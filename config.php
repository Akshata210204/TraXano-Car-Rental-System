<?php
$host = 'localhost';
$port = '5432';
$dbname = 'traxano//your database';        // Use 'dbname' consistently
$user = 'postgres';
$password = 'your password';         // Use 'password' consistently

// Procedural PostgreSQL connection
$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");

if (!$conn) {
    echo json_encode(["error" => "DB connection failed"]);
    exit();
}

// PDO connection (optional, only if needed elsewhere)
try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
