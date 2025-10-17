<?php
require_once 'qb_functions.php';

// Set response header to JSON
header('Content-Type: application/json');

// Get JSON input from POST body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// Required fields from input
$customerName = $input['customerName'] ?? null;
$amount = $input['amount'] ?? null;
$date = $input['date'] ?? null;
$creditCardAccountId = $input['creditCardAccountId'] ?? null;
$expenseAccountId = $input['expenseAccountId'] ?? null;

// Validate input
if (!$customerName || !$amount || !$date || !$creditCardAccountId || !$expenseAccountId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters. Required: customerName, amount, date, creditCardAccountId, expenseAccountId']);
    exit;
}

// Get realm/company ID from somewhere, e.g., session or config
$id = getRealmId();
if (!$id) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing realm ID.']);
    exit;
}

$baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company/' . $id;

// Step 1: Get or create customer by name
$customerId = getOrCreateCustomerByName($customerName);
if (!$customerId) {
    http_response_code(500);
    echo json_encode(['error' => 'Customer creation or retrieval failed.']);
    exit;
}

// Step 2: Build EntityRef
$entityRef = [
    'value' => $customerId,
    'type'  => 'Customer',
    'name'  => $customerName
];

// Step 3: Create purchase payload
$payload = [
    "PaymentType" => "CreditCard",
    "AccountRef" => [
        "value" => $creditCardAccountId
    ],
    "EntityRef" => $entityRef,
    "TxnDate" => $date,
    "Line" => [
        [
            "DetailType" => "AccountBasedExpenseLineDetail",
            "Amount" => $amount,
            "AccountBasedExpenseLineDetail" => [
                "AccountRef" => [
                    "value" => $expenseAccountId
                ]
            ]
        ]
    ]
];

// Step 4: Call QBO to create purchase
$url = "$baseUrl/purchase?minorversion=75";
$response = callQBOApi($url, json_encode($payload), 'POST');

if (isset($response['Purchase'])) {
    echo json_encode([
        'success' => true,
        'purchase' => $response['Purchase']
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'response' => $response
    ]);
}


// === FUNCTION: Get or create customer by name ===
function getOrCreateCustomerByName($name) {
    global $baseUrl;

    $query = "select * from Customer where DisplayName = '$name'";
    $queryUrl = $baseUrl . '/query?query=' . urlencode($query) . '&minorversion=75';
    $result = callQBOApi($queryUrl);

    if (isset($result['QueryResponse']['Customer'][0])) {
        return $result['QueryResponse']['Customer'][0]['Id'];
    }

    $payload = [
        "DisplayName" => $name
    ];
    $createUrl = $baseUrl . '/customer?minorversion=75';
    $response = callQBOApi($createUrl, json_encode($payload), 'POST');

    return $response['Customer']['Id'] ?? null;
}
