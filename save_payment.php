<?php
session_start();
require "config.php"; // Database connection

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
    exit();
}

// Extract data
$userEmail = $data['userEmail'];
$carName = $data['carName'];
$carPrice = $data['carPrice'];
$date = $data['date'];

$stmt = $pdo->prepare("INSERT INTO payments (user_email, car_name, car_price, date) VALUES (?, ?, ?, ?)");
if ($stmt->execute([$userEmail, $carName, $carPrice, $date])) {
    echo json_encode(["success" => "Payment recorded"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save payment"]);
}
?>
