    </div><!-- /#pages -->
    
    <div class="appftr np">
      <span class="t3 ts">HAK Medical &amp; Physiotherapy Center &nbsp;|&nbsp; 30m off Gayaza Road to Magere &nbsp;|&nbsp; 0705 062 567 / 0773 029 999</span>
      <span class="appftrmotto">Excellence in Care, Honesty in Action</span>
    </div>
  </div><!-- /.main -->
</div><!-- /#sa -->

<!-- MODAL: REGISTER PATIENT -->
<div class="ov" id="ov-pat"><div class="modal" style="max-width:720px">
  <div class="mh"><div><h3 id="pat-mtit">Register New Patient</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><button class="btn btng xs" onclick="closeOv('ov-pat')">✕</button></div>
  <div class="mb"><div class="g2 mb12">
    <div class="fg"><label class="fl">First Name *</label><input class="fi" id="pf-fn" placeholder="First name"></div>
    <div class="fg"><label class="fl">Last Name *</label><input class="fi" id="pf-ln" placeholder="Last name"></div>
    <div class="fg"><label class="fl">Age (years) *</label><input class="fi" type="number" id="pf-age" placeholder="e.g. 35" min="0" max="130"></div>
    <div class="fg"><label class="fl">Sex</label><select class="fs" id="pf-sex"><option value="">—</option><option>Male</option><option>Female</option></select></div>
    <div class="fg"><label class="fl">Phone</label><input class="fi" id="pf-ph" placeholder="07XXXXXXXX"></div>
    <div class="fg"><label class="fl">Blood Type</label><select class="fs" id="pf-bl"><option value="">Unknown</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
    <div class="fg"><label class="fl">Address / Village</label><input class="fi" id="pf-ad" placeholder="Village / Area"></div>
    <div class="fg"><label class="fl">Insurance / Scheme</label><input class="fi" id="pf-ins" placeholder="NHIF / AAR / None"></div>
    <div class="fg gall"><label class="fl">Occupation</label><input class="fi" id="pf-oc" placeholder="e.g. Farmer, Teacher"></div>
    <div class="fg gall"><label class="fl">Known Allergies</label><input class="fi" id="pf-al" placeholder="List allergies or write None"></div>
    <div class="fg gall"><label class="fl">Past Medical History</label><textarea class="ft" id="pf-pmh" placeholder="Significant past illnesses, surgeries…" style="min-height:52px"></textarea></div>
    <div class="fg gall"><label class="fl">Emergency Contact (Name &amp; Phone)</label><input class="fi" id="pf-em" placeholder="Next of kin name and phone"></div>
  </div></div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-pat')">Cancel</button><button class="btn btnp" onclick="savePat()" id="pat-savebtn">Register Patient</button></div>
</div></div>

<!-- MODAL: VIEW PATIENT -->
<div class="ov" id="ov-vp"><div class="modal" style="max-width:880px">
  <div class="mh">
    <div><h3 id="vptitle">Patient Profile</h3><p id="vpopd" style="font-size:12px;color:var(--tx3)"></p></div>
    <div class="fxc np">
      <button class="btn btno sm" onclick="editPat(_vpid)">✏️ Edit</button>
      <button class="btn btno sm" onclick="printPat()">🖨 Card</button>
      <button class="btn btno sm" onclick="printAllHistory()">🖨 Full History</button>
      <button class="btn btno sm" onclick="downloadPatFile()">⬇ Download</button>
      <button class="btn btno sm" onclick="toggleShare()">📤 Share</button>
      <button class="btn btng xs" onclick="closeOv('ov-vp')">✕</button>
    </div>
  </div>
  <div class="mb">
    <div id="shrwrap" style="display:none">
      <div style="background:var(--t0);border:1px solid var(--t1);border-radius:11px;padding:12px 16px;margin-bottom:12px">
        <div style="font-size:10px;font-weight:600;color:var(--t7);text-transform:uppercase;letter-spacing:.07em;margin-bottom:9px">📤 Share Patient Summary</div>
        <div style="display:flex;gap:7px;flex-wrap:wrap">
          <button class="btn btnw sm" onclick="shareVia('wa')">💬 WhatsApp</button>
          <button class="btn btnem sm" onclick="shareVia('em')">✉ Email</button>
          <button class="btn btntg sm" onclick="shareVia('tg')">✈ Telegram</button>
          <button class="btn btno sm" onclick="shareVia('cp')">📋 Copy</button>
          <button class="btn btno sm" onclick="shareVia('na')">↗ More…</button>
        </div>
      </div>
    </div>
    <div class="ptbar" id="ptbar">
      <button class="pt on" onclick="showPT('info')">👤 Profile</button>
      <button class="pt" onclick="showPT('enc')">📋 Encounters</button>
      <button class="pt" onclick="showPT('lab')">🧪 Lab</button>
      <button class="pt" onclick="showPT('us')">🔊 Ultrasound</button>
      <button class="pt" onclick="showPT('rx')">💊 Prescriptions</button>
      <button class="pt" onclick="showPT('bill')">💳 Billing</button>
      <button class="pt" onclick="showPT('dc')">🏥 Discharge</button>
    </div>
    <div class="ppe on" id="pp-info"><div id="vpbody"></div></div>
    <div class="ppe" id="pp-enc"><div id="vpencs"></div></div>
    <div class="ppe" id="pp-lab"><div id="vplab"></div></div>
    <div class="ppe" id="pp-us"><div id="vpus"></div></div>
    <div class="ppe" id="pp-rx"><div id="vprx"></div></div>
    <div class="ppe" id="pp-bill"><div id="vpbill"></div></div>
    <div class="ppe" id="pp-dc"><div id="vpdc"></div></div>
  </div>
  <div class="mf"><button class="btn btnp" onclick="closeOv('ov-vp')">Close</button></div>
</div></div>

<!-- MODAL: APPOINTMENT -->
<div class="ov" id="ov-appt"><div class="modal">
  <div class="mh"><h3 id="appt-mtit">Book Appointment</h3><button class="btn btng xs" onclick="closeOv('ov-appt')">✕</button></div>
  <div class="mb"><div class="g2 mb12">
    <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="af-p"></select></div>
    <div class="fg"><label class="fl">Date *</label><input class="fi" type="date" id="af-d"></div>
    <div class="fg"><label class="fl">Time *</label><input class="fi" type="time" id="af-t" value="09:00"></div>
    <div class="fg"><label class="fl">Provider</label><select class="fs" id="af-pr"><option>Dr. Karim</option><option>Physiotherapist</option><option>Nurse / Clinical Officer</option><option>Lab Technician</option></select></div>
    <div class="fg"><label class="fl">Type</label><select class="fs" id="af-ty"><option>Consultation</option><option>Follow-up</option><option>Physio</option><option>Ultrasound</option><option>Laboratory</option><option>Vaccination</option><option>Antenatal</option><option>Dressing</option><option>Review</option></select></div>
    <div class="fg gall"><label class="fl">Notes</label><textarea class="ft" id="af-n" style="min-height:52px" placeholder="Brief notes…"></textarea></div>
  </div></div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-appt')">Cancel</button><button class="btn btnp" onclick="saveAppt()">Book Appointment</button></div>
</div></div>

<!-- MODAL: ENCOUNTER -->
<div class="ov" id="ov-enc"><div class="modal" style="max-width:820px">
  <div class="mh"><div><h3 id="enc-mtit">Clinical Encounter Note</h3><p>SOAP Note</p></div><div class="fxc"><div class="edit-mode-badge" id="enc-editbadge" style="display:none">Editing</div><button class="btn btng xs" onclick="closeOv('ov-enc')">✕</button></div></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="enc-p"></select></div>
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="enc-d"></div>
      <div class="fg"><label class="fl">Type</label><select class="fs" id="enc-ty"><option>OPD</option><option>Physio</option><option>Ultrasound</option><option>Antenatal</option><option>Emergency</option><option>Inpatient</option></select></div>
      <div class="fg"><label class="fl">Provider</label><select class="fs" id="enc-pr"><option>Dr. Karim</option><option>Nurse / Clinical Officer</option><option>Physiotherapist</option></select></div>
    </div>
    <div class="stit">Vital Signs</div>
    <div class="g4 mb12">
      <div class="fg"><label class="fl">Temp (°C)</label><input class="fi" id="v-t" placeholder="37.0"></div>
      <div class="fg"><label class="fl">BP (mmHg)</label><input class="fi" id="v-b" placeholder="120/80"></div>
      <div class="fg"><label class="fl">Pulse (bpm)</label><input class="fi" id="v-p" placeholder="72"></div>
      <div class="fg"><label class="fl">SpO₂ (%)</label><input class="fi" id="v-s" placeholder="99"></div>
      <div class="fg"><label class="fl">Weight (kg)</label><input class="fi" id="v-w" placeholder="60"></div>
      <div class="fg"><label class="fl">Height (cm)</label><input class="fi" id="v-h" placeholder="165"></div>
      <div class="fg"><label class="fl">RBS (mmol/L)</label><input class="fi" id="v-r" placeholder="—"></div>
      <div class="fg"><label class="fl">Resp Rate</label><input class="fi" id="v-rr" placeholder="16"></div>
    </div>
    <div class="stit">SOAP Note</div>
    <div class="g2 mb12">
      <div class="fg"><label class="fl">Subjective — Complaint *</label><textarea class="ft" id="enc-c" placeholder="Patient's presenting complaint…"></textarea></div>
      <div class="fg"><label class="fl">Objective — Examination</label><textarea class="ft" id="enc-o" placeholder="Physical examination findings…"></textarea></div>
      <div class="fg"><label class="fl">Assessment — Diagnosis *</label><textarea class="ft" id="enc-dx" placeholder="Working or confirmed diagnosis…"></textarea></div>
      <div class="fg"><label class="fl">Plan — Management</label><textarea class="ft" id="enc-pl" placeholder="Treatment plan, investigations…"></textarea></div>
    </div>
    <div class="fg"><label class="fl">Follow-up Instructions</label><textarea class="ft" id="enc-fu" style="min-height:48px" placeholder="Return date, instructions…"></textarea></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-enc')">Cancel</button><button class="btn btno" onclick="saveEnc(true)">🖨 Save &amp; Print</button><button class="btn btnp" onclick="saveEnc(false)">Save</button></div>
</div></div>

<!-- MODAL: VIEW ENCOUNTER -->
<div class="ov" id="ov-ve"><div class="modal" style="max-width:720px">
  <div class="mh"><h3 id="vetitle">Encounter</h3><div class="fxc np"><button class="btn btno sm" onclick="printEncById(_veid)">🖨 Print</button><button class="btn btng xs" onclick="closeOv('ov-ve')">✕</button></div></div>
  <div class="mb" id="vebody"></div>
  <div class="mf"><button class="btn btnp" onclick="closeOv('ov-ve')">Close</button></div>
</div></div>

<!-- MODAL: US REQUEST -->
<div class="ov" id="ov-usreq"><div class="modal" style="max-width:740px">
  <div class="mh"><div><h3>Ultrasound Request Form</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><button class="btn btng xs" onclick="closeOv('ov-usreq')">✕</button></div>
  <div class="mb">
    <div class="ibar">30m off Gayaza Road to Magere &nbsp;|&nbsp; Tel: 0705 062 567 / 0773 029 999</div>
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="usq-p"></select></div>
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="usq-d"></div>
      <div class="fg"><label class="fl">Clinician</label><select class="fs" id="usq-cl"><option>Dr. Karim</option><option>Nurse / Clinical Officer</option></select></div>
      <div class="fg"><label class="fl">Priority</label><select class="fs" id="usq-pr"><option>Routine</option><option>Urgent</option></select></div>
    </div>
    <div class="stit">Scan Type(s) Requested</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:12px" id="usscanlist"></div>
    <div class="fg"><label class="fl">Other Scan / Specify</label><input class="fi" id="usq-oth" placeholder="Any other scan not listed…"></div>
    <div class="fg"><label class="fl">Clinical Indication *</label><textarea class="ft" id="usq-ind" placeholder="Clinical history, LMP for obstetric scans…"></textarea></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-usreq')">Cancel</button><button class="btn btno" onclick="saveUSReq(true)">🖨 Save &amp; Print</button><button class="btn btnp" onclick="saveUSReq(false)">Save</button></div>
</div></div>

<!-- MODAL: US REPORT -->
<div class="ov" id="ov-usrep"><div class="modal" style="max-width:720px">
  <div class="mh"><div><h3 id="us-mtit">Ultrasound Report</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><div class="fxc"><div class="edit-mode-badge" id="us-editbadge" style="display:none">Editing</div><button class="btn btng xs" onclick="closeOv('ov-usrep')">✕</button></div></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="usp-p"></select></div>
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="usp-d"></div>
      <div class="fg"><label class="fl">Scan Type</label><input class="fi" id="usp-ty" placeholder="e.g. Obstetric, Abdominal…"></div>
      <div class="fg"><label class="fl">Sonographer</label><input class="fi" id="usp-by" placeholder="Name of sonographer"></div>
      <div class="fg"><label class="fl">Reviewed By</label><select class="fs" id="usp-rv"><option>Dr. Karim</option><option>Radiologist</option></select></div>
      <div class="fg"><label class="fl">Link to Request (optional)</label><select class="fs" id="usp-lk"><option value="">— None —</option></select></div>
    </div>
    <div class="fg"><label class="fl">Findings *</label><textarea class="ft" id="usp-fi" style="min-height:100px" placeholder="Detailed ultrasound findings…"></textarea></div>
    <div class="fg"><label class="fl">Impression / Conclusion *</label><textarea class="ft" id="usp-im" style="min-height:70px" placeholder="Final impression and recommendations…"></textarea></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-usrep')">Cancel</button><button class="btn btno" onclick="saveUSRep(true)">🖨 Save &amp; Print</button><button class="btn btnp" onclick="saveUSRep(false)">Save</button></div>
</div></div>

<!-- MODAL: LAB REQUEST -->
<div class="ov" id="ov-labreq"><div class="modal" style="max-width:760px">
  <div class="mh"><div><h3>Laboratory Request Form</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><button class="btn btng xs" onclick="closeOv('ov-labreq')">✕</button></div>
  <div class="mb">
    <div class="ibar">30m off Gayaza Road to Magere &nbsp;|&nbsp; Tel: 0705 062 567 / 0773 029 999</div>
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="lq-p"></select></div>
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="lq-d"></div>
      <div class="fg"><label class="fl">Clinician</label><select class="fs" id="lq-cl"><option>Dr. Karim</option><option>Nurse / Clinical Officer</option></select></div>
      <div class="fg"><label class="fl">Priority</label><select class="fs" id="lq-pr"><option>Routine</option><option>Urgent</option><option>STAT</option></select></div>
      <div class="fg gall"><label class="fl">Clinical Indication *</label><textarea class="ft" id="lq-ind" placeholder="Presenting complaint, relevant history…" style="min-height:50px"></textarea></div>
    </div>
    <div class="stit">Tests Requested</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:12px">
      <div style="background:var(--iv2);border-radius:9px;padding:11px"><div style="font-size:9.5px;font-weight:600;color:var(--t7);text-transform:uppercase;margin-bottom:7px">Haematology</div>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Full Blood Count (FBC)"> Full Blood Count</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="ESR"> ESR</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Malaria RDT"> Malaria RDT</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Malaria Slide"> Malaria Slide</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Blood Group &amp; Rhesus"> Blood Group &amp; Rh</label>
        <label style="display:flex;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" class="lbt" value="Sickling Test"> Sickling Test</label>
      </div>
      <div style="background:var(--iv2);border-radius:9px;padding:11px"><div style="font-size:9.5px;font-weight:600;color:var(--t7);text-transform:uppercase;margin-bottom:7px">Biochemistry</div>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Random Blood Sugar"> Random Blood Sugar</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Fasting Blood Sugar"> Fasting Blood Sugar</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="HbA1c"> HbA1c</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Urea &amp; Creatinine"> Urea &amp; Creatinine</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Liver Function Tests"> Liver Function Tests</label>
        <label style="display:flex;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" class="lbt" value="Lipid Profile"> Lipid Profile</label>
      </div>
      <div style="background:var(--iv2);border-radius:9px;padding:11px"><div style="font-size:9.5px;font-weight:600;color:var(--t7);text-transform:uppercase;margin-bottom:7px">Microbiology &amp; Other</div>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="HIV Rapid Test"> HIV Rapid Test</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Hepatitis B (HBsAg)"> Hepatitis B</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Pregnancy Test"> Pregnancy Test</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Urinalysis"> Urinalysis</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Urine MCS"> Urine MCS</label>
        <label style="display:flex;gap:6px;font-size:12px;margin-bottom:4px;cursor:pointer"><input type="checkbox" class="lbt" value="Widal Test"> Widal Test</label>
        <label style="display:flex;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" class="lbt" value="Typhoid Rapid Test"> Typhoid RDT</label>
      </div>
    </div>
    <div class="fg"><label class="fl">Other / Specify</label><input class="fi" id="lq-oth" placeholder="Any other test…"></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-labreq')">Cancel</button><button class="btn btno" onclick="saveLabReq(true)">🖨 Save &amp; Print</button><button class="btn btnp" onclick="saveLabReq(false)">Save</button></div>
</div></div>

<!-- MODAL: LAB RESULTS -->
<div class="ov" id="ov-labrep"><div class="modal" style="max-width:780px">
  <div class="mh"><div><h3 id="lab-mtit">Laboratory Results Entry</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><div class="fxc"><div class="edit-mode-badge" id="lab-editbadge" style="display:none">Editing</div><button class="btn btng xs" onclick="closeOv('ov-labrep')">✕</button></div></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="lp-p"></select></div>
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="lp-d"></div>
      <div class="fg"><label class="fl">Performed By</label><input class="fi" id="lp-by" placeholder="Lab technician name"></div>
      <div class="fg"><label class="fl">Reviewed By</label><select class="fs" id="lp-rv"><option>Dr. Karim</option><option>External Pathologist</option></select></div>
      <div class="fg gall"><label class="fl">Link to Request (optional)</label><select class="fs" id="lp-lk"><option value="">— None —</option></select></div>
    </div>
    <div class="stit">Results</div>
    <div id="lp-rows"></div>
    <div style="background:var(--t0);border:1px solid var(--t1);border-radius:9px;padding:11px;margin-bottom:12px">
      <div style="font-size:10px;font-weight:600;color:var(--t7);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">⚡ Quick Templates — auto-fills all rows with normal reference ranges</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        <button onclick="loadCBCTpl()" style="background:linear-gradient(135deg,#1d8a5e,#145369);color:white;border:none;padding:6px 13px;border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:var(--ff)">🩸 Full CBC</button>
        <button onclick="loadUATpl()" style="background:linear-gradient(135deg,#1d8a5e,#145369);color:white;border:none;padding:6px 13px;border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:var(--ff)">🧫 Urinalysis</button>
        <button onclick="loadLFTTpl()" style="background:linear-gradient(135deg,#1d8a5e,#145369);color:white;border:none;padding:6px 13px;border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:var(--ff)">🫀 Liver Function</button>
        <button onclick="loadRFTTpl()" style="background:linear-gradient(135deg,#1d8a5e,#145369);color:white;border:none;padding:6px 13px;border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:var(--ff)">🫘 Renal Function</button>
        <button onclick="loadRDSTpl()" style="background:linear-gradient(135deg,#1d8a5e,#145369);color:white;border:none;padding:6px 13px;border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:var(--ff)">🦠 RDTs Panel</button>
      </div>
    </div>
    <button class="btn btno sm mb12" onclick="addLabRow()">+ Add Test Row</button>
    <div style="border:2px solid var(--t7);border-radius:9px;padding:12px;margin-bottom:12px">
      <div style="font-size:10.5px;font-weight:700;color:var(--t7);text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px">🔬 MICROSCOPY</div>
      <textarea class="ft" id="lp-micro" style="min-height:80px" placeholder="Microscopy findings e.g. WBC 2-4/HPF, RBC 0-2/HPF, Epithelial cells: nil, Casts: nil, Crystals: nil…"></textarea>
    </div>
    <div class="fg"><label class="fl">Interpretation / Comments *</label><textarea class="ft" id="lp-int" style="min-height:75px" placeholder="Overall interpretation, clinical correlation…"></textarea></div>
  </div>
  <div style="background:var(--t0);border:1px solid var(--t1);border-radius:0 0 6px 6px;padding:9px 20px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between">
    <div style="font-size:11.5px;color:var(--t7)">
      💡 <strong>Multiple panels:</strong> use "Save &amp; Add Another" to enter CBC + Urinalysis + RDTs etc. for the same patient in one session.
      <span id="lab-panel-count" style="background:var(--t5);color:white;border-radius:99px;padding:1px 8px;font-size:10.5px;margin-left:5px;display:none">0 saved</span>
    </div>
  </div>
  <div class="mf">
    <button class="btn btng" onclick="closeOv('ov-labrep')">Cancel</button>
    <button class="btn btno" onclick="saveLabRep(true)">🖨 Save &amp; Print</button>
    <button class="btn btns" onclick="saveLabRepAddAnother()" title="Save this panel and start a new one for the same patient — perfect for CBC + UA + RDTs">✚ Save &amp; Add Another Panel</button>
    <button class="btn btnp" onclick="saveLabRep(false)">✓ Save &amp; Close</button>
  </div>
</div></div>

<!-- MODAL: PRESCRIPTION -->
<div class="ov" id="ov-rx"><div class="modal" style="max-width:840px">
  <div class="mh"><div><h3 id="rx-mtit">Prescription</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><div class="fxc"><div class="edit-mode-badge" id="rx-editbadge" style="display:none">Editing</div><button class="btn btng xs" onclick="closeOv('ov-rx')">✕</button></div></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="rx-p"></select></div>
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="rx-d"></div>
      <div class="fg"><label class="fl">Clinician</label><select class="fs" id="rx-cl"><option>Dr. Karim</option><option>Nurse / Clinical Officer</option></select></div>
      <div class="fg"><label class="fl">Diagnosis</label><input class="fi" id="rx-dx" placeholder="Working diagnosis"></div>
      <div class="fg gall"><label class="fl">Allergies (from record)</label><input class="fi" id="rx-al" readonly></div>
    </div>
    <div class="stit">Medications</div>
    <div id="rx-rows"></div>
    <button class="btn btno sm mb12" onclick="addRxRow()">+ Add Medication</button>
    <div class="fg"><label class="fl">Additional Instructions</label><textarea class="ft" id="rx-n" style="min-height:50px" placeholder="Diet, follow-up date…"></textarea></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-rx')">Cancel</button><button class="btn btno" onclick="saveRx(true)">🖨 Save &amp; Print</button><button class="btn btnp" onclick="saveRx(false)">Save</button></div>
</div></div>

<!-- MODAL: DISPENSE — multi-drug per patient -->
<div class="ov" id="ov-dis"><div class="modal" style="max-width:780px">
  <div class="mh">
    <div><h3 id="dis-mtit">Dispense Medication</h3><p>Add multiple drugs for one patient in a single session</p></div>
    <button class="btn btng xs" onclick="closeOv('ov-dis')">✕</button>
  </div>
  <div class="mb">
    <div class="g3 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="dis-p"></select></div>
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="dis-d"></div>
      <div class="fg"><label class="fl">Dispensed By</label><input class="fi" id="dis-by" placeholder="Pharmacist name"></div>
    </div>
    <div class="stit" style="display:flex;align-items:center;justify-content:space-between">
      <span>Drugs to Dispense</span>
      <span id="dis-item-count" style="font-size:11px;color:var(--t6);font-weight:400;text-transform:none;letter-spacing:0"></span>
    </div>
    <div id="dis-drug-rows"></div>
    <button class="btn btno sm mb14" onclick="addDrugRow()" style="width:100%;justify-content:center;border-style:dashed">
      + Add Another Drug
    </button>
    <div style="background:var(--t7);border-radius:var(--r);padding:12px 18px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.07em">Grand Total</div>
        <div id="dis-grand-breakdown" style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px"></div>
      </div>
      <span id="dis-grand-total" style="font-family:var(--fs);font-size:24px;font-weight:700;color:white">UGX 0</span>
    </div>
  </div>
  <div class="mf">
    <button class="btn btng" onclick="closeOv('ov-dis')">Cancel</button>
    <button class="btn btnp" onclick="saveDis()">✓ Dispense All</button>
  </div>
</div></div>

<!-- MODAL: INVENTORY ITEM -->
<div class="ov" id="ov-inv"><div class="modal">
  <div class="mh"><h3 id="invmtit">Add Inventory Item</h3><button class="btn btng xs" onclick="closeOv('ov-inv')">✕</button></div>
  <div class="mb"><div class="g2">
    <div class="fg gall"><label class="fl">Item Name *</label><input class="fi" id="iv-n" placeholder="Drug / item name"></div>
    <div class="fg"><label class="fl">Category</label><select class="fs" id="iv-c"><option>Antimalarial</option><option>Antibiotic</option><option>Analgesic</option><option>Cardiovascular</option><option>Diabetes</option><option>IV Fluid</option><option>Consumables</option><option>Supplies</option><option>Other</option></select></div>
    <div class="fg"><label class="fl">Unit</label><select class="fs" id="iv-u"><option>Tablet</option><option>Capsule</option><option>Bottle</option><option>Vial</option><option>Bag</option><option>Piece</option><option>Box</option></select></div>
    <div class="fg"><label class="fl">Quantity *</label><input class="fi" type="number" id="iv-q" placeholder="0" min="0"></div>
    <div class="fg"><label class="fl">Reorder Level</label><input class="fi" type="number" id="iv-ro" placeholder="10"></div>
    <div class="fg"><label class="fl">Cost Price (UGX)</label><input class="fi" type="number" id="iv-cp" placeholder="0"></div>
    <div class="fg"><label class="fl">Selling Price (UGX)</label><input class="fi" type="number" id="iv-sp" placeholder="0"></div>
    <div class="fg"><label class="fl">Supplier</label><input class="fi" id="iv-su" placeholder="Supplier name"></div>
    <div class="fg"><label class="fl">Expiry Date</label><input class="fi" type="date" id="iv-ex"></div>
    <div class="fg"><label class="fl">Storage Location</label><input class="fi" id="iv-lo" placeholder="Shelf / Store"></div>
  </div></div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-inv')">Cancel</button><button class="btn btnp" onclick="saveInv()">Save Item</button></div>
</div></div>

<!-- MODAL: BILLING -->
<div class="ov" id="ov-bill"><div class="modal" style="max-width:820px">
  <div class="mh"><div><h3 id="bill-mtit">Create Invoice / Receipt</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><div class="fxc"><div class="edit-mode-badge" id="bill-editbadge" style="display:none;background:var(--wn);color:white;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:600">Editing</div><button class="btn btng xs" onclick="closeOv('ov-bill')">✕</button></div></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="bl-p"></select></div>
      <div class="fg"><label class="fl">Invoice Date</label><input class="fi" type="date" id="bl-d"></div>
      <div class="fg">
        <label class="fl">Status (auto-updates from payments)</label>
        <div style="background:var(--iv2);border:1.5px solid var(--iv3);border-radius:var(--r);padding:9px 11px;display:flex;align-items:center;gap:8px">
          <span id="bl-s-dot" style="width:10px;height:10px;border-radius:50%;background:var(--wa);display:inline-block;flex-shrink:0"></span>
          <span id="bl-s-text" style="font-size:13px;font-weight:600;color:var(--tx)">Unpaid</span>
          <select class="fs" id="bl-s" style="display:none"><option>Unpaid</option><option>Paid</option><option>Partial</option></select>
          <span style="font-size:10.5px;color:var(--tx3);margin-left:auto">Set automatically</span>
        </div>
      </div>
    </div>
    <div class="stit">Invoice Items</div>
    <div id="bl-rows"></div>
    <button class="btn btno sm mb12" onclick="addBillRow()">+ Add Item</button>
    <div style="background:var(--t7);border-radius:var(--r);padding:11px 16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:12px;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.07em">Grand Total</span>
      <span id="bltot" style="font-family:var(--fs);font-size:22px;font-weight:700;color:white">UGX 0</span>
    </div>
    <div style="background:var(--okb);border:1px solid var(--t1);border-radius:9px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
        <div>
          <span style="font-size:10.5px;font-weight:700;color:var(--ok);text-transform:uppercase;letter-spacing:.07em">💳 Payments Received</span>
          <span style="font-size:11px;color:var(--tx3);margin-left:7px">— one row per instalment, method or payer (e.g. Cash + NHIF + Balance later)</span>
        </div>
        <button class="btn btns xs" onclick="addPayRow()" style="font-size:11px">+ Add Payment</button>
      </div>
      <div id="bl-pay-rows"></div>
      <div style="margin-top:8px;font-size:11px;color:var(--tx3)">
        💡 Add multiple rows to split payment: e.g. UGX 50,000 Cash + UGX 30,000 Mobile Money. 
        Leave empty if not yet paid (status will be set to Unpaid automatically).
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">
      <div style="background:var(--t0);border-radius:var(--r);padding:10px 13px;text-align:center">
        <div style="font-size:10px;color:var(--t7);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Total Billed</div>
        <div id="bl-tot-disp" style="font-family:var(--fs);font-size:18px;font-weight:700;color:var(--t7)">UGX 0</div>
      </div>
      <div style="background:var(--okb);border-radius:var(--r);padding:10px 13px;text-align:center">
        <div style="font-size:10px;color:var(--ok);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Total Paid</div>
        <div id="bl-pd-disp" style="font-family:var(--fs);font-size:18px;font-weight:700;color:var(--ok)">UGX 0</div>
      </div>
      <div style="border-radius:var(--r);padding:10px 13px;text-align:center" id="bl-bal-card">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px" id="bl-bal-lbl">Balance Due</div>
        <div id="bl-ba-disp" style="font-family:var(--fs);font-size:18px;font-weight:700">UGX 0</div>
      </div>
    </div>
    <div class="fg"><label class="fl">Notes</label><textarea class="ft" id="bl-n" style="min-height:40px" placeholder="Any additional notes…"></textarea></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-bill')">Cancel</button><button class="btn btno" onclick="saveBill(true)">🖨 Save &amp; Print Receipt</button><button class="btn btnp" onclick="saveBill(false)">Save Invoice</button></div>
</div></div>

<!-- MODAL: DISCHARGE -->
<div class="ov" id="ov-dc"><div class="modal" style="max-width:800px">
  <div class="mh"><div><h3 id="dc-mtit">Discharge Summary</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><div class="fxc"><div class="edit-mode-badge" id="dc-editbadge" style="display:none">Editing</div><button class="btn btng xs" onclick="closeOv('ov-dc')">✕</button></div></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="dc-p"></select></div>
      <div class="fg"><label class="fl">Admission Date</label><input class="fi" type="date" id="dc-ad"></div>
      <div class="fg"><label class="fl">Discharge Date</label><input class="fi" type="date" id="dc-dd"></div>
      <div class="fg"><label class="fl">Ward / Room</label><input class="fi" id="dc-wd" placeholder="OPD / Ward 1 / Physio"></div>
      <div class="fg"><label class="fl">Clinician</label><select class="fs" id="dc-cl"><option>Dr. Karim</option><option>Nurse / Clinical Officer</option><option>Physiotherapist</option></select></div>
      <div class="fg"><label class="fl">Condition at Discharge</label><select class="fs" id="dc-co"><option>Stable</option><option>Improved</option><option>Recovered</option><option>Against Medical Advice</option><option>Referred</option><option>Deceased</option></select></div>
    </div>
    <div class="g2">
      <div class="fg"><label class="fl">Presenting Complaint</label><textarea class="ft" id="dc-cc" placeholder="Reason for admission…"></textarea></div>
      <div class="fg"><label class="fl">Admission Diagnosis</label><textarea class="ft" id="dc-ai" placeholder="Diagnosis at admission…"></textarea></div>
      <div class="fg"><label class="fl">Discharge Diagnosis *</label><textarea class="ft" id="dc-di" placeholder="Final discharge diagnosis…"></textarea></div>
      <div class="fg"><label class="fl">Investigations &amp; Results</label><textarea class="ft" id="dc-iv" placeholder="Key lab, imaging results…"></textarea></div>
      <div class="fg"><label class="fl">Treatment Given</label><textarea class="ft" id="dc-tx" placeholder="Medications, procedures…"></textarea></div>
      <div class="fg"><label class="fl">Discharge Medications</label><textarea class="ft" id="dc-mx" placeholder="Medications on discharge with doses…"></textarea></div>
    </div>
    <div class="fg"><label class="fl">Follow-up Instructions</label><textarea class="ft" id="dc-fu" placeholder="Return date, outpatient appointments…"></textarea></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-dc')">Cancel</button><button class="btn btno" onclick="saveDC(true)">🖨 Save &amp; Print</button><button class="btn btnp" onclick="saveDC(false)">Save Discharge</button></div>
</div></div>

<!-- MODAL: MEDICAL FORMS -->
<div class="ov" id="ov-mf"><div class="modal" style="max-width:720px">
  <div class="mh"><div><h3>Medical Forms</h3><p>Generate printable forms for patients</p></div><button class="btn btng xs" onclick="closeOv('ov-mf')">✕</button></div>
  <div class="mb">
    <div class="g2 mb16">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="mf-p"></select></div>
      <div class="fg gall"><label class="fl">Form Type *</label><select class="fs" id="mf-ty" onchange="updMF()"><option value="">— Select form type —</option><option value="sick">Sick / Absentee Note</option><option value="cert">Medical Certificate</option><option value="ref">Referral Letter</option><option value="fit">Fitness Certificate</option></select></div>
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="mf-d"></div>
      <div class="fg"><label class="fl">Clinician</label><select class="fs" id="mf-cl"><option>Dr. Karim</option><option>Nurse / Clinical Officer</option></select></div>
    </div>
    <div id="mf-extra"></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-mf')">Cancel</button><button class="btn btno" onclick="printMF()">🖨 Print Form</button></div>
</div></div>

<!-- OTC SALE MODAL -->
<div class="ov" id="ov-otc"><div class="modal" style="max-width:600px">
  <div class="mh"><div><h3 id="otc-mtit">New OTC Sale</h3><p>Over-the-counter / walk-in sale — no patient file required</p></div><button class="btn btng xs" onclick="closeOv('ov-otc')">✕</button></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg"><label class="fl">Date</label><input class="fi" type="date" id="otc-date"></div>
      <div class="fg"><label class="fl">Time</label><input class="fi" type="time" id="otc-time"></div>
      <div class="fg"><label class="fl">Served By</label><input class="fi" id="otc-by" placeholder="Staff name"></div>
      <div class="fg"><label class="fl">Payment Method</label><select class="fs" id="otc-pay"><option>Cash</option><option>Mobile Money</option><option>NHIF</option></select></div>
    </div>
    <div class="stit">Items Sold</div>
    <div id="otc-rows"></div>
    <button class="btn btno sm mb12" onclick="addOTCRow()">+ Add Item</button>
    <div style="background:var(--t7);border-radius:var(--r);padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.07em">Sale Total</div>
        <div id="otc-qty-lbl" style="font-size:11px;color:rgba(255,255,255,.45);margin-top:1px"></div>
      </div>
      <span id="otc-tot-disp" style="font-family:var(--fs);font-size:22px;font-weight:700;color:white">UGX 0</span>
    </div>
    <div class="fg" style="margin-top:10px"><label class="fl">Notes (optional)</label><textarea class="ft" id="otc-notes" style="min-height:42px" placeholder="Customer name, any notes…"></textarea></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-otc')">Cancel</button><button class="btn btno" onclick="saveOTC(true)">🖨 Save &amp; Print Receipt</button><button class="btn btnp" onclick="saveOTC(false)">✓ Record Sale</button></div>
</div></div>

<!-- MODAL: ADD EXPENDITURE -->
<div class="ov" id="ov-exp"><div class="modal" style="max-width:560px">
  <div class="mh"><div><h3 id="exp-mtit">Record Expenditure</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><button class="btn btng xs" onclick="closeOv('ov-exp')">✕</button></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg"><label class="fl">Date *</label><input class="fi" type="date" id="exp-d"></div>
      <div class="fg"><label class="fl">Amount (UGX) *</label><input class="fi" type="number" id="exp-amt" placeholder="0" min="0" oninput="updExpPreview()"></div>
      <div class="fg"><label class="fl">Category *</label>
        <select class="fs" id="exp-cat">
          <option>Salaries &amp; Wages</option>
          <option>Medical Supplies</option>
          <option>Drug Purchases</option>
          <option>Utilities (Electricity/Water)</option>
          <option>Rent / Premises</option>
          <option>Equipment &amp; Maintenance</option>
          <option>Stationery &amp; Office</option>
          <option>Transport</option>
          <option>Laboratory Reagents</option>
          <option>Cleaning &amp; Sanitation</option>
          <option>Marketing &amp; Advertising</option>
          <option>Miscellaneous</option>
        </select>
      </div>
      <div class="fg"><label class="fl">Payment Method</label>
        <select class="fs" id="exp-m">
          <option>Cash</option><option>Mobile Money</option><option>Bank Transfer</option><option>Cheque</option>
        </select>
      </div>
      <div class="fg gall"><label class="fl">Description *</label><input class="fi" id="exp-desc" placeholder="Brief description of what was paid for"></div>
      <div class="fg"><label class="fl">Recorded By</label><input class="fi" id="exp-by" placeholder="Your name"></div>
      <div class="fg"><label class="fl">Receipt / Ref No.</label><input class="fi" id="exp-ref" placeholder="Receipt number (optional)"></div>
    </div>
    <div id="exp-preview" style="display:none;background:var(--erb);border-radius:9px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:12px;color:var(--er)">Amount to record</span>
      <span id="exp-amt-disp" style="font-family:var(--fs);font-size:20px;font-weight:700;color:var(--er)">UGX 0</span>
    </div>
  </div>
  <div class="mf">
    <button class="btn btng" onclick="closeOv('ov-exp')">Cancel</button>
    <button class="btn btno" onclick="saveExpense(true)">✓ Save &amp; Add Another</button>
    <button class="btn btnp" id="exp-sbtn" onclick="saveExpense(false)">Save Expenditure</button>
  </div>
</div></div>

<!-- MANUAL INCOME MODAL -->
<div class="ov" id="ov-inc"><div class="modal" style="max-width:540px">
  <div class="mh"><div><h3 id="inc-mtit">Record Manual Income</h3><p>For income not captured automatically (e.g. donations, grants, other cash)</p></div><button class="btn btng xs" onclick="closeOv('ov-inc')">✕</button></div>
  <div class="mb">
    <div style="background:var(--wnb);border:1px solid #f0d9b8;border-radius:8px;padding:10px 13px;margin-bottom:12px;font-size:12px;color:var(--wn)">
      💡 <strong>Note:</strong> Billing, OTC sales and dispensing income are auto-captured. Only use this for income not recorded elsewhere.
    </div>
    <div class="g2 mb12">
      <div class="fg"><label class="fl">Date *</label><input class="fi" type="date" id="inc-d"></div>
      <div class="fg"><label class="fl">Amount (UGX) *</label><input class="fi" type="number" id="inc-amt" placeholder="0" min="0" oninput="updIncPreview()"></div>
      <div class="fg"><label class="fl">Income Category *</label>
        <select class="fs" id="inc-cat">
          <option>Donation / Grant</option>
          <option>Government Funding</option>
          <option>Insurance Reimbursement</option>
          <option>Loan / Credit</option>
          <option>Refund Received</option>
          <option>Other Income</option>
          <option>Refund Received</option>
          <option>Other Cash Income</option>
        </select>
      </div>
      <div class="fg"><label class="fl">Payment Method</label>
        <select class="fs" id="inc-m">
          <option>Cash</option><option>Mobile Money</option><option>Bank Transfer</option><option>Cheque</option>
        </select>
      </div>
      <div class="fg gall"><label class="fl">Description *</label><input class="fi" id="inc-desc" placeholder="Brief description of income source"></div>
      <div class="fg"><label class="fl">Recorded By</label><input class="fi" id="inc-by" placeholder="Your name"></div>
      <div class="fg"><label class="fl">Reference / Receipt No.</label><input class="fi" id="inc-ref" placeholder="Reference number (optional)"></div>
    </div>
    <div id="inc-preview" style="display:none;background:var(--okb);border-radius:9px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:12px;color:var(--ok)">Amount to record</span>
      <span id="inc-amt-disp" style="font-family:var(--fs);font-size:20px;font-weight:700;color:var(--ok)">UGX 0</span>
    </div>
  </div>
  <div class="mf">
    <button class="btn btng" onclick="closeOv('ov-inc')">Cancel</button>
    <button class="btn btno" onclick="saveIncome(true)">✓ Save &amp; Add Another</button>
    <button class="btn btnp" id="inc-sbtn" onclick="saveIncome(false)">Save Income</button>
  </div>
</div></div>

<!-- ADD STAFF MODAL -->
<div class="ov" id="ov-addstaff"><div class="modal" style="max-width:540px">
  <div class="mh"><div><h3>Add Staff Member</h3><p>Create a new user account</p></div><button class="btn btng xs" onclick="closeOv('ov-addstaff')">✕</button></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg"><label class="fl">Full Name *</label><input class="fi" type="text" id="staff-name" placeholder="e.g. Dr. John Doe"></div>
      <div class="fg"><label class="fl">Username *</label><input class="fi" type="text" id="staff-username" placeholder="e.g. drjohn"></div>
    </div>
    <div class="g2 mb12">
      <div class="fg"><label class="fl">Role *</label>
        <select class="fs" id="staff-role">
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="lab">Lab Tech</option>
          <option value="reception">Reception</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="billing">Billing</option>
          <option value="patient">Patient</option>
        </select>
      </div>
      <div class="fg"><label class="fl">Password *</label><input class="fi" type="password" id="staff-password" placeholder="••••••••"></div>
    </div>
  </div>
  <div class="mf">
    <button class="btn btng" onclick="closeOv('ov-addstaff')">Cancel</button>
    <button class="btn btnp" id="staff-sbtn" onclick="saveStaff()">Add Staff</button>
  </div>
</div></div>

<!-- MODAL: BILLING -->
<div class="ov" id="ov-bill"><div class="modal" style="max-width:820px">
  <div class="mh"><div><h3 id="bill-mtit">Create Invoice / Receipt</h3><p>HAK Medical &amp; Physiotherapy Center</p></div><div class="fxc"><div class="edit-mode-badge" id="bill-editbadge" style="display:none;background:var(--wn);color:white;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:600">Editing</div><button class="btn btng xs" onclick="closeOv('ov-bill')">✕</button></div></div>
  <div class="mb">
    <div class="g2 mb12">
      <div class="fg gall"><label class="fl">Patient *</label><select class="fs" id="bl-p"></select></div>
      <div class="fg"><label class="fl">Invoice Date</label><input class="fi" type="date" id="bl-d"></div>
      <div class="fg">
  <label class="fl">Status (auto-updates from payments)</label>
  <div style="background:var(--iv2);border:1.5px solid var(--iv3);border-radius:var(--r);padding:9px 11px;display:flex;align-items:center;gap:8px">
    <span id="bl-s-dot" style="width:10px;height:10px;border-radius:50%;background:var(--wa);display:inline-block;flex-shrink:0"></span>
    <span id="bl-s-text" style="font-size:13px;font-weight:600;color:var(--tx)">Unpaid</span>
    <select class="fs" id="bl-s" style="display:none"><option>Unpaid</option><option>Paid</option><option>Partial</option></select>
    <span style="font-size:10.5px;color:var(--tx3);margin-left:auto">Set automatically</span>
  </div>
</div>
    </div>

    <!-- ── INVOICE ITEMS ── -->
    <div class="stit">Invoice Items</div>
    <div id="bl-rows"></div>
    <button class="btn btno sm mb12" onclick="addBillRow()">+ Add Item</button>
    <!-- Grand total bar -->
    <div style="background:var(--t7);border-radius:var(--r);padding:11px 16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:12px;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.07em">Grand Total</span>
      <span id="bltot" style="font-family:var(--fs);font-size:22px;font-weight:700;color:white">UGX 0</span>
    </div>

    <!-- ── PAYMENTS RECEIVED ── -->
    <div style="background:var(--okb);border:1px solid var(--t1);border-radius:9px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
        <div>
          <span style="font-size:10.5px;font-weight:700;color:var(--ok);text-transform:uppercase;letter-spacing:.07em">💳 Payments Received</span>
          <span style="font-size:11px;color:var(--tx3);margin-left:7px">— one row per instalment, method or payer (e.g. Cash + NHIF + Balance later)</span>
        </div>
        <button class="btn btns xs" onclick="addPayRow()" style="font-size:11px">+ Add Payment</button>
      </div>
      <div id="bl-pay-rows"></div>
      <div style="margin-top:8px;font-size:11px;color:var(--tx3)">
        💡 Add multiple rows to split payment: e.g. UGX 50,000 Cash + UGX 30,000 Mobile Money. 
        Leave empty if not yet paid (status will be set to Unpaid automatically).
      </div>
    </div>

    <!-- Summary cards -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">
      <div style="background:var(--t0);border-radius:var(--r);padding:10px 13px;text-align:center">
        <div style="font-size:10px;color:var(--t7);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Total Billed</div>
        <div id="bl-tot-disp" style="font-family:var(--fs);font-size:18px;font-weight:700;color:var(--t7)">UGX 0</div>
      </div>
      <div style="background:var(--okb);border-radius:var(--r);padding:10px 13px;text-align:center">
        <div style="font-size:10px;color:var(--ok);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Total Paid</div>
        <div id="bl-pd-disp" style="font-family:var(--fs);font-size:18px;font-weight:700;color:var(--ok)">UGX 0</div>
      </div>
      <div style="border-radius:var(--r);padding:10px 13px;text-align:center" id="bl-bal-card">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px" id="bl-bal-lbl">Balance Due</div>
        <div id="bl-ba-disp" style="font-family:var(--fs);font-size:18px;font-weight:700">UGX 0</div>
      </div>
    </div>
    <div class="fg"><label class="fl">Notes</label><textarea class="ft" id="bl-n" style="min-height:40px" placeholder="Any additional notes…"></textarea></div>
  </div>
  <div class="mf"><button class="btn btng" onclick="closeOv('ov-bill')">Cancel</button><button class="btn btno" onclick="saveBill(true)">🖨 Save &amp; Print Receipt</button><button class="btn btnp" onclick="saveBill(false)">Save Invoice</button></div>
</div></div>

<!-- MODAL: RECORD PAYMENT (quick payment against existing invoice) -->
<div class="ov" id="ov-rp"><div class="modal" style="max-width:520px">
  <div class="mh">
    <div>
      <h3>💳 Record Payment</h3>
      <p>Add a payment to an existing invoice</p>
    </div>
    <button class="btn btng xs" onclick="closeOv('ov-rp')">✕</button>
  </div>
  <div class="mb">
    <!-- Invoice Summary -->
    <div style="background:var(--t0);border:1px solid var(--t1);border-radius:11px;padding:13px 16px;margin-bottom:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <div>
          <div style="font-size:9.5px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Invoice</div>
          <div style="font-weight:700;color:var(--t7)" id="rp-ref">—</div>
        </div>
        <div>
          <div style="font-size:9.5px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Patient</div>
          <div style="font-weight:500;font-size:13px" id="rp-patient">—</div>
        </div>
        <div>
          <div style="font-size:9.5px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Total Billed</div>
          <div style="font-weight:700;color:var(--t7);font-family:var(--fs)" id="rp-tot">UGX 0</div>
        </div>
        <div>
          <div style="font-size:9.5px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Already Paid</div>
          <div style="font-weight:700;color:var(--ok);font-family:var(--fs)" id="rp-paid">UGX 0</div>
        </div>
        <div style="grid-column:span 2">
          <div style="font-size:9.5px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Outstanding Balance</div>
          <div style="font-weight:700;font-size:18px;font-family:var(--fs)" id="rp-bal">UGX 0</div>
        </div>
      </div>
    </div>
    <!-- Payment history -->
    <div id="rp-history" style="margin-bottom:14px"></div>
    <!-- New payment entry -->
    <div class="stit">New Payment</div>
    <div class="g2 mb12">
      <div class="fg">
        <label class="fl">Amount (UGX) *</label>
        <input class="fi" type="number" id="rp-amount" placeholder="0" min="1" style="font-size:16px;font-weight:600;color:var(--ok)">
      </div>
      <div class="fg">
        <label class="fl">Date Paid</label>
        <input class="fi" type="date" id="rp-date">
      </div>
      <div class="fg">
        <label class="fl">Payment Method *</label>
        <select class="fs" id="rp-method">
          <option>Cash</option>
          <option>Mobile Money</option>
          <option>NHIF</option>
          <option>Insurance</option>
          <option>Bank Transfer</option>
          <option>Credit</option>
        </select>
      </div>
      <div class="fg">
        <label class="fl">Reference / Transaction ID</label>
        <input class="fi" id="rp-ref-note" placeholder="Receipt no., mobile money transaction ID…">
      </div>
    </div>
  </div>
  <div class="mf">
    <button class="btn btng" onclick="closeOv('ov-rp')">Cancel</button>
    <button class="btn btnp" onclick="saveRecordPayment()">✓ Record Payment</button>
  </div>
</div></div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- app.js with cache-busting timestamp -->
<script src="app.js?v=<?php echo time(); ?>"></script>
</body>
</html>
