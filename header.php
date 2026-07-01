<?php
// header.php
// Common header template with dynamically filtered sidebar based on role

require_once 'auth.php';
check_login();

$user = $_SESSION['user'];

// Define all navigation items (matching NAVS from config.php)
$nav_items = [
    'dashboard' => ['lb' => 'Dashboard', 'ico' => 'dashboard'],
    'patients' => ['lb' => 'Patients', 'ico' => 'patients'],
    'appointments' => ['lb' => 'Appointments', 'ico' => 'appointments'],
    'encounters' => ['lb' => 'Encounters', 'ico' => 'encounters'],
    'ultrasound' => ['lb' => 'Ultrasound', 'ico' => 'ultrasound'],
    'laboratory' => ['lb' => 'Laboratory', 'ico' => 'laboratory'],
    'pharmacy' => ['lb' => 'Pharmacy / Rx', 'ico' => 'pharmacy'],
    'inventory' => ['lb' => 'Inventory', 'ico' => 'inventory'],
    'billing' => ['lb' => 'Billing', 'ico' => 'billing'],
    'discharge' => ['lb' => 'Discharge', 'ico' => 'discharge'],
    'finance' => ['lb' => 'Finance', 'ico' => 'finance'],
    'otc' => ['lb' => 'OTC Sales', 'ico' => 'otc'],
    'staff' => ['lb' => 'Staff Management', 'ico' => 'dashboard']
];

// SVG Icons matching the original HAK Medical design
$nav_icons = [
    'dashboard' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>',
    'patients' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke-linecap="round"/></svg>',
    'appointments' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="2.5" width="13" height="12" rx="2"/><path d="M5 1v3M11 1v3M1.5 7h13" stroke-linecap="round"/></svg>',
    'encounters' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1.5" width="12" height="13" rx="1.5"/><path d="M5 6h6M5 9h4" stroke-linecap="round"/></svg>',
    'ultrasound' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="8" rx="6" ry="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/></svg>',
    'laboratory' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2v5L3 13h10l-3-6V2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 2h6" stroke-linecap="round"/></svg>',
    'pharmacy' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1.5" width="12" height="13" rx="1.5"/><path d="M6 8h4M8 6v4" stroke-linecap="round"/></svg>',
    'inventory' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="5" width="14" height="9" rx="1.5"/><path d="M5 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke-linecap="round"/></svg>',
    'billing' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3.5" width="14" height="9" rx="2"/><path d="M1 7.5h14M5 11h2M10 11h1" stroke-linecap="round"/></svg>',
    'finance' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12V5a1 1 0 011-1h12a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1z"/><path d="M5 8h6M8 6v4" stroke-linecap="round"/><circle cx="8" cy="8" r="2.5"/></svg>',
    'discharge' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10a1 1 0 011 1v11l-3-2-2 2-2-2-3 2V3a1 1 0 011-1z"/><path d="M6 6h4M6 9h3" stroke-linecap="round"/></svg>',
    'otc' => '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12l-1 9H3L2 4z"/><path d="M6 4V3a2 2 0 014 0v1M6 8h.01M10 8h.01" stroke-linecap="round"/></svg>'
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?php echo isset($page_title) ? $page_title : 'HAK Medical Center'; ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="index.css">
<script>
// Expose the server session user state to JavaScript
const CU = {
  username: <?php echo json_encode($user['username']); ?>,
  name: <?php echo json_encode($user['name']); ?>,
  role: <?php echo json_encode($user['role']); ?>
};
sessionStorage.setItem('hak_u', JSON.stringify(CU));
const SERVER_DB = <?php echo get_database_json(); ?>;
</script>
</head>
<body>
<div id="toast"></div>
<div class="po" id="parea"></div>

<!-- APP -->
<div id="sa" class="screen active">
  <aside class="sidebar">
    <div class="sblogo">
      <div class="sbmark">
        <div class="sbcross"><svg viewBox="0 0 22 22" fill="none"><rect x="9" y="2" width="4" height="18" rx="2" fill="white"/><rect x="2" y="9" width="18" height="4" rx="2" fill="white"/></svg></div>
        <div><div class="sbname">HAK Medical</div><div class="sbsub">Physiotherapy Center</div></div>
      </div>
    </div>
    <nav class="sbnav" id="sbnav">
      <div class="sbsec">Navigation</div>
      <?php
      global $ROLE_PERMISSIONS;
      foreach ($nav_items as $id => $item) {
          // Check server-side permissions: user role must be allowed for this module
          if (in_array($user['role'], $ROLE_PERMISSIONS[$id]) || $user['role'] === 'admin') {
              echo "<div class='sbi' id='sbn-{$id}' onclick='nav(\"{$id}\")'>";
              echo "<div class='sbico'>{$nav_icons[$item['ico']]}</div>";
              echo htmlspecialchars($item['lb']);
              echo "</div>";
          }
      }
      ?>
    </nav>
    <div class="sbuser">
      <div class="sbav" id="sbav"><?php echo strtoupper(substr($user['name'], 0, 2)); ?></div>
      <div>
        <div class="sbuname" id="sbuname"><?php echo htmlspecialchars($user['name']); ?></div>
        <div class="sbrole" id="sbrole"><?php echo htmlspecialchars($user['role']); ?></div>
      </div>
      <button class="sbout" onclick="window.location.href='logout.php'" title="Sign out">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" width="16" height="16">
          <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="sbfooter">Excellence in Care<br>Honesty in Action</div>
  </aside>

  <div class="main">
    <div class="topbar np">
      <div class="tbtitle" id="tbtitle">Dashboard</div>
      <div class="tbdate" id="tbdate"><?php echo date('D, j M Y'); ?></div>
      <div style="display:flex;gap:7px" id="tbact"></div>
      <button class="btn btno sm np" onclick="downloadBackup()" title="Download data backup">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Backup
      </button>
    </div>
    <div id="pages">
