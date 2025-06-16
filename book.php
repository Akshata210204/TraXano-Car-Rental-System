<?php
session_start();
require "config.php";

if (!isset($_SESSION['user'])) {
    die("Please log in to book a car.");
}

$car_id = $_GET['id'];
$user = $_SESSION['user'];


$stmt = $pdo->prepare("INSERT INTO bookings (user_name, car_id) VALUES (?, ?)");
$stmt->execute([$user, $car_id]);

echo "Booking Successful!";
?>
