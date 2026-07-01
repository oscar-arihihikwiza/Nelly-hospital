<?php
// reception.php
// Workspace page for Reception & Registration Workspace

require_once 'auth.php';
check_access(['reception']);

$page_title = "Reception & Registration Workspace - HAK Medical";
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
          <div class="fxc"><div class="tabs"><button class="tab on" id="at-all" onclick="setAF('all')">All</button><button class="tab" id="at-Pending" onclick="setAF('Pending')">Pending</button><button class="tab" id="at-Scheduled" onclick="setAF('Scheduled')">Scheduled</button><button class="tab" id="at-Completed" onclick="setAF('Completed')">Completed</button></div><input type="date" class="fi" id="adf" style="width:145px" onchange="renderAppts()"></div>
          <button class="btn btnp" onclick="openAppt()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>New Appointment</button>
        </div>
        <div class="card"><div class="tw"><table><thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Provider</th><th>Type</th><th>Notes</th><th>Status</th><th></th></tr></thead><tbody id="atbody"></tbody></table></div></div>
      </div>

<!-- MODULE: BILLING -->
<div class="page phide" id="pg-billing">
        <!-- BILLING SUMMARY STATS -->
        <div id="bill-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px"></div>
        <!-- QUICK INVOICE SECTION -->
        <div class="card mb14" id="quick-invoice-card">
          <div class="ch" style="cursor:pointer" onclick="toggleQuickInvoice()">
            <h2>📋 Issue New Invoice</h2>
            <span style="font-size:12px;color:var(--tx3)">Click to expand and issue an invoice directly from this page</span>
            <button class="btn btno sm" style="margin-left:auto" id="qi-toggle-btn">▼ Expand</button>
          </div>
          <div id="qi-body" style="display:none;padding:18px 20px">
            <div class="g2 mb12">
              <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="qi-p" onchange="qiPatChange()"></select></div>
              <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="qi-date"></div>
            </div>
            <!-- Invoice Items -->
            <div class="stit">Invoice Items</div>
            <div id="qi-rows"></div>
            <button class="btn btno sm mb12" onclick="addQIRow()">+ Add Item</button>
            <!-- Grand Total bar -->
            <div style="background:var(--t7);border-radius:var(--r);padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:12px;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.06em">Grand Total</span>
              <span id="qi-tot" style="font-family:var(--fs);font-size:20px;font-weight:700;color:white">UGX 0</span>
            </div>
            <!-- Multiple Payments -->
            <div class="stit" style="margin-bottom:8px">Payments Received <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx3);font-size:11px">— one row per payment method or instalment</span></div>
            <div id="qi-pay-rows"></div>
            <button class="btn btno sm mb12" onclick="addQIPayRow()">+ Add Payment</button>
            <!-- Summary cards -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:12px">
              <div style="background:var(--t0);border-radius:var(--r);padding:9px 12px;text-align:center">
                <div style="font-size:10px;color:var(--t7);text-transform:uppercase;margin-bottom:2px">Total Billed</div>
                <div id="qi-tot2" style="font-family:var(--fs);font-size:16px;font-weight:700;color:var(--t7)">UGX 0</div>
              </div>
              <div style="background:var(--okb);border-radius:var(--r);padding:9px 12px;text-align:center">
                <div style="font-size:10px;color:var(--ok);text-transform:uppercase;margin-bottom:2px">Total Paid</div>
                <div id="qi-pd-disp" style="font-family:var(--fs);font-size:16px;font-weight:700;color:var(--ok)">UGX 0</div>
              </div>
              <div id="qi-bal-card" style="background:var(--erb);border-radius:var(--r);padding:9px 12px;text-align:center">
                <div id="qi-bal-lbl" style="font-size:10px;color:var(--er);text-transform:uppercase;margin-bottom:2px">Balance Due</div>
                <div id="qi-ba" style="font-family:var(--fs);font-size:16px;font-weight:700;color:var(--er)">UGX 0</div>
              </div>
            </div>
            <div class="fg"><label class="fl">Notes</label><textarea class="ft" id="qi-n" style="min-height:40px" placeholder="Any additional notes…"></textarea></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
              <button class="btn btno" onclick="saveQI(true)">🖨 Save &amp; Print Receipt</button>
              <button class="btn btns" onclick="saveQI(false)">✓ Issue Invoice</button>
            </div>
          </div>
        </div>
        <!-- INVOICE TABLE -->
        <div class="card">
          <div class="ch">
            <div class="tabs" style="margin-bottom:0">
              <button class="tab on" id="bt-all" onclick="setBF('all')">All</button>
              <button class="tab" id="bt-Unpaid" onclick="setBF('Unpaid')">Unpaid</button>
              <button class="tab" id="bt-Paid" onclick="setBF('Paid')">Paid</button>
              <button class="tab" id="bt-Partial" onclick="setBF('Partial')">Partial</button>
            </div>
            <button class="btn btno sm" onclick="openBill()" style="margin-left:auto">+ Via Dialog</button>
          </div>
          <div class="tw"><table><thead><tr><th>Invoice</th><th>Date</th><th>Patient</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th><th></th></tr></thead><tbody id="bltb"></tbody></table></div>
        </div>
      </div>

<!-- MODULE: OTC -->
<div class="page phide" id="pg-otc">
        <!-- Stats -->
        <div id="otc-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px"></div>
        <!-- Filters + New Sale button -->
        <div class="fxb mb12 np">
          <div class="fxc">
            <div class="tabs">
              <button class="tab on" id="otc-td" onclick="setOTCF('today')">Today</button>
              <button class="tab" id="otc-wk" onclick="setOTCF('week')">Last 7 Days</button>
              <button class="tab" id="otc-al" onclick="setOTCF('all')">All Time</button>
            </div>
            <input type="date" class="fi" id="otc-df" style="width:145px" onchange="renderOTC()" title="Filter by specific date">
          </div>
          <div class="fxc">
            <span id="otc-count" class="t3 ts"></span>
            <button class="btn btno sm" onclick="printOTCReport()">🖨 Print Report</button>
            <button class="btn btnp" onclick="openOTCSale()">+ New OTC Sale</button>
          </div>
        </div>
        <!-- Sales Table -->
        <div class="card">
          <div class="ch"><h2>Over-The-Counter Sales Log</h2></div>
          <div class="tw">
            <table>
              <thead><tr>
                <th>#</th><th>Date &amp; Time</th><th>Items Sold</th><th>Total Qty</th>
                <th>Unit Price</th><th>Total (UGX)</th><th>Payment</th><th>Served By</th><th>Notes</th><th></th>
              </tr></thead>
              <tbody id="otctb"></tbody>
              <tfoot id="otc-tfoot" style="display:none">
                <tr style="background:var(--t0);font-weight:600">
                  <td colspan="3" style="padding:10px 11px;color:var(--t7);text-align:right;font-size:12px">TOTALS:</td>
                  <td id="otc-tot-qty" style="padding:10px 11px;color:var(--t7)"></td>
                  <td></td>
                  <td id="otc-tot-val" style="padding:10px 11px;color:var(--ok);font-size:13px"></td>
                  <td colspan="4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

<?php
require_once 'footer.php';
?>
