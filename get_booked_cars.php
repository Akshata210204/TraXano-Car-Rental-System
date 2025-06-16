<?php
// get_booked_cars.php
include 'db_connect.php'; // PostgreSQL connection

$today = date("Y-m-d");
$bookedCars = [];

// Per Day Bookings
$sql_day = "SELECT car_name FROM per_day_bookings 
            WHERE pickup_date <= $1 AND dropoff_date >= $1";
$result_day = pg_query_params($conn, $sql_day, [$today]);

if ($result_day) {
    while ($row = pg_fetch_assoc($result_day)) {
        $bookedCars[] = $row['car_name'];
    }
}

// Per Hour Bookings (assuming rental_date is the booking day)
$sql_hour = "SELECT car_name FROM per_hour_bookings 
             WHERE rental_date = $1";
$result_hour = pg_query_params($conn, $sql_hour, [$today]);

if ($result_hour) {
    while ($row = pg_fetch_assoc($result_hour)) {
        $bookedCars[] = $row['car_name'];
    }
}

echo json_encode($bookedCars);
?>
