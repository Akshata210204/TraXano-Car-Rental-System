<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$carName = $_GET['car_name'] ?? '';

if (!$carName) {
    echo json_encode(['error' => 'Car name not provided.']);
    exit;
}

$query = "SELECT name, image, price FROM cars WHERE name = $1 LIMIT 1";
$result = pg_query_params($conn, $query, [$carName]);

if ($result && pg_num_rows($result) > 0) {
    $car = pg_fetch_assoc($result);
    echo json_encode($car);
} else {
    echo json_encode(['error' => 'Car not found.']);
}
?>
