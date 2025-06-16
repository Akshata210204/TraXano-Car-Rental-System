<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id']) || !isset($data['rentalType']) || !isset($data['isUpdated'])) {
    echo json_encode(['error' => 'Missing required data']);
    exit;
}

$bookingId = $data['id'];
$rentalType = $data['rentalType'];
$isUpdated = $data['isUpdated'];

switch ($rentalType) {
    case 'perHour':
        $table = $isUpdated ? 'updated_hour_bookings' : 'per_hour_bookings';
        break;
    case 'perDay':
        $table = $isUpdated ? 'updated_day_bookings' : 'per_day_bookings';
        break;
    default:
        echo json_encode(['error' => 'Invalid rental type']);
        exit;
}

$query = "DELETE FROM " . pg_escape_identifier($conn, $table) . " WHERE id = $1";
$result = pg_query_params($conn, $query, [$bookingId]);

if ($result) {
    if (pg_affected_rows($result) > 0) {
        echo json_encode(['success' => true, 'message' => 'Booking deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Booking not found']);
    }
    pg_free_result($result);
} else {
    echo json_encode(['error' => 'Failed to delete booking: ' . pg_last_error($conn)]);
}
error_log("DELETE DATA: " . json_encode($data));

?>
