<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id']) || !isset($data['rentalType'])) {
    echo json_encode(['error' => 'Missing required data']);
    exit;
}

$bookingId = $data['id'];
$rentalType = $data['rentalType'];

switch ($rentalType) {
    case 'perHour':
        $updatedTable = 'updated_hour_bookings';
        $originalTable = 'per_hour_bookings';
        break;
    case 'perDay':
        $updatedTable = 'updated_day_bookings';
        $originalTable = 'per_day_bookings';
        break;
    default:
        echo json_encode(['error' => 'Invalid rental type']);
        exit;
}

// 1. Get the original booking_id from the updated table
$query = "SELECT booking_id FROM " . pg_escape_identifier($updatedTable) . " WHERE id = $1";
$result = pg_query_params($conn, $query, [$bookingId]);

if (!$result || pg_num_rows($result) === 0) {
    echo json_encode(['error' => 'Updated booking not found']);
    exit;
}

$row = pg_fetch_assoc($result);
$originalBookingId = $row['booking_id'];
pg_free_result($result);

// 2. Delete from updated table
$deleteUpdated = pg_query_params($conn, "DELETE FROM " . pg_escape_identifier($updatedTable) . " WHERE id = $1", [$bookingId]);

// 3. Delete from original table using booking_id
$deleteOriginal = pg_query_params($conn, "DELETE FROM " . pg_escape_identifier($originalTable) . " WHERE id = $1", [$originalBookingId]);

if ($deleteUpdated && $deleteOriginal) {
    echo json_encode(['success' => true, 'message' => 'Updated and original bookings deleted']);
} else {
    echo json_encode(['error' => 'Failed to delete both records']);
}
?>
