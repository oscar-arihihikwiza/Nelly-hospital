<?php
// doctor.php
// Workspace page for Clinician Workspace

require_once 'auth.php';
check_access(['doctor']);

$page_title = "Clinician Workspace - HAK Medical";
require_once 'header.php';
?>

<!-- MODULE: DASHBOARD -->
<div class="page" id="pg-dashboard">
        <div class="wb"><div><div class="wbt" id="wbg">Good morning</div><div class="wbs" id="wbd"></div></div><div class="wbp">HAK Medical &amp; Physiotherapy Center</div></div>
        <div class="srow" id="dstats"></div>
        <div class="gr2">
          <div class="card"><div class="ch"><h2>Today's Appointments</h2><button class="btn btno sm" onclick="nav('appointments')">All</button></div><div class="tw"><table><thead><tr><th>Time</th><th>Patient</th><th>Type</th><th>Status</th></tr></thead><tbody id="dappts"></tbody></table></div></div>
          <div class="card"><div class="ch"><h2>Low Stock Alert</h2><button class="btn btno sm" onclick="nav('inventory')">View</button></div><div class="tw"><table><thead><tr><th>Item</th><th>Qty</th><th>Level</th></tr></thead><tbody id="dstock"></tbody></table></div></div>
          <div class="card"><div class="ch"><h2>Recent Patients</h2><button class="btn btno sm" onclick="nav('patients')">All</button></div><div class="tw"><table><thead><tr><th>OPD</th><th>Name</th><th>Age</th><th>Insurance</th></tr></thead><tbody id="dpats"></tbody></table></div></div>
          <div class="card"><div class="ch"><h2>Active Encounters</h2><button class="btn btno sm" onclick="nav('encounters')">All</button></div><div class="tw"><table><thead><tr><th>Patient</th><th>Type</th><th>Diagnosis</th><th>Status</th></tr></thead><tbody id="dencs"></tbody></table></div></div>
        </div>
      </div>

<!-- MODULE: PATIENTS -->
<div class="page phide" id="pg-patients">
        <div class="fxb mb12 np"><input class="fi" id="psrch" placeholder="Search name, OPD, phone…" style="width:220px" oninput="renderPats()"><button class="btn btnp" onclick="openPat()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>Register Patient</button></div>
        <div class="card"><div class="tw"><table><thead><tr><th>OPD</th><th>Full Name</th><th>Age</th><th>Sex</th><th>Blood</th><th>Phone</th><th>Address</th><th>Insurance</th><th>Registered</th><th></th></tr></thead><tbody id="ptbody"></tbody></table></div></div>
      </div>

<!-- MODULE: APPOINTMENTS -->
<div class="page phide" id="pg-appointments">
        <div class="fxb mb12 np">
          <div class="fxc">
            <div class="tabs">
              <button class="tab on" id="at-all" onclick="setAF('all')">All</button>
              <button class="tab" id="at-Pending" onclick="setAF('Pending')">Pending</button>
              <button class="tab" id="at-Scheduled" onclick="setAF('Scheduled')">Scheduled</button>
              <button class="tab" id="at-Completed" onclick="setAF('Completed')">Completed</button>
            </div>
            <input type="date" class="fi" id="adf" style="width:145px" onchange="renderAppts()">
          </div>
          <button class="btn btnp" onclick="openAppt()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>New Appointment</button>
        </div>
        <div class="card"><div class="tw"><table><thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Provider</th><th>Type</th><th>Notes</th><th>Status</th><th></th></tr></thead><tbody id="atbody"></tbody></table></div></div>
      </div>

<!-- MODULE: ENCOUNTERS -->
<div class="page phide" id="pg-encounters">
        <div class="fxb mb12 np"><div class="tabs"><button class="tab on" id="ef-all" onclick="setEF('all')">All</button><button class="tab" id="ef-Active" onclick="setEF('Active')">Active</button><button class="tab" id="ef-Completed" onclick="setEF('Completed')">Completed</button></div><button class="btn btnp" onclick="openEnc()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>New Encounter</button></div>
        <div class="card"><div class="tw"><table><thead><tr><th>Date</th><th>Patient</th><th>Type</th><th>Provider</th><th>Complaint</th><th>Diagnosis</th><th>Status</th><th></th></tr></thead><tbody id="etbody"></tbody></table></div></div>
      </div>

<!-- MODULE: ULTRASOUND -->
<div class="page phide" id="pg-ultrasound">
        <div class="fxb mb12 np"><div class="tabs"><button class="tab on" id="ut-r" onclick="setUT('r')">Requests</button><button class="tab" id="ut-p" onclick="setUT('p')">Reports</button></div><div class="fxc"><button class="btn btno" onclick="openUSRep()">Enter Report</button><button class="btn btnp" onclick="openUSReq()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>New Request</button></div></div>
        <div id="usrp"><div class="card"><div class="ch"><h2>Ultrasound Requests</h2></div><div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Patient</th><th>Scans</th><th>Clinician</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody id="usrtb"></tbody></table></div></div></div>
        <div id="uspp" style="display:none"><div class="card"><div class="ch"><h2>Ultrasound Reports</h2></div><div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Patient</th><th>Scan</th><th>Impression</th><th>By</th><th></th></tr></thead><tbody id="usptb"></tbody></table></div></div></div>
      </div>

<!-- MODULE: LABORATORY -->
<div class="page phide" id="pg-laboratory">
        <div class="fxb mb12 np"><div class="tabs"><button class="tab on" id="lt-r" onclick="setLT('r')">Requests</button><button class="tab" id="lt-p" onclick="setLT('p')">Results</button></div><div class="fxc"><button class="btn btno" onclick="openLabRep()">Enter Results</button><button class="btn btnp" onclick="openLabReq()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>New Request</button></div></div>
        <div id="lrp"><div class="card"><div class="ch"><h2>Lab Requests</h2></div><div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Patient</th><th>Tests</th><th>Clinician</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody id="lrtb"></tbody></table></div></div></div>
        <div id="lpp" style="display:none"><div class="card"><div class="ch"><h2>Lab Results</h2></div><div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Patient</th><th>Tests</th><th>By</th><th></th></tr></thead><tbody id="lptb"></tbody></table></div></div></div>
      </div>

<!-- MODULE: PHARMACY -->
<div class="page phide" id="pg-pharmacy">
        <div class="fxb mb12 np"><div class="tabs"><button class="tab on" id="rxt-r" onclick="setRT('r')">Prescriptions</button><button class="tab" id="rxt-d" onclick="setRT('d')">Dispensing Log</button></div><div class="fxc"><button class="btn btno" onclick="openDis()">Dispense</button><button class="btn btnp" onclick="openRx()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>New Prescription</button></div></div>
        <div id="rxp"><div class="card"><div class="ch"><h2>Prescriptions</h2></div><div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Patient</th><th>Medications</th><th>Clinician</th><th>Diagnosis</th><th></th></tr></thead><tbody id="rxtb"></tbody></table></div></div></div>
        <div id="dip" style="display:none">
          <div class="card">
            <div class="ch"><h2>Dispensing Log</h2></div>
            <div class="tw"><table><thead><tr><th>Date</th><th>Patient</th><th>Item</th><th>Qty Dispensed</th><th>Unit Price (UGX)</th><th>Total (UGX)</th><th>Dispensed By</th></tr></thead><tbody id="ditb"></tbody>
            <tfoot id="dis-tfoot" style="display:none">
              <tr style="background:var(--t0);font-weight:600">
                <td colspan="3" style="padding:10px 11px;color:var(--t7);font-size:12px;text-align:right">TOTALS:</td>
                <td id="dis-tot-qty" style="padding:10px 11px;color:var(--t7)"></td>
                <td></td>
                <td id="dis-tot-val" style="padding:10px 11px;color:var(--ok)"></td>
                <td></td>
              </tr>
            </tfoot>
            </table></div>
            <div id="dis-summary" style="display:none;padding:12px 18px;border-top:1px solid var(--bd);display:flex;gap:20px;flex-wrap:wrap"></div>
          </div>
        </div>
      </div>

<!-- MODULE: DISCHARGE -->
<div class="page phide" id="pg-discharge">
        <div class="fxb mb12 np"><span class="t3 ts">Discharge summaries &amp; medical forms</span><div class="fxc"><button class="btn btno" onclick="openMedForm()">📋 Medical Forms</button><button class="btn btnp" onclick="openDC()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>New Discharge</button></div></div>
        <div class="card"><div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Patient</th><th>Admitted</th><th>Discharge Dx</th><th>Clinician</th><th>Condition</th><th></th></tr></thead><tbody id="dctb"></tbody></table></div></div>
      </div>

<?php
require_once 'footer.php';
?>
