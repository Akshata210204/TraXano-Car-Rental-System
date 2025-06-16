<?php
$host = "localhost";
$port = "5432";
$dbname = "traxano // your database";
$user = "postgres";
$password = "your password";

$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
?>
