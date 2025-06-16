<?php
require "config.php"; // Database connection

$stmt = $pdo->query("SELECT * FROM cars");
$cars = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Available Cars</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Available Cars</h1>
    <div class="car-container">
        <?php foreach ($cars as $car): ?>
            <div class="car-card">
                <h3><?= htmlspecialchars($car['model']) ?></h3>
                <p>Price: <?= htmlspecialchars($car['price']) ?> per day</p>
                <a href="book.php?id=<?= $car['id'] ?>"><button>Book Now</button></a>
            </div>
        <?php endforeach; ?>
    </div>
</body>
</html>
