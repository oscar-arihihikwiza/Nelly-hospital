<?php
// api.php - Database synchronization API
require_once 'auth.php';
header('Content-Type: application/json');

$pdo = get_pdo();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save') {
    $key = $_POST['key'] ?? '';
    $data = json_decode($_POST['data'] ?? '[]', true);
    
    if (empty($key) || !is_array($data)) {
        echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
        exit;
    }
    
    try {
        $pdo->beginTransaction();
        
        $table_map = [
            'patients' => 'patients',
            'appointments' => 'appointments',
            'encounters' => 'encounters',
            'inventory' => 'inventory',
            'lab_requests' => 'lab_requests',
            'lab_reports' => 'lab_reports',
            'us_requests' => 'us_requests',
            'us_reports' => 'us_reports',
            'prescriptions' => 'prescriptions',
            'dispensing_log' => 'dispensing_log',
            'billing' => 'billing_invoices',
            'discharge' => 'discharge_summaries',
            'otc_sales' => 'otc_sales',
            'manual_income' => 'manual_income',
            'expenses' => 'expenses',
            'users' => 'users'
        ];
        
        $table = $table_map[$key] ?? $key;
        
        $pdo->exec("DELETE FROM $table");
        
        if (count($data) > 0) {
            $columns = array_keys($data[0]);
            $placeholders = implode(',', array_fill(0, count($columns), '?'));
            $stmt = $pdo->prepare("INSERT INTO $table (" . implode(',', $columns) . ") VALUES ($placeholders)");
            
            foreach ($data as $row) {
                $values = [];
                foreach ($columns as $col) {
                    $val = $row[$col] ?? null;
                    $values[] = is_array($val) ? json_encode($val) : $val;
                }
                $stmt->execute($values);
            }
        }
        
        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'add_user') {
    check_access(['admin']);
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? '';
    $name = $_POST['name'] ?? '';
    
    if (empty($username) || empty($password) || empty($role) || empty($name)) {
        echo json_encode(['success' => false, 'error' => 'All fields are required']);
        exit;
    }
    
    try {
        $hashed_pass = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role, name, created_at) VALUES (?, ?, ?, ?, datetime('now'))");
        $stmt->execute([strtolower(trim($username)), $hashed_pass, $role, $name]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Username already exists']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete_user') {
    check_access(['admin']);
    $user_id = $_POST['user_id'] ?? '';
    
    if (empty($user_id)) {
        echo json_encode(['success' => false, 'error' => 'User ID is required']);
        exit;
    }
    
    try {
        // Don't let admin delete themselves
        if ($_SESSION['user']['id'] == $user_id) {
            echo json_encode(['success' => false, 'error' => 'Cannot delete your own account']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Failed to delete user']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($action, ['approve_appointment', 'reject_appointment'])) {
    check_access(['admin', 'reception']);
    $appt_id = $_POST['appt_id'] ?? '';
    $notes = $_POST['notes'] ?? '';
    
    if (empty($appt_id)) {
        echo json_encode(['success' => false, 'error' => 'Appointment ID is required']);
        exit;
    }
    
    try {
        // Get the appointment and patient info
        $stmt = $pdo->prepare("
            SELECT a.*, p.fn, p.ln, p.email 
            FROM appointments a 
            JOIN patients p ON a.pid = p.id 
            WHERE a.id = ?
        ");
        $stmt->execute([$appt_id]);
        $appt = $stmt->fetch();
        
        if (!$appt) {
            echo json_encode(['success' => false, 'error' => 'Appointment not found']);
            exit;
        }
        
        $new_status = $action === 'approve_appointment' ? 'Scheduled' : 'Rejected';
        
        // Update the appointment
        $updateStmt = $pdo->prepare("UPDATE appointments SET st = ? WHERE id = ?");
        $updateStmt->execute([$new_status, $appt_id]);
        
        // Send email notification
        $patientName = $appt['fn'] . ' ' . $appt['ln'];
        $statusLabel = $action === 'approve_appointment' ? 'approved' : 'rejected';
        send_appointment_email(
            $patientName,
            $appt['email'],
            $appt['date'],
            $appt['time'],
            $appt['ty'],
            $statusLabel,
            $notes
        );
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get') {
    echo get_database_json();
    exit;
}

echo json_encode(['success' => false, 'error' => 'Invalid action']);
