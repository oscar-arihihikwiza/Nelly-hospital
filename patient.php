<?php
// patient.php
// Patient portal - see own records and book appointments

require_once 'auth.php';
check_login();

if ($_SESSION['user']['role'] !== 'patient') {
    header('Location: index.php');
    exit;
}

$user = $_SESSION['user'];
$pdo = get_pdo();

// Find patient by name (or later add a user-patient mapping)
$stmt = $pdo->prepare('SELECT * FROM patients WHERE fn || " " || ln = ? LIMIT 1');
$stmt->execute([$user['name']]);
$patient = $stmt->fetch();

if (!$patient) {
    // If no patient found, maybe redirect to register, but let's just handle it
    $patient = null;
}

$patient_id = $patient ? $patient['id'] : null;
?>
<?php
// Create a modified header without sidebar (or simplified)
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Patient Portal - HAK Medical &amp; Physiotherapy Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="index.css">
<script>
const SERVER_DB = <?php echo get_database_json(); ?>;
const KEY_MAP = {
  'patients': 'patients',
  'appointments': 'appointments',
  'encounters': 'encounters',
  'inventory': 'inventory',
  'lab_req': 'lab_requests',
  'lab_rep': 'lab_reports',
  'us_req': 'us_requests',
  'us_rep': 'us_reports',
  'rx': 'prescriptions',
  'dis': 'dispensing_log',
  'billing': 'billing',
  'discharge': 'discharge',
  'otc_sales': 'otc_sales',
  'manual_income': 'manual_income',
  'expenses': 'expenses'
};
let LOCAL_DB = {};
function initDB() {
  for (const [appKey, tableKey] of Object.entries(KEY_MAP)) {
    LOCAL_DB[appKey] = SERVER_DB[tableKey] || [];
  }
}
initDB();
const DB={
  get(k){ return LOCAL_DB[k] || []; },
  set(k,v){
    LOCAL_DB[k] = v;
    const tableKey = KEY_MAP[k] || k;
    try {
      const formData = new FormData();
      formData.append('key', tableKey);
      formData.append('data', JSON.stringify(v));
      fetch('api.php?action=save', { method: 'POST', body: formData });
    } catch (e) { console.error('Sync error:', e); }
  },
  id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
};
function fd(d){if(!d)return'—';return new Date(d+'T00:00:00').toLocaleDateString('en-UG',{day:'2-digit',month:'short',year:'numeric'});}
function td(){return new Date().toISOString().slice(0,10);}
</script>
</head>
<body>
<div id="toast"></div>
<div class="po" id="parea"></div>

<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold" style="color: #2089ab;">HAK Medical Center</h2>
            <p class="mb-0 text-muted">Patient Portal</p>
        </div>
        <div class="d-flex gap-2 align-items-center">
            <span class="fw-semibold">Hi, <?php echo htmlspecialchars($user['name']); ?></span>
            <a href="logout.php" class="btn btn-outline-danger btn-sm">Logout</a>
        </div>
    </div>

    <?php if (!$patient): ?>
        <div class="alert alert-warning">
            <h4>Welcome!</h4>
            <p>We don't have your patient record yet. Please contact reception to complete your registration.</p>
        </div>
    <?php else: ?>
        <!-- Patient Profile -->
        <div class="card mb-4">
            <div class="card-body">
                <h4 class="card-title">Profile</h4>
                <div class="row">
                    <div class="col-md-3"><strong>OPD Number:</strong> <?php echo htmlspecialchars($patient['opd']); ?></div>
                    <div class="col-md-3"><strong>Name:</strong> <?php echo htmlspecialchars($patient['fn'] . ' ' . $patient['ln']); ?></div>
                    <div class="col-md-3"><strong>Age:</strong> <?php echo htmlspecialchars($patient['age'] ?: '—'); ?></div>
                    <div class="col-md-3"><strong>Sex:</strong> <?php echo htmlspecialchars($patient['sex'] ?: '—'); ?></div>
                    <div class="col-md-3"><strong>Blood Type:</strong> <?php echo htmlspecialchars($patient['bl'] ?: '—'); ?></div>
                    <div class="col-md-3"><strong>Phone:</strong> <?php echo htmlspecialchars($patient['ph'] ?: '—'); ?></div>
                    <div class="col-md-3"><strong>Insurance:</strong> <?php echo htmlspecialchars($patient['ins'] ?: 'None'); ?></div>
                    <div class="col-md-3"><strong>Allergies:</strong> <?php echo htmlspecialchars($patient['al'] ?: 'None'); ?></div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4" id="patientTabs" role="tablist">
            <li class="nav-item">
                <button class="nav-link active" id="appointments-tab" data-bs-toggle="tab" data-bs-target="#appointments" type="button">Appointments</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" id="encounters-tab" data-bs-toggle="tab" data-bs-target="#encounters" type="button">Encounters</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" id="lab-tab" data-bs-toggle="tab" data-bs-target="#lab" type="button">Lab Reports</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" id="us-tab" data-bs-toggle="tab" data-bs-target="#us" type="button">Ultrasound Reports</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" id="rx-tab" data-bs-toggle="tab" data-bs-target="#rx" type="button">Prescriptions</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" id="billing-tab" data-bs-toggle="tab" data-bs-target="#billing" type="button">Billing</button>
            </li>
        </ul>

        <div class="tab-content" id="patientTabsContent">
            <!-- Appointments -->
            <div class="tab-pane fade show active" id="appointments">
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Your Appointments</h5>
                        <button class="btn btn-primary btn-sm mb-3" onclick="openAppointmentForm()">Book New Appointment</button>
                        <div id="appointments-list"></div>
                    </div>
                </div>
            </div>

            <!-- Encounters -->
            <div class="tab-pane fade" id="encounters">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Your Encounters</h5>
                        <div id="encounters-list"></div>
                    </div>
                </div>
            </div>

            <!-- Lab Reports -->
            <div class="tab-pane fade" id="lab">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Lab Reports</h5>
                        <div id="lab-list"></div>
                    </div>
                </div>
            </div>

            <!-- Ultrasound Reports -->
            <div class="tab-pane fade" id="us">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Ultrasound Reports</h5>
                        <div id="us-list"></div>
                    </div>
                </div>
            </div>

            <!-- Prescriptions -->
            <div class="tab-pane fade" id="rx">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Prescriptions</h5>
                        <div id="rx-list"></div>
                    </div>
                </div>
            </div>

            <!-- Billing -->
            <div class="tab-pane fade" id="billing">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Billing Records</h5>
                        <div id="billing-list"></div>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<!-- Appointment Booking Modal -->
<div class="modal fade" id="appointmentModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Book Appointment</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Date</label>
                    <input type="date" id="appt-date" class="form-control">
                </div>
                <div class="mb-3">
                    <label class="form-label">Time</label>
                    <input type="time" id="appt-time" class="form-control">
                </div>
                <div class="mb-3">
                    <label class="form-label">Provider</label>
                    <select id="appt-pr" class="form-select">
                        <option value="Dr. Karim">Dr. Karim</option>
                        <option value="Physiotherapist">Physiotherapist</option>
                        <option value="Nurse">Nurse</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Type</label>
                    <select id="appt-ty" class="form-select">
                        <option value="Consultation">Consultation</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Physio">Physiotherapy</option>
                        <option value="Ultrasound">Ultrasound</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Notes</label>
                    <textarea id="appt-n" class="form-control" rows="2"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveAppointment()">Book</button>
            </div>
        </div>
    </div>
</div>

<script>
const PATIENT_ID = <?php echo json_encode($patient_id); ?>;
const PATIENT_NAME = <?php echo json_encode($patient ? $patient['fn'] . ' ' . $patient['ln'] : ''); ?>;

function renderAppointments() {
    if (!PATIENT_ID) return;
    const appts = DB.get('appointments').filter(a => a.pid == PATIENT_ID);
    const list = document.getElementById('appointments-list');
    if (appts.length === 0) {
        list.innerHTML = '<p class="text-muted">No appointments yet.</p>';
        return;
    }
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Date</th><th>Time</th><th>Provider</th><th>Type</th><th>Status</th><th>Notes</th></tr></thead>';
    html += '<tbody>';
    for (const a of appts) {
        let statusBadge = '';
        switch (a.st) {
            case 'Pending': statusBadge = '<span class="badge bg-warning text-dark">Pending Approval</span>'; break;
            case 'Scheduled': statusBadge = '<span class="badge bg-primary">Scheduled</span>'; break;
            case 'Completed': statusBadge = '<span class="badge bg-success">Completed</span>'; break;
            case 'Cancelled': statusBadge = '<span class="badge bg-danger">Cancelled</span>'; break;
            case 'Rejected': statusBadge = '<span class="badge bg-danger">Rejected</span>'; break;
        }
        html += `<tr><td>${fd(a.date)}</td><td>${a.time}</td><td>${a.pr}</td><td>${a.ty}</td><td>${statusBadge}</td><td>${a.n || '—'}</td></tr>`;
    }
    html += '</tbody></table></div>';
    list.innerHTML = html;
}

function renderEncounters() {
    if (!PATIENT_ID) return;
    const encs = DB.get('encounters').filter(e => e.pid == PATIENT_ID);
    const list = document.getElementById('encounters-list');
    if (encs.length === 0) {
        list.innerHTML = '<p class="text-muted">No encounters yet.</p>';
        return;
    }
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Date</th><th>Type</th><th>Provider</th><th>Complaint</th><th>Diagnosis</th><th>Status</th></tr></thead>';
    html += '<tbody>';
    for (const e of encs) {
        html += `<tr><td>${fd(e.date)}</td><td>${e.ty}</td><td>${e.pr}</td><td>${e.c}</td><td>${e.dx}</td><td><span class="badge ${e.st === 'Completed' ? 'bg-success' : 'bg-primary'}">${e.st}</span></td></tr>`;
    }
    html += '</tbody></table></div>';
    list.innerHTML = html;
}

function renderLab() {
    if (!PATIENT_ID) return;
    const reps = DB.get('lab_rep').filter(r => r.pid == PATIENT_ID);
    const list = document.getElementById('lab-list');
    if (reps.length === 0) {
        list.innerHTML = '<p class="text-muted">No lab reports yet.</p>';
        return;
    }
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Ref</th><th>Date</th><th>Performed By</th><th>Reviewed By</th></tr></thead>';
    html += '<tbody>';
    for (const r of reps) {
        html += `<tr><td><strong>${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.by || '—'}</td><td>${r.reviewed_by || '—'}</td></tr>`;
    }
    html += '</tbody></table></div>';
    list.innerHTML = html;
}

function renderUS() {
    if (!PATIENT_ID) return;
    const reps = DB.get('us_rep').filter(r => r.pid == PATIENT_ID);
    const list = document.getElementById('us-list');
    if (reps.length === 0) {
        list.innerHTML = '<p class="text-muted">No ultrasound reports yet.</p>';
        return;
    }
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Ref</th><th>Date</th><th>Type</th><th>Performed By</th></tr></thead>';
    html += '<tbody>';
    for (const r of reps) {
        html += `<tr><td><strong>${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.ty || '—'}</td><td>${r.by || '—'}</td></tr>`;
    }
    html += '</tbody></table></div>';
    list.innerHTML = html;
}

function renderRx() {
    if (!PATIENT_ID) return;
    const rx = DB.get('rx').filter(r => r.pid == PATIENT_ID);
    const list = document.getElementById('rx-list');
    if (rx.length === 0) {
        list.innerHTML = '<p class="text-muted">No prescriptions yet.</p>';
        return;
    }
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Ref</th><th>Date</th><th>Clinician</th><th>Diagnosis</th></tr></thead>';
    html += '<tbody>';
    for (const r of rx) {
        html += `<tr><td><strong>${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.cl || '—'}</td><td>${r.dx || '—'}</td></tr>`;
    }
    html += '</tbody></table></div>';
    list.innerHTML = html;
}

function renderBilling() {
    if (!PATIENT_ID) return;
    const bills = DB.get('billing').filter(b => b.pid == PATIENT_ID);
    const list = document.getElementById('billing-list');
    if (bills.length === 0) {
        list.innerHTML = '<p class="text-muted">No billing records yet.</p>';
        return;
    }
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Ref</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>';
    html += '<tbody>';
    for (const b of bills) {
        let statusBadge = '';
        switch (b.st) {
            case 'Paid': statusBadge = '<span class="badge bg-success">Paid</span>'; break;
            case 'Partial': statusBadge = '<span class="badge bg-warning text-dark">Partial</span>'; break;
            case 'Unpaid': statusBadge = '<span class="badge bg-danger">Unpaid</span>'; break;
        }
        html += `<tr><td><strong>${b.ref}</strong></td><td>${fd(b.date)}</td><td>UGX ${(b.tot || 0).toLocaleString()}</td><td>UGX ${(b.paid || 0).toLocaleString()}</td><td>UGX ${(b.bal || 0).toLocaleString()}</td><td>${statusBadge}</td></tr>`;
    }
    html += '</tbody></table></div>';
    list.innerHTML = html;
}

function openAppointmentForm() {
    document.getElementById('appt-date').value = td();
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    modal.show();
}

function saveAppointment() {
    if (!PATIENT_ID) { alert('No patient record found!'); return; }
    const date = document.getElementById('appt-date').value;
    const time = document.getElementById('appt-time').value;
    const pr = document.getElementById('appt-pr').value;
    const ty = document.getElementById('appt-ty').value;
    const n = document.getElementById('appt-n').value;
    
    if (!date || !time) { alert('Please select date and time!'); return; }
    
    const appts = DB.get('appointments');
    appts.unshift({
        id: DB.id(),
        pid: PATIENT_ID,
        pn: PATIENT_NAME,
        date,
        time,
        pr,
        ty,
        n,
        st: 'Pending'
    });
    DB.set('appointments', appts);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
    modal.hide();
    renderAppointments();
    alert('Appointment booked! Pending approval from reception.');
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderAppointments();
    renderEncounters();
    renderLab();
    renderUS();
    renderRx();
    renderBilling();
});
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>