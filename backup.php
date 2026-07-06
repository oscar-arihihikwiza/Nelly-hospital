<?php
// backup.php — Database Backup & Restore
require_once 'auth.php';
check_access(['admin']);

$pdo = get_pdo();
$msg = '';
$msgType = '';

// Handle restore upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['backup_file'])) {
    $file = $_FILES['backup_file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $msg = 'File upload failed. Error code: ' . $file['error'];
        $msgType = 'danger';
    } else {
        $content = file_get_contents($file['tmp_name']);
        $data = json_decode($content, true);
        if (!$data) {
            $msg = 'Invalid backup file — not valid JSON.';
            $msgType = 'danger';
        } else {
            try {
                $pdo->beginTransaction();
                $table_map = [
                    'patients'            => 'patients',
                    'appointments'        => 'appointments',
                    'encounters'          => 'encounters',
                    'inventory'           => 'inventory',
                    'lab_requests'        => 'lab_requests',
                    'lab_reports'         => 'lab_reports',
                    'us_requests'         => 'us_requests',
                    'us_reports'          => 'us_reports',
                    'prescriptions'       => 'prescriptions',
                    'dispensing_log'      => 'dispensing_log',
                    'billing'             => 'billing_invoices',
                    'billing_invoices'    => 'billing_invoices',
                    'discharge'           => 'discharge_summaries',
                    'discharge_summaries' => 'discharge_summaries',
                    'otc_sales'           => 'otc_sales',
                    'manual_income'       => 'manual_income',
                    'expenses'            => 'expenses',
                ];
                $restored = 0;
                foreach ($table_map as $key => $table) {
                    if (!isset($data[$key]) || !is_array($data[$key])) continue;
                    $rows = $data[$key];
                    if (empty($rows)) continue;
                    $pdo->exec("DELETE FROM $table");
                    $columns = array_keys($rows[0]);
                    $placeholders = implode(',', array_fill(0, count($columns), '?'));
                    $stmt = $pdo->prepare("INSERT INTO $table (" . implode(',', $columns) . ") VALUES ($placeholders)");
                    foreach ($rows as $row) {
                        $values = array_map(function($v) {
                            return is_array($v) ? json_encode($v) : $v;
                        }, array_values($row));
                        $stmt->execute($values);
                    }
                    $restored++;
                }
                $pdo->commit();
                $msg = "Restore successful! $restored table(s) restored from backup.";
                $msgType = 'success';
            } catch (Exception $e) {
                $pdo->rollBack();
                $msg = 'Restore failed: ' . $e->getMessage();
                $msgType = 'danger';
            }
        }
    }
}

// Download JSON backup
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'download') {
    $data = json_decode(get_database_json(), true);
    $data['_exported'] = date('c');
    $data['_system']   = 'HAK Medical & Physiotherapy Center';
    $data['_version']  = '1.0';
    $filename = 'HAK_Backup_' . date('Y-m-d_His') . '.json';
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-cache');
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

// Get table stats
$tables = ['patients','appointments','encounters','inventory','lab_requests','lab_reports',
           'us_requests','us_reports','prescriptions','dispensing_log','billing_invoices',
           'discharge_summaries','otc_sales','manual_income','expenses','users'];
$stats = [];
foreach ($tables as $t) {
    try {
        $s = $pdo->query("SELECT COUNT(*) as cnt FROM $t");
        $stats[$t] = (int)$s->fetchColumn();
    } catch (Exception $e) { $stats[$t] = 0; }
}
$totalRecords = array_sum($stats);

$page_title = 'Backup & Restore — HAK Medical';
require_once 'header.php';
?>

<!-- MODULE: BACKUP PAGE (rendered inside the normal layout) -->
<div class="page" id="pg-backup">
  <div style="max-width:820px;margin:0 auto">

    <?php if ($msg): ?>
    <div class="alert" style="background:<?= $msgType==='success'?'var(--okb)':'var(--erb)' ?>;color:<?= $msgType==='success'?'var(--ok)':'var(--er)' ?>;border:1.5px solid <?= $msgType==='success'?'var(--ok)':'var(--er)' ?>;border-radius:10px;padding:13px 18px;margin-bottom:18px;font-weight:500">
      <?= $msgType==='success'?'✓ ':'⚠ ' ?><?= htmlspecialchars($msg) ?>
    </div>
    <?php endif; ?>

    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div>
        <h2 style="font-family:var(--ff2);color:var(--t7);margin:0 0 4px">📦 Backup &amp; Restore</h2>
        <p style="color:var(--tx3);font-size:13px;margin:0">Download a full backup or restore from a previous backup file</p>
      </div>
      <a href="backup.php?action=download" class="btn btnp" style="text-decoration:none;display:inline-flex;align-items:center;gap:7px">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Download Backup (.json)
      </a>
    </div>

    <!-- Stats grid -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
      <?php foreach([
        ['Total Records', $totalRecords, '#eaf6fb', '#1a6b87'],
        ['Patients',      $stats['patients'],   '#e6f5ef', '#1d8a5e'],
        ['Appointments',  $stats['appointments'],'#fdf3e6','#c97c2e'],
        ['Invoices',      $stats['billing_invoices'],'var(--t1)','#0f3d4f'],
      ] as [$lbl,$val,$bg,$ic]): ?>
      <div style="background:<?=$bg?>;border-radius:12px;padding:14px 16px">
        <div style="font-size:10px;color:<?=$ic?>;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px"><?=$lbl?></div>
        <div style="font-family:var(--fs);font-size:24px;font-weight:700;color:<?=$ic?>"><?=number_format($val)?></div>
      </div>
      <?php endforeach; ?>
    </div>

    <!-- Table breakdown -->
    <div class="card mb14">
      <div class="ch"><h2>📊 Database Table Summary</h2><span class="t3 ts"><?= $totalRecords ?> total records across <?= count($tables) ?> tables</span></div>
      <div class="tw">
        <table>
          <thead><tr><th>Table</th><th style="text-align:right">Records</th><th>Description</th></tr></thead>
          <tbody>
          <?php
          $desc = [
            'patients'          => 'Registered patient records',
            'appointments'      => 'Appointment bookings (Pending/Scheduled/Completed)',
            'encounters'        => 'Clinical SOAP notes and encounters',
            'inventory'         => 'Drug and supplies inventory',
            'lab_requests'      => 'Laboratory test requests',
            'lab_reports'       => 'Laboratory results and reports',
            'us_requests'       => 'Ultrasound scan requests',
            'us_reports'        => 'Ultrasound scan reports',
            'prescriptions'     => 'Medication prescriptions',
            'dispensing_log'    => 'Pharmacy dispensing records',
            'billing_invoices'  => 'Patient invoices and payments',
            'discharge_summaries'=>'Hospital discharge summaries',
            'otc_sales'         => 'Over-the-counter sales',
            'manual_income'     => 'Manual income entries',
            'expenses'          => 'Expenditure records',
            'users'             => 'System user accounts',
          ];
          foreach($tables as $i => $t):
          ?>
          <tr style="<?= $i%2===0?'':'background:var(--iv)' ?>">
            <td><code style="background:var(--t0);padding:2px 7px;border-radius:5px;font-size:11.5px;color:var(--t7)"><?= $t ?></code></td>
            <td style="text-align:right;font-weight:700;font-family:var(--fs);color:var(--t7)"><?= number_format($stats[$t]) ?></td>
            <td style="color:var(--tx3);font-size:12.5px"><?= $desc[$t] ?? '—' ?></td>
          </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Download section -->
    <div class="card mb14">
      <div class="ch"><h2>⬇ Download Backup</h2></div>
      <div class="cb" style="padding:20px">
        <p style="color:var(--tx3);font-size:13px;margin-bottom:16px">
          Downloads a complete JSON backup of all database tables. Store this file securely — it contains all patient and clinical data.
        </p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a href="backup.php?action=download" class="btn btnp" style="text-decoration:none;display:inline-flex;align-items:center;gap:7px">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Download Full Backup
          </a>
          <button class="btn btno" onclick="downloadJSBackup()">
            ⬇ Download JS Snapshot
          </button>
        </div>
        <div style="background:var(--t0);border-radius:9px;padding:12px 16px;margin-top:14px;font-size:12px;color:var(--tx3);line-height:1.7">
          <strong style="color:var(--t7)">💡 Backup Tips:</strong><br>
          • Download backups regularly — daily for active clinics<br>
          • Store backups in Google Drive, a USB drive, or email them to yourself<br>
          • The JSON file can be used to restore data if the database is ever lost<br>
          • Keep multiple dated copies — don't overwrite older backups
        </div>
      </div>
    </div>

    <!-- Restore section -->
    <div class="card">
      <div class="ch">
        <h2>⬆ Restore from Backup</h2>
        <span style="background:var(--erb);color:var(--er);font-size:11px;padding:3px 9px;border-radius:99px;font-weight:600">⚠ Overwrites current data</span>
      </div>
      <div class="cb" style="padding:20px">
        <div style="background:var(--erb);border:1.5px solid var(--er);border-radius:9px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:var(--er)">
          <strong>⚠ Warning:</strong> Restoring a backup will <strong>overwrite all current data</strong> in the selected tables. This cannot be undone. Make sure to download a fresh backup first.
        </div>
        <form method="POST" action="backup.php" enctype="multipart/form-data">
          <div style="margin-bottom:14px">
            <label class="fl">Select Backup File (.json) *</label>
            <input type="file" name="backup_file" accept=".json" class="fi" required style="background:white;padding:9px">
          </div>
          <div style="display:flex;gap:10px">
            <button type="submit" class="btn btnd" onclick="return confirm('Are you sure? This will overwrite current data and cannot be undone.')">
              ⬆ Restore Database
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</div>

<script>
function downloadJSBackup() {
  // Use LOCAL_DB if available (from app.js context)
  if (typeof LOCAL_DB !== 'undefined') {
    const data = { ...LOCAL_DB, _exported: new Date().toISOString(), _system: 'HAK Medical & Physiotherapy Center' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'HAK_JS_Snapshot_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  } else {
    alert('JS snapshot not available on this page. Use the full backup download instead.');
  }
}

// Mark this as the backup page so bootApp doesn't redirect to dashboard
window._backupPage = true;
window.addEventListener('DOMContentLoaded', function() {
  // Ensure backup page is visible after bootApp runs
  var pg = document.getElementById('pg-backup');
  if (pg) {
    pg.classList.remove('phide');
    var tbtitle = document.getElementById('tbtitle');
    if (tbtitle) tbtitle.textContent = 'Backup & Restore';
    document.querySelectorAll('.sbi').forEach(function(i){ i.classList.remove('on'); });
    var sbn = document.getElementById('sbn-backup');
    if (sbn) sbn.classList.add('on');
  }
});
</script>

<?php require_once 'footer.php'; ?>
