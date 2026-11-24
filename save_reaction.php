<?php
// NovaVerse: record one like for a celestial body. Expects JSON { "body": "novaprime" }.
// Returns JSON { "success": true, "body": "...", "likes": 129 }.
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true);
$body = isset($input['body']) ? trim($input['body']) : '';

$allowed = ['novaprime', 'ember', 'azure', 'verdant', 'frost', 'lunaone', 'lunatwo', 'lunathree'];

if (!in_array($body, $allowed, true)) {
    echo json_encode(['success' => false, 'error' => 'Unknown celestial body.']);
    exit;
}

if (!$pdo) {
    echo json_encode(['success' => false, 'error' => 'Database unavailable.']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO reactions (body_name, likes) VALUES (:body, 1) ON DUPLICATE KEY UPDATE likes = likes + 1");
    $stmt->execute(['body' => $body]);

    $stmt2 = $pdo->prepare("SELECT likes FROM reactions WHERE body_name = :body");
    $stmt2->execute(['body' => $body]);
    $row = $stmt2->fetch();

    echo json_encode([
        'success' => true,
        'body' => $body,
        'likes' => $row ? (int) $row['likes'] : 1
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Could not save the like.']);
}
