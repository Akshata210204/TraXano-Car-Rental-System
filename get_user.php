<?php
header("Access-Control-Allow-Origin: *"); // Allow any origin (you can restrict it later)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user'])) {
    echo json_encode(["error" => "User not logged in"]);
    exit();
}

echo json_encode($_SESSION['user']);
?>
