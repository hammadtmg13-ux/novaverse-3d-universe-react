<?php
// NovaVerse: return the visitor count and the like counts as JSON.
// Read only: the visitor counter is increased by index.php on each page load.
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$defaultReactions = [
    'novaprime' => 128,
    'ember' => 42,
    'azure' => 57,
    'verdant' => 49,
    'frost' => 33,
    'lunaone' => 64,
    'lunatwo' => 41,
    'lunathree' => 38
];

$out = [
    'visitors' => 1247,
    'total_likes' => array_sum($defaultReactions),
    'reactions' => $defaultReactions
];

if ($pdo) {
    try {
        $row = $pdo->query("SELECT total_visits FROM visitors WHERE id = 1")->fetch();
        if ($row) {
            $out['visitors'] = (int) $row['total_visits'];
        }
        $rows = $pdo->query("SELECT body_name, likes FROM reactions")->fetchAll();
        foreach ($rows as $r) {
            if (isset($out['reactions'][$r['body_name']])) {
                $out['reactions'][$r['body_name']] = (int) $r['likes'];
            }
        }
        $out['total_likes'] = array_sum($out['reactions']);
    } catch (Exception $e) {
        // Keep the default numbers.
    }
}

echo json_encode($out);
