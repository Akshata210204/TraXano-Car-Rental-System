<?php
$host = 'localhost';
$dbname = 'traxano// make ur own database';
$user = 'postgres';
$password = 'your password';

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the JSON data from the request body
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true); // Decode JSON into an associative array

    if (!isset($data['phoneOtp']) || !isset($data['emailOtp'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'OTP verification required.']);
        exit();
    }

    $name = $data['name'];
    $phone = $data['phone'];
    $email = $data['email'];
    $license_number = $data['licenseNumber'];
    $age = $data['age'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT INTO users (name, phone, email, license_number, age, password) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $phone, $email, $license_number, $age, $password]);

    echo json_encode(['success' => true, 'message' => 'Registered Successfully!']);
    exit();

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    exit();
}
?>
