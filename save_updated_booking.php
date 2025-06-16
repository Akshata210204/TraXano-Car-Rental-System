<?php
require_once 'db_connect.php';
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

$bookingId = $data['booking_id'] ?? null;
$rentalType = $data['rental_type'] ?? null;
$email = $data['email'] ?? null;
$updatedPrice = $data['updated_price'] ?? 0;
$pickupAddress = $data['pickup_address'] ?? '';
$dropoffAddress = $data['dropoff_address'] ?? '';
$basicInsurance = $data['basic_insurance'] ?? 'No';
$paiInsurance = $data['pai_insurance'] ?? 'No';
$carImage = $data['car_image'] ?? '';
$carName = $data['car_name'] ?? '';

if (!$bookingId || !$rentalType || !$email) {
    echo json_encode(['success' => false, 'message' => 'Missing booking ID, rental type, or email']);
    exit;
}

$originalTable = ($rentalType === 'perDay') ? 'per_day_bookings' : 'per_hour_bookings';
$updateHistoryTable = ($rentalType === 'perDay') ? 'updated_day_bookings' : 'updated_hour_bookings';

if ($rentalType === 'perDay') {
    $pickupDate = $data['pickup_date'] ?? null;
    $dropoffDate = $data['dropoff_date'] ?? null;

    $historyQuery = "
        INSERT INTO $updateHistoryTable (
            booking_id, user_email, pickup_date, dropoff_date, pickup_address, dropoff_address,
            basic_insurance, pai_insurance, updated_price, updated_at, car_image, car_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11)
    ";

    $historyParams = [
        $bookingId, $email, $pickupDate, $dropoffDate, $pickupAddress, $dropoffAddress,
        $basicInsurance, $paiInsurance, $updatedPrice, $carImage, $carName
    ];
} else {
    // For perHour bookings, now we expect a field named "rental_date" to be passed.
    $rentalDate = $data['rental_date'] ?? null;  // Use rental_date rather than pickup_date
    $pickupTime = $data['pickup_time'] ?? null;
    $dropoffTime = $data['dropoff_time'] ?? null;
    $hours = $data['hours'] ?? 1;
    
    // Log the rentalDate value for debugging purposes.
    error_log("rental_date received: " . var_export($rentalDate, true));

    $historyQuery = "
        INSERT INTO $updateHistoryTable (
            booking_id, user_email, rental_date, pickup_time, dropoff_time, hours,
            pickup_address, dropoff_address, basic_insurance, pai_insurance,
            updated_price, updated_at, car_image, car_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13)
    ";

    $historyParams = [
        $bookingId, $email, $rentalDate, $pickupTime, $dropoffTime, $hours,
        $pickupAddress, $dropoffAddress, $basicInsurance, $paiInsurance,
        $updatedPrice, $carImage, $carName
    ];
}

// Fetch car image from the cars table based on car_name
$carImageQuery = "SELECT image FROM cars WHERE name = $1";
$carImageResult = pg_query_params($conn, $carImageQuery, array($carName)); // $carName is the name of the car
if ($carImageRow = pg_fetch_assoc($carImageResult)) {
    $carImage = $carImageRow['image'];
} else {
    $carImage = '';  // Default or fallback if no image found
}

// Now, update the booking with the fetched image
if ($rentalType === 'perDay') {
    $updateQuery = "UPDATE updated_day_bookings SET car_image = $1 WHERE booking_id = $2";
} else {
    $updateQuery = "UPDATE updated_hour_bookings SET car_image = $1 WHERE booking_id = $2";
}
pg_query_params($conn, $updateQuery, array($carImage, $bookingId));

// Prepare and execute the history insert query
$result = pg_prepare($conn, "insert_update_history", $historyQuery);
if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Error preparing query: ' . pg_last_error($conn)]);
    exit;
}

$result = pg_execute($conn, "insert_update_history", $historyParams);
if ($result) {
    echo json_encode(['success' => true, 'message' => 'Booking updated and history saved']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to insert update history: ' . pg_last_error($conn)]);
}

// Close the connection
pg_close($conn);
?>
