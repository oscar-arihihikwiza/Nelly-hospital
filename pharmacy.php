<?php
// pharmacy.php
// Workspace page for Pharmacy Workspace

require_once 'auth.php';
check_access(['pharmacy']);

$page_title = "Pharmacy Workspace - HAK Medical";
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

<!-- MODULE: INVENTORY -->
<div class="page phide" id="pg-inventory">
        <div class="fxb mb12 np">
          <div class="fxc">
            <input class="fi" id="invsrch" placeholder="Search by name or category…" style="width:230px" oninput="renderInv()">
            <button class="btn btno sm" onclick="clearInvSearch()" title="Show all items">Show All</button>
          </div>
          <button class="btn btnp" onclick="openInvAdd()"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10M2 7h10" stroke-linecap="round"/></svg>Add Item</button>
        </div>
        <!-- Inventory Summary Stats -->
        <div id="inv-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px"></div>
        <div class="card">
          <div class="ch" style="padding-bottom:8px">
            <h2>All Inventory Items</h2>
            <span id="inv-count" class="t3 ts"></span>
          </div>
          <div class="tw"><table><thead><tr><th>#</th><th>Item Name</th><th>Category</th><th>Unit</th><th>In Stock</th><th>Reorder Level</th><th>Cost (UGX)</th><th>Price (UGX)</th><th>Supplier</th><th>Location</th><th>Expiry</th><th>Status</th><th>Action</th></tr></thead><tbody id="invtb"></tbody></table></div>
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
