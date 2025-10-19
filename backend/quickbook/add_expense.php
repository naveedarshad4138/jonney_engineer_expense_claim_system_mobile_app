<?php
require_once 'qb_functions.php';

header('Content-Type: application/json');

// Determine input type: JSON body or multipart/form-data
$input = [];
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    $input = $_POST;
}

// Extract inputs
$customerName = $input['customerName'] ?? null;
$amount = $input['amount'] ?? null;
$date = $input['date'] ?? null;
$creditCardAccountId = $input['creditCardAccountId'] ?? null;
$expenseAccountId = $input['expenseAccountId'] ?? null;

// Validate required fields
if (!$customerName || !$amount || !$date || !$creditCardAccountId || !$expenseAccountId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: customerName, amount, date, creditCardAccountId, expenseAccountId']);
    exit;
}

// Get QBO Realm ID
$realmId = getRealmId();
if (!$realmId) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing QBO Realm ID']);
    exit;
}

$baseUrl = "https://sandbox-quickbooks.api.intuit.com/v3/company/{$realmId}";

// Step 1: Get or create customer
$customerId = getOrCreateCustomerByName($customerName, $baseUrl);
if (!$customerId) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not find or create customer']);
    exit;
}

// Step 2: Prepare purchase payload
$purchasePayload = [
    "PaymentType" => "CreditCard",
    "AccountRef" => ["value" => $creditCardAccountId],
    "EntityRef" => [
        "value" => $customerId,
        "type" => "Customer",
        "name" => $customerName
    ],
    "TxnDate" => $date,
    "Line" => [
        [
            "DetailType" => "AccountBasedExpenseLineDetail",
            "Amount" => $amount,
            "AccountBasedExpenseLineDetail" => [
                "AccountRef" => ["value" => $expenseAccountId]
            ]
        ]
    ]
];

// Step 3: Create purchase in QBO
$purchaseUrl = "$baseUrl/purchase?minorversion=75";
$purchaseResponse = callQBOApi($purchaseUrl, json_encode($purchasePayload), 'POST');

if (!isset($purchaseResponse['Purchase'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create purchase', 'response' => $purchaseResponse]);
    exit;
}

$purchase = $purchaseResponse['Purchase'];
$purchaseId = $purchase['Id'];

// Step 4: Upload attachment if PDF file uploaded
$attachmentResponse = null;
if (isset($_FILES['pdf']) && $_FILES['pdf']['error'] === UPLOAD_ERR_OK) {
    $tmpFile = $_FILES['pdf']['tmp_name'];
    $fileName = $_FILES['pdf']['name'];

    $attachmentResponse = uploadAttachmentToQBO($realmId, $purchaseId, 'Purchase', $tmpFile, $fileName);
}

// Final output
echo json_encode([
    'success' => true,
    'purchase' => $purchase,
    'attachment' => $attachmentResponse
]);


// === FUNCTIONS ===

function getOrCreateCustomerByName($name, $baseUrl) {
    $query = "select * from Customer where DisplayName = '$name'";
    $queryUrl = $baseUrl . '/query?query=' . urlencode($query) . '&minorversion=75';
    $result = callQBOApi($queryUrl);

    if (isset($result['QueryResponse']['Customer'][0])) {
        return $result['QueryResponse']['Customer'][0]['Id'];
    }

    // Create new customer
    $payload = ["DisplayName" => $name];
    $createUrl = $baseUrl . '/customer?minorversion=75';
    $response = callQBOApi($createUrl, json_encode($payload), 'POST');

    return $response['Customer']['Id'] ?? null;
}

function uploadAttachmentToQBO($realmId, $txnId, $txnType, $filePath, $fileName) {
    $tokens = getTokens();
    if (!$tokens || !isset($tokens['access_token'])) {
        return ['error' => 'Access token not found'];
    }
    $accessToken = $tokens['access_token'];

    $url = "https://sandbox-quickbooks.api.intuit.com/v3/company/{$realmId}/upload?minorversion=75";

    if (!file_exists($filePath)) {
        return ['error' => "File not found: $filePath"];
    }

    $mimeType = mime_content_type($filePath);
    $fileContents = file_get_contents($filePath);

    $boundary = uniqid('---------------------');
    $eol = "\r\n";

    // Build JSON metadata
    $metadata = json_encode([
        "AttachableRef" => [
            [
                "EntityRef" => [
                    "type"  => $txnType,   // e.g. 'Purchase'
                    "value" => $txnId      // Purchase ID
                ]
            ]
        ],
        "FileName" => $fileName,
        "ContentType" => $mimeType
    ]);

    // Build multipart body
    $body = '';
    $body .= "--$boundary$eol";
    $body .= "Content-Disposition: form-data; name=\"file_metadata_0\"$eol";
    $body .= "Content-Type: application/json; charset=UTF-8$eol";
    $body .= "Content-Transfer-Encoding: 8bit$eol$eol";
    $body .= $metadata . $eol;

    $body .= "--$boundary$eol";
    $body .= "Content-Disposition: form-data; name=\"file_content_0\"; filename=\"$fileName\"$eol";
    $body .= "Content-Type: $mimeType$eol";
    $body .= "Content-Transfer-Encoding: binary$eol$eol";
    $body .= $fileContents . $eol;

    $body .= "--$boundary--$eol";

    $headers = [
        "Authorization: Bearer {$accessToken}",
        "Content-Type: multipart/form-data; boundary=$boundary",
        "Accept: application/json"
    ];

    // Use cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($error) {
        return ['error' => "cURL Error: $error"];
    }

    $decoded = json_decode($response, true);

    if ($statusCode >= 200 && $statusCode < 300) {
        return $decoded;
    } else {
        return [
            'error' => "QBO Upload failed (HTTP $statusCode)",
            'response' => $decoded ?: $response,
            'raw' => $response
        ];
    }
}