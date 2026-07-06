/* ── AUTH ── */
var ACCS={'admin':{pass:'admin123',role:'admin',name:'Administrator'},'dr.karim':{pass:'karim123',role:'doctor',name:'Dr. Karim'},'nurse1':{pass:'nurse123',role:'nurse',name:'Nurse Faith'},'lab1':{pass:'lab123',role:'lab',name:'Lab Tech Moses'},'reception':{pass:'recep123',role:'reception',name:'Reception Aisha'},'pharmacy':{pass:'pharm123',role:'pharmacy',name:'Pharmacist James'},'billing':{pass:'bill123',role:'billing',name:'Billing Officer'}};
var CU = null;
function doLogin(){
  var u=V('lu').trim().toLowerCase(),p=V('lp'),r=V('lr');
  var a=ACCS[u];
  if(!a||a.pass!==p||(r&&a.role!==r)){var el=document.getElementById('lerr');if(el)el.style.display='block';return;}
  var el2=document.getElementById('lerr');if(el2)el2.style.display='none';
  CU={username:u,name:a.name,role:a.role};sessionStorage.setItem('hak_u',JSON.stringify(CU));bootApp();
}
function doLogout(){sessionStorage.removeItem('hak_u');CU=null;window.location.href='logout.php';}
/* ── SCREENS ── */
function switchScr(id){}

/* ── DB ── */
// Map app.js keys to SQLite table names
var KEY_MAP = {
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
  'billing': 'billing_invoices',
  'discharge': 'discharge_summaries',
  'otc_sales': 'otc_sales',
  'manual_income': 'manual_income',
  'expenses': 'expenses',
  'users': 'users'
};

// Local cache of server data
var LOCAL_DB = {};

// Initialize LOCAL_DB from SERVER_DB
function initDB() {
  var src = (typeof SERVER_DB !== 'undefined') ? SERVER_DB : {};
  for (var appKey in KEY_MAP) {
    var tableKey = KEY_MAP[appKey];
    LOCAL_DB[appKey] = src[tableKey] || [];
  }
}

initDB();

var DB={
  get:function(k){ return LOCAL_DB[k] || []; },
  set:function(k,v){
    LOCAL_DB[k] = v;
    var tableKey = KEY_MAP[k] || k;
    try {
      var formData = new FormData();
      formData.append('key', tableKey);
      formData.append('data', JSON.stringify(v));
      fetch('api.php?action=save', { method: 'POST', body: formData });
    } catch(e) { console.error('Failed to sync data:', e); }
  },
  id:function(){return Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
};

function downloadBackup(){
  // Alias for the full backup download
  const a = document.createElement('a');
  a.href = 'backup.php?action=download';
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('Downloading backup…', 'success');
}

async function refreshDataFromServer(){
  try {
    var resp = await fetch('api.php?action=get');
    if (!resp.ok) throw new Error('Server error ' + resp.status);
    var serverData = await resp.json();
    for (var appKey in KEY_MAP) {
      var tableKey = KEY_MAP[appKey];
      LOCAL_DB[appKey] = serverData[tableKey] || [];
    }
    // Re-render current page
    var renderers = {
      dashboard: renderDash, patients: renderPats, appointments: renderAppts,
      encounters: renderEncs, ultrasound: renderUSReqs, laboratory: renderLabReqs,
      pharmacy: renderRx, inventory: renderInv,
      billing: function(){renderBill();renderBillStats();},
      discharge: renderDC, otc: renderOTC, finance: renderFinance, staff: renderStaff
    };
    if(renderers[curPg]) renderers[curPg]();
    toast('Data refreshed ✓', 'success');
  } catch (e) {
    console.error('Failed to refresh data:', e);
    toast('Refresh failed — working offline', 'warn');
  }
}

/* ── SEED ── */
function seedDB(){
  // No longer needed - seeded via auth.php SQLite
}

/* ── UTILS ── */
function V(id){const e=document.getElementById(id);return e?e.value:'';}
function S(id,v){const e=document.getElementById(id);if(e)e.value=v||'';}
function fd(d){if(!d)return'—';return new Date(d+'T00:00:00').toLocaleDateString('en-UG',{day:'2-digit',month:'short',year:'numeric'});}
function agD(a){return(parseInt(a)||0)+'y';}
function td(){return new Date().toISOString().slice(0,10);}
function fm(n){return'UGX '+Number(n||0).toLocaleString();}
function nRef(pfx,arr){const ns=arr.map(r=>parseInt((r.ref||'').replace(pfx+'-',''))||0);return pfx+'-'+String((ns.length?Math.max(...ns):0)+1).padStart(3,'0');}
function toast(msg,tp=''){
  const t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;t.className='';
  if(tp==='success')t.classList.add('tok');
  else if(tp==='warn')t.classList.add('twn');
  else if(tp==='error')t.classList.add('ter');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t=setTimeout(()=>t.classList.remove('show'),3200);
}
function openOv(id){const el=document.getElementById(id);if(el)el.classList.add('open');}
function closeOv(id){const el=document.getElementById(id);if(el)el.classList.remove('open');}
document.addEventListener('click',e=>{if(e.target.classList.contains('ov'))e.target.classList.remove('open');});

/* ── DELETE RECORD ── */
function delRec(key, id, refreshFn){
  if(!confirm('Delete this entry? This cannot be undone.'))return;
  const arr=DB.get(key).filter(x=>x.id!==id);
  DB.set(key,arr);
  if(typeof refreshFn==='function')refreshFn();
  else if(typeof refreshFn==='string'&&window[refreshFn])window[refreshFn]();
  toast('Entry deleted','warn');
}

/* ── BACKUP redirect ── */
// downloadBackup() defined above — uses server-side backup.php

/* ── PRINT HELPERS ── */
function hakHdr(title,ref,date){return`<div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2.5px solid #2089ab;padding-bottom:14px;margin-bottom:16px"><div style="display:flex;align-items:center;gap:12px"><div style="background:#145369;width:46px;height:46px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 22 22" fill="none" width="24" height="24"><rect x="9" y="2" width="4" height="18" rx="2" fill="white"/><rect x="2" y="9" width="18" height="4" rx="2" fill="white"/></svg></div><div><div style="font-size:18px;font-weight:700;color:#0a2e3a;font-family:'Playfair Display',serif">HAK Medical &amp; Physiotherapy Center</div><div style="font-size:11px;color:#5a7a8a">30m off Gayaza Road to Magere &nbsp;|&nbsp; Tel: 0705 062 567 / 0773 029 999 &nbsp;|&nbsp; hakmedicalcenter@gmail.com</div></div></div><div style="text-align:right"><div style="font-size:14px;font-weight:700;color:#1a6b87;font-family:'Playfair Display',serif">${title}</div>${ref?`<div style="font-size:11px;color:#5a7a8a">Ref: <strong>${ref}</strong></div>`:''}${date?`<div style="font-size:11px;color:#5a7a8a">${fd(date)}</div>`:''}</div></div>`;}
function hakFtr(){return`<div style="margin-top:24px;padding-top:9px;border-top:1px solid #d4eff8;text-align:center;font-size:10.5px;color:#5a7a8a;font-style:italic">Excellence in Care, Honesty in Action &nbsp;|&nbsp; HAK Medical &amp; Physiotherapy Center &nbsp;|&nbsp; 0705 062 567 / 0773 029 999</div>`;}
function doPrint(html){
  const fontLink='<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">';
  const printStyle=`<style>
    body{font-family:'Outfit',sans-serif;background:white;color:#0f1e25;margin:0;padding:0}
    .pfield{margin-bottom:10px;page-break-inside:avoid}
    .pfield-label{font-size:9.5px;color:#5a7a8a;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px;font-weight:600}
    .pfield-value{border:1px solid #d4eff8;border-radius:7px;padding:9px 12px;line-height:1.8;font-size:13px;white-space:pre-wrap;word-break:break-word;min-height:28px;background:#fafcfe}
    table{border-collapse:collapse}th,td{font-family:'Outfit',sans-serif}
    @page{margin:14mm}
  </style>`;
  // Wrap the content properly so ONLY this document prints
  document.getElementById('parea').innerHTML=fontLink+printStyle+'<div>'+html+'</div>';
  setTimeout(()=>window.print(),320);
}

/* ── NAV ── */
const NAVS=[
  {id:'dashboard',  lb:'Dashboard',    ro:['admin','doctor','nurse','lab','reception','pharmacy','billing']},
  {id:'patients',   lb:'Patients',     ro:['admin','doctor','nurse','reception']},
  {id:'appointments',lb:'Appointments',ro:['admin','doctor','nurse','reception']},
  {id:'encounters', lb:'Encounters',   ro:['admin','doctor','nurse']},
  {id:'ultrasound', lb:'Ultrasound',   ro:['admin','doctor','nurse','lab']},
  {id:'laboratory', lb:'Laboratory',   ro:['admin','doctor','nurse','lab']},
  {id:'pharmacy',   lb:'Pharmacy / Rx',ro:['admin','doctor','pharmacy','nurse']},
  {id:'inventory',  lb:'Inventory',    ro:['admin','pharmacy','billing']},
  {id:'billing',    lb:'Billing',      ro:['admin','billing','reception']},
  {id:'discharge',  lb:'Discharge',    ro:['admin','doctor','nurse']},
  {id:'finance',    lb:'Finance',      ro:['admin','billing']},
  {id:'otc',        lb:'OTC Sales',     ro:['admin','pharmacy','billing','reception']},
  {id:'staff',      lb:'Staff Management', ro:['admin']},
  {id:'backup',     lb:'Backup & Restore', ro:['admin']},
];
const ICONS={
  dashboard:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>`,
  patients:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke-linecap="round"/></svg>`,
  appointments:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="2.5" width="13" height="12" rx="2"/><path d="M5 1v3M11 1v3M1.5 7h13" stroke-linecap="round"/></svg>`,
  encounters:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1.5" width="12" height="13" rx="1.5"/><path d="M5 6h6M5 9h4" stroke-linecap="round"/></svg>`,
  ultrasound:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="8" rx="6" ry="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  laboratory:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2v5L3 13h10l-3-6V2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 2h6" stroke-linecap="round"/></svg>`,
  pharmacy:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1.5" width="12" height="13" rx="1.5"/><path d="M6 8h4M8 6v4" stroke-linecap="round"/></svg>`,
  inventory:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="5" width="14" height="9" rx="1.5"/><path d="M5 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke-linecap="round"/></svg>`,
  billing:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3.5" width="14" height="9" rx="2"/><path d="M1 7.5h14M5 11h2M10 11h1" stroke-linecap="round"/></svg>`,
  otc:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="14" height="10" rx="2"/><path d="M5 4V3a2 2 0 014 0v1M6 9h4M8 7v4" stroke-linecap="round"/></svg>`,
  finance:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12V5a1 1 0 011-1h12a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1z"/><path d="M5 8h6M8 6v4" stroke-linecap="round"/><circle cx="8" cy="8" r="2.5"/></svg>`,
  discharge:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10a1 1 0 011 1v11l-3-2-2 2-2-2-3 2V3a1 1 0 011-1z"/><path d="M6 6h4M6 9h3" stroke-linecap="round"/></svg>`,
  otc:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12l-1 9H3L2 4z"/><path d="M6 4V3a2 2 0 014 0v1M6 8h.01M10 8h.01" stroke-linecap="round"/></svg>`,
  backup:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2v8M5 8l3 3 3-3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke-linecap="round"/></svg>`,
};
var curPg='dashboard';
function buildNav(){
  var el=document.getElementById('sbnav');
  if(!el)return;
  el.innerHTML='<div class="sbsec">Navigation</div>'+
    NAVS.filter(function(n){return CU&&n.ro.indexOf(CU.role)>-1;}).map(function(n){
      return '<div class="sbi'+(n.id===curPg?' on':'')+'" id="sbn-'+n.id+'" onclick="nav(\''+n.id+'\')">'+'<div class="sbico">'+(ICONS[n.id]||'')+'</div>'+n.lb+'</div>';
    }).join('');
}
function nav(pg){
  if(pg==='backup'){window.location.href='backup.php';return;}
  curPg=pg;
  document.querySelectorAll('.page').forEach(function(p){p.classList.add('phide');});
  var pgEl=document.getElementById('pg-'+pg);
  if(pgEl)pgEl.classList.remove('phide');
  document.querySelectorAll('.sbi').forEach(function(i){i.classList.remove('on');});
  var sbnEl=document.getElementById('sbn-'+pg);
  if(sbnEl)sbnEl.classList.add('on');
  var tbtitle=document.getElementById('tbtitle');
  if(tbtitle){
    var nav_item=NAVS.find(function(n){return n.id===pg;});
    if(nav_item)tbtitle.textContent=nav_item.lb;
  }
  try{
    var renderers={
      dashboard:renderDash,patients:renderPats,appointments:renderAppts,
      encounters:renderEncs,ultrasound:renderUSReqs,laboratory:renderLabReqs,
      pharmacy:renderRx,inventory:renderInv,
      billing:function(){renderBill();renderBillStats();},
      discharge:renderDC,otc:renderOTC,finance:renderFinance,staff:renderStaff
    };
    if(renderers[pg])renderers[pg]();
  }catch(e){console.error('nav render error for '+pg+':',e);}
}

/* ── STAFF MANAGEMENT ── */
function renderStaff(){
  const stafftb=document.getElementById('stafftb');
  if(!stafftb)return;
  let users = DB.get('users');
  // Staff management shows ONLY staff (non-patient roles) — patients managed separately
  users = users.filter(u => u.role !== 'patient');
  const q = V('staffsrch')?.toLowerCase() || '';
  if(q){
    users = users.filter(u => (u.name && u.name.toLowerCase().includes(q)) || (u.username && u.username.toLowerCase().includes(q)));
  }
  stafftb.innerHTML = users.length ? users.map((u, i) => `<tr>
    <td>${i+1}</td>
    <td><strong>${u.username}</strong></td>
    <td>${u.name}</td>
    <td><span class="b bt">${u.role}</span></td>
    <td>${fd(u.created_at || u.created)}</td>
    <td style="white-space:nowrap">
      ${u.id != CU.id ? `<button class="btn btnd xs" onclick="deleteStaff('${u.id}')" title="Delete">🗑</button>` : '<span style="color:var(--tx3);font-size:12px;">You</span>'}
    </td>
  </tr>`).join('') : `<tr><td colspan="6" class="nd">No staff found</td></tr>`;
}

function openAddStaff(){
  S('staff-name','');
  S('staff-username','');
  S('staff-password','');
  S('staff-role','reception');
  openOv('ov-addstaff');
}

async function saveStaff(){
  const name = V('staff-name');
  const username = V('staff-username');
  const password = V('staff-password');
  const role = V('staff-role');
  
  if(!name || !username || !password){
    toast('Please fill in all required fields','error');
    return;
  }
  
  const formData = new FormData();
  formData.append('name', name);
  formData.append('username', username);
  formData.append('password', password);
  formData.append('role', role);
  
  try {
    const resp = await fetch('api.php?action=add_user', { method: 'POST', body: formData });
    const data = await resp.json();
    if(data.success){
      // Refresh the local DB and re-render
      const getResp = await fetch('api.php?action=get');
      const newServerDB = await getResp.json();
      for (const [appKey, tableKey] of Object.entries(KEY_MAP)) {
        LOCAL_DB[appKey] = newServerDB[tableKey] || [];
      }
      toast('Staff member added successfully','success');
      closeOv('ov-addstaff');
      renderStaff();
    } else {
      toast(data.error || 'Failed to add staff','error');
    }
  } catch(e){
    console.error(e);
    toast('Error saving staff','error');
  }
}

async function deleteStaff(id){
  if(!confirm('Are you sure you want to delete this staff member? This cannot be undone.')) return;
  
  const formData = new FormData();
  formData.append('user_id', id);
  
  try {
    const resp = await fetch('api.php?action=delete_user', { method: 'POST', body: formData });
    const data = await resp.json();
    if(data.success){
      // Refresh the local DB and re-render
      const getResp = await fetch('api.php?action=get');
      const newServerDB = await getResp.json();
      for (const [appKey, tableKey] of Object.entries(KEY_MAP)) {
        LOCAL_DB[appKey] = newServerDB[tableKey] || [];
      }
      toast('Staff member deleted successfully','success');
      renderStaff();
    } else {
      toast(data.error || 'Failed to delete staff','error');
    }
  } catch(e){
    console.error(e);
    toast('Error deleting staff','error');
  }
}

/* ── BOOT ── */
function bootApp(){
  if(!CU)return;
  seedDB();
  var ini=CU.name.split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();
  var sbav=document.getElementById('sbav');if(sbav)sbav.textContent=ini;
  var sbun=document.getElementById('sbuname');if(sbun)sbun.textContent=CU.name;
  var sbrl=document.getElementById('sbrole');if(sbrl)sbrl.textContent=CU.role;
  var now=new Date(),h=now.getHours();
  var greeting=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  var wbg=document.getElementById('wbg');if(wbg)wbg.textContent=greeting+', '+CU.name;
  var wbd=document.getElementById('wbd');
  if(wbd)wbd.textContent=now.toLocaleDateString('en-UG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var tbd=document.getElementById('tbdate');
  if(tbd)tbd.textContent=now.toLocaleDateString('en-UG',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  if(window._backupPage)return;
  nav('dashboard');
}

/* ── DASHBOARD ── */
function renderDash(){
  var ps=DB.get('patients'),es=DB.get('encounters'),as=DB.get('appointments'),inv=DB.get('inventory');
  var isReceptionOrAdmin = CU && (CU.role==='admin' || CU.role==='reception');
  var filteredAppointments = as.filter(function(a){return isReceptionOrAdmin||a.st!=='Pending';});
  var t=td(),ta=filteredAppointments.filter(function(a){return a.date===t;}),
      ae=es.filter(function(e){return e.st==='Active';}),
      ls=inv.filter(function(i){return i.qty<=i.ro;});
  var pendingCount = isReceptionOrAdmin ? as.filter(function(a){return a.st==='Pending';}).length : 0;

  var dashAlert=document.getElementById('dash-pending-alert');
  if(dashAlert && isReceptionOrAdmin){
    dashAlert.style.display=pendingCount>0?'flex':'none';
    var cntEl=document.getElementById('dash-pending-count');
    if(cntEl&&pendingCount>0)cntEl.textContent=pendingCount+' appointment'+(pendingCount!==1?'s':'')+' awaiting your approval';
  }

  var statsEl=document.getElementById('dstats');
  if(statsEl)statsEl.innerHTML=[
    {n:ps.length,l:'Total Patients',bg:'#eaf6fb',ic:'#1a6b87',ico:'<svg viewBox="0 0 22 22" fill="none" stroke="#1a6b87" stroke-width="1.5"><circle cx="11" cy="7" r="4"/><path d="M3 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke-linecap="round"/></svg>'},
    {n:ta.length,l:"Today's Appointments",bg:'#e6f5ef',ic:'#1d8a5e',ico:'<svg viewBox="0 0 22 22" fill="none" stroke="#1d8a5e" stroke-width="1.5"><rect x="2" y="3" width="18" height="16" rx="2.5"/><path d="M7 1v4M15 1v4M2 9h18" stroke-linecap="round"/></svg>'},
    {n:ae.length,l:'Active Encounters',bg:'#fdf3e6',ic:'#c97c2e',ico:'<svg viewBox="0 0 22 22" fill="none" stroke="#c97c2e" stroke-width="1.5"><rect x="3" y="2" width="16" height="18" rx="2"/><path d="M7 8h8M7 12h5" stroke-linecap="round"/></svg>'},
    (isReceptionOrAdmin&&pendingCount>0)
      ? {n:pendingCount,l:'Pending Approval',bg:'#fff3cd',ic:'#856404',ico:'<svg viewBox="0 0 22 22" fill="none" stroke="#856404" stroke-width="1.5"><circle cx="11" cy="11" r="9"/><path d="M11 7v5l3 3" stroke-linecap="round"/></svg>',click:true}
      : {n:ls.length,l:'Low Stock Items',bg:'#fceeed',ic:'#b5322a',ico:'<svg viewBox="0 0 22 22" fill="none" stroke="#b5322a" stroke-width="1.5"><path d="M11 2l9 16H2L11 2z"/><path d="M11 9v4M11 16v.5" stroke-linecap="round"/></svg>'},
  ].map(function(s){
    return '<div class="stat"'+(s.click?' onclick="nav(\'appointments\');setAF(\'Pending\')" style="cursor:pointer"':'')+'>'+
      '<div class="stico" style="background:'+s.bg+'">'+s.ico+'</div>'+
      '<div><div class="stnum" style="color:'+s.ic+'">'+s.n+'</div><div class="stlbl">'+s.l+'</div></div></div>';
  }).join('');

  var dappts=document.getElementById('dappts');
  if(dappts)dappts.innerHTML=(ta.length?ta:filteredAppointments.slice(0,4)).map(function(a){
    var badge=a.st==='Completed'?'bg':a.st==='Scheduled'?'bo':'ba';
    var extra=a.st==='Pending'?' style="background:#fff3cd;color:#856404;border:1px solid #ffc107"':'';
    var label=a.st==='Pending'?'⏳ Pending':a.st;
    return '<tr><td>'+a.time+'</td><td><strong>'+a.pn+'</strong></td><td><span class="b bb">'+a.ty+'</span></td><td><span class="b '+badge+'"'+extra+'>'+label+'</span></td></tr>';
  }).join('')||'<tr><td colspan="4" class="nd">No appointments today</td></tr>';

  var dstock=document.getElementById('dstock');
  if(dstock)dstock.innerHTML=ls.slice(0,5).map(function(i){
    return '<tr><td>'+i.nm+'</td><td><span class="b '+(i.qty===0?'br':'bo')+'">'+i.qty+'</span></td><td>'+i.ro+'</td></tr>';
  }).join()||'<tr><td colspan="3" class="nd" style="color:var(--ok)">✓ All in stock</td></tr>';

  var dpats=document.getElementById('dpats');
  if(dpats)dpats.innerHTML=ps.slice(0,5).map(function(p){
    return '<tr><td><strong style="color:var(--t7)">'+p.opd+'</strong></td><td>'+p.fn+' '+p.ln+'</td><td>'+agD(p.age)+'</td><td><span class="b '+(p.ins&&p.ins!=='None'?'bg':'ba')+'">'+(p.ins||'None')+'</span></td></tr>';
  }).join('');

  var dencs=document.getElementById('dencs');
  if(dencs)dencs.innerHTML=es.slice(0,5).map(function(e){
    return '<tr><td><strong>'+e.pn+'</strong></td><td><span class="b bt">'+e.ty+'</span></td><td style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+e.dx+'</td><td><span class="b '+(e.st==='Active'?'bo':e.st==='Completed'?'bg':'ba')+'">'+e.st+'</span></td></tr>';
  }).join('');
}

/* ── PATIENTS ── */
let pats=[];
function loadPats(){pats=DB.get('patients');}
function patOpts(){return'<option value="">— Select patient —</option>'+pats.map(p=>`<option value="${p.id}">${p.opd} — ${p.fn} ${p.ln} (${agD(p.age)})</option>`).join('');}
function nextOPD(){const ns=pats.map(p=>parseInt(p.opd.replace('HAK-',''))||0);return'HAK-'+String((ns.length?Math.max(...ns):0)+1).padStart(3,'0');}

function renderPats(){
  loadPats();
  var q=V('psrch').toLowerCase();
  var list=pats.filter(function(p){return (p.fn+' '+p.ln+' '+p.opd+' '+(p.ph||'')).toLowerCase().indexOf(q)>-1;});
  var ptbody=document.getElementById('ptbody');
  if(!ptbody)return;
  ptbody.innerHTML=list.length?list.map(function(p){return '<tr>'+
    '<td><strong style="color:var(--t7)">'+p.opd+'</strong></td>'+
    '<td><a href="#" onclick="viewPat(\''+p.id+'\');return false" style="color:var(--t6);font-weight:500;text-decoration:none">'+p.fn+' '+p.ln+'</a></td>'+
    '<td><strong style="color:var(--t7)">'+agD(p.age)+'</strong></td>'+
    '<td>'+(p.sex||'—')+'</td><td>'+(p.bl||'—')+'</td><td>'+(p.ph||'—')+'</td><td>'+(p.ad||'—')+'</td>'+
    '<td><span class="b '+(p.ins&&p.ins!=='None'?'bg':'ba')+'">'+(p.ins||'None')+'</span></td>'+
    '<td style="font-size:11.5px">'+fd(p.created)+'</td>'+
    '<td style="white-space:nowrap">'+
      '<button class="btn btng xs" onclick="viewPat(\''+p.id+'\')">View</button>'+
      '<button class="btn btno xs" onclick="editPat&&editPat(\''+p.id+'\')" style="margin-left:3px">✏️</button>'+
      '<button class="btn btnd xs" onclick="delRec(\'patients\',\''+p.id+'\',renderPats)" title="Delete" style="margin-left:3px">🗑</button>'+
    '</td></tr>';}).join(''):'<tr><td colspan="10" class="nd">No patients found</td></tr>';
}

function openPat(){
  if(CU.role !== 'admin' && CU.role !== 'reception'){
    toast('You are not authorized to register patients','error');
    return;
  }
  loadPats();['pf-fn','pf-ln','pf-age','pf-ph','pf-ad','pf-ins','pf-oc','pf-al','pf-pmh','pf-em'].forEach(id=>S(id,''));openOv('ov-pat');
}
function savePat(){
  const fn=V('pf-fn').trim(),ln=V('pf-ln').trim(),age=parseInt(V('pf-age'))||0;
  if(!fn||!ln){toast('First and last name required','error');return;}
  loadPats();
  const p={id:DB.id(),opd:nextOPD(),fn,ln,age,sex:V('pf-sex'),ph:V('pf-ph'),ad:V('pf-ad'),bl:V('pf-bl'),ins:V('pf-ins')||'None',oc:V('pf-oc'),al:V('pf-al')||'None',pmh:V('pf-pmh'),em:V('pf-em'),created:td()};
  pats.unshift(p);DB.set('patients',pats);closeOv('ov-pat');renderPats();toast(`Patient ${p.opd} registered`,'success');
}

let _vpid=null;
function viewPat(id){
  loadPats();_vpid=id;const p=pats.find(x=>x.id===id);if(!p)return;
  document.getElementById('vptitle').textContent=`${p.fn} ${p.ln}`;
  document.getElementById('vpopd').textContent=`${p.opd} · ${agD(p.age)} · ${p.sex||'—'}`;
  document.querySelectorAll('.pt').forEach((t,i)=>t.classList.toggle('on',i===0));
  document.querySelectorAll('.ppe').forEach((t,i)=>t.classList.toggle('on',i===0));
  document.getElementById('vpbody').innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px">
    ${[['OPD Number',p.opd],['Age','<span style="font-size:22px;font-weight:700;color:var(--t7);font-family:var(--fs)">'+agD(p.age)+'</span>'],['Sex',p.sex||'—'],['Blood Type',p.bl||'Unknown'],['Phone',p.ph||'—'],['Address',p.ad||'—'],['Occupation',p.oc||'—'],['Insurance',p.ins||'None'],['Emergency Contact',p.em||'—'],['Registered',fd(p.created)]].map(([l,v])=>`<div style="border-bottom:1px solid var(--bd);padding-bottom:9px"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">${l}</div><div style="font-weight:500;font-size:13.5px">${v}</div></div>`).join('')}
    ${p.al&&p.al!=='None'?`<div style="grid-column:1/-1;background:var(--erb);border-radius:8px;padding:10px"><div style="font-size:10px;color:var(--er);text-transform:uppercase">⚠ Known Allergies</div><div style="font-weight:600;color:var(--er);margin-top:2px">${p.al}</div></div>`:''}
    ${p.pmh?`<div style="grid-column:1/-1;border-bottom:1px solid var(--bd);padding-bottom:9px"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;margin-bottom:2px">Past Medical History</div><div style="font-size:13px;line-height:1.6">${p.pmh}</div></div>`:''}
  </div>`;
  openOv('ov-vp');
}
function showPT(tab){
  const mp={info:0,enc:1,lab:2,us:3,rx:4,bill:5,dc:6},idx=mp[tab];
  document.querySelectorAll('.pt').forEach((t,i)=>t.classList.toggle('on',i===idx));
  document.querySelectorAll('.ppe').forEach((t,i)=>t.classList.toggle('on',i===idx));
  const p=pats.find(x=>x.id===_vpid);if(!p)return;
  if(tab==='enc'){
    const l=DB.get('encounters').filter(e=>e.pid===_vpid);
    document.getElementById('vpencs').innerHTML=l.length?`<div class="tw"><table><thead><tr><th>Date</th><th>Type</th><th>Complaint</th><th>Diagnosis</th><th>Provider</th><th>Status</th><th></th></tr></thead><tbody>${l.map(e=>`<tr><td>${fd(e.date)}</td><td><span class="b bt">${e.ty}</span></td><td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.c}</td><td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.dx}</td><td>${e.pr}</td><td><span class="b ${e.st==='Completed'?'bg':'bo'}">${e.st}</span></td><td style="white-space:nowrap"><button class="btn btng xs" onclick="closeOv('ov-vp');viewEnc('${e.id}')">View</button><button class="btn btno xs" onclick="closeOv('ov-vp');editEnc('${e.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('encounters','${e.id}',()=>{showPT('enc')})" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="nd">No encounters on record</div>';
  }else if(tab==='lab'){
    const rq=DB.get('lab_req').filter(r=>r.pid===_vpid);
    const rp=DB.get('lab_rep').filter(r=>r.pid===_vpid);
    document.getElementById('vplab').innerHTML=`
      <div class="stit mb12">Lab Requests (${rq.length})</div>
      <div class="tw mb16"><table><thead><tr><th>Ref</th><th>Date</th><th>Tests</th><th>Clinician</th><th>Status</th><th></th></tr></thead><tbody>${rq.length?rq.map(r=>`<tr><td><strong>${r.ref}</strong></td><td>${fd(r.date)}</td><td style="max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.tests?.join(', ')}</td><td>${r.cl}</td><td><span class="b ${r.st==='Pending'?'bo':'bg'}">${r.st}</span></td><td><button class="btn btng xs" onclick="pLabReq('${r.id}')">Print</button></td></tr>`).join(''):'<tr><td colspan="6" class="nd">No lab requests</td></tr>'}</tbody></table></div>
      <div class="stit mb12">Lab Results (${rp.length})</div>
      <div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Tests</th><th>Performed By</th><th></th></tr></thead><tbody>${rp.length?rp.map(r=>`<tr><td><strong>${r.ref}</strong></td><td>${fd(r.date)}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.rows?.map(x=>x.t).join(', ')}</td><td>${r.by||'—'}</td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pLabRep('${r.id}')">🖨</button><button class="btn btno xs" onclick="editLabRep('${r.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('lab_rep','${r.id}',()=>{showPT('lab')})" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join(''):'<tr><td colspan="5" class="nd">No lab results</td></tr>'}</tbody></table></div>`;
  }else if(tab==='us'){
    const rq=DB.get('us_req').filter(r=>r.pid===_vpid);
    const rp=DB.get('us_rep').filter(r=>r.pid===_vpid);
    document.getElementById('vpus').innerHTML=`
      <div class="stit mb12">Ultrasound Requests (${rq.length})</div>
      <div class="tw mb16"><table><thead><tr><th>Ref</th><th>Date</th><th>Scans</th><th>Status</th><th></th></tr></thead><tbody>${rq.length?rq.map(r=>`<tr><td><strong>${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.scans?.join(', ')}</td><td><span class="b ${r.st==='Pending'?'bo':'bg'}">${r.st}</span></td><td><button class="btn btng xs" onclick="pUSReq('${r.id}')">Print</button></td></tr>`).join(''):'<tr><td colspan="5" class="nd">No ultrasound requests</td></tr>'}</tbody></table></div>
      <div class="stit mb12">Ultrasound Reports (${rp.length})</div>
      <div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Scan Type</th><th>Impression</th><th></th></tr></thead><tbody>${rp.length?rp.map(r=>`<tr><td><strong>${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.ty}</td><td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.imp}</td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pUSRep('${r.id}')">🖨</button><button class="btn btno xs" onclick="editUSRep('${r.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('us_rep','${r.id}',()=>{showPT('us')})" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join(''):'<tr><td colspan="5" class="nd">No ultrasound reports</td></tr>'}</tbody></table></div>`;
  }else if(tab==='rx'){
    const l=DB.get('rx').filter(r=>r.pid===_vpid);
    document.getElementById('vprx').innerHTML=l.length?`<div class="tw"><table><thead><tr><th>Ref</th><th>Date</th><th>Medications</th><th>Diagnosis</th><th>Clinician</th><th></th></tr></thead><tbody>${l.map(r=>`<tr><td><strong>${r.ref}</strong></td><td>${fd(r.date)}</td><td style="max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.meds?.map(m=>m.dr).join(', ')}</td><td>${r.dx||'—'}</td><td>${r.cl}</td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pRx('${r.id}')">🖨</button><button class="btn btno xs" onclick="editRx('${r.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('rx','${r.id}',()=>{showPT('rx')})" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="nd">No prescriptions on record</div>';
  }else if(tab==='bill'){
    const l=DB.get('billing').filter(b=>b.pid===_vpid);
    const tot=l.reduce((s,b)=>s+Number(b.tot||0),0);
    const paid=l.reduce((s,b)=>s+Number(b.paid||0),0);
    document.getElementById('vpbill').innerHTML=l.length?`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="background:var(--t0);border-radius:9px;padding:11px;text-align:center"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;margin-bottom:2px">Total Billed</div><div style="font-family:var(--fs);font-size:16px;font-weight:700;color:var(--t7)">${fm(tot)}</div></div>
        <div style="background:var(--okb);border-radius:9px;padding:11px;text-align:center"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;margin-bottom:2px">Total Paid</div><div style="font-family:var(--fs);font-size:16px;font-weight:700;color:var(--ok)">${fm(paid)}</div></div>
        <div style="background:${tot-paid>0?'var(--erb)':'var(--okb)'};border-radius:9px;padding:11px;text-align:center"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;margin-bottom:2px">Balance</div><div style="font-family:var(--fs);font-size:16px;font-weight:700;color:${tot-paid>0?'var(--er)':'var(--ok)'}">${fm(tot-paid)}</div></div>
      </div>
      <div class="tw"><table><thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th><th></th></tr></thead><tbody>${l.map(b=>`<tr>
  <td><strong>${b.ref}</strong></td><td>${fd(b.date)}</td><td>${fm(b.tot)}</td>
  <td>${fm(b.paid)}${b.payments&&b.payments.length>1?`<div style="font-size:10px;color:var(--tx3);margin-top:2px">${b.payments.map(p=>p.m+': '+fm(p.a)).join(' | ')}</div>`:''}</td>
  <td><span class="b ${b.bal>0?'br':'bg'}">${fm(b.bal)}</span></td>
  <td style="font-size:12px">${b.mt}</td>
  <td><span class="b ${b.st==='Paid'?'bg':b.st==='Partial'?'bo':'br'}">${b.st}</span></td>
  <td style="white-space:nowrap"><button class="btn btng xs" onclick="pInvoice('${b.id}')">🖨</button><button class="btn btnd xs" onclick="delRec('billing','${b.id}',()=>{showPT('bill')})" title="Delete" style="margin-left:3px">🗑</button></td>
</tr>`).join('')}</tbody></table></div>`:'<div class="nd">No billing records</div>';
  }else if(tab==='dc'){
    const l=DB.get('discharge').filter(d=>d.pid===_vpid);
    document.getElementById('vpdc').innerHTML=l.length?`<div class="tw"><table><thead><tr><th>Ref</th><th>Admitted</th><th>Discharged</th><th>Dx</th><th>Condition</th><th></th></tr></thead><tbody>${l.map(d=>`<tr><td><strong>${d.ref}</strong></td><td>${fd(d.ad)}</td><td>${fd(d.dd)}</td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.di}</td><td><span class="b ${d.co==='Recovered'||d.co==='Improved'?'bg':'bo'}">${d.co}</span></td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pDC('${d.id}')">🖨</button><button class="btn btno xs" onclick="editDC('${d.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('discharge','${d.id}',()=>{showPT('dc')})" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="nd">No discharge records</div>';
  }
}
function printPat(){
  loadPats();const p=pats.find(x=>x.id===_vpid);if(!p)return;
  doPrint(`<div style="max-width:700px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">
    ${hakHdr('PATIENT REGISTRATION CARD',p.opd,p.created)}
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      ${[['Full Name',`${p.fn} ${p.ln}`,'OPD',p.opd],['Age',agD(p.age),'Sex',p.sex||'—'],['Blood Type',p.bl||'Unknown','Phone',p.ph||'—'],['Address',p.ad||'—','Occupation',p.oc||'—'],['Insurance',p.ins||'None','Emergency Contact',p.em||'—'],['Allergies',`<strong style="color:#b5322a">${p.al||'None'}</strong>`,'Registered',fd(p.created)]]
      .map((r,i)=>`<tr style="${i%2?'':'background:#eaf6fb'}"><td style="padding:8px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">${r[0]}</td><td style="padding:8px 10px;font-weight:500">${r[1]}</td><td style="padding:8px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">${r[2]}</td><td style="padding:8px 10px;font-weight:500">${r[3]}</td></tr>`).join('')}
    </table>
    ${p.pmh?`<div style="margin-top:12px"><div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:4px">Past Medical History</div><div style="border:1px solid #d4eff8;border-radius:8px;padding:10px;line-height:1.7">${p.pmh}</div></div>`:''}
    ${hakFtr()}
  </div>`);
}
function printAllHistory(){
  loadPats();const p=pats.find(x=>x.id===_vpid);if(!p)return;
  const es=DB.get('encounters').filter(e=>e.pid===_vpid);
  const lr=DB.get('lab_rep').filter(r=>r.pid===_vpid);
  const ur=DB.get('us_rep').filter(r=>r.pid===_vpid);
  const rx=DB.get('rx').filter(r=>r.pid===_vpid);
  const bl=DB.get('billing').filter(b=>b.pid===_vpid);
  const dc=DB.get('discharge').filter(d=>d.pid===_vpid);
  doPrint(`<div style="max-width:720px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">
    ${hakHdr('COMPLETE MEDICAL HISTORY',p.opd,td())}
    <div style="background:#eaf6fb;border-radius:9px;padding:12px;margin-bottom:16px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;font-size:12.5px">
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Patient</span><strong>${p.fn} ${p.ln}</strong></div>
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Age</span><strong>${agD(p.age)}</strong></div>
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Sex</span><strong>${p.sex||'—'}</strong></div>
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Blood</span><strong>${p.bl||'Unknown'}</strong></div>
      ${p.al&&p.al!=='None'?`<div style="grid-column:1/-1"><span style="color:#b5322a;font-size:10px;display:block;text-transform:uppercase">⚠ Allergies</span><strong style="color:#b5322a">${p.al}</strong></div>`:''}
    </div>
    ${es.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;border-bottom:1px solid #d4eff8;padding-bottom:4px">📋 Clinical Encounters (${es.length})</div>${es.map(e=>`<div style="border:1px solid #d4eff8;border-radius:7px;padding:9px;margin-bottom:6px;font-size:12px"><strong>${fd(e.date)} — ${e.ty} — ${e.pr}</strong><br>Complaint: ${e.c}<br>Diagnosis: <strong>${e.dx}</strong>${e.pl?'<br>Plan: '+e.pl:''}</div>`).join('')}</div>`:''}
    ${lr.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;border-bottom:1px solid #d4eff8;padding-bottom:4px">🧪 Lab Results (${lr.length})</div>${lr.map(r=>`<div style="border:1px solid #d4eff8;border-radius:7px;padding:9px;margin-bottom:6px;font-size:12px"><strong>${r.ref} — ${fd(r.date)}</strong><br>${r.rows?.map(x=>`${x.t}: <strong>${x.r}</strong> ${x.u} [${x.f}]`).join(' | ')}<br><em>${r.int}</em></div>`).join('')}</div>`:''}
    ${ur.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;border-bottom:1px solid #d4eff8;padding-bottom:4px">🔊 Ultrasound Reports (${ur.length})</div>${ur.map(r=>`<div style="border:1px solid #d4eff8;border-radius:7px;padding:9px;margin-bottom:6px;font-size:12px"><strong>${r.ref} — ${fd(r.date)} — ${r.ty}</strong><br><em>${r.imp}</em></div>`).join('')}</div>`:''}
    ${rx.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;border-bottom:1px solid #d4eff8;padding-bottom:4px">💊 Prescriptions (${rx.length})</div>${rx.map(r=>`<div style="border:1px solid #d4eff8;border-radius:7px;padding:9px;margin-bottom:6px;font-size:12px"><strong>${r.ref} — ${fd(r.date)}</strong> — ${r.dx||'—'}<br>${r.meds?.map(m=>`${m.dr} ${m.do} ${m.fr}`).join(' | ')}</div>`).join('')}</div>`:''}
    ${bl.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;border-bottom:1px solid #d4eff8;padding-bottom:4px">💳 Billing Summary</div><div style="font-size:12.5px;display:flex;gap:20px;margin-bottom:6px"><span>Total Billed: <strong>${fm(bl.reduce((s,b)=>s+Number(b.tot),0))}</strong></span><span>Paid: <strong style="color:#1d8a5e">${fm(bl.reduce((s,b)=>s+Number(b.paid),0))}</strong></span></div></div>`:''}
    ${dc.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;border-bottom:1px solid #d4eff8;padding-bottom:4px">🏥 Discharge Summaries (${dc.length})</div>${dc.map(d=>`<div style="border:1px solid #d4eff8;border-radius:7px;padding:9px;margin-bottom:6px;font-size:12px"><strong>${d.ref} — Discharged ${fd(d.dd)}</strong><br>Dx: ${d.di} | Condition: ${d.co}</div>`).join('')}</div>`:''}
    ${hakFtr()}
  </div>`);
}

/* ── APPOINTMENTS ── */
let aFil='all';
let _editApptId=null; // declared here so saveAppt can reference it
function setAF(f){
  aFil=f;
  // Update all tab buttons
  document.querySelectorAll('[id^="at-"]').forEach(b=>{
    if(b.id==='at-Pending'){return;} // handled separately
    b.className='tab'+(b.id==='at-'+f?' on':'');
  });
  const pt=document.getElementById('at-Pending');
  if(pt) pt.classList.toggle('on', f==='Pending');
  renderAppts();
}
function renderAppts(){
  const isReceptionOrAdmin = CU && (CU.role==='admin' || CU.role==='reception');
  const canApprovePending  = isReceptionOrAdmin;
  // Doctors & nurses can VIEW pending (read-only); pharmacy/billing/lab cannot
  const canSeePending = CU && ['admin','reception','doctor','nurse'].indexOf(CU.role) > -1;
  let l = DB.get('appointments');
  const df = V('adf');
  if(!canSeePending){ l = l.filter(a => a.st !== 'Pending'); }
  if(df) l = l.filter(a => a.date === df);
  if(aFil !== 'all') l = l.filter(a => a.st === aFil);
  l.sort((a,b)=>{
    if(a.st==='Pending' && b.st!=='Pending') return -1;
    if(b.st==='Pending' && a.st!=='Pending') return 1;
    return (b.date||'').localeCompare(a.date||'');
  });
  // Pending badge on tab
  if(canSeePending){
    const pendingCount = DB.get('appointments').filter(a=>a.st==='Pending').length;
    const pendingTab = document.getElementById('at-Pending');
    if(pendingTab){
      pendingTab.innerHTML = pendingCount > 0
        ? `Pending <span style="background:#e53e3e;color:white;border-radius:99px;padding:1px 7px;font-size:10px;margin-left:4px;font-weight:700">${pendingCount}</span>`
        : 'Pending';
    }
  }
  const atbody = document.getElementById('atbody');
  if(!atbody) return;
  atbody.innerHTML = l.length ? l.map(a=>`
    <tr style="${a.st==='Pending'?'background:rgba(255,193,7,.07);':''}">
      <td>${fd(a.date)}</td>
      <td>${a.time||'—'}</td>
      <td><strong>${a.pn}</strong></td>
      <td>${a.pr||'—'}</td>
      <td><span class="b bt">${a.ty||'—'}</span></td>
      <td style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.n||'—'}</td>
      <td>
        <span class="b ${a.st==='Completed'?'bg':a.st==='Scheduled'?'bo':a.st==='Rejected'?'br':'ba'}"
          ${a.st==='Pending'?'style="background:#fff3cd;color:#856404;border:1px solid #ffc107"':''}>
          ${a.st==='Pending'?'⏳ Pending':a.st}
        </span>
      </td>
      <td style="white-space:nowrap">
        <button class="btn btno xs" onclick="editAppt('${a.id}')">✏️</button>
        <button class="btn btnd xs" onclick="delRec('appointments','${a.id}',renderAppts)" title="Delete" style="margin-left:3px">🗑</button>
        ${a.st==='Pending' && canApprovePending
          ? `<button class="btn btng xs" onclick="approveAppt('${a.id}')" style="margin-left:3px;background:#1d8a5e;color:white">✓ Approve</button>
             <button class="btn btnd xs" onclick="rejectAppt('${a.id}')" style="margin-left:3px">✗ Reject</button>`
          : ''}
        ${a.st==='Scheduled'
          ? `<button class="btn btng xs" onclick="mkAppt('${a.id}','Completed')" style="margin-left:3px">✓ Done</button>
             <button class="btn btnd xs" onclick="mkAppt('${a.id}','Cancelled')" style="margin-left:3px">✗ Cancel</button>`
          : ''}
      </td>
    </tr>`).join('') : `<tr><td colspan="8" class="nd">No appointments</td></tr>`;
}
function openAppt(){
  loadPats();
  S('af-d',td());
  _editApptId = null;
  document.getElementById('appt-mtit').textContent = 'Book Appointment';
  if(document.getElementById('appt-editbadge')) document.getElementById('appt-editbadge').style.display='none';
  document.getElementById('af-p').innerHTML=patOpts();
  openOv('ov-appt');
}
function saveAppt(){
  const pid=V('af-p');if(!pid){toast('Select a patient','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);
  if(!p){toast('Patient not found','error');return;}
  // Staff-created appointments are immediately Scheduled (no approval needed)
  const a={id:DB.id(),pid,pn:`${p.fn} ${p.ln}`,date:V('af-d'),time:V('af-t'),pr:V('af-pr'),ty:V('af-ty'),n:V('af-n'),st:'Scheduled'};
  if(_editApptId){
    const ar=DB.get('appointments');const idx=ar.findIndex(x=>x.id===_editApptId);
    if(idx>-1){ar[idx]={...ar[idx],pid,pn:`${p.fn} ${p.ln}`,date:V('af-d'),time:V('af-t'),pr:V('af-pr'),ty:V('af-ty'),n:V('af-n')};}
    DB.set('appointments',ar);_editApptId=null;
    document.getElementById('appt-mtit').textContent='Book Appointment';
    closeOv('ov-appt');renderAppts();toast('Appointment updated','success');
    return;
  }
  const ar=DB.get('appointments');ar.unshift(a);DB.set('appointments',ar);closeOv('ov-appt');S('af-n','');renderAppts();toast('Appointment booked','success');
}
async function approveAppt(id){
  // Optimistic update — instantly show Scheduled
  const ar = DB.get('appointments').map(a => a.id===id ? {...a, st:'Scheduled'} : a);
  LOCAL_DB['appointments'] = ar;
  renderAppts();
  renderDash();
  try {
    const formData = new FormData();
    formData.append('appt_id', id);
    const resp = await fetch('api.php?action=approve_appointment', { method:'POST', body:formData });
    const result = await resp.json();
    if (result.success) {
      // Full refresh to sync any server-side changes
      const getResp = await fetch('api.php?action=get');
      const srv = await getResp.json();
      for (const [appKey, tableKey] of Object.entries(KEY_MAP)) {
        LOCAL_DB[appKey] = srv[tableKey] || [];
      }
      renderAppts();
      renderDash();
      toast('Appointment approved ✓', 'success');
    } else {
      // Rollback
      LOCAL_DB['appointments'] = DB.get('appointments').map(a => a.id===id ? {...a, st:'Pending'} : a);
      renderAppts();
      toast(result.error || 'Failed to approve appointment', 'error');
    }
  } catch (e) {
    console.error(e);
    toast('Network error — appointment updated locally', 'warn');
  }
}

async function rejectAppt(id){
  const notes = prompt('Reason for rejection (optional):', '') ?? '';
  // Optimistic update
  const ar = DB.get('appointments').map(a => a.id===id ? {...a, st:'Rejected'} : a);
  LOCAL_DB['appointments'] = ar;
  renderAppts();
  renderDash();
  try {
    const formData = new FormData();
    formData.append('appt_id', id);
    if (notes) formData.append('notes', notes);
    const resp = await fetch('api.php?action=reject_appointment', { method:'POST', body:formData });
    const result = await resp.json();
    if (result.success) {
      const getResp = await fetch('api.php?action=get');
      const srv = await getResp.json();
      for (const [appKey, tableKey] of Object.entries(KEY_MAP)) {
        LOCAL_DB[appKey] = srv[tableKey] || [];
      }
      renderAppts();
      renderDash();
      toast('Appointment rejected', 'warn');
    } else {
      LOCAL_DB['appointments'] = DB.get('appointments').map(a => a.id===id ? {...a, st:'Pending'} : a);
      renderAppts();
      toast(result.error || 'Failed to reject appointment', 'error');
    }
  } catch (e) {
    console.error(e);
    toast('Network error — appointment updated locally', 'warn');
  }
}
function mkAppt(id,st){
  const ar=DB.get('appointments').map(a=>a.id===id?{...a,st}:a);
  DB.set('appointments',ar);
  renderAppts();
  renderDash();
  toast(st==='Completed'?'Marked complete':'Updated','success');
}

/* ── ENCOUNTERS ── */
let eFil='all';
function setEF(f){eFil=f;document.querySelectorAll('[id^="ef-"]').forEach(b=>{if(b.classList.contains('tab'))b.className='tab'+(b.id==='ef-'+f?' on':'')});renderEncs();}
function renderEncs(){
  const etbody=document.getElementById('etbody');
  if(!etbody)return;
  let l=DB.get('encounters');if(eFil!=='all')l=l.filter(e=>e.st===eFil);
  etbody.innerHTML=l.length?l.map(e=>`<tr>
    <td>${fd(e.date)}</td>
    <td><a href="#" onclick="viewEnc('${e.id}');return false" style="color:var(--t6);font-weight:500;text-decoration:none">${e.pn}</a></td>
    <td><span class="b bt">${e.ty}</span></td><td>${e.pr}</td>
    <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.c}</td>
    <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.dx}</td>
    <td><span class="b ${e.st==='Active'?'bo':e.st==='Completed'?'bg':'ba'}">${e.st}</span></td>
    <td style="white-space:nowrap">
      <button class="btn btng xs" onclick="viewEnc('${e.id}')">View</button>
      <button class="btn btno xs" onclick="editEnc('${e.id}')" style="margin-left:3px">✏️</button>
      <button class="btn btnd xs" onclick="delRec('encounters','${e.id}',renderEncs)" title="Delete" style="margin-left:3px">🗑</button>
      ${e.st!=='Completed'?`<button class="btn btng xs" onclick="doneEnc('${e.id}')" style="margin-left:3px">Done</button>`:''}
    </td>
  </tr>`).join(''):`<tr><td colspan="8" class="nd">No encounters</td></tr>`;
}
function doneEnc(id){const ar=DB.get('encounters').map(e=>e.id===id?{...e,st:'Completed'}:e);DB.set('encounters',ar);renderEncs();toast('Completed','success');}
function openEnc(){
  loadPats();S('enc-d',td());document.getElementById('enc-p').innerHTML=patOpts();
  ['enc-c','enc-o','enc-dx','enc-pl','enc-fu','v-t','v-b','v-p','v-s','v-w','v-h','v-r','v-rr'].forEach(id=>S(id,''));openOv('ov-enc');
}
function saveEnc(pr){
  const pid=V('enc-p'),c=V('enc-c').trim(),dx=V('enc-dx').trim();
  if(!pid||!c||!dx){toast('Patient, complaint and diagnosis required','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);
  const e={id:DB.id(),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('enc-d'),ty:V('enc-ty'),pr:V('enc-pr'),c,o:V('enc-o'),dx,pl:V('enc-pl'),fu:V('enc-fu'),vt:{t:V('v-t'),b:V('v-b'),p:V('v-p'),s:V('v-s'),w:V('v-w'),h:V('v-h'),r:V('v-r'),rr:V('v-rr')},st:'Active'};
  const ar=DB.get('encounters');ar.unshift(e);DB.set('encounters',ar);closeOv('ov-enc');renderEncs();toast('Encounter saved','success');if(pr)printEncById(e.id);
}
let _veid=null;
function viewEnc(id){
  _veid=id;const e=DB.get('encounters').find(x=>x.id===id);if(!e)return;
  document.getElementById('vetitle').textContent=`${e.pn} — ${fd(e.date)}`;
  const v=e.vt||{};
  document.getElementById('vebody').innerHTML=`
    <div style="background:var(--t0);border-radius:9px;padding:11px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
      ${[['Temp',v.t?v.t+'°C':'—'],['BP',v.b||'—'],['Pulse',v.p?v.p+' bpm':'—'],['SpO₂',v.s?v.s+'%':'—'],['Weight',v.w?v.w+' kg':'—'],['Height',v.h?v.h+' cm':'—'],['RBS',v.r||'—'],['Resp',v.rr||'—']].map(([l,val])=>`<div><div style="font-size:9.5px;color:var(--tx3);text-transform:uppercase">${l}</div><div style="font-weight:600;font-size:13px">${val}</div></div>`).join('')}
    </div>
    ${[['Chief Complaint',e.c],['Objective / Examination',e.o||'—'],['Assessment / Diagnosis',e.dx],['Plan / Management',e.pl||'—'],...(e.fu?[['Follow-up',e.fu]]:[])].map(([l,val])=>`<div style="margin-bottom:11px"><div class="stit">${l}</div><div style="background:var(--iv);border:1px solid var(--bd);border-radius:7px;padding:10px;font-size:13px;line-height:1.7">${val}</div></div>`).join('')}`;
  openOv('ov-ve');
}
function printEncById(id){
  const e=DB.get('encounters').find(x=>x.id===id);if(!e)return;const v=e.vt||{};
  doPrint(`<div style="max-width:720px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">
    ${hakHdr('CLINICAL ENCOUNTER NOTE',e.id,e.date)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12.5px">
      <tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${e.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD</td><td style="padding:7px 10px;font-weight:600">${e.opd}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Provider</td><td style="padding:7px 10px;font-weight:600">${e.pr}</td></tr>
    </table>
    <div style="background:#eaf6fb;border-radius:9px;padding:11px;margin-bottom:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:7px;font-size:12px">
      <div style="font-weight:600;color:#1a6b87;grid-column:1/-1;font-size:9.5px;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px">Vital Signs</div>
      ${[['Temp',v.t?v.t+'°C':'—'],['BP',v.b||'—'],['Pulse',v.p?v.p+' bpm':'—'],['SpO₂',v.s?v.s+'%':'—'],['Weight',v.w?v.w+' kg':'—'],['Height',v.h?v.h+' cm':'—'],['RBS',v.r||'—'],['Resp',v.rr||'—']].map(([l,val])=>`<div><span style="color:#5a7a8a;font-size:9.5px;display:block;text-transform:uppercase">${l}</span><strong>${val}</strong></div>`).join('')}
    </div>
    ${[['Subjective — Chief Complaint',e.c],['Objective — Examination',e.o||'—'],['Assessment — Diagnosis',e.dx],['Plan — Management',e.pl||'—']].map(([l,val])=>`<div style="margin-bottom:10px"><div style="font-size:9.5px;color:#5a7a8a;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px">${l}</div><div style="border:1px solid #d4eff8;border-radius:7px;padding:9px;line-height:1.7;font-size:12.5px">${val}</div></div>`).join('')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:26px"><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Clinician: <strong>${e.pr}</strong></div><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Signature: ___________________</div></div>
    ${hakFtr()}
  </div>`);
}

/* ── ULTRASOUND ── */
const US_SCANS=['Obstetric / Pregnancy','Abdominal','Pelvic','Renal / KUB','Thyroid','Scrotal','Breast','Cardiac (Echo)','Trans-vaginal'];
function setUT(t){document.getElementById('usrp').style.display=t==='r'?'':'none';document.getElementById('uspp').style.display=t==='p'?'':'none';document.getElementById('ut-r').className='tab'+(t==='r'?' on':'');document.getElementById('ut-p').className='tab'+(t==='p'?' on':'');}
function renderUSReqs(){
  const usrtb=document.getElementById('usrtb');
  const usptb=document.getElementById('usptb');
  if(!usrtb&&!usptb)return;
  const l=DB.get('us_req');
  if(usrtb)usrtb.innerHTML=l.length?l.map(r=>`<tr><td><strong style="color:var(--t7)">${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.pn}</td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.scans?.join(', ')}</td><td>${r.cl}</td><td><span class="b ${r.pr==='Urgent'?'bo':'ba'}">${r.pr}</span></td><td><span class="b ${r.st==='Pending'?'bo':'bg'}">${r.st}</span></td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pUSReq('${r.id}')">🖨</button><button class="btn btno xs" onclick="editUSReq&&editUSReq('${r.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('us_req','${r.id}',renderUSReqs)" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join(''):`<tr><td colspan="8" class="nd">No requests</td></tr>`;
  const p=DB.get('us_rep');
  if(usptb)usptb.innerHTML=p.length?p.map(r=>`<tr><td><strong style="color:var(--t7)">${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.pn}</td><td>${r.ty}</td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.imp}</td><td>${r.by||'—'}</td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pUSRep('${r.id}')">🖨</button><button class="btn btno xs" onclick="editUSRep('${r.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('us_rep','${r.id}',renderUSReqs)" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join(''):`<tr><td colspan="7" class="nd">No reports</td></tr>`;
}
function openUSReq(){
  loadPats();S('usq-d',td());S('usq-ind','');S('usq-oth','');document.getElementById('usq-p').innerHTML=patOpts();
  document.getElementById('usscanlist').innerHTML=US_SCANS.map(s=>`<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;background:var(--iv2);padding:8px 10px;border-radius:7px;cursor:pointer"><input type="checkbox" class="uss" value="${s}"> ${s}</label>`).join('');
  openOv('ov-usreq');
}
function saveUSReq(pr){
  const pid=V('usq-p');if(!pid){toast('Select a patient','error');return;}
  const scans=[...document.querySelectorAll('.uss:checked')].map(c=>c.value);const oth=V('usq-oth');
  if(!scans.length&&!oth){toast('Select at least one scan','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const ar=DB.get('us_req');
  const r={id:DB.id(),ref:nRef('US-REQ',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('usq-d'),cl:V('usq-cl'),pr:V('usq-pr'),scans:[...scans,...(oth?[oth]:[])],ind:V('usq-ind'),st:'Pending'};
  ar.unshift(r);DB.set('us_req',ar);closeOv('ov-usreq');renderUSReqs();if(pr)pUSReq(r.id);else toast('US request saved — '+r.ref,'success');
}
function openUSRep(){
  loadPats();S('usp-d',td());S('usp-ty','');S('usp-by','');S('usp-fi','');S('usp-im','');document.getElementById('usp-p').innerHTML=patOpts();
  const rqs=DB.get('us_req').filter(r=>r.st==='Pending');document.getElementById('usp-lk').innerHTML='<option value="">— None —</option>'+rqs.map(r=>`<option value="${r.id}">${r.ref} — ${r.pn}</option>`).join('');openOv('ov-usrep');
}
function saveUSRep(pr){
  const pid=V('usp-p'),fi=V('usp-fi').trim(),im=V('usp-im').trim();if(!pid||!fi||!im){toast('Patient, findings and impression required','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const ar=DB.get('us_rep');const lk=V('usp-lk');
  const r={id:DB.id(),ref:nRef('US-RPT',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('usp-d'),ty:V('usp-ty'),by:V('usp-by'),rv:V('usp-rv'),lk,fi,imp:im};
  ar.unshift(r);DB.set('us_rep',ar);if(lk){DB.set('us_req',DB.get('us_req').map(x=>x.id===lk?{...x,st:'Reported'}:x));}
  closeOv('ov-usrep');renderUSReqs();if(pr)pUSRep(r.id);else toast('US report saved — '+r.ref,'success');
}
function pUSReq(id){const r=DB.get('us_req').find(x=>x.id===id);if(!r)return;doPrint(`<div style="max-width:700px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">${hakHdr('ULTRASOUND REQUEST FORM',r.ref,r.date)}<table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12.5px"><tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${r.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD</td><td style="padding:7px 10px;font-weight:600">${r.opd}</td></tr><tr><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Clinician</td><td style="padding:7px 10px">${r.cl}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Priority</td><td style="padding:7px 10px"><strong>${r.pr}</strong></td></tr></table><div style="margin-bottom:12px"><div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:5px">Scans Requested</div><div style="border:1.5px solid #2089ab;border-radius:7px;padding:10px">${r.scans.map(s=>`<div style="display:inline-block;background:#eaf6fb;border-radius:4px;padding:3px 9px;margin:3px;font-size:12px">☐ ${s}</div>`).join('')}</div></div><div style="margin-bottom:12px"><div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:5px">Clinical Indication</div><div style="border:1px solid #d4eff8;border-radius:7px;padding:9px;line-height:1.7">${r.ind||'—'}</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:26px"><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Requested by: <strong>${r.cl}</strong></div><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Sonographer: ___________________</div></div>${hakFtr()}</div>`);}
function pUSRep(id){const r=DB.get('us_rep').find(x=>x.id===id);if(!r)return;doPrint(`<div style="max-width:700px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">${hakHdr('ULTRASOUND REPORT',r.ref,r.date)}<table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12.5px"><tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${r.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Scan</td><td style="padding:7px 10px;font-weight:600">${r.ty}</td></tr></table><div style="margin-bottom:12px"><div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:5px">Findings</div><div style="border:1px solid #d4eff8;border-radius:7px;padding:10px;line-height:1.8">${r.fi}</div></div><div style="margin-bottom:12px"><div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:5px">Impression</div><div style="border:2px solid #2089ab;border-radius:7px;padding:10px;background:#eaf6fb;line-height:1.8;font-weight:500">${r.imp}</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:26px"><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Sonographer: <strong>${r.by||'—'}</strong></div><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Reviewed by: <strong>${r.rv||'—'}</strong></div></div>${hakFtr()}</div>`);}

/* ── LABORATORY ── */
function setLT(t){document.getElementById('lrp').style.display=t==='r'?'':'none';document.getElementById('lpp').style.display=t==='p'?'':'none';document.getElementById('lt-r').className='tab'+(t==='r'?' on':'');document.getElementById('lt-p').className='tab'+(t==='p'?' on':'');}
function renderLabReqs(){
  const lrtb=document.getElementById('lrtb');
  const lptb=document.getElementById('lptb');
  if(!lrtb&&!lptb)return;
  const l=DB.get('lab_req');
  if(lrtb)lrtb.innerHTML=l.length?l.map(r=>`<tr><td><strong style="color:var(--t7)">${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.pn}</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.tests?.slice(0,3).join(', ')+(r.tests?.length>3?'…':'')}</td><td>${r.cl}</td><td><span class="b ${r.pr==='STAT'?'br':r.pr==='Urgent'?'bo':'ba'}">${r.pr}</span></td><td><span class="b ${r.st==='Pending'?'bo':'bg'}">${r.st}</span></td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pLabReq('${r.id}')">🖨</button><button class="btn btnd xs" onclick="delRec('lab_req','${r.id}',renderLabReqs)" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join(''):`<tr><td colspan="8" class="nd">No lab requests</td></tr>`;
  const p=DB.get('lab_rep');
  if(lptb)lptb.innerHTML=p.length?p.map(r=>`<tr><td><strong style="color:var(--t7)">${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.pn}</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.rows?.slice(0,3).map(x=>x.t).join(', ')}</td><td>${r.by||'—'}</td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pLabRep('${r.id}')">🖨</button><button class="btn btno xs" onclick="editLabRep('${r.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('lab_rep','${r.id}',renderLabReqs)" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join(''):`<tr><td colspan="6" class="nd">No results</td></tr>`;
}
function openLabReq(){loadPats();S('lq-d',td());S('lq-ind','');S('lq-oth','');document.getElementById('lq-p').innerHTML=patOpts();document.querySelectorAll('.lbt').forEach(c=>c.checked=false);openOv('ov-labreq');}
function saveLabReq(pr){
  const pid=V('lq-p');if(!pid){toast('Select a patient','error');return;}
  const tests=[...document.querySelectorAll('.lbt:checked')].map(c=>c.value);const oth=V('lq-oth');
  if(!tests.length&&!oth){toast('Select at least one test','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const ar=DB.get('lab_req');
  const r={id:DB.id(),ref:nRef('LAB-REQ',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('lq-d'),cl:V('lq-cl'),pr:V('lq-pr'),tests:[...tests,...(oth?[oth]:[])],ind:V('lq-ind'),st:'Pending'};
  ar.unshift(r);DB.set('lab_req',ar);closeOv('ov-labreq');renderLabReqs();if(pr)pLabReq(r.id);else toast('Lab request saved — '+r.ref,'success');
}
let labRids=[];
function addLabRow(t='',r='',u='',rng='',f='Normal'){
  const id='lr_'+Date.now()+'_'+Math.random().toString(36).slice(2,5);labRids.push(id);
  const d=document.createElement('div');d.id=id;d.style.cssText='display:grid;grid-template-columns:2fr 2fr 1fr 2fr 1fr auto;gap:7px;margin-bottom:7px;align-items:end';
  d.innerHTML=`<div><label class="fl">Test</label><input class="fi" placeholder="Test name" value="${t}" data-f="t"></div><div><label class="fl">Result</label><input class="fi" placeholder="Value" value="${r}" data-f="r"></div><div><label class="fl">Unit</label><input class="fi" placeholder="g/dL" value="${u}" data-f="u"></div><div><label class="fl">Ref Range</label><input class="fi" placeholder="4–11" value="${rng}" data-f="rn"></div><div><label class="fl">Flag</label><select class="fs" data-f="f"><option ${f==='Normal'?'selected':''}>Normal</option><option ${f==='High'?'selected':''}>High</option><option ${f==='Low'?'selected':''}>Low</option><option ${f==='Critical'?'selected':''}>Critical</option></select></div><div style="padding-bottom:1px"><button class="btn btnd xs" onclick="document.getElementById('${id}').remove()">✕</button></div>`;
  document.getElementById('lp-rows').appendChild(d);
}
function getLabRows(){return labRids.map(id=>{const el=document.getElementById(id);if(!el)return null;return{t:el.querySelector('[data-f="t"]').value,r:el.querySelector('[data-f="r"]').value,u:el.querySelector('[data-f="u"]').value,rn:el.querySelector('[data-f="rn"]').value,f:el.querySelector('[data-f="f"]').value};}).filter(Boolean).filter(x=>x.t);}
function openLabRep(){
  loadPats();
  S('lp-d',td());S('lp-by','');S('lp-int','');S('lp-micro','');
  document.getElementById('lp-p').innerHTML=patOpts();
  const rqs=DB.get('lab_req').filter(r=>r.st==='Pending');
  document.getElementById('lp-lk').innerHTML='<option value="">— None —</option>'+rqs.map(r=>`<option value="${r.id}">${r.ref} — ${r.pn}</option>`).join('');
  labRids=[];document.getElementById('lp-rows').innerHTML='';
  // Reset panel counter badge
  const cnt=document.getElementById('lab-panel-count');
  if(cnt){cnt.dataset.n='0';cnt.textContent='';cnt.style.display='none';}
  document.getElementById('lab-editbadge').style.display='none';
  document.getElementById('lab-mtit').textContent='Laboratory Results Entry';
  addLabRow();openOv('ov-labrep');
}
function saveLabRep(pr){
  const pid=V('lp-p'),int=V('lp-int').trim();if(!pid){toast('Select a patient','error');return;}
  const rows=getLabRows();if(!rows.length){toast('Add at least one result row','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const ar=DB.get('lab_rep');const lk=V('lp-lk');
  const micro=V('lp-micro')||'';
  const r={id:DB.id(),ref:nRef('LAB-RPT',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('lp-d'),by:V('lp-by'),rv:V('lp-rv'),lk,rows,micro,int};
  ar.unshift(r);DB.set('lab_rep',ar);if(lk){DB.set('lab_req',DB.get('lab_req').map(x=>x.id===lk?{...x,st:'Resulted'}:x));}
  closeOv('ov-labrep');renderLabReqs();if(pr)pLabRep(r.id);else toast('Results saved — '+r.ref,'success');
}
function saveLabRepAddAnother(){
  // Save the current panel, then reopen for a new panel with same patient + date
  const pid=V('lp-p'),int=V('lp-int').trim();
  if(!pid){toast('Select a patient','error');return;}
  const rows=getLabRows();
  if(!rows.length){toast('Add at least one result row','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const ar=DB.get('lab_rep');const lk=V('lp-lk');
  const micro=V('lp-micro')||'';
  const savedDate=V('lp-d');
  const savedBy=V('lp-by');
  const savedRv=V('lp-rv');
  const r={id:DB.id(),ref:nRef('LAB-RPT',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:savedDate,by:savedBy,rv:savedRv,lk,rows,micro,int};
  ar.unshift(r);DB.set('lab_rep',ar);
  if(lk){DB.set('lab_req',DB.get('lab_req').map(x=>x.id===lk?{...x,st:'Resulted'}:x));}
  renderLabReqs();
  toast('Panel saved — '+r.ref+'. Ready for next panel.','success');
  // Update panel count badge
  const cnt=document.getElementById('lab-panel-count');
  if(cnt){
    const n=(parseInt(cnt.dataset.n||0))+1;cnt.dataset.n=n;
    cnt.textContent=n+' panel'+(n!==1?'s':'')+' saved';cnt.style.display='inline-block';
  }
  // Clear only the rows + micro + interpretation, keep patient/date/by
  labRids=[];document.getElementById('lp-rows').innerHTML='';
  document.getElementById('lp-micro').value='';
  document.getElementById('lp-int').value='';
  // Clear the link (new panel can link to a different request)
  const rqs=DB.get('lab_req').filter(x=>x.st==='Pending');
  document.getElementById('lp-lk').innerHTML='<option value="">— None —</option>'+rqs.map(x=>`<option value="${x.id}">${x.ref} — ${x.pn}</option>`).join('');
  // Add one empty row ready for the next panel
  addLabRow();
  // Scroll back to top of modal
  const modal=document.querySelector('#ov-labrep .modal');
  if(modal)modal.scrollTop=0;
}

function pLabReq(id){
  const r=DB.get('lab_req').find(x=>x.id===id);if(!r)return;
  doPrint(`
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<div style="font-family:'Outfit',sans-serif;max-width:720px;margin:0 auto;padding:26px">
  ${hakHdr('LABORATORY REQUEST FORM',r.ref,r.date)}
  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px">
    <tr style="background:#eaf6fb">
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td>
      <td style="padding:7px 10px;font-weight:700">${r.pn}</td>
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD No.</td>
      <td style="padding:7px 10px;font-weight:700">${r.opd}</td>
    </tr>
    <tr>
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Requesting Clinician</td>
      <td style="padding:7px 10px;font-weight:600">${r.cl}</td>
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Priority</td>
      <td style="padding:7px 10px;font-weight:700;color:${r.pr==='STAT'?'#b5322a':r.pr==='Urgent'?'#c97c2e':'inherit'}">${r.pr}</td>
    </tr>
    <tr style="background:#eaf6fb">
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Date</td>
      <td colspan="3" style="padding:7px 10px">${fd(r.date)}</td>
    </tr>
  </table>
  <div style="margin-bottom:14px">
    <div style="font-size:10px;color:#145369;text-transform:uppercase;font-weight:700;letter-spacing:.07em;margin-bottom:8px">Tests Requested for This Patient</div>
    <div style="border:1.5px solid #2089ab;border-radius:8px;padding:12px;background:#f8fbff">
      ${r.tests.map(t=>`<div style="display:inline-block;background:white;border:1px solid #d4eff8;border-radius:5px;padding:5px 12px;margin:3px;font-size:12.5px">☐ ${t}</div>`).join('')}
    </div>
  </div>
  <div style="margin-bottom:14px">
    <div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;font-weight:600;letter-spacing:.07em;margin-bottom:6px">Clinical Indication / History</div>
    <div style="border:1px solid #d4eff8;border-radius:8px;padding:11px 13px;line-height:1.8;white-space:pre-wrap;font-size:13px;min-height:50px">${r.ind||'—'}</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:28px">
    <div style="border-top:1.5px solid #d4eff8;padding-top:8px">
      <div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:3px">Requested by</div>
      <div style="font-size:13px;font-weight:600">${r.cl}</div>
      <div style="font-size:10px;color:#5a7a8a;margin-top:16px">Signature: ___________________</div>
    </div>
    <div style="border-top:1.5px solid #d4eff8;padding-top:8px">
      <div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:3px">Received by (Lab)</div>
      <div style="font-size:13px">___________________</div>
      <div style="font-size:10px;color:#5a7a8a;margin-top:4px">Date &amp; Time: ___________________</div>
    </div>
  </div>
  ${hakFtr()}
</div>`);
}
// pLabRep defined below with full microscopy+patient-only support
function pLabRep(id){_pLabRepFull(id);}

/* ── PHARMACY ── */
function setRT(t){document.getElementById('rxp').style.display=t==='r'?'':'none';document.getElementById('dip').style.display=t==='d'?'':'none';document.getElementById('rxt-r').className='tab'+(t==='r'?' on':'');document.getElementById('rxt-d').className='tab'+(t==='d'?' on':'');}
function renderRx(){
  const rxtb=document.getElementById('rxtb');
  const ditb=document.getElementById('ditb');
  const l=DB.get('rx');
  if(rxtb)rxtb.innerHTML=l.length?l.map(r=>`<tr><td><strong style="color:var(--t7)">${r.ref}</strong></td><td>${fd(r.date)}</td><td>${r.pn}</td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.meds?.slice(0,2).map(m=>m.dr).join(', ')+(r.meds?.length>2?'…':'')}</td><td>${r.cl}</td><td>${r.dx||'—'}</td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pRx('${r.id}')">🖨</button><button class="btn btno xs" onclick="editRx('${r.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('rx','${r.id}',renderRx)" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join(''):`<tr><td colspan="7" class="nd">No prescriptions</td></tr>`;
  const d=DB.get('dis');
  if(ditb)ditb.innerHTML=d.length?d.map(x=>`<tr>
    <td>${fd(x.date)}</td><td>${x.pn}</td><td>${x.item}</td>
    <td><strong>${x.qty.toLocaleString()}</strong></td>
    <td>${fm(x.pr)}</td>
    <td><strong>${fm(x.tot)}</strong></td>
    <td>${x.by||'—'}</td>
    <td><button class="btn btnd xs" onclick="delRec('dis','${x.id}',renderRx)" title="Delete">🗑</button></td>
  </tr>`).join(''):`<tr><td colspan="8" class="nd">No dispensing records</td></tr>`;
  // Compute and display totals
  if(d.length>0){
    const totQty=d.reduce((s,x)=>s+Number(x.qty||0),0);
    const totVal=d.reduce((s,x)=>s+Number(x.tot||0),0);
    const tfEl=document.getElementById('dis-tfoot');
    const smEl=document.getElementById('dis-summary');
    if(tfEl){tfEl.style.display='';document.getElementById('dis-tot-qty').textContent=totQty.toLocaleString()+' units total';document.getElementById('dis-tot-val').textContent=fm(totVal);}
    if(smEl){
      // Per-item summary
      const byItem={};d.forEach(x=>{if(!byItem[x.item])byItem[x.item]={qty:0,tot:0};byItem[x.item].qty+=Number(x.qty||0);byItem[x.item].tot+=Number(x.tot||0);});
      smEl.style.display='flex';
      smEl.innerHTML='<div style="font-size:10px;font-weight:600;color:var(--t7);text-transform:uppercase;letter-spacing:.07em;width:100%;margin-bottom:7px">📦 Dispensing Summary by Item</div>'+Object.entries(byItem).map(([nm,v])=>`<div style="background:var(--t0);border-radius:8px;padding:8px 12px;font-size:12px"><div style="font-weight:600">${nm}</div><div style="color:var(--tx3)">${v.qty.toLocaleString()} units &nbsp;|&nbsp; ${fm(v.tot)}</div></div>`).join('');
    }
  }else{
    const tfEl=document.getElementById('dis-tfoot');const smEl=document.getElementById('dis-summary');
    if(tfEl)tfEl.style.display='none';if(smEl)smEl.style.display='none';
  }
}
let rxRids=0;
function addRxRow(dr='',do_='',fr='Twice daily',du='',rt='Oral',qt=''){
  rxRids++;const id='rxr'+rxRids;const d=document.createElement('div');d.id=id;d.style.cssText='display:grid;grid-template-columns:2.5fr 1fr 1.5fr 1fr 1fr 1fr auto;gap:7px;margin-bottom:7px;align-items:end;background:var(--iv2);padding:9px;border-radius:8px';
  d.innerHTML=`<div><label class="fl">Drug</label><input class="fi" placeholder="e.g. Amoxicillin 250mg" value="${dr}" data-f="dr"></div><div><label class="fl">Dose</label><input class="fi" placeholder="1 tab" value="${do_}" data-f="do"></div><div><label class="fl">Frequency</label><select class="fs" data-f="fr"><option ${fr==='Once daily'?'selected':''}>Once daily</option><option ${fr==='Twice daily'?'selected':''}>Twice daily</option><option ${fr==='Three times daily'?'selected':''}>Three times daily</option><option ${fr==='Four times daily'?'selected':''}>Four times daily</option><option ${fr==='As needed'?'selected':''}>As needed</option><option ${fr==='Stat'?'selected':''}>Stat</option><option ${fr==='Nocte'?'selected':''}>Nocte</option></select></div><div><label class="fl">Duration</label><input class="fi" placeholder="5 days" value="${du}" data-f="du"></div><div><label class="fl">Route</label><select class="fs" data-f="rt"><option ${rt==='Oral'?'selected':''}>Oral</option><option ${rt==='IV'?'selected':''}>IV</option><option ${rt==='IM'?'selected':''}>IM</option><option ${rt==='Topical'?'selected':''}>Topical</option></select></div><div><label class="fl">Qty</label><input class="fi" type="number" placeholder="10" value="${qt}" data-f="qt"></div><div style="padding-bottom:1px"><button class="btn btnd xs" onclick="document.getElementById('${id}').remove()">✕</button></div>`;
  document.getElementById('rx-rows').appendChild(d);
}
function getRxRows(){return[...document.getElementById('rx-rows').children].map(el=>({dr:el.querySelector('[data-f="dr"]').value,do:el.querySelector('[data-f="do"]').value,fr:el.querySelector('[data-f="fr"]').value,du:el.querySelector('[data-f="du"]').value,rt:el.querySelector('[data-f="rt"]').value,qt:el.querySelector('[data-f="qt"]').value})).filter(r=>r.dr);}
function openRx(){
  loadPats();S('rx-d',td());S('rx-dx','');S('rx-n','');S('rx-al','');
  document.getElementById('rx-p').innerHTML=patOpts();
  document.getElementById('rx-p').onchange=function(){const p=pats.find(x=>x.id===this.value);S('rx-al',p?p.al||'None':'');};
  document.getElementById('rx-rows').innerHTML='';rxRids=0;addRxRow();openOv('ov-rx');
}
function saveRx(pr){
  const pid=V('rx-p');if(!pid){toast('Select a patient','error');return;}
  const meds=getRxRows();if(!meds.length){toast('Add at least one medication','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const ar=DB.get('rx');
  const r={id:DB.id(),ref:nRef('RX',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('rx-d'),cl:V('rx-cl'),dx:V('rx-dx'),al:V('rx-al'),meds,n:V('rx-n')};
  ar.unshift(r);DB.set('rx',ar);closeOv('ov-rx');renderRx();if(pr)pRx(r.id);else toast('Prescription saved — '+r.ref,'success');
}
function pRx(id){const r=DB.get('rx').find(x=>x.id===id);if(!r)return;doPrint(`<div style="max-width:720px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">${hakHdr('PRESCRIPTION',r.ref,r.date)}<table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px"><tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${r.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD</td><td style="padding:7px 10px;font-weight:600">${r.opd}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Allergies</td><td style="padding:7px 10px;color:#b5322a;font-weight:600">${r.al||'None'}</td></tr><tr><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Diagnosis</td><td colspan="5" style="padding:7px 10px">${r.dx||'—'}</td></tr></table><table style="width:100%;border-collapse:collapse;border:1px solid #d4eff8;margin-bottom:14px;font-size:12.5px"><thead><tr style="background:#145369;color:white"><th style="padding:8px;text-align:left">#</th><th style="padding:8px;text-align:left">Medication</th><th style="padding:8px;text-align:left">Dose</th><th style="padding:8px;text-align:left">Frequency</th><th style="padding:8px;text-align:left">Route</th><th style="padding:8px;text-align:left">Duration</th><th style="padding:8px;text-align:left">Qty</th></tr></thead><tbody>${r.meds.map((m,i)=>`<tr style="${i%2===0?'background:#f8fbfd':''}"><td style="padding:7px 8px;color:#5a7a8a">${i+1}</td><td style="padding:7px 8px;font-weight:600">${m.dr}</td><td style="padding:7px 8px">${m.do}</td><td style="padding:7px 8px">${m.fr}</td><td style="padding:7px 8px">${m.rt}</td><td style="padding:7px 8px">${m.du}</td><td style="padding:7px 8px">${m.qt}</td></tr>`).join('')}</tbody></table>${r.n?`<div style="margin-bottom:12px"><div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:5px">Instructions</div><div style="border:1px solid #d4eff8;border-radius:7px;padding:9px">${r.n}</div></div>`:''}<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:26px"><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Prescribing Clinician: <strong>${r.cl}</strong></div><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Dispensed by: ___________________</div></div>${hakFtr()}</div>`);}

/* ── DISPENSING ── */
/* ══════════════════════════════════════════════════════════════
   DISPENSE — multi-drug per patient session
   Each drug row has its own inline search, qty, price, instructions.
   All drugs are saved as separate dispensing log entries in one go.
══════════════════════════════════════════════════════════════ */
let disRows=[];        // array of row IDs currently in modal
let _disSrchItems=[];  // inventory cache (refreshed on open + every search)

/* ── Open dispensing modal ── */
function openDis(){
  loadPats();
  _disSrchItems=DB.get('inventory');
  disRows=[];
  document.getElementById('dis-p').innerHTML=patOpts();
  S('dis-d',td()); S('dis-by','');
  document.getElementById('dis-drug-rows').innerHTML='';
  document.getElementById('dis-grand-total').textContent='UGX 0';
  document.getElementById('dis-grand-breakdown').textContent='';
  document.getElementById('dis-mtit').textContent='Dispense Medication';
  // Add one empty row to start
  addDrugRow();
  openOv('ov-dis');
  // Focus first search field
  setTimeout(()=>{const f=document.querySelector('.dis-row-srch');if(f)f.focus();},150);
}

/* ── Add a new drug row ── */
function addDrugRow(iid='',nm='',qty='',pr='',inst=''){
  const rowId='dr_'+Date.now()+'_'+Math.random().toString(36).slice(2,5);
  disRows.push(rowId);
  _disSrchItems=DB.get('inventory');

  const el=document.createElement('div');
  el.id=rowId;
  el.style.cssText='background:var(--iv2);border-radius:11px;padding:13px 14px;margin-bottom:10px;position:relative;border:1.5px solid var(--iv3);transition:border-color .2s';
  el.dataset.iid=iid;

  el.innerHTML=`
    <!-- Row header -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span class="dis-row-num" style="font-size:10px;font-weight:700;color:var(--t6);text-transform:uppercase;letter-spacing:.07em">Drug ${disRows.length}</span>
      <button class="btn btnd xs" onclick="removeDrugRow('${rowId}')" title="Remove this drug">✕ Remove</button>
    </div>
    <!-- Search area -->
    <div style="position:relative;margin-bottom:9px">
      <label class="fl">Search Medicine *</label>
      <div style="position:relative">
        <input class="fi dis-row-srch" id="${rowId}_srch" placeholder="Type name, category or supplier…" autocomplete="off"
          oninput="rowSrch('${rowId}')" onkeydown="rowSrchKey(event,'${rowId}')"
          style="padding-left:32px" value="${nm?'':''}" >
        <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none">🔍</span>
      </div>
      <div style="margin-top:4px;display:flex;gap:7px;align-items:center">
        <button class="btn btno xs" onclick="rowBrowseAll('${rowId}')" style="font-size:10.5px">📋 Browse All</button>
        <span id="${rowId}_cnt" style="font-size:10.5px;color:var(--tx3)">${_disSrchItems.length} items in inventory</span>
      </div>
      <!-- Dropdown -->
      <div id="${rowId}_res" style="display:none;position:absolute;z-index:2000;left:0;right:0;top:calc(100% - 18px);max-height:220px;overflow-y:auto;background:white;border:1.5px solid var(--t2);border-top:none;border-radius:0 0 var(--r) var(--r);box-shadow:var(--shm)"></div>
    </div>
    <!-- Selected item info card (hidden until drug is picked) -->
    <div id="${rowId}_card" style="display:${iid?'block':'none'};background:var(--t0);border:1px solid var(--t1);border-radius:8px;padding:9px 12px;margin-bottom:9px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
        <span id="${rowId}_nm" style="font-weight:600;font-size:13px;color:var(--t8)">${nm||'—'}</span>
        <button class="btn btng xs" onclick="clearDrugRow('${rowId}')" style="font-size:10px">Change</button>
      </div>
      <div id="${rowId}_info" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:11.5px"></div>
    </div>
    <!-- Qty + Price + Instructions -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;align-items:end">
      <div class="fg" style="margin:0"><label class="fl">Qty *</label>
        <input class="fi" id="${rowId}_qty" type="number" min="1" placeholder="0" value="${qty}" oninput="calcDisRow('${rowId}')">
      </div>
      <div class="fg" style="margin:0"><label class="fl">Unit Price (UGX)</label>
        <input class="fi" id="${rowId}_pr" type="number" placeholder="0" value="${pr}" oninput="calcDisRow('${rowId}')">
      </div>
      <div class="fg" style="margin:0"><label class="fl">Row Total</label>
        <input class="fi" id="${rowId}_tot" readonly style="background:white;font-weight:700;color:var(--t7)">
      </div>
    </div>
    <div class="fg" style="margin-top:8px;margin-bottom:0"><label class="fl">Instructions</label>
      <input class="fi" id="${rowId}_inst" placeholder="e.g. 1 tab twice daily after food" value="${inst}">
    </div>`;

  document.getElementById('dis-drug-rows').appendChild(el);

  // If pre-filling (edit mode), populate from inventory
  if(iid){
    const item=_disSrchItems.find(x=>x.id===iid);
    if(item){
      el.dataset.iid=iid;
      populateDrugCard(rowId,item);
      const si=document.getElementById(rowId+'_srch');
      if(si)si.value=item.nm;
    }
  }

  renumberDrugRows();
  calcDisGrand();
}

/* ── Remove a drug row ── */
function removeDrugRow(rowId){
  document.getElementById(rowId)?.remove();
  disRows=disRows.filter(r=>r!==rowId);
  renumberDrugRows();
  calcDisGrand();
  if(disRows.length===0)addDrugRow(); // always keep at least one row
}

/* ── Renumber row headers ── */
function renumberDrugRows(){
  disRows.forEach((id,idx)=>{
    const el=document.getElementById(id);
    if(!el)return;
    const lbl=el.querySelector('.dis-row-num');
    if(lbl)lbl.textContent='Drug '+(idx+1);
  });
  const countEl=document.getElementById('dis-item-count');
  if(countEl){
    const n=disRows.length;
    countEl.textContent=n+' drug'+(n!==1?'s':'')+' to dispense';
  }
}

/* ── Populate the drug info card after selection ── */
function populateDrugCard(rowId,item){
  const out=item.qty===0,low=item.qty>0&&item.qty<=item.ro;
  const stockColor=out?'var(--er)':low?'var(--wn)':'var(--ok)';
  const infoEl=document.getElementById(rowId+'_info');
  if(infoEl)infoEl.innerHTML=`
    <div><span style="color:var(--tx3);font-size:9px;display:block;text-transform:uppercase">Category</span>${item.cat}</div>
    <div><span style="color:var(--tx3);font-size:9px;display:block;text-transform:uppercase">In Stock</span><span style="font-weight:700;color:${stockColor}">${item.qty.toLocaleString()} ${item.un}</span></div>
    <div><span style="color:var(--tx3);font-size:9px;display:block;text-transform:uppercase">Unit</span>${item.un}</div>
    <div><span style="color:var(--tx3);font-size:9px;display:block;text-transform:uppercase">Sell Price</span>${item.sp>0?fm(item.sp):'—'}</div>
    <div><span style="color:var(--tx3);font-size:9px;display:block;text-transform:uppercase">Location</span>${item.lo||'—'}</div>
    <div><span style="color:var(--tx3);font-size:9px;display:block;text-transform:uppercase">Expiry</span><span style="font-size:11px">${fd(item.ex)}</span></div>`;
  const nmEl=document.getElementById(rowId+'_nm');
  if(nmEl)nmEl.textContent=item.nm;
  const card=document.getElementById(rowId+'_card');
  if(card)card.style.display='block';
  // Auto-fill price
  const prEl=document.getElementById(rowId+'_pr');
  if(prEl&&(!prEl.value||prEl.value==='0'))prEl.value=item.sp>0?item.sp:(item.cp>0?item.cp:'');
  calcDisRow(rowId);
  // Highlight the row
  const rowEl=document.getElementById(rowId);
  if(rowEl)rowEl.style.borderColor='var(--t3)';
}

/* ── Clear a drug row (unselect item) ── */
function clearDrugRow(rowId){
  const el=document.getElementById(rowId);if(!el)return;
  el.dataset.iid='';
  el.style.borderColor='var(--iv3)';
  const srch=document.getElementById(rowId+'_srch');if(srch){srch.value='';srch.style.display='';}
  document.getElementById(rowId+'_card').style.display='none';
  document.getElementById(rowId+'_res').style.display='none';
  S(rowId+'_qty','');S(rowId+'_pr','');S(rowId+'_tot','');
  calcDisGrand();
  setTimeout(()=>srch?.focus(),80);
}

/* ── Per-row search ── */
function rowSrch(rowId){
  const q=document.getElementById(rowId+'_srch')?.value.trim().toLowerCase()||'';
  const res=document.getElementById(rowId+'_res');if(!res)return;
  if(!q){res.style.display='none';return;}
  _disSrchItems=DB.get('inventory');
  const matches=_disSrchItems.filter(i=>
    i.nm.toLowerCase().includes(q)||
    (i.cat||'').toLowerCase().includes(q)||
    (i.su||'').toLowerCase().includes(q)||
    (i.lo||'').toLowerCase().includes(q)
  );
  if(!matches.length){
    res.innerHTML=`<div style="padding:12px 16px;color:var(--tx3);font-size:12.5px;text-align:center">
      <div style="font-size:16px;margin-bottom:4px">💊</div>
      No medicines found matching "<strong>${q}</strong>"<br>
      <a href="#" onclick="closeOv('ov-dis');nav('inventory');return false" style="color:var(--t5);font-size:11.5px">Go to Inventory to add this item</a>
    </div>`;
    res.style.display='block';return;
  }
  res.innerHTML=matches.map((i,idx)=>{
    const out=i.qty===0,low=i.qty>0&&i.qty<=i.ro;
    const sc=out?'var(--er)':low?'var(--wn)':'var(--ok)';
    const hl=t=>t.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),m=>`<mark style="background:#fef9c3;border-radius:2px">${m}</mark>`);
    return`<div onclick="rowSelect('${rowId}','${i.id}')"
      onmouseenter="this.style.background='var(--t0)'" onmouseleave="this.style.background=''"
      style="padding:9px 14px;cursor:pointer;border-bottom:1px solid rgba(26,107,135,.07);display:flex;align-items:center;gap:11px;transition:background .1s">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px;color:var(--t8)">${hl(i.nm)}</div>
        <div style="font-size:11px;color:var(--tx3)">${i.cat} · ${i.un}${i.lo?' · '+i.lo:''}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:12.5px;font-weight:700;color:${sc}">${i.qty.toLocaleString()} ${i.un}</div>
        <div style="font-size:10px;color:${sc}">${out?'Out of Stock':low?'Low Stock':'In Stock'}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;min-width:65px">
        <div style="font-size:12px;color:var(--t7);font-weight:500">${i.sp>0?fm(i.sp):'—'}</div>
        <div style="font-size:10px;color:var(--tx3)">per ${i.un}</div>
      </div>
    </div>`;
  }).join('');
  res.style.display='block';
}

/* ── Browse all stock for a row ── */
function rowBrowseAll(rowId){
  _disSrchItems=DB.get('inventory');
  const sorted=[..._disSrchItems].sort((a,b)=>a.nm.localeCompare(b.nm));
  const res=document.getElementById(rowId+'_res');if(!res)return;
  if(!sorted.length){res.innerHTML=`<div style="padding:12px;color:var(--tx3);text-align:center;font-size:12.5px">No items in inventory. <a href="#" onclick="closeOv('ov-dis');nav('inventory');return false">Add items to inventory.</a></div>`;res.style.display='block';return;}
  res.innerHTML=sorted.map(i=>{
    const out=i.qty===0,low=i.qty>0&&i.qty<=i.ro;
    const sc=out?'var(--er)':low?'var(--wn)':'var(--ok)';
    return`<div onclick="rowSelect('${rowId}','${i.id}')"
      onmouseenter="this.style.background='var(--t0)'" onmouseleave="this.style.background=''"
      style="padding:8px 14px;cursor:pointer;border-bottom:1px solid rgba(26,107,135,.07);display:flex;align-items:center;gap:11px;transition:background .1s">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:12.5px;color:var(--t8)">${i.nm}</div>
        <div style="font-size:11px;color:var(--tx3)">${i.cat} · ${i.un}${i.lo?' · '+i.lo:''}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:12px;font-weight:700;color:${sc}">${i.qty.toLocaleString()} ${i.un}</div>
        <div style="font-size:10px;color:${sc}">${out?'Out of Stock':low?'Low Stock':'In Stock'}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;min-width:60px">
        <div style="font-size:11.5px;color:var(--t7);font-weight:500">${i.sp>0?fm(i.sp):'—'}</div>
      </div>
    </div>`;
  }).join('');
  res.style.display='block';
}

/* ── Select item for a row ── */
function rowSelect(rowId,iid){
  _disSrchItems=DB.get('inventory');
  const item=_disSrchItems.find(x=>x.id===iid);if(!item)return;
  const el=document.getElementById(rowId);if(!el)return;
  el.dataset.iid=iid;
  const srch=document.getElementById(rowId+'_srch');
  if(srch)srch.value=item.nm;
  const res=document.getElementById(rowId+'_res');
  if(res)res.style.display='none';
  populateDrugCard(rowId,item);
  // Focus qty
  setTimeout(()=>document.getElementById(rowId+'_qty')?.focus(),80);
}

/* ── Keyboard navigation for a row search ── */
function rowSrchKey(e,rowId){
  const res=document.getElementById(rowId+'_res');if(!res)return;
  const items=[...res.querySelectorAll('div[onclick]')];
  if(!items.length)return;
  if(e.key==='Escape'){res.style.display='none';}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    let idx=items.findIndex(el=>el.style.background.includes('var(--t0)'));
    items.forEach(el=>el.style.background='');
    if(e.key==='ArrowDown')idx=Math.min(idx+1,items.length-1);
    else idx=Math.max(idx,0)-1<0?0:idx-1;
    if(idx>=0){items[idx].style.background='var(--t0)';items[idx].scrollIntoView({block:'nearest'});}
  }
  else if(e.key==='Enter'){
    e.preventDefault();
    const focused=items.find(el=>el.style.background.includes('var(--t0)'));
    if(focused)focused.click();
    else if(items.length===1)items[0].click();
  }
}

/* ── Per-row total calculation ── */
function calcDisRow(rowId){
  const q=parseFloat(document.getElementById(rowId+'_qty')?.value)||0;
  const p=parseFloat(document.getElementById(rowId+'_pr')?.value)||0;
  const tot=q*p;
  const totEl=document.getElementById(rowId+'_tot');
  if(totEl)totEl.value=tot>0?'UGX '+tot.toLocaleString():'';
  calcDisGrand();
}

/* ── Grand total across all rows ── */
function calcDisGrand(){
  let grand=0;
  const parts=[];
  disRows.forEach(rowId=>{
    const el=document.getElementById(rowId);if(!el)return;
    const q=parseFloat(document.getElementById(rowId+'_qty')?.value)||0;
    const p=parseFloat(document.getElementById(rowId+'_pr')?.value)||0;
    const iid=el.dataset.iid;
    if(iid&&q&&p){
      const item=_disSrchItems.find(x=>x.id===iid);
      if(item)parts.push(`${q}×${item.nm.split(' ')[0]}`);
    }
    grand+=q*p;
  });
  document.getElementById('dis-grand-total').textContent='UGX '+grand.toLocaleString();
  document.getElementById('dis-grand-breakdown').textContent=parts.length>0?parts.join(' + '):'';
}

/* Close dropdowns when clicking outside */
document.addEventListener('click',function(e){
  if(!document.getElementById('ov-dis')?.classList.contains('open'))return;
  document.querySelectorAll('[id$="_res"]').forEach(res=>{
    if(!res.contains(e.target)&&!e.target.classList.contains('dis-row-srch')&&
       !e.target.closest('[id$="_srch"]')&&!e.target.closest('.btn'))
      res.style.display='none';
  });
});

/* ── SAVE ALL — dispatches one log entry per drug ── */
function saveDis(){
  const pid=V('dis-p');
  if(!pid){toast('Select a patient first','error');return;}
  const dateVal=V('dis-d');
  const byVal=V('dis-by');

  // Validate all rows
  const inv=DB.get('inventory');
  const toDispense=[];
  let hasError=false;

  disRows.forEach((rowId,idx)=>{
    const el=document.getElementById(rowId);if(!el)return;
    const iid=el.dataset.iid;
    const qty=parseInt(document.getElementById(rowId+'_qty')?.value)||0;
    const pr=parseFloat(document.getElementById(rowId+'_pr')?.value)||0;
    const inst=document.getElementById(rowId+'_inst')?.value||'';

    if(!iid||!qty){
      // Skip entirely empty rows (no drug selected, no qty)
      if(iid||qty){
        toast(`Drug ${idx+1}: Please select a medicine and enter quantity`,'error');
        hasError=true;
      }
      return;
    }
    const item=inv.find(x=>x.id===iid);
    if(!item){toast(`Drug ${idx+1}: Item not found in inventory`,'error');hasError=true;return;}
    if(item.qty<qty){toast(`Drug ${idx+1} — ${item.nm}: Only ${item.qty} ${item.un} in stock`,'error');hasError=true;return;}
    toDispense.push({iid,item,qty,pr,tot:qty*pr,inst});
  });

  if(hasError)return;
  if(!toDispense.length){toast('Add at least one drug to dispense','error');return;}

  // Confirm if multiple drugs
  if(toDispense.length>1){
    const summary=toDispense.map(d=>`${d.qty}× ${d.item.nm}`).join(', ');
    if(!confirm(`Dispense ${toDispense.length} drugs for this patient?\n\n${summary}\n\nTotal: UGX ${toDispense.reduce((s,d)=>s+d.tot,0).toLocaleString()}`))return;
  }

  // Save and deduct stock
  loadPats();const p=pats.find(x=>x.id===pid);if(!p)return;
  const di=DB.get('dis');
  toDispense.forEach(d=>{
    di.unshift({
      id:DB.id(),pid,
      pn:`${p.fn} ${p.ln}`,
      date:dateVal,
      item:d.item.nm,
      unit:d.item.un,
      qty:d.qty,pr:d.pr,
      tot:d.tot,
      by:byVal,
      inst:d.inst
    });
    d.item.qty-=d.qty;
  });
  DB.set('dis',di);DB.set('inventory',inv);

  closeOv('ov-dis');
  renderRx();renderInv();

  const grandTot=toDispense.reduce((s,d)=>s+d.tot,0);
  toast(`✓ Dispensed ${toDispense.length} drug${toDispense.length>1?'s':''} — Total: ${fm(grandTot)}`,'success');
}

/* Legacy single-drug helpers (kept for any existing calls) */
function cDis(){calcDisGrand();}
function disSrch(){}
function disSrchKey(){}
function disSelect(){}
function disSrchClear(){}
function disBrowseAll(){}

/* ── INVENTORY ── */
let _eivid=null;
function renderInv(){
  const invtb=document.getElementById('invtb');
  if(!invtb)return;
  const q=V('invsrch').toLowerCase();
  const all=DB.get('inventory');
  const l=q?all.filter(i=>(i.nm+' '+(i.cat||'')).toLowerCase().includes(q)):all;
  const countEl=document.getElementById('inv-count');
  if(countEl)countEl.textContent=l.length+' item'+(l.length!==1?'s':'')+(q?' matching':'');
  const out=all.filter(i=>i.qty===0).length;
  const low=all.filter(i=>i.qty>0&&i.qty<=i.ro).length;
  const ok=all.filter(i=>i.qty>i.ro).length;
  const statsEl=document.getElementById('inv-stats');
  if(statsEl)statsEl.innerHTML=[
    {n:all.length,l:'Total Items',bg:'#eaf6fb',ic:'#1a6b87'},
    {n:ok,l:'In Stock',bg:'#e6f5ef',ic:'#1d8a5e'},
    {n:low,l:'Low Stock',bg:'#fdf3e6',ic:'#c97c2e'},
    {n:out,l:'Out of Stock',bg:'#fceeed',ic:'#b5322a'},
  ].map(s=>`<div style="background:${s.bg};border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center"><div style="font-size:11px;color:${s.ic};text-transform:uppercase;letter-spacing:.06em;font-weight:600">${s.l}</div><div style="font-family:var(--fs);font-size:24px;font-weight:700;color:${s.ic}">${s.n}</div></div>`).join('');
  invtb.innerHTML=l.length?l.map((i,idx)=>{
    const lw=i.qty>0&&i.qty<=i.ro,out=i.qty===0;
    const expSoon=i.ex&&(new Date(i.ex)-new Date())<90*86400000&&new Date(i.ex)>new Date();
    const expired=i.ex&&new Date(i.ex)<new Date();
    // Stock level bar: pct relative to reorder×3 as "full"
    const maxVis=Math.max((i.ro||10)*3,i.qty,1);
    const pct=Math.min(100,Math.round((i.qty/maxVis)*100));
    const barColor=out?'var(--er)':lw?'var(--wn)':'var(--ok)';
    const stockBar=`<div style="display:flex;align-items:center;gap:6px">
      <span class="b ${out?'br':lw?'bo':'bg'}" style="font-size:12px;min-width:32px;text-align:center">${i.qty.toLocaleString()}</span>
      <div style="flex:1;min-width:50px;background:var(--iv2);border-radius:99px;height:6px;overflow:hidden" title="${i.qty} / reorder at ${i.ro}">
        <div style="background:${barColor};height:100%;width:${pct}%;border-radius:99px;transition:width .3s"></div>
      </div>
    </div>`;
    return`<tr class="${out?'rout':lw?'rlow':''}">
      <td style="color:var(--tx3);font-size:12px">${idx+1}</td>
      <td><strong>${i.nm}</strong></td>
      <td><span class="b bt">${i.cat}</span></td>
      <td style="font-size:12px;color:var(--tx3)">${i.un}</td>
      <td style="min-width:110px">${stockBar}</td>
      <td style="font-size:12px">${i.ro}</td>
      <td style="font-size:12px">${fm(i.cp)}</td>
      <td style="font-size:12px">${i.sp>0?fm(i.sp):'—'}</td>
      <td style="font-size:12px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.su||'—'}</td>
      <td style="font-size:12px;color:var(--tx3)">${i.lo||'—'}</td>
      <td style="font-size:11.5px;color:${expired?'var(--er)':expSoon?'var(--wn)':'inherit'}" title="${expired?'EXPIRED':expSoon?'Expiring soon':''}">${fd(i.ex)}${expired?' ⚠':expSoon?' ⚡':''}</td>
      <td><span class="b ${out?'br':lw?'bo':'bg'}">${out?'Out of Stock':lw?'Low Stock':'In Stock'}</span></td>
      <td style="white-space:nowrap">
        <button class="btn btnp xs" onclick="editInv('${i.id}')">✏️ Edit</button>
        <button class="btn btnd xs" onclick="delRec('inventory','${i.id}',renderInv)" title="Delete" style="margin-left:3px">🗑</button>
      </td>
    </tr>`;}).join(''):`<tr><td colspan="13" class="nd">${q?'No items match your search — <a href="#" onclick="clearInvSearch();return false">show all</a>':'No inventory items yet'}</td></tr>`;
}
function clearInvSearch(){S('invsrch','');renderInv();}
function openInvAdd(){_eivid=null;['iv-n','iv-q','iv-ro','iv-cp','iv-sp','iv-su','iv-lo'].forEach(id=>S(id,''));S('iv-ex','');document.getElementById('invmtit').textContent='Add Inventory Item';openOv('ov-inv');}
function editInv(id){const inv=DB.get('inventory'),it=inv.find(x=>x.id===id);if(!it)return;_eivid=id;S('iv-n',it.nm);S('iv-q',it.qty);S('iv-ro',it.ro);S('iv-cp',it.cp);S('iv-sp',it.sp);S('iv-su',it.su);S('iv-ex',it.ex);S('iv-lo',it.lo);document.getElementById('iv-c').value=it.cat;document.getElementById('iv-u').value=it.un;document.getElementById('invmtit').textContent='Edit Item';openOv('ov-inv');}
function saveInv(){
  const nm=V('iv-n').trim();if(!nm){toast('Item name required','error');return;}
  const inv=DB.get('inventory');
  const it={id:_eivid||DB.id(),nm,cat:V('iv-c'),un:V('iv-u'),qty:parseInt(V('iv-q'))||0,ro:parseInt(V('iv-ro'))||10,cp:parseFloat(V('iv-cp'))||0,sp:parseFloat(V('iv-sp'))||0,su:V('iv-su'),ex:V('iv-ex'),lo:V('iv-lo')};
  if(_eivid){const i=inv.findIndex(x=>x.id===_eivid);if(i>-1)inv[i]=it;}else inv.push(it);
  DB.set('inventory',inv);closeOv('ov-inv');renderInv();
  // Refresh dispense search cache so new items appear immediately
  _disSrchItems=DB.get('inventory');
  toast((_eivid?'Updated':'Added')+' — '+nm,'success');
}

/* ── BILLING STATS ── */
function renderBillStats(){
  const all=DB.get('billing');
  const totBilled=all.reduce((s,b)=>s+Number(b.tot||0),0);
  const totPaid=all.reduce((s,b)=>s+Number(b.paid||0),0);
  const totBal=all.reduce((s,b)=>s+Number(b.bal||0),0);
  const unpaid=all.filter(b=>b.st==='Unpaid').length;
  const partial=all.filter(b=>b.st==='Partial').length;
  const el=document.getElementById('bill-stats');
  if(el)el.innerHTML=[
    {n:all.length,l:'Total Invoices',bg:'#eaf6fb',ic:'#1a6b87',sub:'All time'},
    {n:'UGX '+totBilled.toLocaleString(),l:'Total Billed',bg:'var(--t1)',ic:'#0f3d4f',sub:'',big:true},
    {n:'UGX '+totPaid.toLocaleString(),l:'Total Collected',bg:'#e6f5ef',ic:'#1d8a5e',sub:'',big:true},
    {n:'UGX '+totBal.toLocaleString(),l:'Outstanding Balance',bg:'#fceeed',ic:'#b5322a',sub:unpaid+' unpaid, '+partial+' partial',big:true},
  ].map(s=>`<div style="background:${s.bg};border-radius:12px;padding:14px 16px"><div style="font-size:10px;color:${s.ic};text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">${s.l}</div><div style="font-family:var(--fs);font-size:${s.big?'17px':'24px'};font-weight:700;color:${s.ic}">${s.n}</div>${s.sub?`<div style="font-size:11px;color:var(--tx3);margin-top:2px">${s.sub}</div>`:''}</div>`).join('');
  // Show/hide pending appointment alert for reception
  const pendingCount = DB.get('appointments').filter(a=>a.st==='Pending').length;
  const alertEl = document.getElementById('pending-appt-alert');
  if(alertEl && (CU.role==='reception' || CU.role==='admin')){
    if(pendingCount>0){
      alertEl.style.display='flex';
      const cntEl=document.getElementById('pending-alert-count');
      if(cntEl)cntEl.textContent=pendingCount+' appointment'+(pendingCount!==1?'s':'')+' awaiting approval';
    }else{
      alertEl.style.display='none';
    }
  }
}

function printBillReport(){
  const all=DB.get('billing');
  const tot=all.reduce((s,b)=>s+Number(b.tot||0),0);
  const paid=all.reduce((s,b)=>s+Number(b.paid||0),0);
  const bal=all.reduce((s,b)=>s+Number(b.bal||0),0);
  const paidCount=all.filter(b=>b.st==='Paid').length;
  const unpaidCount=all.filter(b=>b.st==='Unpaid').length;
  const partialCount=all.filter(b=>b.st==='Partial').length;
  // Group by payment method
  const byMethod={};
  all.forEach(b=>{(b.payments||[]).forEach(p=>{if(!byMethod[p.m])byMethod[p.m]=0;byMethod[p.m]+=Number(p.a||0);});if(!(b.payments&&b.payments.length)&&Number(b.paid||0)>0){if(!byMethod[b.mt||'Cash'])byMethod[b.mt||'Cash']=0;byMethod[b.mt||'Cash']+=Number(b.paid||0);}});
  doPrint(`<div style="max-width:720px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">
    ${hakHdr('BILLING REPORT','',td())}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">
      <div style="background:#eaf6fb;border-radius:9px;padding:12px;text-align:center"><div style="font-size:9.5px;color:#1a6b87;text-transform:uppercase;margin-bottom:3px">Total Invoices</div><div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#1a6b87">${all.length}</div></div>
      <div style="background:var(--t1);border-radius:9px;padding:12px;text-align:center"><div style="font-size:9.5px;color:#0f3d4f;text-transform:uppercase;margin-bottom:3px">Total Billed</div><div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#0f3d4f">${fm(tot)}</div></div>
      <div style="background:#e6f5ef;border-radius:9px;padding:12px;text-align:center"><div style="font-size:9.5px;color:#1d8a5e;text-transform:uppercase;margin-bottom:3px">Collected</div><div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#1d8a5e">${fm(paid)}</div></div>
      <div style="background:#fceeed;border-radius:9px;padding:12px;text-align:center"><div style="font-size:9.5px;color:#b5322a;text-transform:uppercase;margin-bottom:3px">Outstanding</div><div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#b5322a">${fm(bal)}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
      <div><div style="font-size:10px;font-weight:700;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;border-bottom:1px solid #d4eff8;padding-bottom:4px">Invoice Status</div>
        ${[['Paid',paidCount,'#1d8a5e'],['Partial',partialCount,'#c97c2e'],['Unpaid',unpaidCount,'#b5322a']].map(([lbl,cnt,c])=>`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f8fc"><span>${lbl}</span><span style="font-weight:700;color:${c}">${cnt}</span></div>`).join('')}
      </div>
      ${Object.keys(byMethod).length?`<div><div style="font-size:10px;font-weight:700;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;border-bottom:1px solid #d4eff8;padding-bottom:4px">Collections by Method</div>
        ${Object.entries(byMethod).sort((a,b)=>b[1]-a[1]).map(([m,a])=>`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f8fc"><span>${m}</span><span style="font-weight:700;color:#1d8a5e">${fm(a)}</span></div>`).join('')}
      </div>`:''}
    </div>
    <div style="font-size:10px;font-weight:700;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;border-bottom:1px solid #d4eff8;padding-bottom:4px">Invoice Details</div>
    <table style="width:100%;border-collapse:collapse;font-size:11.5px">
      <thead><tr style="background:#145369;color:white"><th style="padding:7px 9px;text-align:left">Ref</th><th style="padding:7px 9px;text-align:left">Date</th><th style="padding:7px 9px;text-align:left">Patient</th><th style="padding:7px 9px;text-align:right">Total</th><th style="padding:7px 9px;text-align:right">Paid</th><th style="padding:7px 9px;text-align:right">Balance</th><th style="padding:7px 9px;text-align:left">Status</th></tr></thead>
      <tbody>${all.map((b,i)=>`<tr style="${i%2===0?'':'background:#f8fbfd'}"><td style="padding:6px 9px;font-weight:600;color:#1a6b87">${b.ref}</td><td style="padding:6px 9px">${fd(b.date)}</td><td style="padding:6px 9px">${b.pn}</td><td style="padding:6px 9px;text-align:right">${fm(b.tot)}</td><td style="padding:6px 9px;text-align:right;color:#1d8a5e">${fm(b.paid)}</td><td style="padding:6px 9px;text-align:right;color:${b.bal>0?'#b5322a':'#1d8a5e'}">${fm(b.bal)}</td><td style="padding:6px 9px"><span style="background:${b.st==='Paid'?'#e6f5ef':b.st==='Partial'?'#fdf3e6':'#fceeed'};color:${b.st==='Paid'?'#1d8a5e':b.st==='Partial'?'#c97c2e':'#b5322a'};border-radius:99px;padding:2px 8px;font-size:10px;font-weight:600">${b.st}</span></td></tr>`).join('')}
      <tr style="border-top:2.5px solid #2089ab;background:#eaf6fb;font-weight:700"><td colspan="3" style="padding:8px 9px;text-align:right;font-size:12px">TOTALS</td><td style="padding:8px 9px;text-align:right;color:#145369">${fm(tot)}</td><td style="padding:8px 9px;text-align:right;color:#1d8a5e">${fm(paid)}</td><td style="padding:8px 9px;text-align:right;color:${bal>0?'#b5322a':'#1d8a5e'}">${fm(bal)}</td><td></td></tr>
      </tbody>
    </table>
    ${hakFtr()}
  </div>`);
}

/* ── QUICK INVOICE (inline on billing page) ── */
let qiRids=[],qiPayRids=[];
function toggleQuickInvoice(){
  const body=document.getElementById('qi-body');
  const btn=document.getElementById('qi-toggle-btn');
  if(!body||!btn)return;
  const open=body.style.display==='none';
  body.style.display=open?'block':'none';
  btn.textContent=open?'▲ Collapse':'▼ Expand';
  if(open){
    loadPats();
    S('qi-date',td());S('qi-n','');
    document.getElementById('qi-p').innerHTML=patOpts();
    document.getElementById('qi-tot').textContent='UGX 0';
    document.getElementById('qi-rows').innerHTML='';qiRids=[];
    document.getElementById('qi-pay-rows').innerHTML='';qiPayRids=[];
    addQIRow('Consultation',1,30000);
    addQIPayRow('','Cash');
  }
}
function qiPatChange(){/* slot for future logic */}
function addQIRow(d='',q=1,p=0){
  const id='qi_'+Date.now()+'_'+Math.random().toString(36).slice(2,4);qiRids.push(id);
  const el=document.createElement('div');el.id=id;el.style.cssText='display:grid;grid-template-columns:3fr 1fr 1.5fr 1.5fr auto;gap:7px;margin-bottom:7px;align-items:end';
  el.innerHTML=`<div><label class="fl">Description</label><input class="fi" placeholder="Service or item" value="${d}" data-f="d" oninput="calcQI()"></div><div><label class="fl">Qty</label><input class="fi" type="number" value="${q}" min="1" data-f="q" oninput="calcQI()"></div><div><label class="fl">Unit Price (UGX)</label><input class="fi" type="number" value="${p}" data-f="p" oninput="calcQI()"></div><div><label class="fl">Total</label><input class="fi" id="${id}_t" readonly></div><div style="padding-bottom:1px"><button class="btn btnd xs" onclick="document.getElementById('${id}').remove();qiRids=qiRids.filter(r=>r!=='${id}');calcQI()">✕</button></div>`;
  document.getElementById('qi-rows').appendChild(el);calcQI();
}
function addQIPayRow(amt='',method='Cash',date_='',note_=''){
  const id='qpr_'+Date.now()+'_'+Math.random().toString(36).slice(2,4);qiPayRids.push(id);
  const el=document.createElement('div');el.id=id;
  el.style.cssText='display:grid;grid-template-columns:1.8fr 1.5fr 1.2fr 2fr auto;gap:7px;margin-bottom:7px;align-items:end;background:var(--okb);border-radius:8px;padding:9px';
  el.innerHTML=`<div><label class="fl">Amount (UGX) *</label><input class="fi" type="number" placeholder="0" value="${amt}" data-f="a" oninput="calcQI()" style="background:white"></div><div><label class="fl">Method</label><select class="fs" data-f="m" style="background:white"><option ${method==='Cash'?'selected':''}>Cash</option><option ${method==='Mobile Money'?'selected':''}>Mobile Money</option><option ${method==='NHIF'?'selected':''}>NHIF</option><option ${method==='Insurance'?'selected':''}>Insurance</option><option ${method==='Bank Transfer'?'selected':''}>Bank Transfer</option><option ${method==='Credit'?'selected':''}>Credit</option></select></div><div><label class="fl">Date Paid</label><input class="fi" type="date" value="${date_||td()}" data-f="d" style="background:white"></div><div><label class="fl">Ref / Note</label><input class="fi" placeholder="Receipt no., transaction ID…" value="${note_}" data-f="n" style="background:white"></div><div style="padding-bottom:1px"><button class="btn btnd xs" onclick="document.getElementById('${id}').remove();qiPayRids=qiPayRids.filter(r=>r!=='${id}');calcQI()" title="Remove">✕</button></div>`;
  document.getElementById('qi-pay-rows').appendChild(el);calcQI();
}
function calcQI(){
  // Items total
  let tot=0;
  qiRids.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const q=parseFloat(el.querySelector('[data-f="q"]').value)||0;
    const p=parseFloat(el.querySelector('[data-f="p"]').value)||0;
    const t=q*p;tot+=t;
    const ti=document.getElementById(id+'_t');if(ti)ti.value=t?t.toLocaleString():'';
  });
  document.getElementById('qi-tot').textContent='UGX '+tot.toLocaleString();
  const t2=document.getElementById('qi-tot2');if(t2)t2.textContent='UGX '+tot.toLocaleString();
  // Payments total
  let paid=0;
  qiPayRids.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    paid+=parseFloat(el.querySelector('[data-f="a"]').value)||0;
  });
  const bal=tot-paid;
  const pdEl=document.getElementById('qi-pd-disp');if(pdEl)pdEl.textContent='UGX '+paid.toLocaleString();
  const baEl=document.getElementById('qi-ba');if(baEl)baEl.textContent='UGX '+Math.abs(bal).toLocaleString();
  const bc=document.getElementById('qi-bal-card');const bl=document.getElementById('qi-bal-lbl');
  if(bc&&bl&&baEl){
    if(bal>0){bc.style.background='var(--erb)';baEl.style.color='var(--er)';bl.style.color='var(--er)';bl.textContent='Balance Due';}
    else if(bal<0){bc.style.background='#e6f5ef';baEl.style.color='#1d8a5e';bl.style.color='#1d8a5e';bl.textContent='Overpaid';}
    else{bc.style.background='var(--okb)';baEl.style.color='var(--ok)';bl.style.color='var(--ok)';bl.textContent='Fully Paid ✓';}
  }
}
function qiUpdBal(){calcQI();}
function getQIRows(){
  return qiRids.map(id=>{
    const el=document.getElementById(id);if(!el)return null;
    const q=parseFloat(el.querySelector('[data-f="q"]').value)||0;
    const p=parseFloat(el.querySelector('[data-f="p"]').value)||0;
    return{d:el.querySelector('[data-f="d"]').value,q,p,tot:q*p};
  }).filter(Boolean).filter(r=>r.d);
}
function getQIPayRows(){
  return qiPayRids.map(id=>{
    const el=document.getElementById(id);if(!el)return null;
    return{a:parseFloat(el.querySelector('[data-f="a"]').value)||0,m:el.querySelector('[data-f="m"]').value,d:el.querySelector('[data-f="d"]').value,n:el.querySelector('[data-f="n"]').value};
  }).filter(Boolean).filter(r=>r.a>0);
}
function saveQI(pr){
  const pid=V('qi-p');if(!pid){toast('Select a patient','error');return;}
  const items=getQIRows();if(!items.length){toast('Add at least one item','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);if(!p)return;
  const payments=getQIPayRows();
  const tot=items.reduce((s,i)=>s+i.tot,0);
  const paid=payments.reduce((s,x)=>s+x.a,0);
  const bal=tot-paid;
  const st=paid<=0?'Unpaid':bal>0?'Partial':'Paid';
  const mt=payments.length>0?payments.map(x=>x.m).join(' + '):'Cash';
  const ar=DB.get('billing');
  const b={id:DB.id(),ref:nRef('INV',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('qi-date'),mt,items,payments,tot,paid,bal,st,n:V('qi-n')};
  ar.unshift(b);DB.set('billing',ar);
  renderBill();renderBillStats();
  // Reset form — keep patient and date for quick follow-up
  document.getElementById('qi-rows').innerHTML='';qiRids=[];addQIRow();
  document.getElementById('qi-pay-rows').innerHTML='';qiPayRids=[];addQIPayRow('','Cash');
  S('qi-n','');document.getElementById('qi-tot').textContent='UGX 0';
  if(pr)pInvoice(b.id);else toast('Invoice '+b.ref+' — '+fm(tot)+' | Paid: '+fm(paid),'success');
}

/* ── BILLING ── */
let bFil='all';
function setBF(f){bFil=f;document.querySelectorAll('[id^="bt-"]').forEach(b=>{b.className='tab'+(b.id==='bt-'+f?' on':'')});renderBill();}
function renderBill(){
  let l=DB.get('billing');if(bFil!=='all')l=l.filter(b=>b.st===bFil);
  document.getElementById('bltb').innerHTML=l.length?l.map(b=>`<tr>
    <td><strong style="color:var(--t7)">${b.ref}</strong></td><td>${fd(b.date)}</td><td>${b.pn}</td>
    <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.items?.map(i=>i.d).join(', ')}</td>
    <td><strong>${fm(b.tot)}</strong></td>
    <td>${fm(b.paid)}${b.payments&&b.payments.length>1?`<div style="font-size:10px;color:var(--tx3)">${b.payments.map(p=>p.m).join(' + ')}</div>`:''}</td>
    <td><span class="b ${b.bal>0?'br':'bg'}">${fm(b.bal)}</span></td>
    <td style="font-size:12px">${b.mt}</td>
    <td><span class="b ${b.st==='Paid'?'bg':b.st==='Partial'?'bo':'br'}">${b.st}</span></td>
    <td style="white-space:nowrap">
      <button class="btn btng xs" onclick="pInvoice('${b.id}')">🖨</button>
      <button class="btn btno xs" onclick="editBill&&editBill('${b.id}')" style="margin-left:3px">✏️</button>
      <button class="btn btnd xs" onclick="delRec('billing','${b.id}',renderBill)" title="Delete" style="margin-left:3px">🗑</button>
    </td>
  </tr>`).join(''):`<tr><td colspan="10" class="nd">No invoices yet</td></tr>`;
  renderBillStats();
}
let _editBillId=null; // declared here so openBill/saveBill can reference it
let bRids=[];
/* ── BILLING: multi-payment JS ── */
let payRids=[];

function addBillRow(d='',q=1,p=0){
  const id='br_'+Date.now()+'_'+Math.random().toString(36).slice(2,4);
  bRids.push(id);
  const el=document.createElement('div');el.id=id;
  el.style.cssText='display:grid;grid-template-columns:3fr 1fr 1.5fr 1.5fr auto;gap:7px;margin-bottom:7px;align-items:end';
  el.innerHTML=`<div><label class="fl">Description</label><input class="fi" placeholder="Service or item" value="${d}" data-f="d" oninput="calcBT()"></div><div><label class="fl">Qty</label><input class="fi" type="number" value="${q}" min="1" data-f="q" oninput="calcBT()"></div><div><label class="fl">Unit Price (UGX)</label><input class="fi" type="number" value="${p}" data-f="p" oninput="calcBT()"></div><div><label class="fl">Total</label><input class="fi" id="${id}_t" readonly></div><div style="padding-bottom:1px"><button class="btn btnd xs" onclick="document.getElementById('${id}').remove();bRids=bRids.filter(r=>r!=='${id}');calcBT()" title="Remove">✕</button></div>`;
  document.getElementById('bl-rows').appendChild(el);calcBT();
}

function addPayRow(amt='',method='Cash',date_='',note_=''){
  const id='pr_'+Date.now()+'_'+Math.random().toString(36).slice(2,4);
  payRids.push(id);
  const rowNum=payRids.length;
  const el=document.createElement('div');el.id=id;
  el.style.cssText='border:1.5px solid var(--t1);border-radius:10px;padding:11px 13px;margin-bottom:9px;background:var(--okb);position:relative';
  el.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
      <div style="font-size:11px;font-weight:700;color:var(--ok);text-transform:uppercase;letter-spacing:.07em">
        💳 Payment #<span class="pay-num">${rowNum}</span>
      </div>
      <button class="btn btnd xs" onclick="removePayRow('${id}')" title="Delete this payment entry"
        style="font-size:11px;padding:4px 10px">
        🗑 Delete
      </button>
    </div>
    <div style="display:grid;grid-template-columns:1.8fr 1.5fr 1.2fr 2fr;gap:9px">
      <div>
        <label class="fl">Amount (UGX) *</label>
        <input class="fi" type="number" placeholder="0" value="${amt}" data-f="a"
          oninput="calcBT()" style="background:white;font-weight:600;font-size:14px;color:var(--ok)">
      </div>
      <div>
        <label class="fl">Payment Method</label>
        <select class="fs" data-f="m" onchange="calcBT()" style="background:white">
          <option ${method==='Cash'?'selected':''}>Cash</option>
          <option ${method==='Mobile Money'?'selected':''}>Mobile Money</option>
          <option ${method==='NHIF'?'selected':''}>NHIF</option>
          <option ${method==='Insurance'?'selected':''}>Insurance</option>
          <option ${method==='Bank Transfer'?'selected':''}>Bank Transfer</option>
          <option ${method==='Credit'?'selected':''}>Credit</option>
        </select>
      </div>
      <div>
        <label class="fl">Date Paid</label>
        <input class="fi" type="date" value="${date_||td()}" data-f="d" onchange="calcBT()" style="background:white">
      </div>
      <div>
        <label class="fl">Reference / Note</label>
        <input class="fi" placeholder="Receipt no., transaction ID…" value="${note_}" data-f="n" style="background:white">
      </div>
    </div>`;
  document.getElementById('bl-pay-rows').appendChild(el);
  renumberPayRows();
  calcBT();
}

function removePayRow(id){
  const el=document.getElementById(id);
  if(el)el.remove();
  payRids=payRids.filter(r=>r!==id);
  renumberPayRows();
  calcBT();
}

function renumberPayRows(){
  // Renumber visible payment rows after adding/removing
  payRids.forEach((id,i)=>{
    const el=document.getElementById(id);
    if(!el)return;
    const numEl=el.querySelector('.pay-num');
    if(numEl)numEl.textContent=i+1;
  });
}

function calcBT(){
  // Tally invoice items
  let tot=0;
  bRids.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const q=parseFloat(el.querySelector('[data-f="q"]').value)||0;
    const p=parseFloat(el.querySelector('[data-f="p"]').value)||0;
    const t=q*p;tot+=t;
    const ti=document.getElementById(id+'_t');if(ti)ti.value=t?t.toLocaleString():'';
  });
  document.getElementById('bltot').textContent='UGX '+tot.toLocaleString();
  const td2=document.getElementById('bl-tot-disp');if(td2)td2.textContent='UGX '+tot.toLocaleString();

  // Tally payments
  let paid=0;
  payRids.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    paid+=parseFloat(el.querySelector('[data-f="a"]').value)||0;
  });
  const bal=tot-paid;

  // Update display
  const pdEl=document.getElementById('bl-pd-disp');if(pdEl)pdEl.textContent='UGX '+paid.toLocaleString();
  const baEl=document.getElementById('bl-ba-disp');if(baEl)baEl.textContent='UGX '+Math.abs(bal).toLocaleString();
  const balCard=document.getElementById('bl-bal-card');
  const balLbl=document.getElementById('bl-bal-lbl');
  if(balCard&&balLbl){
    if(bal>0){balCard.style.background='var(--erb)';baEl.style.color='var(--er)';balLbl.style.color='var(--er)';balLbl.textContent='Balance Due';}
    else if(bal<0){balCard.style.background='#e6f5ef';baEl.style.color='#1d8a5e';balLbl.style.color='#1d8a5e';balLbl.textContent='Overpaid';}
    else{balCard.style.background='var(--okb)';baEl.style.color='var(--ok)';balLbl.style.color='var(--ok)';balLbl.textContent='Fully Paid ✓';}
  }
  // Auto-update status
  const stEl=document.getElementById('bl-s');
  const stTxt=document.getElementById('bl-s-text');
  const stDot=document.getElementById('bl-s-dot');
  let newStatus='Unpaid';
  if(paid<=0)newStatus='Unpaid';
  else if(bal>0)newStatus='Partial';
  else newStatus='Paid';
  if(stEl)stEl.value=newStatus;
  if(stTxt){
    stTxt.textContent=newStatus;
    if(newStatus==='Paid'){stTxt.style.color='var(--ok)';}
    else if(newStatus==='Partial'){stTxt.style.color='var(--wn)';}
    else{stTxt.style.color='var(--er)';}
  }
  if(stDot){
    if(newStatus==='Paid')stDot.style.background='var(--ok)';
    else if(newStatus==='Partial')stDot.style.background='var(--wn)';
    else stDot.style.background='var(--er)';
  }
  // Also update the balance display with colour
  if(baEl){
    if(bal>0)baEl.style.color='var(--er)';
    else if(bal<0)baEl.style.color='var(--wn)';
    else baEl.style.color='var(--ok)';
  }
}

function getBillRows(){
  return bRids.map(id=>{
    const el=document.getElementById(id);if(!el)return null;
    const q=parseFloat(el.querySelector('[data-f="q"]').value)||0;
    const p=parseFloat(el.querySelector('[data-f="p"]').value)||0;
    return{d:el.querySelector('[data-f="d"]').value,q,p,tot:q*p};
  }).filter(Boolean).filter(r=>r.d);
}

function getPayRows(){
  return payRids.map(id=>{
    const el=document.getElementById(id);if(!el)return null;
    return{a:parseFloat(el.querySelector('[data-f="a"]').value)||0,m:el.querySelector('[data-f="m"]').value,d:el.querySelector('[data-f="d"]').value,n:el.querySelector('[data-f="n"]').value};
  }).filter(Boolean).filter(r=>r.a>0);
}

function openBill(){
  _editBillId=null;
  document.getElementById('bill-mtit').textContent='Create Invoice / Receipt';
  document.getElementById('bill-editbadge').style.display='none';
  loadPats();S('bl-d',td());S('bl-n','');
  document.getElementById('bl-p').innerHTML=patOpts();
  document.getElementById('bltot').textContent='UGX 0';
  const td2=document.getElementById('bl-tot-disp');if(td2)td2.textContent='UGX 0';
  const pd=document.getElementById('bl-pd-disp');if(pd)pd.textContent='UGX 0';
  const ba=document.getElementById('bl-ba-disp');if(ba)ba.textContent='UGX 0';
  document.getElementById('bl-rows').innerHTML='';bRids=[];
  document.getElementById('bl-pay-rows').innerHTML='';payRids=[];
  addBillRow('Consultation',1,30000);
  addPayRow('','Cash');
  openOv('ov-bill');
}

function saveBill(pr){
  const pid=V('bl-p');if(!pid){toast('Select a patient','error');return;}
  const items=getBillRows();if(!items.length){toast('Add at least one invoice item','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);if(!p)return;
  const payments=getPayRows();
  const tot=items.reduce((s,i)=>s+i.tot,0);
  const paid=payments.reduce((s,x)=>s+x.a,0);
  const bal=tot-paid;
  const st=paid<=0?'Unpaid':bal>0?'Partial':'Paid';
  const ar=DB.get('billing');
  if(_editBillId){
    const idx=ar.findIndex(x=>x.id===_editBillId);
    if(idx>-1){ar[idx]={...ar[idx],pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('bl-d'),items,payments,tot,paid,bal,mt:payments.length>0?payments.map(x=>x.m).join(' + '):V('bl-s'),st,n:V('bl-n'),_edited:td()};}
    DB.set('billing',ar);_editBillId=null;
    document.getElementById('bill-mtit').textContent='Create Invoice / Receipt';
    document.getElementById('bill-editbadge').style.display='none';
    closeOv('ov-bill');renderBill();
    if(pr)pInvoice(ar[idx].id);else toast('Invoice updated','success');
  }else{
    const b={id:DB.id(),ref:nRef('INV',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('bl-d'),items,payments,tot,paid,bal,mt:payments.length>0?payments.map(x=>x.m).join(' + '):'Cash',st,n:V('bl-n')};
    ar.unshift(b);DB.set('billing',ar);
    closeOv('ov-bill');renderBill();
    if(pr)pInvoice(b.id);else toast('Invoice saved — '+b.ref,'success');
  }
}
function pInvoice(id){
  const b=DB.get('billing').find(x=>x.id===id);if(!b)return;
  doPrint(`<div style="max-width:700px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">
    ${hakHdr('RECEIPT / INVOICE',b.ref,b.date)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px">
      <tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${b.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD</td><td style="padding:7px 10px;font-weight:600">${b.opd}</td></tr>
      <tr><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Payment Method</td><td style="padding:7px 10px">${b.mt}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Status</td><td style="padding:7px 10px;font-weight:700">${b.st}</td></tr>
    </table>
    <table style="width:100%;border-collapse:collapse;border:1px solid #d4eff8;margin-bottom:14px;font-size:12.5px">
      <thead><tr style="background:#145369;color:white"><th style="padding:8px 11px;text-align:left">Description</th><th style="padding:8px 11px;text-align:right">Qty</th><th style="padding:8px 11px;text-align:right">Unit Price</th><th style="padding:8px 11px;text-align:right">Total</th></tr></thead>
      <tbody>${b.items.map((item,i)=>`<tr style="${i%2===0?'background:#f8fbfd':''}"><td style="padding:7px 11px">${item.d}</td><td style="padding:7px 11px;text-align:right">${item.q}</td><td style="padding:7px 11px;text-align:right">${fm(item.p)}</td><td style="padding:7px 11px;text-align:right;font-weight:600">${fm(item.tot)}</td></tr>`).join('')}
      <tr style="border-top:2px solid #2089ab;background:#eaf6fb"><td colspan="3" style="padding:9px 11px;font-weight:700;text-align:right;font-size:14px">TOTAL</td><td style="padding:9px 11px;font-weight:700;font-size:17px;text-align:right;color:#145369">${fm(b.tot)}</td></tr>
      ${(b.payments&&b.payments.length>0)?b.payments.map((pmt,pi)=>`<tr style="background:${pi%2===0?'#f0faf5':'#e6f5ef'}"><td colspan="2" style="padding:6px 11px;text-align:right;color:#5a7a8a;font-size:11.5px">Payment ${pi+1}: ${pmt.m}${pmt.d?' ('+fd(pmt.d)+')':''}${pmt.n?' — '+pmt.n:''}</td><td style="padding:6px 11px;text-align:right;color:#5a7a8a;font-size:11.5px">Amount Received</td><td style="padding:6px 11px;text-align:right;color:#1d8a5e;font-weight:600">${fm(pmt.a)}</td></tr>`).join(''):`<tr><td colspan="3" style="padding:6px 11px;text-align:right;color:#5a7a8a;font-size:12px">Amount Paid</td><td style="padding:6px 11px;text-align:right;color:#1d8a5e;font-weight:600">${fm(b.paid)}</td></tr>`}
      ${(b.payments&&b.payments.length>1)?`<tr style="border-top:1px solid #d4eff8"><td colspan="3" style="padding:6px 11px;text-align:right;color:#5a7a8a;font-size:12px;font-weight:600">Total Paid</td><td style="padding:6px 11px;text-align:right;color:#1d8a5e;font-weight:700">${fm(b.paid)}</td></tr>`:''}
      <tr style="border-top:2px solid ${b.bal>0?'#b5322a':'#1d8a5e'}"><td colspan="3" style="padding:7px 11px;text-align:right;color:#5a7a8a;font-size:12px;font-weight:600">${b.bal>0?'Balance Due':'Paid in Full ✓'}</td><td style="padding:7px 11px;text-align:right;font-weight:700;font-size:14px;color:${b.bal>0?'#b5322a':'#1d8a5e'}">${fm(Math.abs(b.bal))}</td></tr>
      </tbody>
    </table>
    ${b.n?`<div style="font-size:12px;color:#5a7a8a;border:1px solid #d4eff8;border-radius:7px;padding:9px;margin-bottom:10px">${b.n}</div>`:''}
    <div style="margin-top:18px;text-align:center;font-size:11px;color:#5a7a8a;border-top:1px dashed #d4eff8;padding-top:10px"><strong>Thank you for choosing HAK Medical &amp; Physiotherapy Center</strong><br>30m off Gayaza Road to Magere &nbsp;|&nbsp; 0705 062 567 / 0773 029 999 &nbsp;|&nbsp; hakmedicalcenter@gmail.com</div>
    ${hakFtr()}
  </div>`);
}

/* ── DISCHARGE ── */
function renderDC(){
  const dctb=document.getElementById('dctb');
  if(!dctb)return;
  const l=DB.get('discharge');
  dctb.innerHTML=l.length?l.map(d=>`<tr><td><strong style="color:var(--t7)">${d.ref}</strong></td><td>${fd(d.dd)}</td><td>${d.pn}</td><td>${fd(d.ad)}</td><td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.di}</td><td>${d.cl}</td><td><span class="b ${d.co==='Recovered'||d.co==='Improved'?'bg':d.co==='Referred'?'bo':'ba'}">${d.co}</span></td><td style="white-space:nowrap"><button class="btn btng xs" onclick="pDC('${d.id}')">🖨</button><button class="btn btno xs" onclick="editDC('${d.id}')" style="margin-left:3px">✏️</button><button class="btn btnd xs" onclick="delRec('discharge','${d.id}',renderDC)" title="Delete" style="margin-left:3px">🗑</button></td></tr>`).join(''):`<tr><td colspan="8" class="nd">No discharge summaries</td></tr>`;
}
function openDC(){loadPats();S('dc-ad',td());S('dc-dd',td());['dc-wd','dc-cc','dc-ai','dc-di','dc-iv','dc-tx','dc-mx','dc-fu'].forEach(id=>S(id,''));document.getElementById('dc-p').innerHTML=patOpts();openOv('ov-dc');}
function saveDC(pr){
  const pid=V('dc-p'),di=V('dc-di').trim();if(!pid||!di){toast('Patient and discharge diagnosis required','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const ar=DB.get('discharge');
  const d={id:DB.id(),ref:nRef('DC',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,ad:V('dc-ad'),dd:V('dc-dd'),wd:V('dc-wd'),cl:V('dc-cl'),co:V('dc-co'),cc:V('dc-cc'),ai:V('dc-ai'),di,iv:V('dc-iv'),tx:V('dc-tx'),mx:V('dc-mx'),fu:V('dc-fu')};
  ar.unshift(d);DB.set('discharge',ar);closeOv('ov-dc');renderDC();if(pr)pDC(d.id);else toast('Discharge saved — '+d.ref,'success');
}
function pDC(id){const d=DB.get('discharge').find(x=>x.id===id);if(!d)return;doPrint(`<div style="max-width:720px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">${hakHdr('DISCHARGE SUMMARY',d.ref,d.dd)}<table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px"><tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${d.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD</td><td style="padding:7px 10px;font-weight:600">${d.opd}</td></tr><tr><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Admitted</td><td style="padding:7px 10px">${fd(d.ad)}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Discharged</td><td style="padding:7px 10px">${fd(d.dd)}</td></tr><tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Ward</td><td style="padding:7px 10px">${d.wd||'—'}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Condition</td><td style="padding:7px 10px;font-weight:700">${d.co}</td></tr></table>${[['Presenting Complaint',d.cc],['Admission Diagnosis',d.ai],['Discharge Diagnosis',d.di],['Investigations & Results',d.iv],['Treatment Given',d.tx],['Discharge Medications',d.mx],['Follow-up Instructions',d.fu]].filter(([,v])=>v).map(([l,v])=>`<div style="margin-bottom:10px"><div style="font-size:9.5px;color:#5a7a8a;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px">${l}</div><div style="border:1px solid #d4eff8;border-radius:7px;padding:9px;line-height:1.7;font-size:12.5px">${v}</div></div>`).join('')}<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:26px"><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Clinician: <strong>${d.cl}</strong></div><div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Signature: ___________________</div></div>${hakFtr()}</div>`);}

/* ── MEDICAL FORMS ── */
function openMedForm(){loadPats();S('mf-d',td());document.getElementById('mf-p').innerHTML=patOpts();document.getElementById('mf-ty').value='';document.getElementById('mf-extra').innerHTML='';openOv('ov-mf');}
function updMF(){
  const ty=V('mf-ty');let h='';
  if(ty==='sick'||ty==='cert'){h=`<div class="g2"><div class="fg"><label class="fl">Diagnosis / Condition</label><input class="fi" id="mf-dx" placeholder="Diagnosis or reason"></div><div class="fg"><label class="fl">Days Off / Period</label><input class="fi" id="mf-dy" placeholder="e.g. 3 days, 10–12 May 2025"></div></div><div class="fg"><label class="fl">Remarks</label><textarea class="ft" id="mf-rm" style="min-height:50px" placeholder="Additional notes…"></textarea></div>`;}
  else if(ty==='ref'){h=`<div class="g2"><div class="fg"><label class="fl">Referred To</label><input class="fi" id="mf-to" placeholder="Hospital / Doctor"></div><div class="fg"><label class="fl">Reason</label><input class="fi" id="mf-rn" placeholder="Reason for referral"></div></div><div class="fg"><label class="fl">Clinical Summary</label><textarea class="ft" id="mf-sm" style="min-height:70px" placeholder="Brief clinical history, investigations, treatment given…"></textarea></div>`;}
  else if(ty==='fit'){h=`<div class="g2"><div class="fg"><label class="fl">Purpose</label><input class="fi" id="mf-pu" placeholder="Employment / Sports / School"></div><div class="fg"><label class="fl">Valid Until</label><input class="fi" type="date" id="mf-vl"></div></div><div class="fg"><label class="fl">Remarks</label><textarea class="ft" id="mf-rm" style="min-height:50px" placeholder="Any conditions…"></textarea></div>`;}
  document.getElementById('mf-extra').innerHTML=h;
}
function printMF(){
  const pid=V('mf-p'),ty=V('mf-ty');if(!pid||!ty){toast('Select patient and form type','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const dt=V('mf-d'),cl=V('mf-cl');
  let body='';
  if(ty==='sick'){const dx=V('mf-dx'),dy=V('mf-dy'),rm=V('mf-rm');body=`<p style="line-height:2;font-size:13.5px">This is to certify that <strong>${p.fn} ${p.ln}</strong>, age <strong>${agD(p.age)}</strong>, OPD No. <strong>${p.opd}</strong>, attended this facility on <strong>${fd(dt)}</strong> and was found to be suffering from <strong>${dx||'illness'}</strong>.</p><p style="margin-top:10px;line-height:2;font-size:13.5px">The patient is unfit for duty/school and requires <strong>${dy||'rest'}</strong>.</p>${rm?`<p style="margin-top:8px;font-size:12.5px;color:#5a7a8a">${rm}</p>`:''}`;}
  else if(ty==='cert'){const dx=V('mf-dx'),dy=V('mf-dy'),rm=V('mf-rm');body=`<p style="line-height:2;font-size:13.5px">This is to certify that <strong>${p.fn} ${p.ln}</strong>, age <strong>${agD(p.age)}</strong>, has been under our medical care.</p><p style="margin-top:10px;line-height:2;font-size:13.5px">Diagnosis: <strong>${dx||'As diagnosed'}</strong></p><p style="line-height:2;font-size:13.5px">The patient is advised to rest for <strong>${dy||'the recommended period'}</strong>.</p>${rm?`<p style="margin-top:8px;font-size:12.5px;color:#5a7a8a">${rm}</p>`:''}`;}
  else if(ty==='ref'){const to=V('mf-to'),rn=V('mf-rn'),sm=V('mf-sm');body=`<p style="line-height:1.8;font-size:13.5px">Dear Colleague,</p><p style="margin-top:8px;line-height:1.8;font-size:13.5px">We are referring <strong>${p.fn} ${p.ln}</strong> (${agD(p.age)}, OPD: ${p.opd}) to <strong>${to||'your facility'}</strong> for further evaluation and management of <strong>${rn||'the above condition'}</strong>.</p>${sm?`<div style="margin-top:12px"><div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:4px">Clinical Summary</div><div style="border:1px solid #d4eff8;border-radius:7px;padding:10px;line-height:1.7;font-size:13px">${sm}</div></div>`:''}<p style="margin-top:12px;line-height:1.8;font-size:13.5px">Your continued care is greatly appreciated.</p>`;}
  else if(ty==='fit'){const pu=V('mf-pu'),vl=V('mf-vl'),rm=V('mf-rm');body=`<p style="line-height:2;font-size:13.5px">This is to certify that <strong>${p.fn} ${p.ln}</strong>, age <strong>${agD(p.age)}</strong>, OPD No. <strong>${p.opd}</strong>, has been examined at this facility on <strong>${fd(dt)}</strong>.</p><p style="margin-top:10px;line-height:2;font-size:13.5px">The patient is found medically <strong>FIT</strong> for <strong>${pu||'the intended purpose'}</strong>.${vl?` This certificate is valid until <strong>${fd(vl)}</strong>.`:''}</p>${rm?`<p style="margin-top:8px;font-size:12.5px;color:#5a7a8a">${rm}</p>`:''}`;}
  const titles={sick:'SICK / ABSENTEE NOTE',cert:'MEDICAL CERTIFICATE',ref:'REFERRAL LETTER',fit:'FITNESS CERTIFICATE'};
  doPrint(`<div style="max-width:700px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">
    ${hakHdr(titles[ty]||'MEDICAL FORM','',dt)}
    <div style="background:#eaf6fb;border-radius:9px;padding:11px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:12.5px">
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Patient</span><strong>${p.fn} ${p.ln}</strong></div>
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Age</span><strong>${agD(p.age)}</strong></div>
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">OPD No.</span><strong>${p.opd}</strong></div>
    </div>
    <div style="line-height:1.7;margin-bottom:20px">${body}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:36px">
      <div><div style="border-top:1px solid #d4eff8;padding-top:8px"><div style="font-size:10.5px;color:#5a7a8a">Attending Clinician: <strong>${cl}</strong></div><div style="font-size:10.5px;color:#5a7a8a;margin-top:6px">Date: ${fd(dt)}</div></div></div>
      <div><div style="border-top:1px solid #d4eff8;padding-top:8px"><div style="font-size:10.5px;color:#5a7a8a">Signature &amp; Stamp:</div><div style="height:42px;border-bottom:1px solid #d4eff8;margin-top:8px"></div></div></div>
    </div>
    ${hakFtr()}
  </div>`);
}


/* ══════════════════════════════════════════
   EDIT EXISTING ENTRIES
══════════════════════════════════════════ */
let _editEncId=null,_editLabId=null,_editUSId=null,_editRxId=null,_editDCId=null;

function editEnc(id){
  const e=DB.get('encounters').find(x=>x.id===id);if(!e)return;
  loadPats();_editEncId=id;
  document.getElementById('enc-mtit').textContent='Edit Encounter';
  document.getElementById('enc-editbadge').style.display='block';
  document.getElementById('enc-p').innerHTML=patOpts();
  document.getElementById('enc-p').value=e.pid;
  S('enc-d',e.date);
  document.getElementById('enc-ty').value=e.ty;
  document.getElementById('enc-pr').value=e.pr;
  S('enc-c',e.c);S('enc-o',e.o||'');S('enc-dx',e.dx);S('enc-pl',e.pl||'');S('enc-fu',e.fu||'');
  const v=e.vt||{};
  S('v-t',v.t||'');S('v-b',v.b||'');S('v-p',v.p||'');S('v-s',v.s||'');
  S('v-w',v.w||'');S('v-h',v.h||'');S('v-r',v.r||'');S('v-rr',v.rr||'');
  openOv('ov-enc');
}

// Override saveEnc to handle edit mode
const _origSaveEnc=window.saveEnc;
window.saveEnc=function(pr){
  const pid=V('enc-p'),c=V('enc-c').trim(),dx=V('enc-dx').trim();
  if(!pid||!c||!dx){toast('Patient, complaint and diagnosis required','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);
  const vitals={t:V('v-t'),b:V('v-b'),p:V('v-p'),s:V('v-s'),w:V('v-w'),h:V('v-h'),r:V('v-r'),rr:V('v-rr')};
  if(_editEncId){
    const ar=DB.get('encounters');
    const idx=ar.findIndex(x=>x.id===_editEncId);if(idx<0)return;
    ar[idx]={...ar[idx],pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('enc-d'),ty:V('enc-ty'),pr:V('enc-pr'),c,o:V('enc-o'),dx,pl:V('enc-pl'),fu:V('enc-fu'),vt:vitals,_edited:td()};
    DB.set('encounters',ar);_editEncId=null;
    document.getElementById('enc-mtit').textContent='Clinical Encounter Note';
    document.getElementById('enc-editbadge').style.display='none';
    closeOv('ov-enc');renderEncs();toast('Encounter updated','success');
    if(pr)printEncById(ar.find(x=>x.date===V('enc-d')&&x.pid===pid)?.id||ar[idx].id);
  }else{
    const e={id:DB.id(),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('enc-d'),ty:V('enc-ty'),pr:V('enc-pr'),c,o:V('enc-o'),dx,pl:V('enc-pl'),fu:V('enc-fu'),vt:vitals,st:'Active'};
    const ar=DB.get('encounters');ar.unshift(e);DB.set('encounters',ar);
    closeOv('ov-enc');renderEncs();toast('Encounter saved','success');if(pr)printEncById(e.id);
  }
};

function editLabRep(id){
  const r=DB.get('lab_rep').find(x=>x.id===id);if(!r)return;
  loadPats();_editLabId=id;
  document.getElementById('lab-mtit').textContent='Edit Lab Result';
  document.getElementById('lab-editbadge').style.display='block';
  document.getElementById('lp-p').innerHTML=patOpts();
  document.getElementById('lp-p').value=r.pid;
  S('lp-d',r.date);S('lp-by',r.by||'');S('lp-int',r.int||'');S('lp-micro',r.micro||'');
  document.getElementById('lp-rv').value=r.rv||'Dr. Karim';
  const rqs=DB.get('lab_req').filter(x=>x.st==='Pending'||x.id===r.lk);
  document.getElementById('lp-lk').innerHTML='<option value="">— None —</option>'+rqs.map(x=>`<option value="${x.id}"${x.id===r.lk?' selected':''}>${x.ref} — ${x.pn}</option>`).join('');
  // Load existing rows
  labRids=[];document.getElementById('lp-rows').innerHTML='';
  (r.rows||[]).forEach(row=>addLabRow(row.t,row.r,row.u,row.rn||row.range||'',row.f||'Normal'));
  openOv('ov-labrep');
}

function editUSRep(id){
  const r=DB.get('us_rep').find(x=>x.id===id);if(!r)return;
  loadPats();_editUSId=id;
  document.getElementById('us-mtit').textContent='Edit Ultrasound Report';
  document.getElementById('us-editbadge').style.display='block';
  document.getElementById('usp-p').innerHTML=patOpts();
  document.getElementById('usp-p').value=r.pid;
  S('usp-d',r.date);S('usp-ty',r.ty||'');S('usp-by',r.by||'');S('usp-fi',r.fi||'');S('usp-im',r.imp||'');
  document.getElementById('usp-rv').value=r.rv||'Dr. Karim';
  const rqs=DB.get('us_req').filter(x=>x.st==='Pending'||x.id===r.lk);
  document.getElementById('usp-lk').innerHTML='<option value="">— None —</option>'+rqs.map(x=>`<option value="${x.id}"${x.id===r.lk?' selected':''}>${x.ref} — ${x.pn}</option>`).join('');
  openOv('ov-usrep');
}

function editRx(id){
  const r=DB.get('rx').find(x=>x.id===id);if(!r)return;
  loadPats();_editRxId=id;
  document.getElementById('rx-mtit').textContent='Edit Prescription';
  document.getElementById('rx-editbadge').style.display='block';
  document.getElementById('rx-p').innerHTML=patOpts();
  document.getElementById('rx-p').value=r.pid;
  S('rx-d',r.date);S('rx-dx',r.dx||'');S('rx-n',r.n||'');S('rx-al',r.al||'');
  document.getElementById('rx-cl').value=r.cl||'Dr. Karim';
  document.getElementById('rx-rows').innerHTML='';rxRids=0;
  (r.meds||[]).forEach(m=>addRxRow(m.dr,m.do,m.fr,m.du,m.rt,m.qt));
  openOv('ov-rx');
}

function editDC(id){
  const d=DB.get('discharge').find(x=>x.id===id);if(!d)return;
  loadPats();_editDCId=id;
  document.getElementById('dc-mtit').textContent='Edit Discharge Summary';
  document.getElementById('dc-editbadge').style.display='block';
  document.getElementById('dc-p').innerHTML=patOpts();
  document.getElementById('dc-p').value=d.pid;
  S('dc-ad',d.ad||'');S('dc-dd',d.dd||'');S('dc-wd',d.wd||'');
  document.getElementById('dc-cl').value=d.cl||'Dr. Karim';
  document.getElementById('dc-co').value=d.co||'Stable';
  S('dc-cc',d.cc||'');S('dc-ai',d.ai||'');S('dc-di',d.di||'');S('dc-iv',d.iv||'');S('dc-tx',d.tx||'');S('dc-mx',d.mx||'');S('dc-fu',d.fu||'');
  openOv('ov-dc');
}

/* ── OVERRIDDEN SAVE FUNCTIONS TO SUPPORT EDIT MODE ── */
const _origSaveUSRep=window.saveUSRep;
window.saveUSRep=function(pr){
  const pid=V('usp-p'),fi=V('usp-fi').trim(),im=V('usp-im').trim();
  if(!pid||!fi||!im){toast('Patient, findings and impression required','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const lk=V('usp-lk');
  if(_editUSId){
    const ar=DB.get('us_rep');const idx=ar.findIndex(x=>x.id===_editUSId);if(idx<0)return;
    ar[idx]={...ar[idx],pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('usp-d'),ty:V('usp-ty'),by:V('usp-by'),rv:V('usp-rv'),lk,fi,imp:im,_edited:td()};
    DB.set('us_rep',ar);_editUSId=null;
    document.getElementById('us-mtit').textContent='Ultrasound Report';
    document.getElementById('us-editbadge').style.display='none';
    closeOv('ov-usrep');renderUSReqs();if(pr)pUSRep(_editUSId||ar[idx].id);else toast('US report updated','success');
  }else{
    const ar=DB.get('us_rep');
    const r={id:DB.id(),ref:nRef('US-RPT',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('usp-d'),ty:V('usp-ty'),by:V('usp-by'),rv:V('usp-rv'),lk,fi,imp:im};
    ar.unshift(r);DB.set('us_rep',ar);if(lk){DB.set('us_req',DB.get('us_req').map(x=>x.id===lk?{...x,st:'Reported'}:x));}
    closeOv('ov-usrep');renderUSReqs();if(pr)pUSRep(r.id);else toast('US report saved — '+r.ref,'success');
  }
};

const _origSaveRx=window.saveRx;
window.saveRx=function(pr){
  const pid=V('rx-p');if(!pid){toast('Select a patient','error');return;}
  const meds=getRxRows();if(!meds.length){toast('Add at least one medication','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);
  if(_editRxId){
    const ar=DB.get('rx');const idx=ar.findIndex(x=>x.id===_editRxId);if(idx<0)return;
    ar[idx]={...ar[idx],pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('rx-d'),cl:V('rx-cl'),dx:V('rx-dx'),al:V('rx-al'),meds,n:V('rx-n'),_edited:td()};
    DB.set('rx',ar);_editRxId=null;
    document.getElementById('rx-mtit').textContent='Prescription';
    document.getElementById('rx-editbadge').style.display='none';
    closeOv('ov-rx');renderRx();if(pr)pRx(ar[idx].id);else toast('Prescription updated','success');
  }else{
    const ar=DB.get('rx');
    const r={id:DB.id(),ref:nRef('RX',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('rx-d'),cl:V('rx-cl'),dx:V('rx-dx'),al:V('rx-al'),meds,n:V('rx-n')};
    ar.unshift(r);DB.set('rx',ar);closeOv('ov-rx');renderRx();if(pr)pRx(r.id);else toast('Prescription saved — '+r.ref,'success');
  }
};

const _origSaveDC=window.saveDC;
window.saveDC=function(pr){
  const pid=V('dc-p'),di=V('dc-di').trim();if(!pid||!di){toast('Patient and discharge diagnosis required','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);
  if(_editDCId){
    const ar=DB.get('discharge');const idx=ar.findIndex(x=>x.id===_editDCId);if(idx<0)return;
    ar[idx]={...ar[idx],pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,ad:V('dc-ad'),dd:V('dc-dd'),wd:V('dc-wd'),cl:V('dc-cl'),co:V('dc-co'),cc:V('dc-cc'),ai:V('dc-ai'),di,iv:V('dc-iv'),tx:V('dc-tx'),mx:V('dc-mx'),fu:V('dc-fu'),_edited:td()};
    DB.set('discharge',ar);_editDCId=null;
    document.getElementById('dc-mtit').textContent='Discharge Summary';
    document.getElementById('dc-editbadge').style.display='none';
    closeOv('ov-dc');renderDC();if(pr)pDC(ar[idx].id);else toast('Discharge updated','success');
  }else{
    const ar=DB.get('discharge');
    const d={id:DB.id(),ref:nRef('DC',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,ad:V('dc-ad'),dd:V('dc-dd'),wd:V('dc-wd'),cl:V('dc-cl'),co:V('dc-co'),cc:V('dc-cc'),ai:V('dc-ai'),di,iv:V('dc-iv'),tx:V('dc-tx'),mx:V('dc-mx'),fu:V('dc-fu')};
    ar.unshift(d);DB.set('discharge',ar);closeOv('ov-dc');renderDC();if(pr)pDC(d.id);else toast('Discharge saved — '+d.ref,'success');
  }
};

/* ══════════════════════════════════════════
   LAB RESULTS: SAVE with microscopy field + EDIT
══════════════════════════════════════════ */
const _origSaveLabRep=window.saveLabRep;
window.saveLabRep=function(pr){
  const pid=V('lp-p'),int_=V('lp-int').trim();if(!pid){toast('Select a patient','error');return;}
  const rows=getLabRows();if(!rows.length){toast('Add at least one result row','error');return;}
  loadPats();const p=pats.find(x=>x.id===pid);const lk=V('lp-lk');
  const micro=V('lp-micro')||'';
  if(_editLabId){
    const ar=DB.get('lab_rep');const idx=ar.findIndex(x=>x.id===_editLabId);if(idx<0)return;
    ar[idx]={...ar[idx],pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('lp-d'),by:V('lp-by'),rv:V('lp-rv'),lk,rows,int:int_,micro,_edited:td()};
    DB.set('lab_rep',ar);_editLabId=null;
    document.getElementById('lab-mtit').textContent='Laboratory Results Entry';
    document.getElementById('lab-editbadge').style.display='none';
    closeOv('ov-labrep');renderLabReqs();if(pr)pLabRep(ar[idx].id);else toast('Lab result updated','success');
  }else{
    const ar=DB.get('lab_rep');
    const r={id:DB.id(),ref:nRef('LAB-RPT',ar),pid,pn:`${p.fn} ${p.ln}`,opd:p.opd,date:V('lp-d'),by:V('lp-by'),rv:V('lp-rv'),lk,rows,int:int_,micro};
    ar.unshift(r);DB.set('lab_rep',ar);
    if(lk){DB.set('lab_req',DB.get('lab_req').map(x=>x.id===lk?{...x,st:'Resulted'}:x));}
    closeOv('ov-labrep');renderLabReqs();if(pr)pLabRep(r.id);else toast('Results saved — '+r.ref,'success');
  }
};

/* ══════════════════════════════════════════
   LAB TEMPLATES
══════════════════════════════════════════ */
function clearLabRows(){labRids=[];document.getElementById('lp-rows').innerHTML='';}

// CBC: exact 18 fields in specified order
function loadCBCTpl(){
  clearLabRows();S('lp-micro','');
  const CBC=[
    ['WBC',         '','×10³/μL','4.0 – 11.0',  'Normal'],
    ['Lymph#',      '','×10³/μL','1.0 – 3.2',   'Normal'],
    ['Mid#',        '','×10³/μL','0.1 – 0.9',   'Normal'],
    ['Gran#',       '','×10³/μL','1.8 – 7.5',   'Normal'],
    ['Lymph%',      '','%',      '20 – 45',     'Normal'],
    ['Mid%',        '','%',      '3 – 9',       'Normal'],
    ['Gran%',       '','%',      '50 – 70',     'Normal'],
    ['HGB',         '','g/dL',   'M:13.5–17.5 F:12.0–15.5','Normal'],
    ['RBC',         '','×10⁶/μL','M:4.5–5.9 F:4.0–5.2','Normal'],
    ['HCT',         '','%',      'M:41–53 F:36–46','Normal'],
    ['MCV',         '','fL',     '80 – 100',    'Normal'],
    ['MCH',         '','pg',     '27 – 33',     'Normal'],
    ['MCHC',        '','g/dL',   '31 – 37',     'Normal'],
    ['RDW-CV',      '','%',      '11.5 – 14.5', 'Normal'],
    ['RDW-SD',      '','fL',     '39 – 46',     'Normal'],
    ['PLT',         '','×10³/μL','150 – 400',   'Normal'],
    ['MPV',         '','fL',     '7.5 – 12.5',  'Normal'],
    ['PDW',         '','fL',     '9.0 – 17.0',  'Normal'],
    ['PCT',         '','%',      '0.11 – 0.28', 'Normal'],
  ];
  CBC.forEach(([t,r,u,rng,f])=>addLabRow(t,r,u,rng,f));
  S('lp-int','Full Blood Count results. Please enter values above and change flags as appropriate (Normal/High/Low/Critical).');
  toast('CBC template loaded — 19 parameters ready','success');
}

// Urinalysis: 10 fields
function loadUATpl(){
  clearLabRows();S('lp-micro','WBC: ___/HPF\nRBC: ___/HPF\nEpithelial cells: \nCasts: \nCrystals: \nBacteria: ');
  const UA=[
    ['Colour',          'Yellow', '—',    'Yellow',          'Normal'],
    ['Appearance',      'Clear',  '—',    'Clear',           'Normal'],
    ['pH',              '',       '—',    '5.0 – 8.0',       'Normal'],
    ['Specific Gravity','',       '—',    '1.005 – 1.030',   'Normal'],
    ['Protein',         'Nil',    '—',    'Nil',             'Normal'],
    ['Glucose',         'Nil',    '—',    'Nil',             'Normal'],
    ['Ketones',         'Nil',    '—',    'Nil',             'Normal'],
    ['Blood',           'Nil',    '—',    'Nil',             'Normal'],
    ['Nitrites',        'Nil',    '—',    'Nil',             'Normal'],
    ['Leucocytes',      'Nil',    '/HPF', '< 5/HPF',         'Normal'],
  ];
  UA.forEach(([t,r,u,rng,f])=>addLabRow(t,r,u,rng,f));
  S('lp-int','Urinalysis results. Please edit values and adjust flags as appropriate.');
  toast('Urinalysis template loaded — microscopy box pre-filled','success');
}

// LFT template
function loadLFTTpl(){
  clearLabRows();S('lp-micro','');
  const LFT=[
    ['Total Bilirubin',     '','mg/dL','0.3 – 1.2',  'Normal'],
    ['Direct Bilirubin',    '','mg/dL','0.0 – 0.3',  'Normal'],
    ['Indirect Bilirubin',  '','mg/dL','0.2 – 0.8',  'Normal'],
    ['ALT (SGPT)',          '','U/L',  '7 – 56',      'Normal'],
    ['AST (SGOT)',          '','U/L',  '10 – 40',     'Normal'],
    ['Alkaline Phosphatase','','U/L',  '44 – 147',    'Normal'],
    ['GGT',                 '','U/L',  '8 – 61',      'Normal'],
    ['Total Protein',       '','g/dL', '6.3 – 8.2',   'Normal'],
    ['Albumin',             '','g/dL', '3.5 – 5.0',   'Normal'],
    ['Globulin',            '','g/dL', '2.0 – 3.5',   'Normal'],
  ];
  LFT.forEach(([t,r,u,rng,f])=>addLabRow(t,r,u,rng,f));
  S('lp-int','Liver Function Test results. Please edit values and adjust flags as appropriate.');
  toast('LFT template loaded — 10 tests ready','success');
}

// RFT template
function loadRFTTpl(){
  clearLabRows();S('lp-micro','');
  const RFT=[
    ['Urea',          '','mmol/L','2.5 – 6.7',  'Normal'],
    ['Creatinine',    '','μmol/L','M:62–115 F:53–97','Normal'],
    ['Uric Acid',     '','μmol/L','M:202–416 F:143–339','Normal'],
    ['Sodium (Na)',   '','mmol/L','136 – 145',  'Normal'],
    ['Potassium (K)', '','mmol/L','3.5 – 5.1',  'Normal'],
    ['Chloride (Cl)', '','mmol/L','98 – 107',   'Normal'],
    ['Bicarbonate',   '','mmol/L','22 – 29',    'Normal'],
    ['eGFR',          '','mL/min/1.73m²','> 60','Normal'],
  ];
  RFT.forEach(([t,r,u,rng,f])=>addLabRow(t,r,u,rng,f));
  S('lp-int','Renal Function Test results. Please edit values and adjust flags as appropriate.');
  toast('RFT template loaded — 8 tests ready','success');
}

// RDT rapid tests panel
function loadRDSTpl(){
  clearLabRows();S('lp-micro','');
  // Results start EMPTY — user fills in only the tests actually done.
  // On printing, only rows with a result entered will appear on the report.
  const RDT=[
    ['Malaria RDT (P.falciparum)','','—','Negative','Normal'],
    ['Malaria RDT (P.vivax)',     '','—','Negative','Normal'],
    ['Typhoid Rapid Test (IgM/IgG)','','—','Negative','Normal'],
    ['HIV 1&2',                  '','—','Non-Reactive','Normal'],
    ['HBsAg (Hepatitis B)',       '','—','Non-Reactive','Normal'],
    ['RPR (Syphilis)',            '','—','Non-Reactive','Normal'],
    ['Urine HCG (Pregnancy Test)','','—','Negative','Normal'],
    ['Serum HCG (β-hCG)',        '','mIU/mL','< 5 (non-pregnant)','Normal'],
    ['Fasting Blood Sugar',      '','mmol/L','3.9 – 6.1','Normal'],
    ['Random Blood Sugar',       '','mmol/L','3.9 – 7.8','Normal'],
  ];
  RDT.forEach(([t,r,u,rng,f])=>addLabRow(t,r,u,rng,f));
  S('lp-int','RDT panel results. Note: Only tests with results entered will appear on the printed report.');
  toast('RDT panel loaded — fill in only the tests performed. Empty rows will not print.','success');
}

/* ══════════════════════════════════════════
   IMPROVED PRINT: Each field printed as-typed
   (no collapsing into sentences)
══════════════════════════════════════════ */
// Override printEncById to print fields individually
window.printEncById=function(id){
  const e=DB.get('encounters').find(x=>x.id===id);if(!e)return;const v=e.vt||{};
  const pf=(label,val)=>val?`<div class="pfield"><div class="pfield-label">${label}</div><div class="pfield-value">${val}</div></div>`:'';
  doPrint(`${hakHdr('CLINICAL ENCOUNTER NOTE',e.id,e.date)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px">
      <tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${e.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD</td><td style="padding:7px 10px;font-weight:600">${e.opd}</td></tr>
      <tr><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Type</td><td style="padding:7px 10px">${e.ty}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Provider</td><td style="padding:7px 10px;font-weight:600">${e.pr}</td></tr>
    </table>
    <div style="background:#eaf6fb;border-radius:9px;padding:11px;margin-bottom:14px">
      <div style="font-size:9.5px;font-weight:700;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">VITAL SIGNS</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;font-size:12px">
        ${[['Temperature',v.t?v.t+' °C':''],['Blood Pressure',v.b?v.b+' mmHg':''],['Pulse',v.p?v.p+' bpm':''],['SpO₂',v.s?v.s+'%':''],['Weight',v.w?v.w+' kg':''],['Height',v.h?v.h+' cm':''],['RBS',v.r?v.r+' mmol/L':''],['Resp Rate',v.rr?v.rr+'/min':'']].map(([l,val])=>val?`<div><span style="font-size:9.5px;color:#5a7a8a;display:block;text-transform:uppercase">${l}</span><strong>${val}</strong></div>`:``).join('')}
      </div>
    </div>
    ${pf('SUBJECTIVE — Chief Complaint',e.c)}
    ${pf('OBJECTIVE — Examination Findings',e.o)}
    ${pf('ASSESSMENT — Diagnosis',e.dx)}
    ${pf('PLAN — Management',e.pl)}
    ${pf('FOLLOW-UP INSTRUCTIONS',e.fu)}
    ${e._edited?`<div style="font-size:10px;color:#5a7a8a;margin-top:10px;font-style:italic">Last edited: ${fd(e._edited)}</div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:28px">
      <div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Clinician: <strong>${e.pr}</strong></div>
      <div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Signature: ___________________</div>
    </div>
    ${hakFtr()}`);
};

// ═══════════════════════════════════════════════════════
// pLabRep — prints ONLY the selected patient's lab result
// • All rows shown for CBC/UA/LFT/RFT (they all have values)
// • For RDT panel: only prints rows where a result was entered
//   (non-empty result field), so unfilled RDT rows are excluded
// • Microscopy box printed if present
// ═══════════════════════════════════════════════════════
function _pLabRepFull(id){
  const r=DB.get('lab_rep').find(x=>x.id===id);if(!r)return;
  const fc={Normal:'inherit',High:'#b5322a',Low:'#1a6b87',Critical:'#b5322a'};
  // Smart row filtering:
  // Detect if this is primarily an RDT/rapid-test panel (most rows have categorical results)
  // RDT rows that still show the template default (Negative/Non-Reactive matching ref range) 
  // are skipped — only rows where the user actually typed a result are printed.
  // For CBC/UA/LFT/RFT all rows are always shown.
  const rdtDefaults=new Set(['Negative','Non-Reactive','']);
  // An RDT panel is detected when >50% of rows have unit '—' and categorical reference values
  const isRDT=r.rows.length>0&&r.rows.filter(row=>row.u==='—'&&(row.rn==='Negative'||row.rn==='Non-Reactive')).length>r.rows.length/2;
  let rowsToShow;
  if(isRDT){
    // For RDT panel: only show rows where result was actually entered/changed by user
    // A row is "not tested" if result is empty or still exactly matches the default placeholder
    rowsToShow=r.rows.filter(row=>{
      const res=String(row.r||'').trim();
      if(!res)return false; // empty = not tested
      // If result is still the default template value AND matches ref range, user didn't change it
      // But we still print it — the user chose to save it so it's intentional
      return true;
    }).filter(row=>String(row.r||'').trim()!=='');
    // If somehow nothing left (all empty), fall back to all rows
    if(rowsToShow.length===0)rowsToShow=r.rows;
  }else{
    // For CBC, UA, LFT, RFT: always print all rows regardless of result entry
    rowsToShow=r.rows;
  }
  doPrint(`
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<div style="font-family:'Outfit',sans-serif;max-width:720px;margin:0 auto;padding:26px">
  ${hakHdr('LABORATORY REPORT',r.ref,r.date)}
  <!-- Patient info — ONLY this patient -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px">
    <tr style="background:#eaf6fb">
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td>
      <td style="padding:7px 10px;font-weight:700">${r.pn}</td>
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD No.</td>
      <td style="padding:7px 10px;font-weight:700">${r.opd}</td>
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Date</td>
      <td style="padding:7px 10px">${fd(r.date)}</td>
    </tr>
    <tr>
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Performed By</td>
      <td style="padding:7px 10px">${r.by||'—'}</td>
      <td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Reviewed By</td>
      <td colspan="3" style="padding:7px 10px">${r.rv||'—'}</td>
    </tr>
  </table>
  <!-- Results table — only rows with entered results -->
  <table style="width:100%;border-collapse:collapse;border:1.5px solid #d4eff8;margin-bottom:14px;font-size:12.5px">
    <thead>
      <tr style="background:#145369;color:white">
        <th style="padding:8px 11px;text-align:left">Test</th>
        <th style="padding:8px 11px;text-align:left">Result</th>
        <th style="padding:8px 11px;text-align:left">Unit</th>
        <th style="padding:8px 11px;text-align:left">Reference Range</th>
        <th style="padding:8px 11px;text-align:left">Flag</th>
      </tr>
    </thead>
    <tbody>
      ${rowsToShow.map((row,i)=>`
        <tr style="${i%2===0?'background:#f8fbfd':'background:white'}">
          <td style="padding:8px 11px;font-weight:600">${row.t}</td>
          <td style="padding:8px 11px;font-weight:700;font-size:13.5px;color:${fc[row.f]||'inherit'}">${row.r}</td>
          <td style="padding:8px 11px;color:#5a7a8a">${row.u}</td>
          <td style="padding:8px 11px;color:#5a7a8a;font-size:12px">${row.rn||row.range||''}</td>
          <td style="padding:8px 11px;color:${fc[row.f]||'inherit'};font-weight:600;font-size:11px;text-transform:uppercase">${row.f}</td>
        </tr>`).join('')}
    </tbody>
  </table>
  <!-- Microscopy box — only if content was entered -->
  ${r.micro&&r.micro.trim()?`
  <div style="border:2px solid #145369;border-radius:9px;padding:13px 15px;margin-bottom:14px;page-break-inside:avoid">
    <div style="font-size:10px;font-weight:700;color:#145369;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;display:flex;align-items:center;gap:6px">
      🔬 MICROSCOPY
    </div>
    <div style="font-size:13px;line-height:2;white-space:pre-wrap;color:#0f1e25">${r.micro}</div>
  </div>`:''}
  <!-- Interpretation -->
  <div style="margin-bottom:14px;page-break-inside:avoid">
    <div style="font-size:9.5px;font-weight:700;color:#5a7a8a;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">INTERPRETATION / COMMENTS</div>
    <div style="border:2px solid #2089ab;border-radius:8px;padding:12px 14px;background:#eaf6fb;line-height:1.9;white-space:pre-wrap;font-size:13px">${r.int}</div>
  </div>
  ${r._edited?`<div style="font-size:10px;color:#5a7a8a;margin-bottom:8px;font-style:italic">Last edited: ${fd(r._edited)}</div>`:''}
  <!-- Signatures -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:28px">
    <div style="border-top:1.5px solid #d4eff8;padding-top:8px">
      <div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:3px">Performed by</div>
      <div style="font-size:13px;font-weight:600">${r.by||'___________________'}</div>
    </div>
    <div style="border-top:1.5px solid #d4eff8;padding-top:8px">
      <div style="font-size:10px;color:#5a7a8a;text-transform:uppercase;margin-bottom:3px">Reviewed &amp; Authorised by</div>
      <div style="font-size:13px;font-weight:600">${r.rv||'___________________'}</div>
      <div style="font-size:10px;color:#5a7a8a;margin-top:18px">Signature: ___________________</div>
    </div>
  </div>
  ${hakFtr()}
</div>`);
}
window.pLabRep=_pLabRepFull;

// Override pDC to print fields as-typed
window.pDC=function(id){
  const d=DB.get('discharge').find(x=>x.id===id);if(!d)return;
  const pf=(label,val)=>val?`<div class="pfield"><div class="pfield-label">${label}</div><div class="pfield-value">${val}</div></div>`:'';
  doPrint(`${hakHdr('DISCHARGE SUMMARY',d.ref,d.dd)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px">
      <tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${d.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD</td><td style="padding:7px 10px;font-weight:600">${d.opd}</td></tr>
      <tr><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Admitted</td><td style="padding:7px 10px">${fd(d.ad)}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Discharged</td><td style="padding:7px 10px">${fd(d.dd)}</td></tr>
      <tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Ward</td><td style="padding:7px 10px">${d.wd||'—'}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Condition</td><td style="padding:7px 10px;font-weight:700">${d.co}</td></tr>
    </table>
    ${pf('PRESENTING COMPLAINT',d.cc)}
    ${pf('ADMISSION DIAGNOSIS',d.ai)}
    ${pf('DISCHARGE DIAGNOSIS',d.di)}
    ${pf('INVESTIGATIONS & RESULTS',d.iv)}
    ${pf('TREATMENT GIVEN',d.tx)}
    ${pf('DISCHARGE MEDICATIONS',d.mx)}
    ${pf('FOLLOW-UP INSTRUCTIONS',d.fu)}
    ${d._edited?`<div style="font-size:10px;color:#5a7a8a;margin-top:8px;font-style:italic">Last edited: ${fd(d._edited)}</div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:28px">
      <div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Clinician: <strong>${d.cl}</strong></div>
      <div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Signature: ___________________</div>
    </div>
    ${hakFtr()}`);
};

// Override pRx to print fields as-typed
window.pRx=function(id){
  const r=DB.get('rx').find(x=>x.id===id);if(!r)return;
  doPrint(`${hakHdr('PRESCRIPTION',r.ref,r.date)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px">
      <tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Patient</td><td style="padding:7px 10px;font-weight:600">${r.pn}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">OPD</td><td style="padding:7px 10px;font-weight:600">${r.opd}</td></tr>
      <tr><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Clinician</td><td style="padding:7px 10px;font-weight:600">${r.cl}</td><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Date</td><td style="padding:7px 10px">${fd(r.date)}</td></tr>
      <tr style="background:#eaf6fb"><td style="padding:7px 10px;color:#5a7a8a;font-size:10px;text-transform:uppercase">Diagnosis</td><td colspan="3" style="padding:7px 10px">${r.dx||'—'}</td></tr>
      ${r.al&&r.al!=='None'?`<tr style="background:#fceeed"><td style="padding:7px 10px;color:#b5322a;font-size:10px;text-transform:uppercase">⚠ Allergies</td><td colspan="3" style="padding:7px 10px;color:#b5322a;font-weight:700">${r.al}</td></tr>`:''}
    </table>
    <table style="width:100%;border-collapse:collapse;border:1px solid #d4eff8;margin-bottom:14px;font-size:12.5px">
      <thead><tr style="background:#145369;color:white"><th style="padding:8px">#</th><th style="padding:8px;text-align:left">Medication</th><th style="padding:8px;text-align:left">Dose</th><th style="padding:8px;text-align:left">Frequency</th><th style="padding:8px;text-align:left">Route</th><th style="padding:8px;text-align:left">Duration</th><th style="padding:8px;text-align:left">Qty</th></tr></thead>
      <tbody>${r.meds.map((m,i)=>`<tr style="${i%2===0?'background:#f8fbfd':''}"><td style="padding:7px 8px;text-align:center;color:#5a7a8a">${i+1}</td><td style="padding:7px 8px;font-weight:700">${m.dr}</td><td style="padding:7px 8px">${m.do||''}</td><td style="padding:7px 8px">${m.fr||''}</td><td style="padding:7px 8px">${m.rt||''}</td><td style="padding:7px 8px">${m.du||''}</td><td style="padding:7px 8px">${m.qt||''}</td></tr>`).join('')}</tbody>
    </table>
    ${r.n?`<div class="pfield"><div class="pfield-label">Additional Instructions</div><div class="pfield-value">${r.n}</div></div>`:''}
    ${r._edited?`<div style="font-size:10px;color:#5a7a8a;margin-top:8px;font-style:italic">Last edited: ${fd(r._edited)}</div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:28px">
      <div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Prescribing Clinician: <strong>${r.cl}</strong></div>
      <div style="border-top:1px solid #d4eff8;padding-top:7px;font-size:10.5px;color:#5a7a8a">Dispensed by: ___________________</div>
    </div>
    ${hakFtr()}`);
};

// Override openLabRep to clear microscopy and reset edit state
const _origOpenLabRep=window.openLabRep;
window.openLabRep=function(){
  loadPats();S('lp-d',td());S('lp-by','');S('lp-int','');S('lp-micro','');
  _editLabId=null;
  document.getElementById('lab-mtit').textContent='Laboratory Results Entry';
  document.getElementById('lab-editbadge').style.display='none';
  document.getElementById('lp-p').innerHTML=patOpts();
  const rqs=DB.get('lab_req').filter(r=>r.st==='Pending');
  document.getElementById('lp-lk').innerHTML='<option value="">— None —</option>'+rqs.map(r=>`<option value="${r.id}">${r.ref} — ${r.pn}</option>`).join('');
  labRids=[];document.getElementById('lp-rows').innerHTML='';addLabRow();openOv('ov-labrep');
};

// Override openUSRep to reset edit state
const _origOpenUSRep=window.openUSRep;
window.openUSRep=function(){
  loadPats();S('usp-d',td());S('usp-ty','');S('usp-by','');S('usp-fi','');S('usp-im','');
  _editUSId=null;
  document.getElementById('us-mtit').textContent='Ultrasound Report';
  document.getElementById('us-editbadge').style.display='none';
  document.getElementById('usp-p').innerHTML=patOpts();
  const rqs=DB.get('us_req').filter(r=>r.st==='Pending');
  document.getElementById('usp-lk').innerHTML='<option value="">— None —</option>'+rqs.map(r=>`<option value="${r.id}">${r.ref} — ${r.pn}</option>`).join('');
  openOv('ov-usrep');
};

// Override openRx to reset edit state
const _origOpenRx=window.openRx;
window.openRx=function(){
  loadPats();S('rx-d',td());S('rx-dx','');S('rx-n','');S('rx-al','');
  _editRxId=null;
  document.getElementById('rx-mtit').textContent='Prescription';
  document.getElementById('rx-editbadge').style.display='none';
  document.getElementById('rx-p').innerHTML=patOpts();
  document.getElementById('rx-p').onchange=function(){const p=pats.find(x=>x.id===this.value);S('rx-al',p?p.al||'None':'');};
  document.getElementById('rx-rows').innerHTML='';rxRids=0;addRxRow();openOv('ov-rx');
};

// Override openDC to reset edit state
const _origOpenDC=window.openDC;
window.openDC=function(){
  loadPats();S('dc-ad',td());S('dc-dd',td());
  ['dc-wd','dc-cc','dc-ai','dc-di','dc-iv','dc-tx','dc-mx','dc-fu'].forEach(id=>S(id,''));
  _editDCId=null;
  document.getElementById('dc-mtit').textContent='Discharge Summary';
  document.getElementById('dc-editbadge').style.display='none';
  document.getElementById('dc-p').innerHTML=patOpts();openOv('ov-dc');
};

// Override openEnc to reset edit state
const _origOpenEnc=window.openEnc;
window.openEnc=function(){
  loadPats();S('enc-d',td());
  _editEncId=null;
  document.getElementById('enc-mtit').textContent='Clinical Encounter Note';
  document.getElementById('enc-editbadge').style.display='none';
  document.getElementById('enc-p').innerHTML=patOpts();
  ['enc-c','enc-o','enc-dx','enc-pl','enc-fu','v-t','v-b','v-p','v-s','v-w','v-h','v-r','v-rr'].forEach(id=>S(id,''));
  openOv('ov-enc');
};

/* ══ PRINT CSS for pfield ══ */
(function injectPrintCSS(){
  const s=document.createElement('style');
  s.textContent=`.pfield{margin-bottom:10px;page-break-inside:avoid}.pfield-label{font-size:9.5px;color:#5a7a8a;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px;font-weight:600}.pfield-value{border:1px solid #d4eff8;border-radius:7px;padding:9px 12px;line-height:1.8;font-size:13px;white-space:pre-wrap;word-break:break-word;min-height:28px}`;
  document.head.appendChild(s);
})();


/* ══════════════════════════════════════════
   EDIT PATIENT FILE
══════════════════════════════════════════ */
let _editPatId=null;
function editPat(id){
  loadPats();const p=pats.find(x=>x.id===id);if(!p)return;
  _editPatId=id;
  document.getElementById('pat-mtit').textContent='Edit Patient File';
  document.getElementById('pat-savebtn').textContent='Save Changes';
  S('pf-fn',p.fn);S('pf-ln',p.ln);S('pf-age',p.age||'');S('pf-ph',p.ph||'');S('pf-ad',p.ad||'');
  S('pf-ins',p.ins&&p.ins!=='None'?p.ins:'');S('pf-oc',p.oc||'');
  S('pf-al',p.al&&p.al!=='None'?p.al:'');S('pf-pmh',p.pmh||'');S('pf-em',p.em||'');
  document.getElementById('pf-sex').value=p.sex||'';
  document.getElementById('pf-bl').value=p.bl||'';
  closeOv('ov-vp');openOv('ov-pat');
}

/* ── override savePat to handle edit mode ── */
const _origSavePat=window.savePat||savePat;
window.savePat=function(){
  const fn=V('pf-fn').trim(),ln=V('pf-ln').trim(),age=parseInt(V('pf-age'))||0;
  if(!fn||!ln){toast('First and last name required','error');return;}
  loadPats();
  if(_editPatId){
    const idx=pats.findIndex(x=>x.id===_editPatId);if(idx<0)return;
    pats[idx]={...pats[idx],fn,ln,age,sex:V('pf-sex'),ph:V('pf-ph'),ad:V('pf-ad'),bl:V('pf-bl'),ins:V('pf-ins')||'None',oc:V('pf-oc'),al:V('pf-al')||'None',pmh:V('pf-pmh'),em:V('pf-em'),_updated:td()};
    DB.set('patients',pats);_editPatId=null;
    document.getElementById('pat-mtit').textContent='Register New Patient';
    document.getElementById('pat-savebtn').textContent='Register Patient';
    closeOv('ov-pat');renderPats();toast(`${fn} ${ln} — file updated`,'success');
  }else{
    const p={id:DB.id(),opd:nextOPD(),fn,ln,age,sex:V('pf-sex'),ph:V('pf-ph'),ad:V('pf-ad'),bl:V('pf-bl'),ins:V('pf-ins')||'None',oc:V('pf-oc'),al:V('pf-al')||'None',pmh:V('pf-pmh'),em:V('pf-em'),created:td()};
    pats.unshift(p);DB.set('patients',pats);closeOv('ov-pat');renderPats();toast(`Patient ${p.opd} registered`,'success');
  }
};
/* also reset edit state when opening new patient modal */
const _origOpenPat=window.openPat||openPat;
window.openPat=function(){
  loadPats();_editPatId=null;
  document.getElementById('pat-mtit').textContent='Register New Patient';
  document.getElementById('pat-savebtn').textContent='Register Patient';
  ['pf-fn','pf-ln','pf-age','pf-ph','pf-ad','pf-ins','pf-oc','pf-al','pf-pmh','pf-em'].forEach(id=>S(id,''));
  document.getElementById('pf-sex').value='';
  document.getElementById('pf-bl').value='';
  openOv('ov-pat');
};

/* ══════════════════════════════════════════
   EDIT APPOINTMENT
══════════════════════════════════════════ */
// _editApptId declared at top of appointments section
// editAppt, saveAppt and openAppt are all defined in the appointments section above
function editAppt(id){
  loadPats();const a=DB.get('appointments').find(x=>x.id===id);if(!a)return;
  _editApptId=id;
  document.getElementById('appt-mtit').textContent='Edit Appointment';
  if(document.getElementById('appt-editbadge'))document.getElementById('appt-editbadge').style.display='block';
  document.getElementById('af-p').innerHTML=patOpts();
  setTimeout(()=>{document.getElementById('af-p').value=a.pid;},0);
  S('af-d',a.date);S('af-t',a.time);S('af-n',a.n||'');
  if(document.getElementById('af-pr'))document.getElementById('af-pr').value=a.pr||'Dr. Karim';
  if(document.getElementById('af-ty'))document.getElementById('af-ty').value=a.ty||'Consultation';
  openOv('ov-appt');
}

/* ══════════════════════════════════════════
   EDIT BILLING / INVOICE (_editBillId declared above)
══════════════════════════════════════════ */
function editBill(id){
  loadPats();const b=DB.get('billing').find(x=>x.id===id);if(!b)return;
  _editBillId=id;
  document.getElementById('bill-mtit').textContent='Edit Invoice — '+b.ref;
  const badge=document.getElementById('bill-editbadge');if(badge)badge.style.display='block';
  document.getElementById('bl-p').innerHTML=patOpts();
  document.getElementById('bl-p').value=b.pid;
  S('bl-d',b.date);S('bl-n',b.n||'');
  document.getElementById('bl-s').value=b.st||'Unpaid';
  // Rebuild invoice item rows
  document.getElementById('bl-rows').innerHTML='';bRids=[];
  (b.items||[]).forEach(item=>addBillRow(item.d,item.q,item.p));
  // Rebuild payment rows
  document.getElementById('bl-pay-rows').innerHTML='';payRids=[];
  if(b.payments&&b.payments.length>0){
    b.payments.forEach(py=>addPayRow(py.a,py.m,py.d,py.n));
  }else if(b.paid>0){
    // Legacy: single paid amount, convert to one payment row
    addPayRow(b.paid,b.mt||'Cash',b.date,'');
  }else{
    addPayRow('','Cash');
  }
  calcBT();openOv('ov-bill');
}
/* ══════════════════════════════════════════
   EDIT BILLING / INVOICE
   _editBillId declared in original billing section above
══════════════════════════════════════════ */
function editBill(id){
  loadPats();const b=DB.get('billing').find(x=>x.id===id);if(!b)return;
  _editBillId=id;
  document.getElementById('bill-mtit').textContent='Edit Invoice — '+b.ref;
  const badge=document.getElementById('bill-editbadge');if(badge)badge.style.display='block';
  document.getElementById('bl-p').innerHTML=patOpts();
  setTimeout(()=>{document.getElementById('bl-p').value=b.pid;},0);
  S('bl-d',b.date);S('bl-n',b.n||'');
  const stEl=document.getElementById('bl-s');if(stEl)stEl.value=b.st||'Unpaid';
  // Rebuild invoice item rows
  document.getElementById('bl-rows').innerHTML='';bRids=[];
  (b.items||[]).forEach(item=>addBillRow(item.d,item.q,item.p));
  if(!b.items||!b.items.length)addBillRow();
  // Rebuild payment rows
  document.getElementById('bl-pay-rows').innerHTML='';payRids=[];
  if(b.payments&&b.payments.length>0){
    b.payments.forEach(py=>addPayRow(py.a||0,py.m||'Cash',py.d||'',py.n||''));
  }else if(Number(b.paid||0)>0){
    addPayRow(b.paid,b.mt||'Cash',b.date,'');
  }else{
    addPayRow('','Cash');
  }
  calcBT();openOv('ov-bill');
}

/* ══════════════════════════════════════════
   SHARE PATIENT FILE
══════════════════════════════════════════ */
function toggleShare(){
  const w=document.getElementById('shrwrap');
  if(w)w.style.display=w.style.display==='none'?'block':'none';
}
function buildShareText(){
  loadPats();const p=pats.find(x=>x.id===_vpid);if(!p)return'';
  const es=DB.get('encounters').filter(e=>e.pid===_vpid);
  const rx=DB.get('rx').filter(r=>r.pid===_vpid);
  let t=`*HAK Medical & Physiotherapy Center*\n30m off Gayaza Road to Magere | 0705 062 567\n`;
  t+=`━━━━━━━━━━━━━━━━━━━━━━━\n*PATIENT SUMMARY*\n\n`;
  t+=`Name: ${p.fn} ${p.ln}\nOPD: ${p.opd}\nAge: ${agD(p.age)}\nSex: ${p.sex||'—'}\nBlood: ${p.bl||'Unknown'}\nPhone: ${p.ph||'—'}\nInsurance: ${p.ins||'None'}\n`;
  if(p.al&&p.al!=='None')t+=`⚠ Allergies: ${p.al}\n`;
  if(es.length){t+=`\n*Last Visit (${fd(es[0].date)})*\nComplaint: ${es[0].c}\nDiagnosis: ${es[0].dx}\nPlan: ${es[0].pl||'—'}\n`;}
  if(rx.length){t+=`\n*Current Medications*\n${rx[0].meds?.map(m=>`• ${m.dr} ${m.do} ${m.fr}`).join('\n')}\n`;}
  t+=`\n_Excellence in Care, Honesty in Action_`;
  return t;
}
function shareVia(method){
  const text=buildShareText();loadPats();const p=pats.find(x=>x.id===_vpid);if(!p)return;
  const enc=encodeURIComponent(text);
  if(method==='wa'){window.open(`https://wa.me/?text=${enc}`,'_blank');}
  else if(method==='em'){window.open(`mailto:?subject=${encodeURIComponent('Patient Summary — '+p.fn+' '+p.ln+' ('+p.opd+')')}&body=${enc}`,'_blank');}
  else if(method==='tg'){window.open(`https://t.me/share/url?url=&text=${enc}`,'_blank');}
  else if(method==='cp'){
    navigator.clipboard.writeText(text).then(()=>toast('Copied to clipboard','success')).catch(()=>{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Copied!','success');});
  }else if(method==='na'){if(navigator.share)navigator.share({title:`Patient: ${p.fn} ${p.ln}`,text});else toast('Use Copy or a specific app','warn');}
}

/* ══════════════════════════════════════════
   DOWNLOAD INDIVIDUAL PATIENT FILE
══════════════════════════════════════════ */
function downloadPatFile(){
  loadPats();const p=pats.find(x=>x.id===_vpid);if(!p)return;
  const es=DB.get('encounters').filter(e=>e.pid===_vpid);
  const lr=DB.get('lab_rep').filter(r=>r.pid===_vpid);
  const ur=DB.get('us_rep').filter(r=>r.pid===_vpid);
  const rx=DB.get('rx').filter(r=>r.pid===_vpid);
  const bl=DB.get('billing').filter(b=>b.pid===_vpid);
  const dc=DB.get('discharge').filter(d=>d.pid===_vpid);
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Patient ${p.opd}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
<style>body{font-family:Outfit,sans-serif;background:#faf8f5;padding:24px;color:#0f1e25}
.hdr{background:#0f3d4f;color:white;padding:18px 24px;border-radius:12px;margin-bottom:20px}
.hdr h1{font-family:'Playfair Display',serif;font-size:17px;margin:0}
.hdr p{font-size:11px;opacity:.6;margin:3px 0 0}
.section{background:white;border:1px solid rgba(26,107,135,.15);border-radius:11px;padding:16px 20px;margin-bottom:14px}
.section h2{font-family:'Playfair Display',serif;font-size:14px;color:#145369;margin:0 0 10px;border-bottom:1px solid #d4eff8;padding-bottom:6px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.field label{font-size:10px;color:#5a7a8a;text-transform:uppercase;display:block;margin-bottom:1px}
.field strong{font-size:13px}
.rec{background:#eaf6fb;border-radius:8px;padding:9px;margin-bottom:7px;font-size:12.5px}
.alerg{background:#fceeed;border-radius:8px;padding:9px;grid-column:1/-1}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:#eaf6fb;color:#5a7a8a;font-size:9.5px;text-transform:uppercase;padding:6px 9px;text-align:left}
td{padding:6px 9px;border-bottom:1px solid rgba(26,107,135,.07)}
.ftr{margin-top:18px;text-align:center;font-size:10px;color:#5a7a8a;font-style:italic;border-top:1px solid #d4eff8;padding-top:9px}
</style></head><body>
<div class="hdr">
  <h1>HAK Medical &amp; Physiotherapy Center</h1>
  <p>30m off Gayaza Road to Magere &nbsp;|&nbsp; 0705 062 567 / 0773 029 999 &nbsp;|&nbsp; hakmedicalcenter@gmail.com</p>
</div>
<div class="section">
  <h2>Patient File — ${p.opd}</h2>
  <div class="grid">
    <div class="field"><label>Full Name</label><strong>${p.fn} ${p.ln}</strong></div>
    <div class="field"><label>Age</label><strong style="font-size:18px;color:#145369">${agD(p.age)}</strong></div>
    <div class="field"><label>Sex</label><strong>${p.sex||'—'}</strong></div>
    <div class="field"><label>Blood Type</label><strong>${p.bl||'Unknown'}</strong></div>
    <div class="field"><label>Phone</label><strong>${p.ph||'—'}</strong></div>
    <div class="field"><label>Address</label><strong>${p.ad||'—'}</strong></div>
    <div class="field"><label>Occupation</label><strong>${p.oc||'—'}</strong></div>
    <div class="field"><label>Insurance</label><strong>${p.ins||'None'}</strong></div>
    <div class="field"><label>Emergency Contact</label><strong>${p.em||'—'}</strong></div>
    <div class="field"><label>Registered</label><strong>${fd(p.created)}</strong></div>
    ${p.al&&p.al!=='None'?`<div class="alerg"><label style="color:#b5322a">⚠ Allergies</label><strong style="color:#b5322a">${p.al}</strong></div>`:''}
    ${p.pmh?`<div class="field" style="grid-column:1/-1"><label>Past Medical History</label><div style="font-size:13px;line-height:1.6">${p.pmh}</div></div>`:''}
  </div>
</div>
${es.length?`<div class="section"><h2>📋 Encounters (${es.length})</h2>${es.map(e=>`<div class="rec"><strong>${fd(e.date)} — ${e.ty} — ${e.pr}</strong><br>Complaint: ${e.c}<br>Diagnosis: ${e.dx}${e.pl?'<br>Plan: '+e.pl:''}</div>`).join('')}</div>`:''}
${lr.length?`<div class="section"><h2>🧪 Lab Results (${lr.length})</h2>${lr.map(r=>`<div class="rec"><strong>${r.ref} — ${fd(r.date)}</strong><table><thead><tr><th>Test</th><th>Result</th><th>Unit</th><th>Flag</th></tr></thead><tbody>${r.rows?.map(x=>`<tr><td>${x.t}</td><td><strong>${x.r}</strong></td><td>${x.u}</td><td style="color:${x.f==='High'||x.f==='Critical'?'#b5322a':x.f==='Low'?'#1a6b87':'inherit'}">${x.f}</td></tr>`).join('')}</tbody></table>${r.micro?'<div style="margin-top:7px;font-size:11.5px;color:#145369"><strong>Microscopy:</strong> '+r.micro+'</div>':''}<br><em>${r.int}</em></div>`).join('')}</div>`:''}
${ur.length?`<div class="section"><h2>🔊 Ultrasound Reports (${ur.length})</h2>${ur.map(r=>`<div class="rec"><strong>${r.ref} — ${fd(r.date)} — ${r.ty}</strong><br>${r.fi}<br><em>Impression: ${r.imp}</em></div>`).join('')}</div>`:''}
${rx.length?`<div class="section"><h2>💊 Prescriptions (${rx.length})</h2>${rx.map(r=>`<div class="rec"><strong>${r.ref} — ${fd(r.date)}</strong> — ${r.dx||'—'}<br>${r.meds?.map(m=>`• ${m.dr} ${m.do} ${m.fr} (${m.rt})`).join('<br>')}</div>`).join('')}</div>`:''}
${bl.length?`<div class="section"><h2>💳 Billing (${bl.length})</h2><table><thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>${bl.map(b=>`<tr><td>${b.ref}</td><td>${fd(b.date)}</td><td>UGX ${Number(b.tot||0).toLocaleString()}</td><td>UGX ${Number(b.paid||0).toLocaleString()}</td><td>UGX ${Number(b.bal||0).toLocaleString()}</td><td>${b.st}</td></tr>`).join('')}</tbody></table></div>`:''}
${dc.length?`<div class="section"><h2>🏥 Discharge Summaries (${dc.length})</h2>${dc.map(d=>`<div class="rec"><strong>${d.ref} — Discharged ${fd(d.dd)}</strong><br>Dx: ${d.di}<br>Condition: ${d.co}</div>`).join('')}</div>`:''}
<div class="ftr">Excellence in Care, Honesty in Action &nbsp;|&nbsp; HAK Medical &amp; Physiotherapy Center &nbsp;|&nbsp; Generated ${new Date().toLocaleString('en-UG')}</div>
</body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`HAK_Patient_${p.opd}_${p.fn}_${p.ln}.html`;a.click();
  toast(`Patient file downloaded — ${p.fn} ${p.ln}`,'success');
}

/* ══════════════════════════════════════════
   UPDATE PATIENT TABLE & VIEW MODAL to include Edit button
══════════════════════════════════════════ */
// Patch renderPats to include Edit button in rows (override)
const _origRenderPats=window.renderPats||renderPats;
window.renderPats=function(){
  const ptbody=document.getElementById('ptbody');
  if(!ptbody)return;
  loadPats();const q=V('psrch').toLowerCase();
  const list=pats.filter(p=>`${p.fn} ${p.ln} ${p.opd} ${p.ph||''}`.toLowerCase().includes(q));
  ptbody.innerHTML=list.length?list.map(p=>`<tr>
    <td><strong style="color:var(--t7)">${p.opd}</strong></td>
    <td><a href="#" onclick="viewPat('${p.id}');return false" style="color:var(--t6);font-weight:500;text-decoration:none">${p.fn} ${p.ln}</a></td>
    <td><strong style="color:var(--t7)">${agD(p.age)}</strong></td>
    <td>${p.sex||'—'}</td><td>${p.bl||'—'}</td><td>${p.ph||'—'}</td><td>${p.ad||'—'}</td>
    <td><span class="b ${p.ins&&p.ins!=='None'?'bg':'ba'}">${p.ins||'None'}</span></td>
    <td style="font-size:11.5px">${fd(p.created)}</td>
    <td style="white-space:nowrap">
      <button class="btn btng xs" onclick="viewPat('${p.id}')">View</button>
      <button class="btn btno xs" onclick="editPat('${p.id}')" style="margin-left:3px">✏️</button>
      ${CU&&(CU.role==='admin'||CU.role==='reception')?`<button class="btn btnd xs" onclick="delRec('patients','${p.id}',renderPats)" title="Delete" style="margin-left:3px">🗑</button>`:''}
    </td>
  </tr>`).join(''):`<tr><td colspan="10" class="nd">No patients found</td></tr>`;
};

/* Patch viewPat to add Edit+Share+Download buttons in modal header */
const _origViewPat=window.viewPat||viewPat;
window.viewPat=function(id){
  loadPats();_vpid=id;const p=pats.find(x=>x.id===id);if(!p)return;
  document.getElementById('vptitle').textContent=`${p.fn} ${p.ln}`;
  document.getElementById('vpopd').textContent=`${p.opd} · ${agD(p.age)} · ${p.sex||'—'}`;
  const sp=document.getElementById('shrwrap');if(sp)sp.style.display='none';
  document.querySelectorAll('.pt').forEach((t,i)=>t.classList.toggle('on',i===0));
  document.querySelectorAll('.ppe').forEach((t,i)=>t.classList.toggle('on',i===0));
  document.getElementById('vpbody').innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px">
    ${[['OPD Number',p.opd],['Age','<span style="font-size:20px;font-weight:700;color:var(--t7);font-family:var(--fs)">'+agD(p.age)+'</span>'],['Sex',p.sex||'—'],['Blood Type',p.bl||'Unknown'],['Phone',p.ph||'—'],['Address',p.ad||'—'],['Occupation',p.oc||'—'],['Insurance',p.ins||'None'],['Emergency Contact',p.em||'—'],['Registered',fd(p.created)]].map(([l,v])=>`<div style="border-bottom:1px solid var(--bd);padding-bottom:8px"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">${l}</div><div style="font-weight:500;font-size:13.5px">${v}</div></div>`).join('')}
    ${p.al&&p.al!=='None'?`<div style="grid-column:1/-1;background:var(--erb);border-radius:8px;padding:10px"><div style="font-size:10px;color:var(--er);text-transform:uppercase">⚠ Known Allergies</div><div style="font-weight:600;color:var(--er);margin-top:2px">${p.al}</div></div>`:''}
    ${p.pmh?`<div style="grid-column:1/-1;border-bottom:1px solid var(--bd);padding-bottom:8px"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;margin-bottom:2px">Past Medical History</div><div style="font-size:13px;line-height:1.6;white-space:pre-wrap">${p.pmh}</div></div>`:''}
    ${p._updated?`<div style="grid-column:1/-1"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;margin-bottom:1px">Last Updated</div><div style="font-size:12px;color:var(--tx3)">${fd(p._updated)}</div></div>`:''}
  </div>`;
  openOv('ov-vp');
};

/* Patch viewEnc to display content with edit badge */
const _origViewEnc=window.viewEnc||viewEnc;
window.viewEnc=function(id){
  _veid=id;const e=DB.get('encounters').find(x=>x.id===id);if(!e)return;
  document.getElementById('vetitle').textContent=`${e.pn} — ${fd(e.date)}`;
  const v=e.vt||{};
  document.getElementById('vebody').innerHTML=`
    <div style="background:var(--t0);border-radius:9px;padding:11px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
      ${[['Temp',v.t?v.t+'°C':'—'],['BP',v.b||'—'],['Pulse',v.p?v.p+' bpm':'—'],['SpO₂',v.s?v.s+'%':'—'],['Weight',v.w?v.w+' kg':'—'],['Height',v.h?v.h+' cm':'—'],['RBS',v.r||'—'],['Resp',v.rr||'—']].map(([l,val])=>`<div><div style="font-size:9.5px;color:var(--tx3);text-transform:uppercase">${l}</div><div style="font-weight:600;font-size:13px">${val}</div></div>`).join('')}
    </div>
    ${[['Chief Complaint',e.c],['Objective / Examination',e.o||''],['Assessment / Diagnosis',e.dx],['Plan / Management',e.pl||''],['Follow-up Instructions',e.fu||'']].filter(([,v])=>v).map(([l,val])=>`<div style="margin-bottom:11px"><div class="stit">${l}</div><div style="background:var(--iv);border:1px solid var(--bd);border-radius:7px;padding:10px;font-size:13px;line-height:1.7;white-space:pre-wrap">${val}</div></div>`).join('')}
    ${e._edited?`<div style="font-size:10px;color:var(--tx3);font-style:italic;margin-top:5px">Last edited: ${fd(e._edited)}</div>`:''}`;
  openOv('ov-ve');
};

/* Patch billing table to show Edit button + Record Payment */
const _origRenderBill=window.renderBill||renderBill;
window.renderBill=function(){
  const bltb=document.getElementById('bltb');
  if(!bltb){renderBillStats();return;}
  let l=DB.get('billing');
  const bFil_=window._bFil||'all';
  if(bFil_!=='all')l=l.filter(b=>b.st===bFil_);
  // Sort by date desc
  l.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  document.getElementById('bltb').innerHTML=l.length?l.map(b=>`<tr style="${b.st==='Unpaid'?'background:rgba(181,50,42,.04);':b.st==='Partial'?'background:rgba(201,124,46,.04);':''}">
    <td><strong style="color:var(--t7)">${b.ref}</strong></td><td>${fd(b.date)}</td>
    <td><strong>${b.pn}</strong><div style="font-size:10.5px;color:var(--tx3)">${b.opd||''}</div></td>
    <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${b.items?.map(i=>i.d).join(', ')}</td>
    <td><strong>${fm(b.tot)}</strong></td>
    <td style="color:var(--ok)">${fm(b.paid)}${b.payments&&b.payments.length>1?`<div style="font-size:10px;color:var(--tx3)">${b.payments.map(p=>p.m).join(' + ')}</div>`:''}</td>
    <td><span style="font-weight:700;color:${b.bal>0?'var(--er)':'var(--ok)'}">${fm(b.bal)}</span></td>
    <td style="font-size:11px;color:var(--tx3)">${b.mt}</td>
    <td><span class="b ${b.st==='Paid'?'bg':b.st==='Partial'?'bo':'br'}">${b.st}</span></td>
    <td style="white-space:nowrap">
      <button class="btn btng xs" onclick="pInvoice('${b.id}')" title="Print invoice">🖨</button>
      ${b.st!=='Paid'?`<button class="btn btns xs" onclick="openRecordPayment('${b.id}')" style="margin-left:3px" title="Record payment">💳 Pay</button>`:''}
      <button class="btn btno xs" onclick="editBill('${b.id}')" style="margin-left:3px" title="Edit invoice">✏️</button>
      <button class="btn btnd xs" onclick="delRec('billing','${b.id}',renderBill)" title="Delete" style="margin-left:3px">🗑</button>
    </td>
  </tr>`).join(''):`<tr><td colspan="10" class="nd">No invoices</td></tr>`;
  renderBillStats();
};
// make setBF use _bFil
const _origSetBF=window.setBF||setBF;
window.setBF=function(f){window._bFil=f;document.querySelectorAll('[id^="bt-"]').forEach(b=>{b.className='tab'+(b.id==='bt-'+f?' on':'')});renderBill();};

/* ══════════════════════════════════════════
   RECORD PAYMENT — for unpaid / partial invoices
   Opens a focused modal to add a payment without re-editing the whole invoice
══════════════════════════════════════════ */
let _rpInvoiceId=null;
function openRecordPayment(id){
  const b=DB.get('billing').find(x=>x.id===id);
  if(!b){toast('Invoice not found','error');return;}
  _rpInvoiceId=id;
  // Populate modal
  document.getElementById('rp-ref').textContent=b.ref;
  document.getElementById('rp-patient').textContent=b.pn;
  document.getElementById('rp-tot').textContent=fm(b.tot);
  document.getElementById('rp-paid').textContent=fm(b.paid);
  const balEl=document.getElementById('rp-bal');
  balEl.textContent=fm(b.bal);
  balEl.style.color=b.bal>0?'var(--er)':'var(--ok)';
  // Pre-fill amount with outstanding balance
  document.getElementById('rp-amount').value=b.bal>0?b.bal:'';
  document.getElementById('rp-method').value='Cash';
  document.getElementById('rp-ref-note').value='';
  document.getElementById('rp-date').value=td();
  // Payment history
  const hist=document.getElementById('rp-history');
  const prev=b.payments||[];
  hist.innerHTML=prev.length?`<div style="font-size:10.5px;font-weight:600;color:var(--t7);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Previous Payments</div>`+prev.map((p,i)=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 8px;background:var(--okb);border-radius:6px;margin-bottom:4px"><span>${p.m}${p.d?' — '+fd(p.d):''}${p.n?' ('+p.n+')':''}</span><strong style="color:var(--ok)">${fm(p.a)}</strong></div>`).join(''):'<div style="font-size:12px;color:var(--tx3)">No previous payments</div>';
  openOv('ov-rp');
}

async function saveRecordPayment(){
  const id=_rpInvoiceId;
  if(!id){toast('No invoice selected','error');return;}
  const amount=parseFloat(document.getElementById('rp-amount').value)||0;
  if(amount<=0){toast('Enter a valid payment amount','error');return;}
  const method=document.getElementById('rp-method').value;
  const ref=document.getElementById('rp-ref-note').value;
  const payDate=document.getElementById('rp-date').value;

  // Update via server for persistence
  try {
    const formData=new FormData();
    formData.append('invoice_id',id);
    formData.append('amount',amount);
    formData.append('method',method);
    formData.append('ref',ref);
    formData.append('pay_date',payDate);
    const resp=await fetch('api.php?action=record_payment',{method:'POST',body:formData});
    const result=await resp.json();
    if(result.success){
      // Refresh local DB
      const getResp=await fetch('api.php?action=get');
      const newDB=await getResp.json();
      for(const[appKey,tableKey] of Object.entries(KEY_MAP)){
        LOCAL_DB[appKey]=newDB[tableKey]||[];
      }
      closeOv('ov-rp');
      renderBill();
      toast(`Payment of ${fm(amount)} recorded — Invoice ${result.new_status}`,'success');
    }else{
      toast(result.error||'Failed to record payment','error');
    }
  }catch(e){
    // Fallback: update locally if server fails
    const ar=DB.get('billing');
    const idx=ar.findIndex(x=>x.id===id);
    if(idx<0){toast('Invoice not found','error');return;}
    const b=ar[idx];
    const prev=b.payments||[];
    prev.push({a:amount,m:method,d:payDate,n:ref});
    const newPaid=Number(b.paid||0)+amount;
    const newBal=Number(b.tot||0)-newPaid;
    const newStatus=newPaid<=0?'Unpaid':newBal>0?'Partial':'Paid';
    const newMt=[...new Set(prev.map(p=>p.m))].join(' + ');
    ar[idx]={...b,paid:newPaid,bal:newBal<0?0:newBal,st:newStatus,mt:newMt,payments:prev};
    DB.set('billing',ar);
    closeOv('ov-rp');
    renderBill();
    toast(`Payment recorded locally — Invoice ${newStatus}`,'success');
  }
}

/* ══════════════════════════════════════════
   OTC DAILY SALES
══════════════════════════════════════════ */
let otcFil='today';
function setOTCF(f){
  otcFil=f;
  ['otc-td','otc-wk','otc-al'].forEach(id=>{const el=document.getElementById(id);if(el)el.className='tab'+(el.id==='otc-'+f.slice(0,2)?' on':'');});
  // Map filter names to button ids
  const map={today:'otc-td',week:'otc-wk',all:'otc-al'};
  Object.entries(map).forEach(([k,btnId])=>{const b=document.getElementById(btnId);if(b)b.className='tab'+(k===f?' on':'');});
  renderOTC();
}
function renderOTC(){
  const df=V('otc-df');
  let all=DB.get('otc_sales')||[];
  const now=new Date();
  const todayStr=td();
  const weekAgo=new Date(now-7*86400000).toISOString().slice(0,10);
  let list=all;
  if(df)list=all.filter(s=>s.date===df);
  else if(otcFil==='today')list=all.filter(s=>s.date===todayStr);
  else if(otcFil==='week')list=all.filter(s=>s.date>=weekAgo);
  // Stats
  const totSales=list.reduce((s,x)=>s+Number(x.tot||0),0);
  const totQty=list.reduce((s,x)=>s+(x.items||[]).reduce((q,i)=>q+Number(i.q||0),0),0);
  const todaySales=(DB.get('otc_sales')||[]).filter(s=>s.date===todayStr).reduce((s,x)=>s+Number(x.tot||0),0);
  const statsEl=document.getElementById('otc-stats');
  if(statsEl)statsEl.innerHTML=[
    {n:list.length,l:'Transactions',bg:'#eaf6fb',ic:'#1a6b87'},
    {n:'UGX '+totSales.toLocaleString(),l:'Total Revenue',bg:'#e6f5ef',ic:'#1d8a5e',big:true},
    {n:totQty.toLocaleString(),l:'Items Sold',bg:'var(--t1)',ic:'#0f3d4f'},
    {n:'UGX '+todaySales.toLocaleString(),l:"Today's Sales",bg:'#fdf3e6',ic:'#c97c2e',big:true},
  ].map(s=>`<div style="background:${s.bg};border-radius:12px;padding:14px 16px"><div style="font-size:10px;color:${s.ic};text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">${s.l}</div><div style="font-family:var(--fs);font-size:${s.big?'17px':'24px'};font-weight:700;color:${s.ic}">${s.n}</div></div>`).join('');
  // Count label
  const cntEl=document.getElementById('otc-count');
  if(cntEl)cntEl.textContent=list.length+' sale'+(list.length!==1?'s':'')+' shown';
  // Table
  document.getElementById('otctb').innerHTML=list.length?list.map((s,idx)=>`<tr>
    <td style="color:var(--tx3);font-size:12px">${idx+1}</td>
    <td style="font-size:12px">${fd(s.date)} ${s.time||''}</td>
    <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(s.items||[]).map(i=>i.d).join(', ')}</td>
    <td>${(s.items||[]).reduce((q,i)=>q+Number(i.q||0),0).toLocaleString()}</td>
    <td style="font-size:12px">${s.items?.length===1?fm(s.items[0].p):'—'}</td>
    <td><strong style="color:var(--ok)">${fm(s.tot)}</strong></td>
    <td><span class="b bb" style="font-size:11px">${s.pay||'Cash'}</span></td>
    <td style="font-size:12px">${s.by||'—'}</td>
    <td style="font-size:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx3)">${s.notes||'—'}</td>
    <td style="white-space:nowrap">
      <button class="btn btng xs" onclick="pOTCReceipt('${s.id}')">🖨</button>
      <button class="btn btno xs" onclick="editOTCSale('${s.id}')" style="margin-left:3px">✏️</button>
      <button class="btn btnd xs" onclick="delRec('otc_sales','${s.id}',renderOTC)" title="Delete" style="margin-left:3px">🗑</button>
    </td>
  </tr>`).join(''):`<tr><td colspan="10" class="nd">No OTC sales recorded for this period</td></tr>`;
  // Totals footer
  const tf=document.getElementById('otc-tfoot');
  if(tf&&list.length>0){
    tf.style.display='';
    document.getElementById('otc-tot-qty').textContent=totQty.toLocaleString()+' units';
    document.getElementById('otc-tot-val').textContent=fm(totSales);
  }else if(tf){tf.style.display='none';}
}

let otcRids=[];
function openOTCSale(){
  window._editOTCId=null;
  document.getElementById('otc-mtit').textContent='New OTC Sale';
  const now=new Date();
  S('otc-date',td());
  S('otc-time',now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0'));
  S('otc-by','');S('otc-notes','');
  document.getElementById('otc-tot-disp').textContent='UGX 0';
  const qlEl=document.getElementById('otc-qty-lbl');if(qlEl)qlEl.textContent='';
  document.getElementById('otc-rows').innerHTML='';otcRids=[];
  addOTCRow();openOv('ov-otc');
}
function addOTCRow(d='',q=1,p=0){
  const id='otcr_'+Date.now()+'_'+Math.random().toString(36).slice(2,4);otcRids.push(id);
  const el=document.createElement('div');el.id=id;
  el.style.cssText='background:var(--iv2);border-radius:9px;padding:9px;margin-bottom:7px';
  // Build inventory select options for quick-pick
  const inv=DB.get('inventory');
  const invOpts='<option value="">— Pick from inventory or type below —</option>'+inv.map(i=>`<option value="${i.id}" data-nm="${i.nm}" data-p="${i.sp>0?i.sp:i.cp}">${i.nm} (Stock: ${i.qty} ${i.un}) — ${i.sp>0?fm(i.sp):'No price'}</option>`).join('');
  el.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr auto;gap:6px;margin-bottom:7px;align-items:end">
      <div><label class="fl">Pick from Inventory (optional)</label>
        <select class="fs" id="${id}_inv" onchange="otcPickInv('${id}')">
          ${invOpts}
        </select>
      </div>
      <div style="padding-bottom:1px"><button class="btn btnd xs" onclick="document.getElementById('${id}').remove();otcRids=otcRids.filter(r=>r!=='${id}');calcOTC()" title="Remove row">✕</button></div>
    </div>
    <div style="display:grid;grid-template-columns:3fr 1fr 1.5fr 1.5fr;gap:7px;align-items:end">
      <div><label class="fl">Item / Service *</label><input class="fi" placeholder="Drug name or service" value="${d}" data-f="d" oninput="calcOTC()"></div>
      <div><label class="fl">Qty</label><input class="fi" type="number" value="${q}" min="1" data-f="q" oninput="calcOTC()"></div>
      <div><label class="fl">Unit Price (UGX)</label><input class="fi" type="number" value="${p}" data-f="p" oninput="calcOTC()"></div>
      <div><label class="fl">Total</label><input class="fi" id="${id}_t" readonly></div>
    </div>`;
  document.getElementById('otc-rows').appendChild(el);calcOTC();
}
function otcPickInv(rowId){
  const sel=document.getElementById(rowId+'_inv');
  const opt=sel.options[sel.selectedIndex];
  if(!opt.value)return;
  const el=document.getElementById(rowId);
  if(!el)return;
  el.querySelector('[data-f="d"]').value=opt.dataset.nm||'';
  el.querySelector('[data-f="p"]').value=opt.dataset.p||'';
  el.querySelector('[data-f="q"]').value=1;
  calcOTC();
  el.querySelector('[data-f="d"]').focus();
}
function calcOTC(){
  let tot=0,totalQty=0;
  otcRids.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const q=parseFloat(el.querySelector('[data-f="q"]').value)||0;
    const p=parseFloat(el.querySelector('[data-f="p"]').value)||0;
    const t=q*p;tot+=t;totalQty+=q;
    const ti=document.getElementById(id+'_t');if(ti)ti.value=t||'';
  });
  document.getElementById('otc-tot-disp').textContent='UGX '+tot.toLocaleString();
  const ql=document.getElementById('otc-qty-lbl');
  if(ql)ql.textContent=totalQty?totalQty+' unit'+(totalQty!==1?'s':''):'';
}
function getOTCRows(){
  return otcRids.map(id=>{
    const el=document.getElementById(id);if(!el)return null;
    const q=parseFloat(el.querySelector('[data-f="q"]').value)||0;
    const p=parseFloat(el.querySelector('[data-f="p"]').value)||0;
    return{d:el.querySelector('[data-f="d"]').value,q,p,tot:q*p};
  }).filter(Boolean).filter(r=>r.d);
}
function saveOTC(pr){
  const items=getOTCRows();
  if(!items.length){toast('Add at least one item','error');return;}
  const tot=items.reduce((s,i)=>s+i.tot,0);
  const ar=DB.get('otc_sales')||[];
  const eid=window._editOTCId;
  if(eid){
    const idx=ar.findIndex(x=>x.id===eid);
    if(idx>-1){ar[idx]={...ar[idx],date:V('otc-date'),time:V('otc-time'),by:V('otc-by'),pay:V('otc-pay'),items,tot,notes:V('otc-notes'),_edited:td()};}
    DB.set('otc_sales',ar);window._editOTCId=null;
    document.getElementById('otc-mtit').textContent='New OTC Sale';
    closeOv('ov-otc');renderOTC();
    if(pr)pOTCReceipt(eid);else toast('OTC sale updated — '+fm(tot),'success');
  }else{
    const sale={id:DB.id(),date:V('otc-date'),time:V('otc-time'),by:V('otc-by'),pay:V('otc-pay'),items,tot,notes:V('otc-notes'),ref:'OTC-'+String(ar.length+1).padStart(4,'0')};
    ar.unshift(sale);DB.set('otc_sales',ar);
    closeOv('ov-otc');renderOTC();
    if(pr)pOTCReceipt(sale.id);else toast('OTC sale recorded — '+sale.ref+' — '+fm(tot),'success');
  }
}
function editOTCSale(id){
  const s=(DB.get('otc_sales')||[]).find(x=>x.id===id);if(!s)return;
  document.getElementById('otc-mtit').textContent='Edit OTC Sale';
  S('otc-date',s.date);S('otc-time',s.time||'');S('otc-by',s.by||'');S('otc-notes',s.notes||'');
  document.getElementById('otc-pay').value=s.pay||'Cash';
  document.getElementById('otc-rows').innerHTML='';otcRids=[];
  (s.items||[]).forEach(i=>addOTCRow(i.d,i.q,i.p));
  calcOTC();
  // Store edit id
  window._editOTCId=id;
  openOv('ov-otc');
}
function pOTCReceipt(id){
  const s=(DB.get('otc_sales')||[]).find(x=>x.id===id);if(!s)return;
  doPrint(`<div style="max-width:480px;margin:0 auto;padding:22px;font-family:'Outfit',sans-serif">
    ${hakHdr('OTC SALE RECEIPT',s.ref,s.date)}
    <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px">
      <tr style="background:#eaf6fb"><td style="padding:6px 9px;color:#5a7a8a;font-size:9.5px;text-transform:uppercase">Date &amp; Time</td><td style="padding:6px 9px;font-weight:500">${fd(s.date)} ${s.time||''}</td><td style="padding:6px 9px;color:#5a7a8a;font-size:9.5px;text-transform:uppercase">Payment</td><td style="padding:6px 9px;font-weight:500">${s.pay||'Cash'}</td></tr>
      ${s.by?`<tr><td style="padding:6px 9px;color:#5a7a8a;font-size:9.5px;text-transform:uppercase">Served By</td><td colspan="3" style="padding:6px 9px">${s.by}</td></tr>`:''}
    </table>
    <table style="width:100%;border-collapse:collapse;border:1px solid #d4eff8;margin-bottom:12px;font-size:12.5px">
      <thead><tr style="background:#145369;color:white"><th style="padding:7px 10px;text-align:left">Item</th><th style="padding:7px 10px;text-align:right">Qty</th><th style="padding:7px 10px;text-align:right">Price</th><th style="padding:7px 10px;text-align:right">Total</th></tr></thead>
      <tbody>${s.items.map((item,i)=>`<tr style="${i%2===0?'background:#f8fbfd':''}"><td style="padding:6px 10px">${item.d}</td><td style="padding:6px 10px;text-align:right">${item.q}</td><td style="padding:6px 10px;text-align:right">${fm(item.p)}</td><td style="padding:6px 10px;text-align:right;font-weight:600">${fm(item.tot)}</td></tr>`).join('')}</tbody>
      <tr style="border-top:2px solid #2089ab;background:#eaf6fb"><td colspan="3" style="padding:9px 10px;font-weight:700;text-align:right;font-size:13px">TOTAL</td><td style="padding:9px 10px;font-weight:700;font-size:17px;text-align:right;color:#145369">${fm(s.tot)}</td></tr>
    </table>
    ${s.notes?`<div style="font-size:12px;color:#5a7a8a;border:1px solid #d4eff8;border-radius:7px;padding:8px 10px;margin-bottom:10px">${s.notes}</div>`:''}
    <div style="text-align:center;font-size:11px;color:#5a7a8a;margin-top:14px;border-top:1px dashed #d4eff8;padding-top:9px">
      <strong>Thank you — HAK Medical &amp; Physiotherapy Center</strong><br>
      30m off Gayaza Road to Magere &nbsp;|&nbsp; 0705 062 567 / 0773 029 999
    </div>
    ${hakFtr()}
  </div>`);
}
function printOTCReport(){
  const all=DB.get('otc_sales')||[];
  const df=V('otc-df');
  const todayStr=td();
  const weekAgo=new Date(new Date()-7*86400000).toISOString().slice(0,10);
  let list=all;
  if(df)list=all.filter(s=>s.date===df);
  else if(otcFil==='today')list=all.filter(s=>s.date===todayStr);
  else if(otcFil==='week')list=all.filter(s=>s.date>=weekAgo);
  const tot=list.reduce((s,x)=>s+Number(x.tot||0),0);
  const qty=list.reduce((s,x)=>s+(x.items||[]).reduce((q,i)=>q+Number(i.q||0),0),0);
  // Group by item
  const byItem={};
  list.forEach(s=>(s.items||[]).forEach(i=>{if(!byItem[i.d])byItem[i.d]={qty:0,tot:0};byItem[i.d].qty+=Number(i.q||0);byItem[i.d].tot+=Number(i.tot||0);}));
  const label=df?fd(df):otcFil==='today'?fd(todayStr):otcFil==='week'?'Last 7 Days':'All Time';
  doPrint(`<div style="max-width:720px;margin:0 auto;padding:28px;font-family:'Outfit',sans-serif">
    ${hakHdr('OTC SALES REPORT','',todayStr)}
    <div style="font-size:13px;color:#5a7a8a;margin-bottom:16px">Period: <strong>${label}</strong></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:18px">
      <div style="background:#eaf6fb;border-radius:9px;padding:12px;text-align:center"><div style="font-size:10px;color:#1a6b87;text-transform:uppercase;margin-bottom:3px">Transactions</div><div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#1a6b87">${list.length}</div></div>
      <div style="background:#e6f5ef;border-radius:9px;padding:12px;text-align:center"><div style="font-size:10px;color:#1d8a5e;text-transform:uppercase;margin-bottom:3px">Total Revenue</div><div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#1d8a5e">${fm(tot)}</div></div>
      <div style="background:var(--t1);border-radius:9px;padding:12px;text-align:center"><div style="font-size:10px;color:#0f3d4f;text-transform:uppercase;margin-bottom:3px">Units Sold</div><div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#0f3d4f">${qty.toLocaleString()}</div></div>
    </div>
    ${Object.keys(byItem).length?`<div style="margin-bottom:16px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;border-bottom:1px solid #d4eff8;padding-bottom:4px">Sales by Item</div>
    <table style="width:100%;border-collapse:collapse;font-size:12.5px"><thead><tr style="background:#145369;color:white"><th style="padding:7px 11px;text-align:left">Item</th><th style="padding:7px 11px;text-align:right">Units Sold</th><th style="padding:7px 11px;text-align:right">Revenue</th></tr></thead><tbody>
    ${Object.entries(byItem).sort((a,b)=>b[1].tot-a[1].tot).map(([nm,v],i)=>`<tr style="${i%2===0?'background:#f8fbfd':''}"><td style="padding:7px 11px">${nm}</td><td style="padding:7px 11px;text-align:right">${v.qty.toLocaleString()}</td><td style="padding:7px 11px;text-align:right;font-weight:600;color:#1d8a5e">${fm(v.tot)}</td></tr>`).join('')}
    </tbody></table></div>`:''}
    <div style="margin-bottom:16px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;border-bottom:1px solid #d4eff8;padding-bottom:4px">Transaction Details</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#eaf6fb"><th style="padding:6px 9px;text-align:left">Ref</th><th style="padding:6px 9px;text-align:left">Date</th><th style="padding:6px 9px;text-align:left">Items</th><th style="padding:6px 9px;text-align:right">Total</th><th style="padding:6px 9px;text-align:left">Payment</th></tr></thead><tbody>
    ${list.map((s,i)=>`<tr style="${i%2===0?'':'background:#f8fbfd'}"><td style="padding:6px 9px">${s.ref}</td><td style="padding:6px 9px">${fd(s.date)}</td><td style="padding:6px 9px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(s.items||[]).map(i=>i.d).join(', ')}</td><td style="padding:6px 9px;text-align:right;font-weight:600">${fm(s.tot)}</td><td style="padding:6px 9px">${s.pay||'Cash'}</td></tr>`).join('')}
    <tr style="border-top:2px solid #2089ab;background:#eaf6fb;font-weight:700"><td colspan="3" style="padding:8px 9px;text-align:right">TOTAL</td><td style="padding:8px 9px;text-align:right;color:#145369;font-family:'Playfair Display',serif;font-size:14px">${fm(tot)}</td><td></td></tr>
    </tbody></table></div>
    ${hakFtr()}
  </div>`);
}


/* ══════════════════════════════════════════════════════
   FINANCE MODULE — Income, Expenditure & Daily Summaries
══════════════════════════════════════════════════════ */

/* Period state */
let _finPeriod='today';
let _finFrom='',_finTo='';

function setFinPeriod(p){
  _finPeriod=p;
  ['today','week','month','all'].forEach(x=>{
    const el=document.getElementById('fin-'+x);
    if(el)el.className='tab'+(x===p?' on':'');
  });
  // Set date pickers
  const now=new Date();
  if(p==='today'){
    const t=td();
    S('fin-from',t);S('fin-to',t);
  }else if(p==='week'){
    const d=new Date(now);d.setDate(d.getDate()-6);
    S('fin-from',d.toISOString().slice(0,10));S('fin-to',td());
  }else if(p==='month'){
    S('fin-from',new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10));
    S('fin-to',td());
  }else{
    S('fin-from','');S('fin-to','');
  }
  renderFinance();
}

/* ── Date range filter helper ── */
function inRange(dateStr){
  const from=V('fin-from'),to=V('fin-to');
  if(!from&&!to)return true;
  const d=dateStr?dateStr.slice(0,10):'';
  if(from&&d<from)return false;
  if(to&&d>to)return false;
  return true;
}

/* ── Collect all income from all sources ── */
function collectIncome(){
  const items=[];

  // 1. Billing payments (from invoices)
  DB.get('billing').forEach(b=>{
    if(!inRange(b.date))return;
    if(b.payments&&b.payments.length>0){
      b.payments.forEach(px=>{
        const pDate=(px.d&&px.d!=='')?px.d:b.date;
        if(!inRange(pDate))return;
        items.push({
          date:pDate,
          source:'Billing / Invoice',
          desc:`${b.pn} — ${b.ref} (${px.m})`,
          method:px.m||'Cash',
          amt:Number(px.a||0),
          ref:b.ref,
        });
      });
    }else if(Number(b.paid||0)>0){
      items.push({
        date:b.date,
        source:'Billing / Invoice',
        desc:`${b.pn} — ${b.ref}`,
        method:b.mt||'Cash',
        amt:Number(b.paid||0),
        ref:b.ref,
      });
    }
  });

  // 2. OTC Sales
  DB.get('otc_sales').forEach(s=>{
    if(!inRange(s.date))return;
    items.push({
      date:s.date,
      source:'OTC Sales',
      desc:`${s.ref||'OTC'} — ${s.items?.map(i=>i.d).join(', ')||'Sale'}`,
      method:s.pay||'Cash',
      amt:Number(s.tot||0),
      ref:s.ref||'',
    });
  });

  // 3. Dispensing revenue (pharmacy)
  DB.get('dis').forEach(d=>{
    if(!inRange(d.date))return;
    if(Number(d.tot||0)>0){
      items.push({
        date:d.date,
        source:'Pharmacy / Dispensing',
        desc:`${d.pn} — ${d.item} ×${d.qty}`,
        method:'Cash',
        amt:Number(d.tot||0),
        ref:'',
      });
    }
  });

  // 4. Manual income entries
  (DB.get('manual_income')||[]).forEach(m=>{
    if(!inRange(m.date))return;
    items.push({
      date:m.date,
      source:'Manual Income',
      desc:`${m.cat||'Other'} — ${m.desc||''}`,
      method:m.m||m.method||'Cash',
      amt:Number(m.amt||m.amount||0),
      ref:m.ref||'',
      _manualId:m.id,
    });
  });

  return items.sort((a,b)=>b.date.localeCompare(a.date));
}

/* ── Collect expenditure entries ── */
function collectExpenses(){
  return(DB.get('expenses')||[]).filter(e=>inRange(e.date)).sort((a,b)=>b.date.localeCompare(a.date));
}

/* ── Group items by source/category ── */
function groupBy(arr,key){
  const map={};
  arr.forEach(item=>{
    const k=item[key]||'Other';
    if(!map[k])map[k]={label:k,total:0,count:0};
    map[k].total+=item.amt;map[k].count++;
  });
  return Object.values(map).sort((a,b)=>b.total-a.total);
}

/* ── Main render ── */
function renderFinance(){
  const income=collectIncome();
  const expenses=collectExpenses();

  const totalInc=income.reduce((s,x)=>s+x.amt,0);
  const totalExp=expenses.reduce((s,x)=>s+Number(x.amt||0),0);
  const net=totalInc-totalExp;
  const netPos=net>=0;

  /* Summary cards */
  const cards=[
    {lbl:'Total Income',val:fm(totalInc),bg:'var(--okb)',c:'var(--ok)',sub:income.length+' transaction'+(income.length!==1?'s':'')},
    {lbl:'Total Expenditure',val:fm(totalExp),bg:'var(--erb)',c:'var(--er)',sub:expenses.length+' expense'+(expenses.length!==1?'s':'')},
    {lbl:netPos?'Net Profit':'Net Loss',val:fm(Math.abs(net)),bg:netPos?'#e6f5ef':'var(--erb)',c:netPos?'var(--ok)':'var(--er)',sub:netPos?'Surplus period':'Deficit period'},
    {lbl:'Billing Outstanding',val:fm(DB.get('billing').filter(b=>inRange(b.date)).reduce((s,b)=>s+Number(b.bal||0),0)),bg:'var(--wnb)',c:'var(--wn)',sub:'Unpaid balances in period'},
  ];
  document.getElementById('fin-cards').innerHTML=cards.map(c=>`
    <div style="background:${c.bg};border-radius:12px;padding:14px 16px">
      <div style="font-size:10px;color:${c.c};text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">${c.lbl}</div>
      <div style="font-family:var(--fs);font-size:18px;font-weight:700;color:${c.c}">${c.val}</div>
      <div style="font-size:11px;color:var(--tx3);margin-top:2px">${c.sub}</div>
    </div>`).join('');

  /* Net banner */
  const banner=document.getElementById('fin-net-banner');
  if(banner){
    banner.style.background=netPos?'linear-gradient(135deg,#1d8a5e,#145369)':'linear-gradient(135deg,#b5322a,#7a1f17)';
    banner.style.color='white';
    document.getElementById('fin-net-lbl').textContent=netPos?'💹 Net Profit':'📉 Net Loss';
    const periodText={'today':"Today",'week':"Last 7 days",'month':"This month",'all':"All time"}[_finPeriod]||'Custom period';
    document.getElementById('fin-net-sub').textContent=periodText+' &nbsp;·&nbsp; Income '+fm(totalInc)+' - Expenses '+fm(totalExp);
    document.getElementById('fin-net-val').textContent=fm(Math.abs(net));
  }

  /* Income breakdown */
  const incGroups=groupBy(income,'source');
  document.getElementById('fin-inc-tot').textContent=fm(totalInc);
  document.getElementById('fin-inc-rows').innerHTML=incGroups.length?incGroups.map(g=>{
    const pct=totalInc>0?Math.round(g.total/totalInc*100):0;
    return`<div style="margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div style="font-size:13px;font-weight:500">${g.label}</div>
        <div style="font-family:var(--fs);font-size:14px;font-weight:700;color:var(--ok)">${fm(g.total)}</div>
      </div>
      <div style="background:var(--iv2);border-radius:99px;height:7px;overflow:hidden;margin-bottom:3px">
        <div style="background:var(--ok);height:100%;border-radius:99px;width:${pct}%;transition:width .4s"></div>
      </div>
      <div style="font-size:11px;color:var(--tx3)">${g.count} transaction${g.count!==1?'s':''} &nbsp;·&nbsp; ${pct}% of income</div>
    </div>`;
  }).join(''):'<div class="nd">No income in this period</div>';

  /* Expenditure breakdown */
  const expGroups=groupBy(expenses,'cat');
  document.getElementById('fin-exp-tot').textContent=fm(totalExp);
  document.getElementById('fin-exp-rows').innerHTML=expGroups.length?expGroups.map(g=>{
    const pct=totalExp>0?Math.round(g.total/totalExp*100):0;
    return`<div style="margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div style="font-size:13px;font-weight:500">${g.label}</div>
        <div style="font-family:var(--fs);font-size:14px;font-weight:700;color:var(--er)">${fm(g.total)}</div>
      </div>
      <div style="background:var(--iv2);border-radius:99px;height:7px;overflow:hidden;margin-bottom:3px">
        <div style="background:var(--er);height:100%;border-radius:99px;width:${pct}%;transition:width .4s"></div>
      </div>
      <div style="font-size:11px;color:var(--tx3)">${g.count} entry${g.count!==1?'s':''} &nbsp;·&nbsp; ${pct}% of expenses</div>
    </div>`;
  }).join(''):'<div class="nd">No expenditure recorded in this period</div>';

  /* ── Daily Summary Table ── */
  // Build a map of date -> {inc, exp, txCount}
  const dayMap={};
  income.forEach(x=>{
    if(!dayMap[x.date])dayMap[x.date]={inc:0,exp:0,tx:0};
    dayMap[x.date].inc+=x.amt;dayMap[x.date].tx++;
  });
  expenses.forEach(x=>{
    if(!dayMap[x.date])dayMap[x.date]={inc:0,exp:0,tx:0};
    dayMap[x.date].exp+=Number(x.amt||0);
  });
  const days=Object.keys(dayMap).sort((a,b)=>b.localeCompare(a));
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  document.getElementById('fin-day-tbody').innerHTML=days.length?days.map((date,i)=>{
    const d=dayMap[date];const net2=d.inc-d.exp;const dow=new Date(date+'T00:00:00');
    return`<tr style="${i%2===0?'background:var(--iv)':''}">
      <td><strong>${fd(date)}</strong></td>
      <td style="color:var(--tx3);font-size:12px">${dayNames[dow.getDay()]}</td>
      <td style="color:var(--ok);font-weight:600">${fm(d.inc)}</td>
      <td style="color:${d.exp>0?'var(--er)':'var(--tx3)'};font-weight:${d.exp>0?'600':'400'}">${d.exp>0?fm(d.exp):'—'}</td>
      <td style="color:${net2>=0?'var(--ok)':'var(--er)'};font-weight:700">${net2>=0?'+':''}${fm(net2)}</td>
      <td><span class="b bt" style="font-size:10.5px">${d.tx} tx</span></td>
    </tr>`;
  }).join(''):'<tr><td colspan="6" class="nd">No transactions in this period</td></tr>';
  // Day totals footer
  const dayTfoot=document.getElementById('fin-day-tfoot');
  if(dayTfoot&&days.length){
    dayTfoot.style.display='';
    document.getElementById('fin-day-tinc').textContent=fm(totalInc);
    document.getElementById('fin-day-texp').textContent=fm(totalExp);
    const tnet=document.getElementById('fin-day-tnet');
    if(tnet){tnet.textContent=fm(Math.abs(net));tnet.style.color=netPos?'var(--ok)':'var(--er)';}
  }else if(dayTfoot){dayTfoot.style.display='none';}
  // Day range label
  const drEl=document.getElementById('fin-day-range');
  if(drEl){drEl.textContent=days.length?days[days.length-1]===days[0]?fd(days[0]):''+fd(days[days.length-1])+' – '+fd(days[0]):'No data';}
  const incCountEl=document.getElementById('fin-inc-count');
  if(incCountEl)incCountEl.textContent=income.length+' transaction'+(income.length!==1?'s':'');
  const expCountEl=document.getElementById('fin-exp-count');
  if(expCountEl)expCountEl.textContent=expenses.length+' entry'+(expenses.length!==1?'s':'');

  /* Income transactions table */
  const incTbody=document.getElementById('fin-inc-tbody');
  if(incTbody)incTbody.innerHTML=income.length?income.map(x=>`<tr>
    <td>${fd(x.date)}</td>
    <td><span class="b bg" style="font-size:10.5px">${x.source}</span></td>
    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x.desc}</td>
    <td style="font-size:12px">${x.method}</td>
    <td style="font-weight:700;color:var(--ok)">${fm(x.amt)}</td>
    <td style="white-space:nowrap">${x._manualId?`<button class="btn btno xs" onclick="editIncome('${x._manualId}')">✏️</button><button class="btn btnd xs" onclick="delRec('manual_income','${x._manualId}',renderFinance)" style="margin-left:3px">🗑</button>`:'<span style="font-size:10px;color:var(--tx3)">auto</span>'}</td>
  </tr>`).join(''):`<tr><td colspan="6" class="nd">No income transactions in this period</td></tr>`;

  /* Expenditure transactions table */
  const expTbody=document.getElementById('fin-exp-tbody');
  if(expTbody)expTbody.innerHTML=expenses.length?expenses.map(e=>`<tr>
    <td>${fd(e.date)}</td>
    <td><span class="b br" style="font-size:10.5px">${e.cat||'Other'}</span></td>
    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.desc||'—'}${e.ref?` <span style="font-size:10.5px;color:var(--tx3)">[${e.ref}]</span>`:''}</td>
    <td style="font-size:12px">${e.m||e.method||'Cash'}</td>
    <td style="font-weight:700;color:var(--er)">${fm(e.amt||e.amount||0)}</td>
    <td>${e.by||'—'}</td>
    <td style="white-space:nowrap">
      <button class="btn btno xs" onclick="editExpense('${e.id}')">✏️</button>
      <button class="btn btnd xs" onclick="delRec('expenses','${e.id}',renderFinance)" style="margin-left:3px">🗑</button>
    </td>
  </tr>`).join(''):`<tr><td colspan="7" class="nd">No expenditure recorded in this period</td></tr>`;
}

function toggleFinTable(which){
  const map={inc:'fin-inc-tbl',exp:'fin-exp-tbl',day:'fin-day-tbl'};
  const el=document.getElementById(map[which]||('fin-'+which+'-tbl'));
  if(el)el.style.display=el.style.display==='none'?'':'none';
}

/* ── PRINT FINANCE REPORT ── */
function printFinReport(){
  const income=collectIncome();
  const expenses=collectExpenses();
  // Build daily map for the report
  const dayMap={};
  income.forEach(x=>{if(!dayMap[x.date])dayMap[x.date]={inc:0,exp:0};dayMap[x.date].inc+=x.amt;});
  expenses.forEach(x=>{if(!dayMap[x.date])dayMap[x.date]={inc:0,exp:0};dayMap[x.date].exp+=Number(x.amt||0);});
  const days=Object.keys(dayMap).sort((a,b)=>b.localeCompare(a));
  const totalInc=income.reduce((s,x)=>s+x.amt,0);
  const totalExp=expenses.reduce((s,x)=>s+Number(x.amt||0),0);
  const net=totalInc-totalExp;
  const periodText={'today':'Today ('+fd(td())+')','week':'Last 7 Days','month':'This Month','all':'All Time'}[_finPeriod]||'Custom Period';
  const incGroups=groupBy(income,'source');
  const expGroups=groupBy(expenses,'cat');
  doPrint(`
    ${hakHdr('INCOME & EXPENDITURE REPORT','',td())}
    <div style="background:#eaf6fb;border-radius:9px;padding:11px;margin-bottom:14px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:12.5px">
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Period</span><strong>${periodText}</strong></div>
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Date Range</span><strong>${V('fin-from')?fd(V('fin-from'))+' – '+fd(V('fin-to')):'All records'}</strong></div>
      <div><span style="color:#5a7a8a;font-size:10px;display:block;text-transform:uppercase">Generated</span><strong>${fd(td())}</strong></div>
    </div>
    <!-- Summary -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:13px">
      <tr style="background:#1d8a5e;color:white"><td style="padding:9px 12px;font-weight:700">Total Income</td><td style="padding:9px 12px;font-weight:700;text-align:right">${fm(totalInc)}</td></tr>
      <tr style="background:#fceeed"><td style="padding:9px 12px;font-weight:700;color:#b5322a">Total Expenditure</td><td style="padding:9px 12px;font-weight:700;color:#b5322a;text-align:right">${fm(totalExp)}</td></tr>
      <tr style="background:${net>=0?'#e6f5ef':'#fceeed'}"><td style="padding:9px 12px;font-weight:700;color:${net>=0?'#1d8a5e':'#b5322a'}">${net>=0?'Net Profit':'Net Loss'}</td><td style="padding:9px 12px;font-weight:700;color:${net>=0?'#1d8a5e':'#b5322a'};text-align:right">${fm(Math.abs(net))}</td></tr>
    </table>
    <!-- Income breakdown -->
    ${incGroups.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px;border-bottom:1px solid #d4eff8;padding-bottom:4px">INCOME BY SOURCE</div>
    <table style="width:100%;border-collapse:collapse;font-size:12.5px">${incGroups.map((g,i)=>`<tr style="${i%2===0?'background:#f8fbfd':''}"><td style="padding:6px 10px">${g.label}</td><td style="padding:6px 10px;text-align:right;font-weight:600;color:#1d8a5e">${fm(g.total)}</td><td style="padding:6px 10px;color:#5a7a8a;font-size:11px">${g.count} tx</td></tr>`).join('')}</table></div>`:''}
    <!-- Expenditure breakdown -->
    ${expGroups.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#b5322a;text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px;border-bottom:1px solid #fceeed;padding-bottom:4px">EXPENDITURE BY CATEGORY</div>
    <table style="width:100%;border-collapse:collapse;font-size:12.5px">${expGroups.map((g,i)=>`<tr style="${i%2===0?'background:#fff8f8':''}"><td style="padding:6px 10px">${g.label}</td><td style="padding:6px 10px;text-align:right;font-weight:600;color:#b5322a">${fm(g.total)}</td><td style="padding:6px 10px;color:#5a7a8a;font-size:11px">${g.count} entry${g.count!==1?'s':''}</td></tr>`).join('')}</table></div>`:''}
    <!-- Expenditure details -->
    ${expenses.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#b5322a;text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px;border-bottom:1px solid #fceeed;padding-bottom:4px">EXPENDITURE DETAIL</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#fceeed"><th style="padding:6px 10px;text-align:left">Date</th><th style="padding:6px 10px;text-align:left">Category</th><th style="padding:6px 10px;text-align:left">Description</th><th style="padding:6px 10px;text-align:right">Amount</th></tr></thead><tbody>${expenses.map((e,i)=>`<tr style="${i%2===0?'background:#fff8f8':''}"><td style="padding:5px 10px">${fd(e.date)}</td><td style="padding:5px 10px">${e.cat}</td><td style="padding:5px 10px">${e.desc}</td><td style="padding:5px 10px;text-align:right;font-weight:600;color:#b5322a">${fm(e.amt)}</td></tr>`).join('')}</tbody></table></div>`:''}
    <!-- Daily Summary -->
    ${days&&days.length?`<div style="margin-bottom:14px"><div style="font-size:10.5px;font-weight:600;color:#1a6b87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px;border-bottom:1px solid #d4eff8;padding-bottom:4px">DAILY BREAKDOWN</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#eaf6fb"><th style="padding:6px 10px;text-align:left">Date</th><th style="padding:6px 10px;text-align:left">Day</th><th style="padding:6px 10px;text-align:right">Income</th><th style="padding:6px 10px;text-align:right">Expenditure</th><th style="padding:6px 10px;text-align:right">Net</th></tr></thead><tbody>${days.slice(0,31).map((date,i)=>{const d=dayMap[date];const net2=d.inc-d.exp;const dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(date+'T00:00:00').getDay()];return`<tr style="${i%2===0?'background:#f8fbfd':''}"><td style="padding:5px 10px">${fd(date)}</td><td style="padding:5px 10px;color:#5a7a8a">${dn}</td><td style="padding:5px 10px;text-align:right;color:#1d8a5e;font-weight:600">${fm(d.inc)}</td><td style="padding:5px 10px;text-align:right;color:${d.exp>0?'#b5322a':'#5a7a8a'}">${d.exp>0?fm(d.exp):'—'}</td><td style="padding:5px 10px;text-align:right;font-weight:700;color:${net2>=0?'#1d8a5e':'#b5322a'}">${net2>=0?'+':''}${fm(net2)}</td></tr>`}).join('')}</tbody></table></div>`:''}
    ${hakFtr()}
  `);
}

/* ── INCOME (MANUAL) CRUD ── */
let _editIncId=null;

function openIncome(){
  _editIncId=null;
  document.getElementById('inc-mtit').textContent='Record Manual Income';
  document.getElementById('inc-sbtn').textContent='Save Income';
  S('inc-d',td());S('inc-amt','');S('inc-desc','');S('inc-by','');S('inc-ref','');
  document.getElementById('inc-cat').selectedIndex=0;
  const incMEl=document.getElementById('inc-m');if(incMEl)incMEl.selectedIndex=0;
  const disp=document.getElementById('inc-amt-disp');if(disp)disp.textContent='UGX 0';
  openOv('ov-inc');
  setTimeout(()=>document.getElementById('inc-amt').focus(),120);
}

function editIncome(id){
  const e=(DB.get('manual_income')||[]).find(x=>x.id===id);if(!e)return;
  _editIncId=id;
  document.getElementById('inc-mtit').textContent='Edit Income Entry';
  document.getElementById('inc-sbtn').textContent='Save Changes';
  S('inc-d',e.date);S('inc-amt',e.amt);S('inc-desc',e.desc);S('inc-by',e.by||'');S('inc-ref',e.ref||'');
  document.getElementById('inc-cat').value=e.cat;
  const incMEl=document.getElementById('inc-m');if(incMEl)incMEl.value=e.m||'Cash';
  const disp=document.getElementById('inc-amt-disp');if(disp)disp.textContent=fm(e.amt);
  openOv('ov-inc');
}

function updIncPreview(){
  const v=parseFloat(V('inc-amt'))||0;
  const disp=document.getElementById('inc-amt-disp');
  if(disp)disp.textContent='UGX '+v.toLocaleString();
}

function saveIncome(addAnother){
  const amt=parseFloat(V('inc-amt'));
  const desc=V('inc-desc').trim();
  if(!amt||amt<=0){toast('Enter a valid amount','error');return;}
  if(!desc){toast('Description is required','error');return;}
  const arr=DB.get('manual_income')||[];
  const entry={
    id:_editIncId||DB.id(),
    date:V('inc-d')||td(),
    amt,
    cat:V('inc-cat'),
    m:V('inc-m')||'Cash',
    desc,
    by:V('inc-by'),
    ref:V('inc-ref')||'',
    _saved:new Date().toISOString()
  };
  if(_editIncId){
    const idx=arr.findIndex(x=>x.id===_editIncId);
    if(idx>-1)arr[idx]=entry;
    toast('Income entry updated','success');
  }else{
    arr.unshift(entry);
    toast('Income recorded — '+fm(amt),'success');
  }
  DB.set('manual_income',arr);_editIncId=null;
  if(addAnother){
    // Keep modal open, reset form for next entry
    S('inc-amt','');S('inc-desc','');S('inc-ref','');
    const disp=document.getElementById('inc-amt-disp');if(disp)disp.textContent='UGX 0';
    setTimeout(()=>document.getElementById('inc-amt').focus(),80);
    renderFinance();
  }else{
    closeOv('ov-inc');renderFinance();
  }
}

/* ── EXPENDITURE CRUD ── */
let _editExpId=null;

function openExpense(){
  _editExpId=null;
  document.getElementById('exp-mtit').textContent='Record Expenditure';
  document.getElementById('exp-sbtn').textContent='Save Expenditure';
  S('exp-d',td());S('exp-amt','');S('exp-desc','');S('exp-by','');S('exp-ref','');
  document.getElementById('exp-cat').selectedIndex=0;
  document.getElementById('exp-m').selectedIndex=0;
  openOv('ov-exp');
  setTimeout(()=>document.getElementById('exp-amt').focus(),120);
}

function editExpense(id){
  const e=(DB.get('expenses')||[]).find(x=>x.id===id);if(!e)return;
  _editExpId=id;
  document.getElementById('exp-mtit').textContent='Edit Expenditure';
  document.getElementById('exp-sbtn').textContent='Save Changes';
  S('exp-d',e.date);S('exp-amt',e.amt);S('exp-desc',e.desc);S('exp-by',e.by||'');S('exp-ref',e.ref||'');
  document.getElementById('exp-cat').value=e.cat;
  document.getElementById('exp-m').value=e.m||'Cash';
  openOv('ov-exp');
}

function saveExpense(){
  const amt=parseFloat(V('exp-amt'));
  const desc=V('exp-desc').trim();
  if(!amt||amt<=0){toast('Enter a valid amount','error');return;}
  if(!desc){toast('Description is required','error');return;}
  const arr=DB.get('expenses')||[];
  const entry={
    id:_editExpId||DB.id(),
    date:V('exp-d')||td(),
    amt,
    cat:V('exp-cat'),
    m:V('exp-m'),
    desc,
    by:V('exp-by'),
    ref:V('exp-ref'),
    _saved:new Date().toISOString()
  };
  if(_editExpId){
    const idx=arr.findIndex(x=>x.id===_editExpId);
    if(idx>-1)arr[idx]=entry;
    toast('Expenditure updated','success');
  }else{
    arr.unshift(entry);
    toast('Expenditure recorded — '+fm(amt),'success');
  }
  DB.set('expenses',arr);_editExpId=null;
  closeOv('ov-exp');renderFinance();
}

/* ── INIT: default period ── */

/* ── INIT ── */
(function(){
  try {
    if(window._SERVER_CU){
      CU = window._SERVER_CU;
    } else {
      var s = sessionStorage.getItem('hak_u');
      if(s) CU = JSON.parse(s);
    }
    if(CU){ bootApp(); }
  } catch(e){ console.error('Boot error:', e); }
})();
