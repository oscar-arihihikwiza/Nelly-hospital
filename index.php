<?php
// index.php
// Main router. Redirects authenticated users to their respective role page.

require_once 'auth.php';

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

$role = $_SESSION['user']['role'];
$role_pages = [
    'admin' => 'admin.php',
    'doctor' => 'doctor.php',
    'nurse' => 'nurse.php',
    'lab' => 'lab.php',
    'reception' => 'reception.php',
    'pharmacy' => 'pharmacy.php',
    'billing' => 'billing.php',
    'patient' => 'patient.php'
];

if (isset($role_pages[$role])) {
    header('Location: ' . $role_pages[$role]);
} else {
    // If the role is somehow invalid, destroy the session and send to login
    header('Location: logout.php');
}
exit;
?>
