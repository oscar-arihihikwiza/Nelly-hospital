<?php
// lab.php
// Workspace page for Lab & Imaging Workspace

require_once 'auth.php';
check_access(['lab']);

$page_title = "Lab & Imaging Workspace - HAK Medical";
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

<?php
require_once 'footer.php';
?>
