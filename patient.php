<?php
// patient.php - Patient Portal
require_once 'auth.php';
check_login();

if ($_SESSION['user']['role'] !== 'patient') {
    header('Location: index.php');
    exit;
}

$user = $_SESSION['user'];
$pdo  = get_pdo();

// Find patient record by matching user name
$stmt = $pdo->prepare('SELECT * FROM patients WHERE fn || " " || ln = ? LIMIT 1');
$stmt->execute([$user['name']]);
$patient    = $stmt->fetch();
$patient_id = $patient ? $patient['id'] : null;

// Handle appointment booking POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'book_appointment') {
    if (!$patient_id) {
        header('Location: patient.php?error=No+patient+record+found');
        exit;
    }
    $date = trim($_POST['date'] ?? '');
    $time = trim($_POST['time'] ?? '');
    $pr   = trim($_POST['pr']   ?? 'Dr. Karim');
    $ty   = trim($_POST['ty']   ?? 'Consultation');
    $n    = trim($_POST['n']    ?? '');

    if (!$date || !$time) {
        header('Location: patient.php?error=Date+and+time+are+required');
        exit;
    }
    if ($date < date('Y-m-d')) {
        header('Location: patient.php?error=Please+select+a+future+date');
        exit;
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO appointments (pid, pn, date, time, pr, ty, n, st) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $pn   = $patient['fn'] . ' ' . $patient['ln'];
        $stmt->execute([$patient_id, $pn, $date, $time, $pr, $ty, $n, 'Pending']);
        header('Location: patient.php?booked=1');
        exit;
    } catch (Exception $e) {
        header('Location: patient.php?error=Booking+failed+please+try+again');
        exit;
    }
}

// Fetch this patient's own data directly from DB (not full DB dump)
$myAppts = $myEncs = $myLab = $myUS = $myRx = $myBills = [];
if ($patient_id) {
    $s = $pdo->prepare('SELECT * FROM appointments WHERE pid=? ORDER BY date DESC, time DESC'); $s->execute([$patient_id]); $myAppts = $s->fetchAll();
    $s = $pdo->prepare('SELECT * FROM encounters  WHERE pid=? ORDER BY date DESC');              $s->execute([$patient_id]); $myEncs  = $s->fetchAll();
    $s = $pdo->prepare('SELECT * FROM lab_reports  WHERE pid=? ORDER BY date DESC');             $s->execute([$patient_id]); $myLab   = $s->fetchAll();
    $s = $pdo->prepare('SELECT * FROM us_reports   WHERE pid=? ORDER BY date DESC');             $s->execute([$patient_id]); $myUS    = $s->fetchAll();
    $s = $pdo->prepare('SELECT * FROM prescriptions WHERE pid=? ORDER BY date DESC');            $s->execute([$patient_id]); $myRx    = $s->fetchAll();
    $s = $pdo->prepare('SELECT * FROM billing_invoices WHERE pid=? ORDER BY date DESC');         $s->execute([$patient_id]); $myBills = $s->fetchAll();
}

function statusBadge(string $st): string {
    $map = [
        'Pending'   => 'bg-warning text-dark',
        'Scheduled' => 'bg-primary',
        'Completed' => 'bg-success',
        'Cancelled' => 'bg-secondary',
        'Rejected'  => 'bg-danger',
    ];
    $cls = $map[$st] ?? 'bg-secondary';
    $lbl = $st === 'Pending' ? '⏳ Pending Approval' : $st;
    return "<span class=\"badge {$cls}\">{$lbl}</span>";
}
function billBadge(string $st): string {
    $map = ['Paid'=>'bg-success','Partial'=>'bg-warning text-dark','Unpaid'=>'bg-danger'];
    return '<span class="badge '.($map[$st]??'bg-secondary').'">'.$st.'</span>';
}
function fmUGX(float $n): string { return 'UGX '.number_format($n, 0); }
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Patient Portal — HAK Medical &amp; Physiotherapy Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
body{font-family:'Outfit',sans-serif;background:#f0f7fa;color:#0f1e25}
.portal-nav{background:linear-gradient(135deg,#0a2e3a,#145369);padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.portal-nav .brand{color:white;font-family:'Playfair Display',serif;font-size:20px;font-weight:700;display:flex;align-items:center;gap:10px}
.portal-nav .brand svg{width:32px;height:32px;flex-shrink:0}
.portal-nav .user-info{color:rgba(255,255,255,.8);font-size:13px;display:flex;align-items:center;gap:12px}
.profile-card{background:white;border-radius:14px;padding:20px 24px;margin-bottom:20px;box-shadow:0 2px 12px rgba(26,107,135,.1)}
.profile-field{border-bottom:1px solid #eaf3f7;padding:8px 0;display:flex;gap:8px}
.profile-field .lbl{font-size:10.5px;color:#5a7a8a;text-transform:uppercase;letter-spacing:.05em;min-width:120px;flex-shrink:0;margin-top:2px}
.profile-field .val{font-weight:500;font-size:13.5px}
.allergy-alert{background:#fceeed;border:1.5px solid #e88;border-radius:10px;padding:10px 14px;margin-top:12px;color:#b5322a;font-weight:600;font-size:13px}
.section-card{background:white;border-radius:14px;padding:0;margin-bottom:16px;box-shadow:0 2px 12px rgba(26,107,135,.08);overflow:hidden}
.section-card .sc-head{background:#eaf6fb;padding:14px 20px;font-weight:700;font-size:14px;color:#1a6b87;border-bottom:1px solid #d4eff8;display:flex;justify-content:space-between;align-items:center}
.section-card .sc-body{padding:16px 20px}
.nav-pills .nav-link{color:#5a7a8a;font-size:13px;padding:8px 16px;border-radius:99px;font-weight:500}
.nav-pills .nav-link.active{background:#2089ab;color:white}
.tab-content>.tab-pane{display:none}.tab-content>.tab-pane.show.active{display:block}
table th{font-size:11px;color:#5a7a8a;text-transform:uppercase;letter-spacing:.05em;background:#f7fbfd;border-bottom:1.5px solid #d4eff8 !important}
table td{font-size:13px;vertical-align:middle;border-color:#eef4f7 !important}
.btn-book{background:linear-gradient(135deg,#2089ab,#145369);color:white;border:none;border-radius:8px;padding:9px 20px;font-weight:600;font-size:13.5px;cursor:pointer;transition:all .2s}
.btn-book:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(32,137,171,.4)}
.empty-state{text-align:center;padding:32px 20px;color:#5a7a8a}
.empty-state .icon{font-size:36px;margin-bottom:8px;opacity:.5}
.modal-content{border-radius:14px;border:none;box-shadow:0 8px 32px rgba(10,46,58,.18)}
.modal-header{background:#eaf6fb;border-bottom:1px solid #d4eff8;border-radius:14px 14px 0 0}
.form-label{font-size:11px;color:#5a7a8a;text-transform:uppercase;letter-spacing:.05em;font-weight:600;margin-bottom:4px}
.form-control,.form-select{border:1.5px solid #cde6f0;border-radius:8px;font-size:13px;padding:9px 12px}
.form-control:focus,.form-select:focus{border-color:#2089ab;box-shadow:0 0 0 3px rgba(32,137,171,.15)}
.toast-fixed{position:fixed;bottom:20px;right:20px;z-index:9999;min-width:280px}
</style>
</head>
<body>

<!-- NAV -->
<nav class="portal-nav">
  <div class="brand">
    <svg viewBox="0 0 36 36" fill="none"><rect x="14.5" y="4" width="7" height="28" rx="3.5" fill="white" opacity=".9"/><rect x="4" y="14.5" width="28" height="7" rx="3.5" fill="white" opacity=".9"/></svg>
    HAK Medical &amp; Physiotherapy Center
  </div>
  <div class="user-info">
    <span>👋 <?php echo htmlspecialchars($user['name']); ?></span>
    <a href="logout.php" class="btn btn-sm btn-outline-light" style="border-color:rgba(255,255,255,.4);font-size:12px">Sign Out</a>
  </div>
</nav>

<!-- Toast -->
<div class="toast-fixed">
  <div id="liveToast" class="toast align-items-center text-bg-success border-0" role="alert">
    <div class="d-flex"><div class="toast-body" id="toastMsg"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>
  </div>
</div>

<div class="container py-4" style="max-width:960px">

<?php if (!$patient): ?>
<div class="alert alert-warning rounded-3 shadow-sm">
  <h5>👋 Welcome to your Patient Portal</h5>
  <p class="mb-0">Your account is not yet linked to a patient record. Please contact our reception desk — <strong>0705 062 567</strong> — and they will complete your registration.</p>
</div>
<?php else: ?>

<!-- PROFILE CARD -->
<div class="profile-card">
  <div class="d-flex justify-content-between align-items-start mb-3">
    <div>
      <h4 class="mb-0 fw-bold" style="color:#1a6b87"><?php echo htmlspecialchars($patient['fn'].' '.$patient['ln']); ?></h4>
      <div style="color:#5a7a8a;font-size:13px"><?php echo htmlspecialchars($patient['opd']); ?> &nbsp;·&nbsp;
        <?php echo $patient['age'] ? $patient['age'].'y' : '—'; ?> &nbsp;·&nbsp;
        <?php echo htmlspecialchars($patient['sex'] ?: '—'); ?>
      </div>
    </div>
    <button class="btn-book" onclick="showBookingModal()">+ Book Appointment</button>
  </div>
  <div class="row g-0">
    <?php foreach([
      ['Blood Type', $patient['bl'] ?: 'Unknown'],
      ['Phone', $patient['ph'] ?: '—'],
      ['Address', $patient['ad'] ?: '—'],
      ['Insurance', $patient['ins'] ?: 'None'],
      ['Occupation', $patient['oc'] ?: '—'],
      ['Emergency', $patient['em'] ?: '—'],
    ] as [$lbl,$val]): ?>
    <div class="col-md-4"><div class="profile-field"><span class="lbl"><?= $lbl ?></span><span class="val"><?= htmlspecialchars($val) ?></span></div></div>
    <?php endforeach; ?>
  </div>
  <?php if ($patient['al'] && $patient['al'] !== 'None'): ?>
  <div class="allergy-alert">⚠ Known Allergies: <?php echo htmlspecialchars($patient['al']); ?></div>
  <?php endif; ?>
</div>

<!-- TABS -->
<ul class="nav nav-pills mb-3 flex-wrap gap-1" id="portalTabs" role="tablist">
  <?php foreach([
    ['appts','Appointments',count($myAppts)],
    ['encs','Encounters',count($myEncs)],
    ['lab','Lab Reports',count($myLab)],
    ['us','Ultrasound',count($myUS)],
    ['rx','Prescriptions',count($myRx)],
    ['bills','Billing',count($myBills)],
  ] as $i=>[$tid,$lbl,$cnt]): ?>
  <li class="nav-item" role="presentation">
    <button class="nav-link <?= $i===0?'active':'' ?>" data-bs-toggle="pill" data-bs-target="#tab-<?= $tid ?>" type="button">
      <?= $lbl ?> <?php if($cnt>0): ?><span class="badge bg-secondary ms-1" style="font-size:10px"><?= $cnt ?></span><?php endif; ?>
    </button>
  </li>
  <?php endforeach; ?>
</ul>

<div class="tab-content">

<!-- TAB: APPOINTMENTS -->
<div class="tab-pane fade show active" id="tab-appts">
  <div class="section-card">
    <div class="sc-head">📅 Your Appointments <button class="btn-book btn btn-sm" onclick="showBookingModal()" style="font-size:12px;padding:5px 14px">+ Book New</button></div>
    <div class="sc-body">
      <?php if (empty($myAppts)): ?>
      <div class="empty-state"><div class="icon">📅</div><div>No appointments yet.</div><button class="btn-book mt-3" onclick="showBookingModal()">Book Your First Appointment</button></div>
      <?php else: ?>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead><tr><th>Date</th><th>Time</th><th>Provider</th><th>Type</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
          <?php foreach($myAppts as $a): ?>
          <tr>
            <td><?= date('d M Y', strtotime($a['date'])) ?></td>
            <td><?= htmlspecialchars($a['time'] ?? '—') ?></td>
            <td><?= htmlspecialchars($a['pr'] ?? '—') ?></td>
            <td><span class="badge bg-info text-dark"><?= htmlspecialchars($a['ty'] ?? '—') ?></span></td>
            <td><?= statusBadge($a['st'] ?? '') ?></td>
            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><?= htmlspecialchars($a['n'] ?? '—') ?></td>
          </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- TAB: ENCOUNTERS -->
<div class="tab-pane fade" id="tab-encs">
  <div class="section-card">
    <div class="sc-head">📋 Clinical Encounters</div>
    <div class="sc-body">
      <?php if (empty($myEncs)): ?>
      <div class="empty-state"><div class="icon">📋</div><div>No encounters recorded yet.</div></div>
      <?php else: ?>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead><tr><th>Date</th><th>Type</th><th>Provider</th><th>Complaint</th><th>Diagnosis</th><th>Status</th></tr></thead>
          <tbody>
          <?php foreach($myEncs as $e): ?>
          <tr>
            <td><?= date('d M Y', strtotime($e['date'])) ?></td>
            <td><span class="badge bg-light text-dark"><?= htmlspecialchars($e['ty'] ?? '—') ?></span></td>
            <td><?= htmlspecialchars($e['pr'] ?? '—') ?></td>
            <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><?= htmlspecialchars($e['c'] ?? '—') ?></td>
            <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><strong><?= htmlspecialchars($e['dx'] ?? '—') ?></strong></td>
            <td><span class="badge <?= $e['st']==='Completed'?'bg-success':'bg-primary' ?>"><?= htmlspecialchars($e['st'] ?? '—') ?></span></td>
          </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- TAB: LAB -->
<div class="tab-pane fade" id="tab-lab">
  <div class="section-card">
    <div class="sc-head">🧪 Laboratory Results</div>
    <div class="sc-body">
      <?php if (empty($myLab)): ?>
      <div class="empty-state"><div class="icon">🧪</div><div>No lab results yet.</div></div>
      <?php else: ?>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead><tr><th>Ref</th><th>Date</th><th>Tests</th><th>Performed By</th><th>Reviewed By</th></tr></thead>
          <tbody>
          <?php foreach($myLab as $r):
            $rows = json_decode($r['rows'] ?? '[]', true) ?: [];
            $tests = implode(', ', array_filter(array_map(fn($x)=>$x['t']??'', array_slice($rows,0,3))));
            if (count($rows)>3) $tests .= '…';
          ?>
          <tr>
            <td><strong style="color:#1a6b87"><?= htmlspecialchars($r['ref'] ?? '—') ?></strong></td>
            <td><?= date('d M Y', strtotime($r['date'])) ?></td>
            <td style="font-size:12px;color:#5a7a8a"><?= htmlspecialchars($tests ?: '—') ?></td>
            <td><?= htmlspecialchars($r['by'] ?? '—') ?></td>
            <td><?= htmlspecialchars($r['reviewed_by'] ?? '—') ?></td>
          </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- TAB: ULTRASOUND -->
<div class="tab-pane fade" id="tab-us">
  <div class="section-card">
    <div class="sc-head">🔊 Ultrasound Reports</div>
    <div class="sc-body">
      <?php if (empty($myUS)): ?>
      <div class="empty-state"><div class="icon">🔊</div><div>No ultrasound reports yet.</div></div>
      <?php else: ?>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead><tr><th>Ref</th><th>Date</th><th>Scan Type</th><th>Impression</th><th>By</th></tr></thead>
          <tbody>
          <?php foreach($myUS as $r): ?>
          <tr>
            <td><strong style="color:#1a6b87"><?= htmlspecialchars($r['ref'] ?? '—') ?></strong></td>
            <td><?= date('d M Y', strtotime($r['date'])) ?></td>
            <td><?= htmlspecialchars($r['ty'] ?? '—') ?></td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic"><?= htmlspecialchars($r['imp'] ?? '—') ?></td>
            <td><?= htmlspecialchars($r['by'] ?? '—') ?></td>
          </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- TAB: PRESCRIPTIONS -->
<div class="tab-pane fade" id="tab-rx">
  <div class="section-card">
    <div class="sc-head">💊 Prescriptions</div>
    <div class="sc-body">
      <?php if (empty($myRx)): ?>
      <div class="empty-state"><div class="icon">💊</div><div>No prescriptions yet.</div></div>
      <?php else: ?>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead><tr><th>Ref</th><th>Date</th><th>Clinician</th><th>Diagnosis</th><th>Medications</th></tr></thead>
          <tbody>
          <?php foreach($myRx as $r):
            $meds = json_decode($r['meds'] ?? '[]', true) ?: [];
            $medStr = implode(', ', array_filter(array_map(fn($m)=>$m['dr']??'', array_slice($meds,0,3))));
            if(count($meds)>3) $medStr.='…';
          ?>
          <tr>
            <td><strong style="color:#1a6b87"><?= htmlspecialchars($r['ref'] ?? '—') ?></strong></td>
            <td><?= date('d M Y', strtotime($r['date'])) ?></td>
            <td><?= htmlspecialchars($r['cl'] ?? '—') ?></td>
            <td><?= htmlspecialchars($r['dx'] ?? '—') ?></td>
            <td style="font-size:12px;color:#5a7a8a"><?= htmlspecialchars($medStr ?: '—') ?></td>
          </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- TAB: BILLING -->
<div class="tab-pane fade" id="tab-bills">
  <div class="section-card">
    <div class="sc-head">💳 Billing Records
      <?php
      $totalBilled = array_sum(array_column($myBills,'tot'));
      $totalPaid   = array_sum(array_column($myBills,'paid'));
      $totalBal    = $totalBilled - $totalPaid;
      ?>
      <?php if ($totalBilled > 0): ?>
      <span style="font-size:12px;font-weight:400;color:#5a7a8a">
        Total: <strong style="color:#1a6b87"><?= fmUGX($totalBilled) ?></strong> &nbsp;|&nbsp;
        Paid: <strong style="color:#1d8a5e"><?= fmUGX($totalPaid) ?></strong> &nbsp;|&nbsp;
        <?php if($totalBal>0): ?>Balance: <strong style="color:#b5322a"><?= fmUGX($totalBal) ?></strong>
        <?php else: ?><strong style="color:#1d8a5e">✓ Fully Paid</strong><?php endif; ?>
      </span>
      <?php endif; ?>
    </div>
    <div class="sc-body">
      <?php if (empty($myBills)): ?>
      <div class="empty-state"><div class="icon">💳</div><div>No billing records yet.</div></div>
      <?php else: ?>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th></tr></thead>
          <tbody>
          <?php foreach($myBills as $b): ?>
          <tr>
            <td><strong style="color:#1a6b87"><?= htmlspecialchars($b['ref'] ?? '—') ?></strong></td>
            <td><?= date('d M Y', strtotime($b['date'])) ?></td>
            <td><?= fmUGX((float)($b['tot']??0)) ?></td>
            <td style="color:#1d8a5e"><?= fmUGX((float)($b['paid']??0)) ?></td>
            <td style="color:<?= ($b['bal']??0)>0?'#b5322a':'#1d8a5e' ?>;font-weight:600"><?= fmUGX((float)($b['bal']??0)) ?></td>
            <td style="font-size:12px"><?= htmlspecialchars($b['mt'] ?? '—') ?></td>
            <td><?= billBadge($b['st'] ?? 'Unpaid') ?></td>
          </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>

</div><!-- /tab-content -->
<?php endif; ?>
</div><!-- /container -->

<!-- APPOINTMENT BOOKING MODAL -->
<div class="modal fade" id="bookingModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fw-bold" style="color:#1a6b87">📅 Book an Appointment</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form method="POST" action="patient.php" id="bookingForm">
        <input type="hidden" name="action" value="book_appointment">
        <div class="modal-body">
          <div id="book-alert" class="alert alert-danger d-none mb-3"></div>
          <div class="mb-3">
            <label class="form-label">Preferred Date *</label>
            <input type="date" name="date" id="book-date" class="form-control" required min="<?= date('Y-m-d') ?>">
          </div>
          <div class="mb-3">
            <label class="form-label">Preferred Time *</label>
            <input type="time" name="time" id="book-time" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Provider / Department</label>
            <select name="pr" class="form-select">
              <option value="Dr. Karim">Dr. Karim (General / OPD)</option>
              <option value="Physiotherapist">Physiotherapist</option>
              <option value="Nurse / Clinical Officer">Nurse / Clinical Officer</option>
              <option value="Lab Technician">Lab Technician</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Appointment Type</label>
            <select name="ty" class="form-select">
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Physio">Physiotherapy</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Antenatal">Antenatal</option>
              <option value="Vaccination">Vaccination</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Reason / Notes</label>
            <textarea name="n" class="form-control" rows="2" placeholder="Brief reason for your visit…"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn-book btn" style="border:none">📅 Submit Appointment Request</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
function showBookingModal(){
  document.getElementById('book-date').value = new Date().toISOString().slice(0,10);
  document.getElementById('book-alert').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('bookingModal')).show();
}
<?php if(isset($_GET['booked'])): ?>
document.addEventListener('DOMContentLoaded',()=>{
  const t=document.getElementById('liveToast');
  document.getElementById('toastMsg').textContent='✓ Appointment request submitted! Reception will confirm it shortly.';
  t.classList.remove('text-bg-success'); t.classList.add('text-bg-success');
  new bootstrap.Toast(t,{delay:6000}).show();
});
<?php endif; ?>
<?php if(isset($_GET['error'])): ?>
document.addEventListener('DOMContentLoaded',()=>{
  const t=document.getElementById('liveToast');
  document.getElementById('toastMsg').textContent='<?= htmlspecialchars($_GET['error']) ?>';
  t.classList.remove('text-bg-success'); t.classList.add('text-bg-danger');
  new bootstrap.Toast(t,{delay:5000}).show();
});
<?php endif; ?>
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
