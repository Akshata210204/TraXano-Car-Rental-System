<?php
session_start();
header('Content-Type: application/json');

require 'config.php'; // Ensure this sets up $conn using pg_connect()

if (!isset($conn) || !$conn) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

if (!isset($_SESSION['email'])) {
    echo json_encode(["error" => "User is not logged in"]);
    exit;
}

$email = $_SESSION['email'];

$data = [
    "per_day" => [],
    "per_hour" => []
];

// Fetch updated per-day bookings with car_image from per_day_bookings
$query_day = "
    SELECT u.*, p.car_image 
    FROM updated_day_bookings u
    JOIN per_day_bookings p ON u.booking_id = p.id
    WHERE u.user_email = $1
";

$result_day = pg_query_params($conn, $query_day, [$email]);

if (!$result_day) {
    echo json_encode(["error" => pg_last_error($conn)]);
    exit;
}

while ($row = pg_fetch_assoc($result_day)) {
    $data["per_day"][] = $row;
}

// Fetch updated per-hour bookings with car_image from per_hour_bookings
$query_hour = "
    SELECT u.*, p.car_image 
    FROM updated_hour_bookings u
    JOIN per_hour_bookings p ON u.booking_id = p.id
    WHERE u.user_email = $1
";

$result_hour = pg_query_params($conn, $query_hour, [$email]);

if (!$result_hour) {
    echo json_encode(["error" => pg_last_error($conn)]);
    exit;
}

while ($row = pg_fetch_assoc($result_hour)) {
    $data["per_hour"][] = $row;
}

echo json_encode($data);
