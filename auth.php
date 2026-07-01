<?php
// auth.php
// Authentication, authorization, and database management
require_once 'config.php';

// Initialize SQLite database
function init_database() {
    $db_file = __DIR__ . '/hak_hospital.db';
    $db_exists = file_exists($db_file);
    
    $pdo = new PDO('sqlite:' . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    if (!$db_exists) {
        // Create all tables
        create_tables($pdo);
        seed_users($pdo);
        seed_demo_data($pdo);
    } else {
        // Migrate existing database: add nin and email columns to patients if needed
        try {
            $pdo->exec('ALTER TABLE patients ADD COLUMN nin TEXT');
        } catch (Exception $e) {
            // Column might already exist
        }
        try {
            $pdo->exec('ALTER TABLE patients ADD COLUMN email TEXT');
        } catch (Exception $e) {
            // Column might already exist
        }
    }
    
    return $pdo;
}

function create_tables($pdo) {
    $queries = [
        "CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )",
        
        "CREATE TABLE patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            opd TEXT UNIQUE NOT NULL,
            fn TEXT NOT NULL,
            ln TEXT NOT NULL,
            age INTEGER,
            sex TEXT,
            bl TEXT,
            ph TEXT,
            ad TEXT,
            ins TEXT,
            al TEXT,
            pmh TEXT,
            em TEXT,
            oc TEXT,
            created TEXT DEFAULT CURRENT_DATE,
            nin TEXT,
            email TEXT
        )",
        
        "CREATE TABLE appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pid INTEGER NOT NULL,
            pn TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            pr TEXT,
            ty TEXT,
            n TEXT,
            st TEXT DEFAULT 'Pending',
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE encounters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pid INTEGER NOT NULL,
            pn TEXT NOT NULL,
            opd TEXT,
            date TEXT,
            ty TEXT,
            pr TEXT,
            c TEXT,
            o TEXT,
            dx TEXT,
            pl TEXT,
            vt TEXT,
            fu TEXT,
            st TEXT,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nm TEXT,
            cat TEXT,
            un TEXT,
            qty INTEGER,
            ro INTEGER,
            cp INTEGER,
            sp INTEGER,
            su TEXT,
            ex TEXT,
            lo TEXT
        )",
        
        "CREATE TABLE lab_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            pid INTEGER,
            pn TEXT,
            date TEXT,
            tests TEXT,
            cl TEXT,
            priority TEXT,
            st TEXT,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE lab_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            pid INTEGER,
            pn TEXT,
            date TEXT,
            by TEXT,
            reviewed_by TEXT,
            req_id INTEGER,
            rows TEXT,
            int TEXT,
            micro TEXT,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE us_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            pid INTEGER,
            pn TEXT,
            date TEXT,
            scans TEXT,
            cl TEXT,
            priority TEXT,
            st TEXT,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE us_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            pid INTEGER,
            pn TEXT,
            date TEXT,
            ty TEXT,
            by TEXT,
            reviewed_by TEXT,
            req_id INTEGER,
            fi TEXT,
            imp TEXT,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            pid INTEGER,
            pn TEXT,
            date TEXT,
            cl TEXT,
            dx TEXT,
            al TEXT,
            meds TEXT,
            n TEXT,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE dispensing_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            pid INTEGER,
            pn TEXT,
            date TEXT,
            by TEXT,
            items TEXT,
            total INTEGER,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE billing_invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            pid INTEGER,
            pn TEXT,
            date TEXT,
            items TEXT,
            tot INTEGER,
            paid INTEGER,
            bal INTEGER,
            mt TEXT,
            st TEXT,
            notes TEXT,
            payments TEXT,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE discharge_summaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            pid INTEGER,
            pn TEXT,
            ad TEXT,
            dd TEXT,
            wd TEXT,
            cl TEXT,
            co TEXT,
            cc TEXT,
            ai TEXT,
            di TEXT,
            iv TEXT,
            tx TEXT,
            mx TEXT,
            fu TEXT,
            FOREIGN KEY (pid) REFERENCES patients(id)
        )",
        
        "CREATE TABLE otc_sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref TEXT,
            date TEXT,
            time TEXT,
            by TEXT,
            mt TEXT,
            items TEXT,
            total_qty INTEGER,
            total_amt INTEGER,
            notes TEXT
        )",
        
        "CREATE TABLE manual_income (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            amount INTEGER,
            category TEXT,
            method TEXT,
            desc TEXT,
            by TEXT,
            ref TEXT
        )",
        
        "CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            amount INTEGER,
            category TEXT,
            method TEXT,
            desc TEXT,
            by TEXT,
            ref TEXT
        )"
    ];
    
    foreach ($queries as $query) {
        $pdo->exec($query);
    }
}

function seed_users($pdo) {
    global $ACCS;
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO users (username, password, role, name) VALUES (?, ?, ?, ?)");
    
    foreach ($ACCS as $username => $data) {
        $hashed_pass = password_hash($data['pass'], PASSWORD_DEFAULT);
        $stmt->execute([$username, $hashed_pass, $data['role'], $data['name']]);
    }
}

function seed_demo_data($pdo) {
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO patients (opd, fn, ln, age, sex, ph, ad, bl, ins, al, pmh, em, oc, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $demo_patients = [
        ['HAK-001', 'Grace', 'Nakato', 40, 'Female', '0701234567', 'Magere', 'A+', 'NHIF', 'None', '', 'James Nakato 0712345678', 'Teacher', '2025-01-10'],
        ['HAK-002', 'John', 'Ssekandi', 55, 'Male', '0712345678', 'Gayaza', 'O+', 'None', 'Penicillin', 'Hypertension', 'Mary Ssekandi 0701234567', 'Farmer', '2025-01-12'],
        ['HAK-003', 'Amina', 'Nalwanga', 27, 'Female', '0723456789', 'Kampala', 'B+', 'AAR', 'None', '', 'David Nalwanga 0734567890', 'Student', '2025-02-01'],
        ['HAK-004', 'Robert', 'Opiyo', 70, 'Male', '0734567890', 'Wakiso', 'AB-', 'None', 'Sulfa', 'Diabetes', 'Agnes Opiyo 0745678901', 'Retired', '2025-02-14'],
        ['HAK-005', 'Sarah', 'Akello', 25, 'Female', '0745678901', 'Magere', 'O-', 'NHIF', 'None', '', 'Peter Akello 0756789012', 'Nurse', '2025-03-05']
    ];
    foreach ($demo_patients as $p) {
        $stmt->execute($p);
    }
    
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO appointments (pid, pn, date, time, pr, ty, n, st) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $demo_appointments = [
        [1, 'Grace Nakato', '2025-05-10', '08:30', 'Dr. Karim', 'Follow-up', '', 'Scheduled'],
        [3, 'Amina Nalwanga', '2025-05-10', '09:00', 'Physiotherapist', 'Physio', '', 'Scheduled'],
        [5, 'Sarah Akello', '2025-05-10', '10:00', 'Dr. Karim', 'Ultrasound', '', 'Scheduled'],
        [2, 'John Ssekandi', '2025-05-11', '09:30', 'Dr. Karim', 'Consultation', '', 'Scheduled']
    ];
    foreach ($demo_appointments as $a) {
        $stmt->execute($a);
    }
    
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO encounters (pid, pn, opd, date, ty, pr, c, o, dx, pl, vt, fu, st) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $demo_encounters = [
        [1, 'Grace Nakato', 'HAK-001', '2025-05-08', 'OPD', 'Dr. Karim', 'Headache and fever', 'Febrile, pallor', 'Malaria', 'Coartem 3 days', json_encode(['t'=>'37.8', 'b'=>'120/80', 'p'=>'88', 's'=>'98', 'w'=>'62', 'h'=>'165', 'r'=>'', 'rr'=>'']), '', 'Completed'],
        [2, 'John Ssekandi', 'HAK-002', '2025-05-08', 'OPD', 'Dr. Karim', 'Lower back pain', 'Tenderness L4-L5', 'Lumbar strain', 'NSAIDs, physio', json_encode(['t'=>'36.5', 'b'=>'130/85', 'p'=>'78', 's'=>'99', 'w'=>'80', 'h'=>'175', 'r'=>'', 'rr'=>'']), '', 'Completed'],
        [3, 'Amina Nalwanga', 'HAK-003', '2025-05-09', 'Physio', 'Physiotherapist', 'Knee rehab', 'Post-op assessment', 'Post-op rehab', 'Physio 3x/week', json_encode(['t'=>'36.6', 'b'=>'110/70', 'p'=>'72', 's'=>'99', 'w'=>'55', 'h'=>'160', 'r'=>'', 'rr'=>'']), '', 'Active'],
        [4, 'Robert Opiyo', 'HAK-004', '2025-05-09', 'OPD', 'Dr. Karim', 'Chest tightness', 'BP elevated', 'Hypertension', 'Amlodipine 5mg OD', json_encode(['t'=>'36.8', 'b'=>'155/95', 'p'=>'92', 's'=>'96', 'w'=>'90', 'h'=>'170', 'r'=>'', 'rr'=>'']), '', 'Active']
    ];
    foreach ($demo_encounters as $e) {
        $stmt->execute($e);
    }
    
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO inventory (nm, cat, un, qty, ro, cp, sp, su, ex, lo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $demo_inventory = [
        ['Coartem 20/120mg', 'Antimalarial', 'Tablet', 500, 50, 180, 250, 'Cipla Uganda', '2026-12-31', 'Shelf A1'],
        ['Amoxicillin 250mg', 'Antibiotic', 'Capsule', 300, 30, 80, 120, 'Quality Chemicals', '2026-06-30', 'Shelf A2'],
        ['Paracetamol 500mg', 'Analgesic', 'Tablet', 1000, 100, 30, 50, 'Quality Chemicals', '2027-01-31', 'Shelf B1'],
        ['Amlodipine 5mg', 'Cardiovascular', 'Tablet', 200, 30, 120, 180, 'Cipla Uganda', '2026-09-30', 'Shelf B2'],
        ['Metformin 500mg', 'Diabetes', 'Tablet', 150, 20, 90, 140, 'Quality Chemicals', '2026-08-31', 'Shelf B3'],
        ['IV Fluid NS 500ml', 'IV Fluid', 'Bag', 40, 10, 3500, 5000, 'Mulago Supplies', '2026-05-31', 'Store'],
        ['Syringe 5ml', 'Consumables', 'Piece', 200, 50, 300, 500, 'Mulago Supplies', '2028-01-01', 'Store'],
        ['Gloves Box 100', 'Consumables', 'Box', 12, 5, 15000, 20000, 'Mulago Supplies', '2028-01-01', 'Store'],
        ['Metronidazole 400mg', 'Antibiotic', 'Tablet', 15, 30, 60, 90, 'Quality Chemicals', '2026-03-31', 'Shelf A3'],
        ['Ultrasound Gel', 'Supplies', 'Bottle', 8, 3, 12000, 0, 'HAK Internal', '2027-06-30', 'US Room']
    ];
    foreach ($demo_inventory as $i) {
        $stmt->execute($i);
    }
}

function get_database_json() {
    $pdo = init_database();
    $data = [];
    
    $tables = ['patients', 'appointments', 'encounters', 'inventory', 'lab_requests', 'lab_reports', 'us_requests', 'us_reports', 'prescriptions', 'dispensing_log', 'billing_invoices', 'discharge_summaries', 'otc_sales', 'manual_income', 'expenses', 'users'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM $table");
        $data[$table] = $stmt->fetchAll();
    }
    
    return json_encode($data);
}

function get_pdo() {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = init_database();
    }
    return $pdo;
}

function send_appointment_email($patientName, $patientEmail, $appointmentDate, $appointmentTime, $appointmentType, $status, $notes = '') {
    // Note: For this to work, your PHP server must have mail() configured properly
    // For production, consider using PHPMailer or a transactional email service like SendGrid, Mailgun, etc.
    
    if (!$patientEmail) return false;
    
    $subject = "HAK Medical Center: Your Appointment " . ucfirst($status);
    
    $message = "Dear $patientName,\n\n";
    if ($status === 'approved') {
        $message .= "Your appointment has been approved!\n\n";
        $message .= "Appointment Details:\n";
        $message .= "Date: $appointmentDate\n";
        $message .= "Time: $appointmentTime\n";
        $message .= "Type: $appointmentType\n";
    } else {
        $message .= "We regret to inform you that your appointment request has been rejected.\n\n";
        if ($notes) {
            $message .= "Reason: $notes\n\n";
        }
        $message .= "Please contact us to reschedule or for more information.\n\n";
    }
    
    $message .= "Thank you,\n";
    $message .= "HAK Medical & Physiotherapy Center\n";
    $message .= "30m off Gayaza Road to Magere\n";
    $message .= "Phone: 0705 062 567 / 0773 029 999\n";
    
    $headers = "From: hakmedicalcenter@gmail.com\r\n";
    $headers .= "Reply-To: hakmedicalcenter@gmail.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    return @mail($patientEmail, $subject, $message, $headers);
}

// Session handling
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function check_login() {
    if (!isset($_SESSION['user'])) {
        header('Location: login.php');
        exit;
    }
}

function check_access($allowed_roles) {
    check_login();
    $user = $_SESSION['user'];
    
    if ($user['role'] !== 'admin' && !in_array($user['role'], $allowed_roles)) {
        http_response_code(403);
        echo "<!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Access Denied - HAK Medical</title>
            <link href='https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap' rel='stylesheet'>
            <style>
                body {
                    font-family: 'Outfit', sans-serif;
                    background: #0a2e3a;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .card {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    max-width: 400px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                h1 {
                    color: #f29090;
                    margin-bottom: 15px;
                    font-size: 24px;
                }
                p {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 25px;
                }
                a {
                    display: inline-block;
                    padding: 11px 24px;
                    background: linear-gradient(135deg, #2089ab, #145369);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                a:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(32, 137, 171, 0.45);
                }
            </style>
        </head>
        <body>
            <div class='card'>
                <h1>Access Denied</h1>
                <p>You do not have the required permissions to access this workspace module. Please switch to an authorized staff role or go back to your dashboard.</p>
                <a href='index.php'>Go to Dashboard</a>
            </div>
        </body>
        </html>";
        exit;
    }
}

function login_user($username, $password, $role) {
    $pdo = get_pdo();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([strtolower(trim($username))]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password']) && ($role === '' || $user['role'] === $role)) {
        $_SESSION['user'] = [
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'],
            'id' => $user['id']
        ];
        return true;
    }
    return false;
}
