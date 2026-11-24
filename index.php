<?php
require_once __DIR__ . '/config.php';

// Default sample numbers, used when the database is not reachable.
$defaultLikes = [
    'novaprime' => 128,
    'ember' => 42,
    'azure' => 57,
    'verdant' => 49,
    'frost' => 33,
    'lunaone' => 64,
    'lunatwo' => 41,
    'lunathree' => 38
];
$visitors = 1247;
$likes = $defaultLikes;
$totalLikes = array_sum($likes);

if ($pdo) {
    try {
        $pdo->exec("INSERT INTO visitors (id, total_visits) VALUES (1, 1247) ON DUPLICATE KEY UPDATE total_visits = total_visits + 1");
        $row = $pdo->query("SELECT total_visits FROM visitors WHERE id = 1")->fetch();
        if ($row) {
            $visitors = (int) $row['total_visits'];
        }
        $rows = $pdo->query("SELECT body_name, likes FROM reactions")->fetchAll();
        foreach ($rows as $r) {
            if (isset($likes[$r['body_name']])) {
                $likes[$r['body_name']] = (int) $r['likes'];
            }
        }
        $totalLikes = array_sum($likes);
    } catch (Exception $e) {
        // Keep the default numbers so the page still renders.
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NovaVerse, Interactive 3D Universe by Hammad Khan</title>
<meta name="description" content="NovaVerse is an interactive 3D universe with a glowing ringed planet, three moons, 2,400 stars and nebula clouds. Rebuilt with React 18 and Three.js by Hammad Khan.">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<link href="assets/css/style.css" rel="stylesheet">
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js"></script>
<script>
window.NOVAVERSE_INITIAL = {
    visitors: <?php echo (int) $visitors; ?>,
    likes: <?php echo json_encode($likes); ?>
};
</script>
</head>
<body>

<div id="root"></div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/planets.js"></script>
<script src="assets/js/scene.js"></script>
<script type="text/babel" data-presets="react" src="assets/js/app.jsx"></script>
</body>
</html>
