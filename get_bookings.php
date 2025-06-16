<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once 'db_connect.php';

// Handle fetching booking details for update form
if (isset($_GET['booking_id']) && isset($_GET['rental_type']) && !isset($_POST['updated_price'])) {
    $bookingId = $_GET['booking_id'];
    $rentalType = $_GET['rental_type'];
    $table = $rentalType === 'perDay' ? 'per_day_bookings' : 'per_hour_bookings';

    $query = "SELECT * FROM $table WHERE id = $1";
    $result = pg_query_params($conn, $query, [$bookingId]);

    if ($result && pg_num_rows($result) > 0) {
        $bookingData = pg_fetch_assoc($result);
        $bookingData['original_price'] = $bookingData['price'];
        $bookingData['basic_insurance'] = isset($bookingData['basic_insurance']) && strtolower($bookingData['basic_insurance']) === 'yes' ? 'Yes' : 'No';
        $bookingData['pai_insurance'] = isset($bookingData['pai_insurance']) && strtolower($bookingData['pai_insurance']) === 'yes' ? 'Yes' : 'No';

        $carName = $bookingData['car_name'];
        $carQuery = "SELECT * FROM cars WHERE name = $1";
        $carResult = pg_query_params($conn, $carQuery, [$carName]);
        if ($carResult && pg_num_rows($carResult) > 0) {
            $carInfo = pg_fetch_assoc($carResult);
            $bookingData['car_info'] = $carInfo;
            $bookingData['car_price'] = $carInfo['price'];
        }
        echo json_encode($bookingData);
    } else {
        echo json_encode(['error' => 'Booking not found']);
    }
    exit;
}

// Handle saving the updated booking details
if (isset($_POST['updated_price']) && isset($_POST['booking_id']) && isset($_POST['rental_type'])) {
    $bookingId = $_POST['booking_id'];
    $rentalType = $_POST['rental_type'];
    $table = $rentalType === 'perDay' ? 'per_day_bookings' : 'per_hour_bookings';
    $updatedPrice = $_POST['updated_price'];
    $pickupDate = $_POST['pickup_date'] ?? null;
    $dropoffDate = $_POST['dropoff_date'] ?? null;
    $rentalDate = $_POST['rental_date'] ?? null;
    $pickupTime = $_POST['pickup_time'] ?? null;
    $dropoffTime = $_POST['dropoff_time'] ?? null;
    $hours = $_POST['hours'] ?? null;
    $pickupAddress = $_POST['pickup_address'] ?? null;
    $dropoffAddress = $_POST['dropoff_address'] ?? null;
    $basicInsurance = $_POST['basic_insurance'] ?? 'No';
    $paiInsurance = $_POST['pai_insurance'] ?? 'No';

    $updateFields = [];
    $params = [];
    $paramIndex = 1;

    $updateFields[] = "price = $" . $paramIndex++;
    $params[] = $updatedPrice;

    if ($rentalType === 'perDay') {
        if ($pickupDate !== null) {
            $updateFields[] = "pickup_date = $" . $paramIndex++;
            $params[] = $pickupDate;
        }
        if ($dropoffDate !== null) {
            $updateFields[] = "dropoff_date = $" . $paramIndex++;
            $params[] = $dropoffDate;
        }
    } else {
        if ($rentalDate !== null) {
            $updateFields[] = "rental_date = $" . $paramIndex++;
            $params[] = $rentalDate;
        }
        if ($pickupTime !== null) {
            $updateFields[] = "pickup_time = $" . $paramIndex++;
            $params[] = $pickupTime;
        }
        if ($dropoffTime !== null) {
            $updateFields[] = "dropoff_time = $" . $paramIndex++;
            $params[] = $dropoffTime;
        }
        if ($hours !== null) {
            $updateFields[] = "hours = $" . $paramIndex++;
            $params[] = $hours;
        }
    }

    if ($pickupAddress !== null) {
        $updateFields[] = "pickup_address = $" . $paramIndex++;
        $params[] = $pickupAddress;
    }
    if ($dropoffAddress !== null) {
        $updateFields[] = "dropoff_address = $" . $paramIndex++;
        $params[] = $dropoffAddress;
    }
    if ($basicInsurance !== null) {
        $updateFields[] = "basic_insurance = $" . $paramIndex++;
        $params[] = strtolower($basicInsurance);
    }
    if ($paiInsurance !== null) {
        $updateFields[] = "pai_insurance = $" . $paramIndex++;
        $params[] = strtolower($paiInsurance);
    }

    $updateQuery = "UPDATE $table SET " . implode(", ", $updateFields) . " WHERE id = $" . $paramIndex;
    $params[] = $bookingId;

    $result = pg_query_params($conn, $updateQuery, $params);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Booking updated successfully']);
    } else {
        echo json_encode(['error' => 'Failed to update booking: ' . pg_last_error($conn)]);
    }
    exit;
}

// Handle fetching all bookings for a user
$userEmail = $_GET['email'] ?? '';
if (!$userEmail) {
    echo json_encode(['error' => 'Email is required']);
    exit;
}

$bookingsData = ['perDay' => [], 'perHour' => []];

// 👇 Per Day Bookings
$perDayQuery = "SELECT * FROM per_day_bookings WHERE user_email = $1 ORDER BY id DESC";
$perDayResult = pg_query_params($conn, $perDayQuery, [$userEmail]);
if ($perDayResult) {
    while ($row = pg_fetch_assoc($perDayResult)) {
        $bookingsData['perDay'][] = $row;
    }
}

// 👇 Per Hour Bookings
$perHourQuery = "SELECT * FROM per_hour_bookings WHERE user_email = $1 ORDER BY id DESC";
$perHourResult = pg_query_params($conn, $perHourQuery, [$userEmail]);
if ($perHourResult) {
    while ($row = pg_fetch_assoc($perHourResult)) {
        $bookingsData['perHour'][] = $row;
    }
}

echo json_encode($bookingsData);
?>