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
        // Get the appointment (id may be a string from JS or integer from SQLite)
        $stmt = $pdo->prepare("SELECT * FROM appointments WHERE id = ? OR CAST(id AS TEXT) = ?");
        $stmt->execute([$appt_id, $appt_id]);
        $appt = $stmt->fetch();
        
        if (!$appt) {
            echo json_encode(['success' => false, 'error' => 'Appointment not found']);
            exit;
        }
        
        $new_status = $action === 'approve_appointment' ? 'Scheduled' : 'Rejected';
        
        // Update the appointment by both possible id forms
        $updateStmt = $pdo->prepare("UPDATE appointments SET st = ? WHERE id = ? OR CAST(id AS TEXT) = ?");
        $updateStmt->execute([$new_status, $appt_id, $appt_id]);
        
        // Try to get patient email for notification
        $patientEmail = null;
        $patientName = $appt['pn'] ?? '';
        if (!empty($appt['pid'])) {
            $pStmt = $pdo->prepare("SELECT fn, ln, email FROM patients WHERE id = ? OR CAST(id AS TEXT) = ?");
            $pStmt->execute([$appt['pid'], $appt['pid']]);
            $pat = $pStmt->fetch();
            if ($pat) {
                $patientName = $pat['fn'] . ' ' . $pat['ln'];
                $patientEmail = $pat['email'] ?? null;
            }
        }
        
        // Send email notification (best-effort)
        $statusLabel = $action === 'approve_appointment' ? 'approved' : 'rejected';
        if ($patientEmail) {
            send_appointment_email(
                $patientName,
                $patientEmail,
                $appt['date'],
                $appt['time'],
                $appt['ty'],
                $statusLabel,
                $notes
            );
        }
        
        echo json_encode(['success' => true, 'new_status' => $new_status]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Record a payment against an existing invoice
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'record_payment') {
    check_access(['admin', 'billing', 'reception']);
    $invoice_id = $_POST['invoice_id'] ?? '';
    $amount     = floatval($_POST['amount'] ?? 0);
    $method     = $_POST['method'] ?? 'Cash';
    $ref        = $_POST['ref'] ?? '';
    $pay_date   = $_POST['pay_date'] ?? date('Y-m-d');
    
    if (empty($invoice_id) || $amount <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invoice ID and valid amount required']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM billing_invoices WHERE id = ? OR CAST(id AS TEXT) = ?");
        $stmt->execute([$invoice_id, $invoice_id]);
        $inv = $stmt->fetch();
        
        if (!$inv) {
            echo json_encode(['success' => false, 'error' => 'Invoice not found']);
            exit;
        }
        
        // Decode existing payments
        $payments = json_decode($inv['payments'] ?? '[]', true);
        if (!is_array($payments)) $payments = [];
        $payments[] = ['a' => $amount, 'm' => $method, 'd' => $pay_date, 'n' => $ref];
        
        $new_paid = $inv['paid'] + $amount;
        $new_bal  = $inv['tot'] - $new_paid;
        if ($new_bal < 0) $new_bal = 0;
        $new_status = $new_paid <= 0 ? 'Unpaid' : ($new_bal > 0 ? 'Partial' : 'Paid');
        $new_mt_parts = array_map(function($p){ return $p['m']; }, $payments);
        $new_mt = implode(' + ', array_unique($new_mt_parts));
        
        $upd = $pdo->prepare("UPDATE billing_invoices SET paid = ?, bal = ?, st = ?, mt = ?, payments = ? WHERE id = ? OR CAST(id AS TEXT) = ?");
        $upd->execute([$new_paid, $new_bal, $new_status, $new_mt, json_encode($payments), $invoice_id, $invoice_id]);
        
        echo json_encode(['success' => true, 'new_paid' => $new_paid, 'new_bal' => $new_bal, 'new_status' => $new_status]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get') {
    echo get_database_json();
    exit;
}

// Book appointment (patient portal via AJAX)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'book_appointment') {
    check_login();
    $user = $_SESSION['user'];
    if ($user['role'] !== 'patient') {
        echo json_encode(['success' => false, 'error' => 'Patients only']);
        exit;
    }
    $pdo2   = get_pdo();
    $stmt   = $pdo2->prepare('SELECT id, fn, ln FROM patients WHERE fn || " " || ln = ? LIMIT 1');
    $stmt->execute([$user['name']]);
    $pat    = $stmt->fetch();
    if (!$pat) {
        echo json_encode(['success' => false, 'error' => 'Patient record not found']);
        exit;
    }
    $date = trim($_POST['date'] ?? '');
    $time = trim($_POST['time'] ?? '');
    $pr   = trim($_POST['pr']   ?? 'Dr. Karim');
    $ty   = trim($_POST['ty']   ?? 'Consultation');
    $n    = trim($_POST['n']    ?? '');
    if (!$date || !$time) {
        echo json_encode(['success' => false, 'error' => 'Date and time required']);
        exit;
    }
    try {
        $ins = $pdo2->prepare('INSERT INTO appointments (pid, pn, date, time, pr, ty, n, st) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $ins->execute([$pat['id'], $pat['fn'].' '.$pat['ln'], $date, $time, $pr, $ty, $n, 'Pending']);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['success' => false, 'error' => 'Invalid action']);
