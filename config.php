<?php
// config.php
// Central configuration for HAK Medical & Physiotherapy Center

define('SYSTEM_NAME', 'HAK Medical & Physiotherapy');
define('SYSTEM_SUB', 'Point of Care System');

// Standard staff accounts matching HAK Medical credentials
$ACCS = [
    'admin' => [
        'pass' => 'admin123',
        'role' => 'admin',
        'name' => 'Administrator'
    ],
    'dr.karim' => [
        'pass' => 'karim123',
        'role' => 'doctor',
        'name' => 'Dr. Karim'
    ],
    'nurse1' => [
        'pass' => 'nurse123',
        'role' => 'nurse',
        'name' => 'Nurse Faith'
    ],
    'lab1' => [
        'pass' => 'lab123',
        'role' => 'lab',
        'name' => 'Lab Tech Moses'
    ],
    'reception' => [
        'pass' => 'recep123',
        'role' => 'reception',
        'name' => 'Reception Aisha'
    ],
    'pharmacy' => [
        'pass' => 'pharm123',
        'role' => 'pharmacy',
        'name' => 'Pharmacist James'
    ],
    'billing' => [
        'pass' => 'bill123',
        'role' => 'billing',
        'name' => 'Billing Officer'
    ]
];

// Module permissions mapping corresponding to NAVS configuration in the original client app
$ROLE_PERMISSIONS = [
    'dashboard' => ['admin', 'doctor', 'nurse', 'lab', 'reception', 'pharmacy', 'billing'],
    'patients' => ['admin', 'doctor', 'nurse', 'reception'],
    'appointments' => ['admin', 'doctor', 'nurse', 'reception'],
    'encounters' => ['admin', 'doctor', 'nurse'],
    'ultrasound' => ['admin', 'doctor', 'nurse', 'lab'],
    'laboratory' => ['admin', 'doctor', 'nurse', 'lab'],
    'pharmacy' => ['admin', 'doctor', 'pharmacy', 'nurse'],
    'inventory' => ['admin', 'pharmacy', 'billing'],
    'billing' => ['admin', 'billing', 'reception'],
    'discharge' => ['admin', 'doctor', 'nurse'],
    'finance' => ['admin', 'billing'],
    'otc' => ['admin', 'pharmacy', 'billing', 'reception'],
];
?>
