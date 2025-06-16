<?php
session_start();
require "config.php"; // Database connection

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    die("405 Method Not Allowed: Only POST requests allowed.");
}

$email = $_POST['email'];
$password = $_POST['password'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    // ✅ Now store session values after checking login
    $_SESSION['email'] = $user['email'];
    $_SESSION['user'] = [
        "name" => $user['name'],
        "email" => $user['email'],
        "phone" => $user['phone']
    ];

    header("Location: cars.html");
    exit();
} else {
    echo "Invalid email or password!";
}
?>
