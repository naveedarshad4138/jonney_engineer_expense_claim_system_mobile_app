<?php
session_start();

$clientId = 'ABFpUUIhg3ePilBXdb5eIWytISZ641RfJFapMgvbe8bnJWGE6v';
$clientSecret = 'VjGCz0oYEpHhkrTscFmjd8llfeCU0T0HDve3fc0E';
$redirectUri = 'https://advancedbml.engineering/api/quickbook/qb_functions.php';
$scope = 'com.intuit.quickbooks.accounting';
$authorizationUrl = 'https://appcenter.intuit.com/connect/oauth2';
$tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
$baseUrl='https://sandbox-quickbooks.api.intuit.com/v3/company/4620816365304699800';

$tokenFile = __DIR__ . '/tokens.json';

// Save tokens and realmId
function saveTokens($data, $realmId = null) {
    global $tokenFile;
    $stored = $data;
    if ($realmId !== null) {
        $stored['realm_id'] = $realmId;
    } else {
        // If tokens file already exists, keep existing realm_id if not provided here
        if (file_exists($tokenFile)) {
            $existing = json_decode(file_get_contents($tokenFile), true);
            if (isset($existing['realm_id'])) {
                $stored['realm_id'] = $existing['realm_id'];
            }
        }
    }
    file_put_contents($tokenFile, json_encode($stored, JSON_PRETTY_PRINT));
}

function getTokens() {
    global $tokenFile;
    if (file_exists($tokenFile)) {
        $json = file_get_contents($tokenFile);
        return json_decode($json, true);
    }
    return null;
}

function refreshAccessToken($refreshToken) {
    global $clientId, $clientSecret, $tokenUrl;

    $postFields = http_build_query([
        'grant_type' => 'refresh_token',
        'refresh_token' => $refreshToken,
    ]);

    $ch = curl_init($tokenUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Authorization: Basic ' . base64_encode("$clientId:$clientSecret"),
        'Content-Type: application/x-www-form-urlencoded',
    ]);

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status === 200) {
        $data = json_decode($response, true);
        saveTokens($data);  // Save refreshed tokens (realm_id preserved)
        return $data;
    } else {
        // On failure just return null (no output)
        return null;
    }
}

// Step 0: Handle logout (optional, but no echo here)
if (isset($_GET['logout'])) {
    if (file_exists($tokenFile)) unlink($tokenFile);
    exit; // silently exit on logout
}

$tokens = getTokens();

if ($tokens && isset($tokens['access_token'])) {
    $createdTime = filemtime($tokenFile);
    $expiresIn = $tokens['expires_in'] ?? 3600;
    $expiresAt = $createdTime + $expiresIn;

    if (time() >= $expiresAt) {
        // Try refresh token
        $newTokens = refreshAccessToken($tokens['refresh_token']);
        if ($newTokens) {
            $tokens = $newTokens;
        }
        // if refresh fails, just keep old tokens (you can handle expired tokens on API call)
    }
}

// Step 1: Handle OAuth callback to get tokens and realmId
if (isset($_GET['code']) && isset($_GET['realmId'])) {
    if (!isset($_GET['state']) || $_GET['state'] !== ($_SESSION['oauth2state'] ?? null)) {
        // Invalid state, just exit silently
        exit;
    }
    $authCode = $_GET['code'];
    $realmId = $_GET['realmId'];
    unset($_SESSION['oauth2state']);

    $postFields = http_build_query([
        'grant_type' => 'authorization_code',
        'code' => $authCode,
        'redirect_uri' => $redirectUri,
    ]);

    $ch = curl_init($tokenUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Authorization: Basic ' . base64_encode("$clientId:$clientSecret"),
        'Content-Type: application/x-www-form-urlencoded',
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $tokenData = json_decode($response, true);
        saveTokens($tokenData, $realmId);
        $tokens = getTokens(); // refresh local tokens variable
    }
    // No output, silently end script here
    exit;
}

// Step 2: If no tokens and no code, start OAuth flow
if (!$tokens) {
    $state = bin2hex(random_bytes(16));
    $_SESSION['oauth2state'] = $state;

    $authUrl = $authorizationUrl . '?' . http_build_query([
        'client_id' => $clientId,
        'redirect_uri' => $redirectUri,
        'response_type' => 'code',
        'scope' => $scope,
        'state' => $state,
    ]);

    header('Location: ' . $authUrl);
    exit;
}

// Now tokens are ready to be used silently

// Helper function to get realm id without printing anything
function getRealmId() {
    $tokens = getTokens();
    return $tokens['realm_id'] ?? null;
}

// Helper function to get QBO data by URL (no print, just return)
    $id = $tokens['realm_id'];
// function getQBORecord($url, $query)
// {
//     $tokens = getTokens();
//     if (!$tokens || !isset($tokens['access_token'])) {
//         return null; // no tokens, cannot call
//     }
//     $accessToken = $tokens['access_token'];

//     $headers = [
//         "Authorization: Bearer {$accessToken}",
//         "Accept: application/json",
//         "Content-Type: application/text"
//     ];

//     $ch = curl_init($url);
//     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//     curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

//     // Set POST method and POST data (the query)
//     curl_setopt($ch, CURLOPT_POST, true);
//     curl_setopt($ch, CURLOPT_POSTFIELDS, $query);

//     $response = curl_exec($ch);
//     $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
//     $error = curl_error($ch);
//     curl_close($ch);

//     if ($error) {
//         return ["error" => "cURL Error: $error"];
//     }

//     $result = json_decode($response, true);
//     if ($statusCode >= 200 && $statusCode < 300) {
//         return $result;
//     } else {
//         return ["error" => "QBO API Error: HTTP $statusCode", "response" => $result];
//     }
// }
// function callQBOApi($url, $body = null, $method = 'GET') {
//     $tokens = getTokens();
//     if (!$tokens || !isset($tokens['access_token'])) {
//         return null;
//     }

//     $accessToken = $tokens['access_token'];

//     $headers = [
//         "Authorization: Bearer {$accessToken}",
//         "Accept: application/json",
//         "Content-Type: application/json"
//     ];

//     $ch = curl_init($url);
//     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//     curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

//     switch (strtoupper($method)) {
//         case 'POST':
//             curl_setopt($ch, CURLOPT_POST, true);
//             break;
//         case 'PUT':
//         case 'DELETE':
//             curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
//             break;
//     }

//     if ($body !== null && in_array(strtoupper($method), ['POST', 'PUT'])) {
//         curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
//     }

//     $response = curl_exec($ch);
//     $error = curl_error($ch);
//     $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
//     curl_close($ch);

//     if ($error) {
//         return ["error" => "cURL Error: $error"];
//     }

//     $result = json_decode($response, true);
//     if ($statusCode >= 200 && $statusCode < 300) {
//         return $result;
//     } else {
//         return [
//             "error" => "QBO API Error: HTTP $statusCode",
//             "response" => $result
//         ];
//     }
// }
function callQBOApi($url, $body = null, $method = 'GET', $customHeaders = []) {
    $tokens = getTokens();
    if (!$tokens || !isset($tokens['access_token'])) {
        return ["error" => "Missing or invalid access token"];
    }

    $accessToken = $tokens['access_token'];

    // Default headers (used unless overridden)
    $defaultHeaders = [
        "Authorization: Bearer {$accessToken}",
        "Accept: application/json",
        "Content-Type: application/json"
    ];

    // Use custom headers if provided, otherwise default
    $headers = $customHeaders ?: $defaultHeaders;

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    switch (strtoupper($method)) {
        case 'POST':
            curl_setopt($ch, CURLOPT_POST, true);
            break;
        case 'PUT':
        case 'DELETE':
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
            break;
    }

    if ($body !== null && in_array(strtoupper($method), ['POST', 'PUT'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($error) {
        return ["error" => "cURL Error: $error"];
    }

    $result = json_decode($response, true);
    if ($statusCode >= 200 && $statusCode < 300) {
        return $result;
    } else {
        return [
            "error" => "QBO API Error: HTTP $statusCode",
            "response" => $result
        ];
    }
}