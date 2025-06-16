<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once "db_connect.php";

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}

// Extract common data
$userName = $data['userName'] ?? '';
$userEmail = $data['userEmail'] ?? '';
$carName = $data['carName'] ?? '';
$rentalType = $data['rentalType'] ?? '';
$price = $data['price'] ?? 0;
$pickupAddress = $data['pickupAddress'] ?? '';
$dropoffAddress = $data['dropoffAddress'] ?? '';
$basicInsurance = $data['basic_insurance'] ?? 'no';
$paiInsurance = $data['pai_insurance'] ?? 'no';
$carImage = $data['carImage'] ?? '';


if (!$userName || !$userEmail || !$carName || !$rentalType || !$price) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

if ($rentalType === "perHour") {
    $rentalDate = $data['rentalDate'] ?? '';
    $hours = intval($data['hours'] ?? 0);
    $pickupTime = $data['pickupTime'] ?? '';
    $dropoffTime = $data['dropoffTime'] ?? '';

    $query = "INSERT INTO per_hour_bookings
          (user_name, user_email, car_name, car_image, rental_type, rental_date, hours, pickup_time, dropoff_time, pickup_address, dropoff_address, price, basic_insurance, pai_insurance)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)";

$params = [$userName, $userEmail, $carName, $carImage, $rentalType, $rentalDate, $hours, $pickupTime, $dropoffTime, $pickupAddress, $dropoffAddress, $price, $basicInsurance, $paiInsurance];

} else {
    $pickupDate = $data['pickupDate'] ?? '';
    $dropoffDate = $data['dropoffDate'] ?? '';
    $query = "INSERT INTO per_day_bookings
    (user_name, user_email, car_name, car_image, rental_type, pickup_date, dropoff_date, pickup_address, dropoff_address, price, basic_insurance, pai_insurance)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)";

$params = [$userName, $userEmail, $carName, $carImage, $rentalType, $pickupDate, $dropoffDate, $pickupAddress, $dropoffAddress, $price, $basicInsurance, $paiInsurance];

   }

$result = pg_query_params($conn, $query, $params);

if ($result) {
    echo json_encode(["success" => true, "message" => "Booking successful"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . pg_last_error($conn)]);
}
?>