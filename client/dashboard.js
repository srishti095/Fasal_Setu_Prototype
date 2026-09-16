const API_BASE=localStorage.getItem('fsApi')||'http://localhost:5000/api';
async function dapi(path,opts={}){
  let token=localStorage.getItem('fsToken');
  let r=await fetch(API_BASE+path,{...opts,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}});
  let d={};try{d=await r.json()}catch{}
  if(!r.ok){
    if(r.status===401||r.status===403){
      console.warn('API returned '+r.status+'. Clearing stale session & re-authenticating...');
      localStorage.removeItem('fsToken');
      localStorage.removeItem('fsUser');
      const targetRole=window.location.pathname.includes('operator')?'OPERATOR':window.location.pathname.includes('logistics')?'LOGISTICS':window.location.pathname.includes('admin')?'ADMIN':'FARMER';
      const freshUser=await ensureDemoAuth(targetRole);
      if(freshUser){
        const freshToken=localStorage.getItem('fsToken');
        const retryR=await fetch(API_BASE+path,{...opts,headers:{'Content-Type':'application/json',Authorization:`Bearer ${freshToken}`}});
        let retryD={};try{retryD=await retryR.json()}catch{}
        if(retryR.ok)return retryD;
        d=retryD;
      }
    }
    throw new Error(d.message||'Request failed');
  }
  return d;
}
const escD=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function currentUser(){return JSON.parse(localStorage.getItem('fsUser')||'null')}
function getLocalDateStr(d = new Date()) {
  const dateObj = (d instanceof Date && !isNaN(d)) ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function initDashboard(role){
  let u = requireRole(role, false);
  if(!u || !localStorage.getItem('fsToken')){
    u = await ensureDemoAuth(role);
  }
  if(!u){
    location.href = 'index.html?login=1';
    return;
  }
  document.querySelectorAll('[data-user-name]').forEach(e=>e.textContent=u.name||u.email);
  document.querySelector('[data-logout]')?.addEventListener('click',logout);
  document.querySelectorAll('.side-link[data-section]').forEach(b=>b.addEventListener('click',()=>showSection(b.dataset.section)));
  
  const params = new URLSearchParams(window.location.search);
  const presetCentreId = params.get('centreId');
  if(presetCentreId){
    window.pendingBookCentreId = presetCentreId;
    showSection('booking');
  }else{
    showSection('overview');
  }
}
function showSection(name){try{document.querySelectorAll('.dash-section').forEach(s=>s.classList.add('hidden'));const target=document.getElementById('section-'+name);if(target)target.classList.remove('hidden');document.querySelectorAll('.side-link[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===name));const dashMain=document.querySelector('.dash-main');if(dashMain)dashMain.scrollTop=0;window.scrollTo({top:0,behavior:'smooth'});const loaders={overview:typeof loadOverview==='function'?loadOverview:null,analytics:typeof loadFarmerAnalytics==='function'?loadFarmerAnalytics:null,profile:()=>{const r=currentUser()?.role;if(r==='OPERATOR')loadOperatorProfile();else if(r==='LOGISTICS')loadTransportProfile();else loadProfile();},centres:typeof loadCentres==='function'?loadCentres:null,adminCentres:typeof loadAdminCentres==='function'?loadAdminCentres:null,booking:typeof loadBooking==='function'?loadBooking:null,bookings:()=>{const r=currentUser()?.role;if(r==='ADMIN'&&typeof loadAdminBookings==='function')loadAdminBookings();else if(typeof loadFarmerBookings==='function')loadFarmerBookings();},myBookings:typeof loadFarmerBookings==='function'?loadFarmerBookings:null,queue:typeof loadQueue==='function'?loadQueue:null,crops:()=>{if(typeof renderFarmerCrops==='function')renderFarmerCrops();if(typeof initGrainQuality==='function')initGrainQuality();},staff:typeof loadOperators==='function'?loadOperators:null,operators:typeof loadOperators==='function'?loadOperators:null,transporters:typeof loadTransporters==='function'?loadTransporters:null,farmers:typeof loadFarmers==='function'?loadFarmers:null,procurement:()=>{const r=currentUser()?.role;if(r==='ADMIN'&&typeof loadAdminProcurement==='function')loadAdminProcurement();else if(typeof loadOperatorProcurement==='function')loadOperatorProcurement();},payments:()=>{const r=currentUser()?.role;if(r==='ADMIN'&&typeof loadAdminPayments==='function')loadAdminPayments();else if(typeof loadFarmerPayments==='function')loadFarmerPayments();},grievances:()=>{const r=currentUser()?.role;if(r==='ADMIN'&&typeof loadAdminGrievances==='function')loadAdminGrievances();else if(typeof loadGrievances==='function')loadGrievances();},reports:()=>{const r=currentUser()?.role;if(r==='ADMIN'&&typeof loadAdminReports==='function')loadAdminReports();else if(r==='LOGISTICS'&&typeof loadTransportReports==='function')loadTransportReports();else if(typeof loadOperatorReports==='function')loadOperatorReports();},audit:typeof loadAdminAuditLogs==='function'?loadAdminAuditLogs:null,operatorQueue:typeof loadOperatorQueue==='function'?loadOperatorQueue:null,quality:typeof loadOperatorQuality==='function'?loadOperatorQuality:null,weighment:typeof loadOperatorWeighment==='function'?loadOperatorWeighment:null,centreStatus:typeof loadOperatorCentreStatus==='function'?loadOperatorCentreStatus:null,trips:typeof loadTransportActive==='function'?loadTransportActive:null,trolley:()=>{const r=currentUser()?.role;if(r==='LOGISTICS'&&typeof loadTransportBookings==='function')loadTransportBookings();else if(typeof loadFarmerTrolley==='function')loadFarmerTrolley();},transportBookings:typeof loadTransportBookings==='function'?loadTransportBookings:null,transportActive:typeof loadTransportActive==='function'?loadTransportActive:null,transportCompleted:typeof loadTransportCompleted==='function'?loadTransportCompleted:null,transportEarnings:typeof loadTransportEarnings==='function'?loadTransportEarnings:null,transportProfile:typeof loadTransportProfile==='function'?loadTransportProfile:null};if(typeof loaders[name]==='function')loaders[name]()}catch(err){console.error('Error switching section to '+name+':',err)}};
window.pendingBookCentreId = null;
window.pendingQueueToken = null;


function selectCentreForBooking(centreId) {
  if (centreId) window.pendingBookCentreId = String(centreId);
  showSection('booking');
}

function showQueueForToken(token) {
  if (token) window.pendingQueueToken = String(token);
  showSection('queue');
}

async function loadOverview(){
  let role = currentUser()?.role;
  if(!role){
    const path = window.location.pathname;
    if(path.includes('operator')) role = 'OPERATOR';
    else if(path.includes('logistics')) role = 'LOGISTICS';
    else if(path.includes('admin')) role = 'ADMIN';
    else role = 'FARMER';
  }
  try{
    const r=role==='FARMER'?await dapi('/farmer/status'):role==='ADMIN'?await dapi('/admin/summary'):role==='OPERATOR'?await dapi('/operator/summary'):await dapi('/logistics/summary');
    const box=document.getElementById('overviewContent');
    if(!box)return;
    if(role==='FARMER'){
      const queues=r.data.queues||(r.data.queue?[r.data.queue]:[]);
      const bookings=r.data.bookings||(r.data.booking?[r.data.booking]:[]);
      const activeBookings=bookings.filter(b=>['BOOKED','CHECKED_IN','WAITING','CALLED'].includes(String(b.status).toUpperCase()));
      const pays=r.data.payments||[];

      box.innerHTML=`<div class="kpis">
        <div class="kpi"><small>Active Bookings</small><strong>${activeBookings.length}</strong></div>
        <div class="kpi"><small>Total Registered</small><strong>${bookings.length}</strong></div>
        <div class="kpi"><small>Current Token</small><strong>${escD(queues[0]?.token||'—')}</strong></div>
        <div class="kpi"><small>Payment Status</small><strong>${escD(pays[0]?.status||'Pending')}</strong></div>
      </div>
      
      <div class="dash-grid">
        <div class="panel" style="grid-column: span 2">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3 style="margin:0;color:var(--green-950)">Your Procurement Journey & Active Tokens</h3>
            <span style="font-size:0.8rem;background:rgba(42,89,69,0.1);color:var(--green-900);padding:4px 10px;border-radius:12px;font-weight:600">${activeBookings.length} Active Slot(s)</span>
          </div>

          ${activeBookings.length ? `<div style="display:flex;flex-direction:column;gap:12px">
            ${activeBookings.map((b, idx) => {
              const matchedQ = queues.find(q => String(q.slotId?._id||q.slotId) === String(b.slotId?._id||b.slotId) || String(q.centreId?._id||q.centreId) === String(b.centreId?._id||b.centreId)) || queues[idx];
              const tokenStr = matchedQ?.token || b.gatePassId || '—';
              const isFirst = idx === 0;
              return `<div class="list-item" style="${isFirst ? 'border: 2px solid var(--green-700); background: rgba(42,89,69,0.03);' : ''} border-radius:14px; padding:16px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
                  <div>
                    ${isFirst ? '<span style="font-size:0.75rem;font-weight:700;letter-spacing:0.5px;color:var(--green-800);background:rgba(42,89,69,0.15);padding:2px 8px;border-radius:6px">NEXT UPCOMING BOOKING</span>' : ''}
                    <h4 style="margin:4px 0 2px 0;font-size:1.1rem;color:var(--green-950)">🏢 ${escD(b.centreId?.name || 'Procurement Centre')}</h4>
                    <p style="margin:0;font-size:0.85rem;color:var(--ink-soft)">📍 ${escD(b.centreId?.location?.district || '')}, ${escD(b.centreId?.location?.state || '')}</p>
                  </div>
                  <span class="status-pill status-active" style="font-weight:700">${escD(b.status)}</span>
                </div>
                
                <div class="metric-row" style="margin-top:10px;padding:10px 14px;background:var(--paper);border-radius:10px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
                  <div class="metric"><small style="font-size:0.7rem;text-transform:uppercase">Token</small><strong style="color:var(--green-900);font-size:0.95rem">🎟️ ${escD(tokenStr)}</strong></div>
                  <div class="metric"><small style="font-size:0.7rem;text-transform:uppercase">Crop & Quantity</small><strong style="font-size:0.95rem">🌾 ${escD(b.cropId?.name||'Crop')} (${b.quantity} qtl)</strong></div>
                  <div class="metric"><small style="font-size:0.7rem;text-transform:uppercase">Slot Time</small><strong style="font-size:0.95rem">⏱️ ${b.slotId?.startTime||'—'}–${b.slotId?.endTime||'—'}</strong></div>
                  <div class="metric"><small style="font-size:0.7rem;text-transform:uppercase">Date</small><strong style="font-size:0.95rem">🗓️ ${b.slotId?.date ? new Date(b.slotId.date).toLocaleDateString('en-IN') : '—'}</strong></div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                  <span style="font-size:0.8rem;color:var(--ink-soft)">Gate Pass ID: <strong>${escD(b.gatePassId || '—')}</strong></span>
                  <button class="btn btn-primary btn-small" onclick="showSection('queue')">Track Live Queue →</button>
                </div>
              </div>`;
            }).join('')}
          </div>` : `<div class="empty" style="padding:24px;text-align:center">No active procurement bookings yet.<br><button class="btn btn-primary btn-small" style="margin-top:12px" onclick="showSection('booking')">+ Book First Slot</button></div>`}
        </div>

        <div class="panel">
          <h3>Quick actions</h3>
          <div class="action-grid">
            <button class="action" onclick="showSection('booking')"><strong>Book Slot</strong><span>Choose centre and time</span></button>
            <button class="action" onclick="showSection('queue')"><strong>Live Queue</strong><span>See your current turn</span></button>
            <button class="action" onclick="showSection('grievances')"><strong>Grievance</strong><span>Report a problem</span></button>
          </div>
        </div>

        <div class="panel" style="margin-top:16px">
          <h3>Important notifications</h3>
          <div id="farmerNotificationList">${(r.data.notifications||[]).slice(0,5).map(n=>`<div class="list-item"><strong>${escD(n.title)}</strong><p>${escD(n.message)}</p><span class="small">${new Date(n.createdAt).toLocaleString('en-IN')}</span></div>`).join('')||'<div class="empty">No notifications yet.</div>'}</div>
          <button class="btn btn-outline btn-small" onclick="markAllFarmerNotifications()">Mark all as read</button>
        </div>
      </div>`;
    }else if(role==='ADMIN'){
      const d = r.data || {};
      box.innerHTML=`<div class="kpis">
        <div class="kpi"><small>Total Farmers</small><strong>${d.farmers||0}</strong></div>
        <div class="kpi"><small>Procurement Centres</small><strong>${d.centres||0}</strong></div>
        <div class="kpi"><small>Active Centre Operators</small><strong>${d.activeOperators||0}</strong></div>
        <div class="kpi"><small>Active Transport Operators</small><strong>${d.activeTransporters||0}</strong></div>
        <div class="kpi"><small>Today's Bookings</small><strong>${d.todayBookings||0}</strong></div>
        <div class="kpi"><small>Today's Completed Procurements</small><strong>${d.todayCompleted||0}</strong></div>
        <div class="kpi"><small>Today's Pending Queue</small><strong>${d.todayPendingQueue||0}</strong></div>
        <div class="kpi"><small>Total Procured Quantity</small><strong>${Number(d.totalProcuredQuantity||0).toFixed(1)} qtl</strong></div>
        <div class="kpi"><small>Total Payment Amount</small><strong>₹${Number(d.totalPaymentAmount||0).toLocaleString('en-IN')}</strong></div>
      </div>
      
      <div class="dash-grid" style="margin-top:16px">
        <div class="panel" style="grid-column: span 2">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3 style="margin:0;color:var(--green-950)">🌾 Crop Procurement Throughput (Quintals)</h3>
            <span class="status-pill status-active">MongoDB Live Aggregation</span>
          </div>
          <canvas id="adminThroughputChart" style="max-height:240px"></canvas>
        </div>

        <div class="panel">
          <div class="eyebrow">ADMIN QUICK CONTROLS</div>
          <h3 style="margin:4px 0 12px">Officer Workflows</h3>
          <div class="action-grid">
            <button class="action" onclick="showSection('adminCentres')"><strong>Procurement Centres</strong><span>Manage mandi capacity</span></button>
            <button class="action" onclick="showSection('operators')"><strong>Operator Registration</strong><span>Assign centre operators</span></button>
            <button class="action" onclick="showSection('transporters')"><strong>Transport Registration</strong><span>Manage trolley transporters</span></button>
            <button class="action" onclick="showSection('farmers')"><strong>Farmer Registry</strong><span>View registered farmers</span></button>
            <button class="action" onclick="showSection('grievances')"><strong>Grievance Queue</strong><span>Resolve farmer issues</span></button>
            <button class="action" onclick="showSection('payments')"><strong>Payment Monitoring</strong><span>Track PFMS settlements</span></button>
            <button class="action" onclick="showSection('audit')"><strong>Audit Logs</strong><span>View admin actions</span></button>
          </div>
        </div>

        <div class="panel" style="grid-column: span 3; margin-top:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3 style="margin:0;color:var(--green-950)">🏢 connected Mandi Centres Operational Status</h3>
            <span class="status-pill status-active">Live Status</span>
          </div>
          <div id="adminCentersOverviewTable" class="table-wrap"><div class="small">Loading centre analytics…</div></div>
        </div>
      </div>`;
      renderAdminAnalytics(d);
    }
else if(role==='OPERATOR'){
      loadOperatorCentreHeader();
      const s = r.data || {};
      if(s.centre){
        const title=document.getElementById('headerCentreTitle');
        const meta=document.getElementById('headerCentreMeta');
        if(title)title.textContent=`🏢 ${s.centre.name||'Karnal Mandi Yard 2'}`;
        if(meta)meta.textContent=`Code: ${s.centre.centreCode||'HR-KNL-002'} · District: ${s.centre.district||'Karnal'}, ${s.centre.state||'Haryana'} · Status: ${s.status||'ACTIVE'}`;
      }
      box.innerHTML=`<div class="kpis">
        <div class="kpi"><small>Today's Total Queue</small><strong>${s.queue||0}</strong></div>
        <div class="kpi"><small>Checked In at Gate</small><strong>${s.checkedIn||0}</strong></div>
        <div class="kpi"><small>Completed</small><strong>${s.completed||0}</strong></div>
        <div class="kpi"><small>Total Procured</small><strong>${Number(s.procuredQuantityQtl||0).toFixed(1)} qtl</strong></div>
        <div class="kpi"><small>Payments Initiated</small><strong>₹${Number(s.procurementValue||0).toLocaleString('en-IN')}</strong></div>
        <div class="kpi"><small>Centre Operational Status</small><strong class="status-pill status-active">${escD(s.status||'ACTIVE')}</strong></div>
      </div>
      
      <div class="dash-grid" style="margin-top:16px">
        <div class="panel">
          <div class="eyebrow">CENTRE CONTROL PANEL</div>
          <h3 style="margin:4px 0 12px">Fast Operator Workflows</h3>
          <div class="action-grid">
            <button class="action" onclick="showSection('checkin')"><strong>1. Gate Check-in</strong><span>Scan QR or token</span></button>
            <button class="action" onclick="showSection('quality')"><strong>2. 5-Image AI Quality</strong><span>Multi-photo grading</span></button>
            <button class="action" onclick="showSection('weighment')"><strong>3. Digital Weighbridge</strong><span>Gross - Tare = Net weight</span></button>
            <button class="action" onclick="showSection('procurement')"><strong>4. Confirm & Pay</strong><span>Initiate PFMS settlement</span></button>
            <button class="action" onclick="showSection('operatorQueue')"><strong>Live Queue</strong><span>Manage all tokens</span></button>
            <button class="action" onclick="showSection('centreStatus')"><strong>Centre Settings</strong><span>Capacity & pause status</span></button>
          </div>
        </div>

        <div class="panel">
          <div class="eyebrow">ASSIGNED MANDI DETAILS</div>
          <h3 style="margin:4px 0 12px" id="overviewCentreName">Mandi Metadata</h3>
          <div id="overviewCentreDetails" class="small">Loading centre info...</div>
        </div>
      </div>`;
      loadOperatorCentreOverviewDetails();
    }else{
      box.innerHTML=`<div class="kpis"><div class="kpi"><small>New booking requests</small><strong>${r.data.requests||0}</strong></div><div class="kpi"><small>Active rides</small><strong>${r.data.active||0}</strong></div><div class="kpi"><small>Completed</small><strong>${r.data.completed||0}</strong></div><div class="kpi"><small>Total earned</small><strong>₹${Number(r.data.earnings||0).toLocaleString('en-IN')}</strong></div></div><div class="dash-grid"><div class="panel"><h3>Transport control centre</h3><p>Accept farmer trolley requests, start the route, mark pickup, track the load and complete the ride.</p><div class="action-grid"><button class="action" onclick="showSection('transportBookings')"><strong>Booking requests</strong><span>Review and accept farmer requests</span></button><button class="action" onclick="showSection('transportActive')"><strong>Active rides</strong><span>Update the current journey</span></button><button class="action" onclick="showSection('transportEarnings')"><strong>Earnings</strong><span>View completed trip earnings</span></button></div></div><div class="panel"><h3>Vehicle status</h3><p>Your vehicle and fare are controlled by the Admin listing.</p><button class="btn btn-outline btn-small" onclick="showSection('transportProfile')">View vehicle profile</button></div></div>`;
    }
  }catch(e){
    document.getElementById('overviewContent').innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

function renderAdminAnalytics(summary){
  try {
    if (window.Chart) {
      const common = {
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: 'rgba(32,38,31,0.08)' } }, x: { grid: { display: false } } }
      };

      const crops = (summary.cropThroughput && summary.cropThroughput.length) ? summary.cropThroughput : [];
      const labels = crops.length ? crops.map(c => c.crop) : ['Wheat', 'Mustard', 'Paddy', 'Bajra'];
      const data = crops.length ? crops.map(c => c.quantity) : [0, 0, 0, 0];

      const canvas = document.getElementById('adminThroughputChart');
      if (canvas) {
        if (window.__adminChart) window.__adminChart.destroy();
        window.__adminChart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Procured (Quintals)',
              data,
              backgroundColor: '#EDA335',
              borderRadius: 6,
              maxBarThickness: 45
            }]
          },
          options: common
        });
      }
    }
  } catch (e) {
    console.error('Error rendering admin analytics chart:', e);
  }
  loadAdminAnalyticsCentres();
}

async function loadAdminAnalyticsCentres(){
  const box=document.getElementById('adminCentersOverviewTable');
  if(!box)return;
  try{
    const r=await dapi('/admin/centres');
    const rows=(r.data||[]);
    box.innerHTML=rows.length?`<table><thead><tr><th>Code</th><th>Center Name</th><th>State / District</th><th>Daily Capacity</th><th>Counters</th><th>Live Queue</th><th>Avg Wait</th><th>Status</th></tr></thead><tbody>${rows.map(c=>{
      const q=Number(c.liveQueue||0);
      const cap=Number(c.capacity?.daily||500);
      const wait=Number(c.estimatedWait||0);
      return `<tr><td><code>${escD(c.centreCode)}</code></td><td><strong>${escD(c.name)}</strong></td><td>${escD(c.location?.district||'—')}, ${escD(c.location?.state||'—')}</td><td>${cap} qtl</td><td>${c.capacity?.counters||1}</td><td><strong>${q}</strong> Token(s)</td><td>${wait} min</td><td><span class="status-pill ${c.status==='ACTIVE'?'status-active':'status-warn'}">${escD(c.status)}</span></td></tr>`;
    }).join('')}</tbody></table>`:'<div class="empty">No procurement centres found in database.</div>';
  }catch(e){
    box.innerHTML='<div class="notice">Centre analytics could not be loaded.</div>';
  }
}
async function loadFarmerAnalytics(){
 const box=document.getElementById('farmerAnalyticsContent');if(!box)return;
 box.innerHTML='<div class="empty">Loading your analytics…</div>';
 try{
   const [p,s]=await Promise.all([dapi('/farmer/profile'),dapi('/farmer/status')]);
   const f=p.data||{}, d=s.data||{}, crops=f.crops||[], pays=d.payments||[], bookings=d.bookings||(d.booking?[d.booking]:[]);
   const cropQty=crops.reduce((sum,c)=>sum+Number(c.quantity||c.expectedQuantity||0),0);
   const paid=pays.filter(x=>String(x.status||'').toUpperCase()==='PAID').length;
   const paymentTotal=pays.reduce((sum,x)=>sum+Number(x.amount||0),0);
   const bookingStatus=bookings[0]?.status||'No booking';
   box.innerHTML=`<div class="farmer-analytics-grid">
     <div class="farmer-analytics-card card"><small>Registered crops</small><strong>${crops.length}</strong><span>${cropQty?cropQty.toLocaleString('en-IN')+' qtl recorded':'Add crops from My Crops'}</span></div>
     <div class="farmer-analytics-card card"><small>Active Bookings</small><strong>${bookings.length}</strong><span>${escD(bookings[0]?.centreId?.name||'No active centre')}</span></div>
     <div class="farmer-analytics-card card"><small>Payment records</small><strong>${pays.length}</strong><span>${paid} marked paid${paymentTotal?' · ₹'+paymentTotal.toLocaleString('en-IN')+' total':''}</span></div>
     <div class="farmer-analytics-card card"><small>Current queue</small><strong>${d.queue?.position?Math.max(0,d.queue.position-1):0}</strong><span>${d.queue?.estimatedWait||0} min estimated wait</span></div>
   </div>
   <div class="farmer-analytics-panel card">
     <div><div class="eyebrow">YOUR JOURNEY</div><h3 style="margin:4px 0 6px">Procurement progress</h3><p class="small">A quick view of where your latest procurement currently stands.</p></div>
     <div class="farmer-progress"><div><span>Booking</span><b>${d.booking?'Done':'Pending'}</b></div><div class="progress-track"><i style="width:${d.booking?25:0}%"></i></div>
     <div><span>Queue / Check-in</span><b>${d.queue?.status||'Pending'}</b></div><div class="progress-track"><i style="width:${d.queue?50:25}%"></i></div>
     <div><span>Procurement</span><b>${d.procurement?.status||'Pending'}</b></div><div class="progress-track"><i style="width:${d.procurement?75:50}%"></i></div>
     <div><span>Payment</span><b>${pays[0]?.status||'Pending'}</b></div><div class="progress-track"><i style="width:${paid?100:75}%"></i></div></div>
   </div>`;
 }catch(e){box.innerHTML=`<div class="notice">${escD(e.message)}</div>`}
}
async function loadProfile(){
  const box=document.getElementById('profileContent');
  if(!box)return;
  const user = currentUser() || {};
  if(user.role === 'ADMIN'){
    box.innerHTML=`<div class="card">
      <div class="eyebrow">ADMINISTRATOR OFFICER PROFILE</div>
      <h3 style="margin:4px 0 16px 0;color:var(--green-950)">👤 Authorised Officer Account Details</h3>
      <div class="form-grid">
        <div><label>Full Name</label><div style="font-weight:700;font-size:1.05rem;color:var(--green-950)">${escD(user.name || 'System Administrator')}</div></div>
        <div><label>Email Address</label><div style="font-weight:700;font-size:1.05rem;color:var(--green-950)">${escD(user.email || 'admin@fasalsetu.gov.in')}</div></div>
        <div><label>Mobile Number</label><div style="font-weight:700;font-size:1.05rem;color:var(--green-950)">${escD(user.phone || '+91-9876543210')}</div></div>
        <div><label>System Role</label><div><span class="status-pill status-active">ADMIN / OFFICER</span></div></div>
        <div><label>Department / Authority</label><div style="font-weight:600;color:var(--ink-soft)">Ministry of Agriculture & Farmers Welfare</div></div>
        <div><label>Verification Status</label><div><span class="status-pill status-active">AUTHENTICATED & VERIFIED</span></div></div>
        <div><label>Access Level</label><div style="font-weight:600;color:var(--ink-soft)">Super Admin / District Procurement Officer</div></div>
        <div><label>Account ID</label><div style="font-family:monospace;font-size:0.9rem">${escD(user.id || user._id || 'ADMIN-OFFICER-001')}</div></div>
      </div>
    </div>`;
    return;
  }
  try{
    const r=await dapi('/farmer/profile');
    const f=r.data;
    box.innerHTML=`<div class="card"><div class="form-grid"><div><label>Name</label><div>${escD(f.user?.name)}</div></div><div><label>Email</label><div>${escD(f.user?.email)}</div></div><div><label>Mobile</label><div>${escD(f.user?.phone)}</div></div><div><label>Farmer ID</label><div>${escD(f.farmerId)}</div></div><div><label>State</label><div>${escD(f.address?.state)}</div></div><div><label>District</label><div>${escD(f.address?.district)}</div></div><div><label>Village</label><div>${escD(f.address?.village)}</div></div><div><label>Verification</label><div>${escD(f.verification?.identityStatus||'PENDING')}</div></div></div></div>`;
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}
async function loadCentres(){
 const box=document.getElementById('centresContent');if(!box)return;
 box.innerHTML=`<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Find the nearest procurement centre</h3><p class="small">Use your location to rank nearby centres by distance. The browser will ask for location permission.</p></div><button class="btn btn-primary btn-small" id="useMyLocationBtn">Use my location</button></div><div class="form-grid" style="margin-top:14px"><div><label>Search centre, district or state</label><input id="farmerCentreSearch" placeholder="e.g. Karnal, Punjab, Narela"></div><div><label>Maximum distance</label><select id="farmerCentreRadius"><option value="50">50 km</option><option value="100" selected>100 km</option><option value="250">250 km</option><option value="500">500 km</option><option value="5000">All India</option></select></div></div><div id="nearestCentreCard" style="margin-top:16px"></div><div id="farmerCentreList" class="list" style="margin-top:14px"><div class="small">Loading centres…</div></div></div>`;
 let coords=null;
 const render=async()=>{try{const q=document.getElementById('farmerCentreSearch')?.value.trim()||'',radius=document.getElementById('farmerCentreRadius')?.value||100;let url='/public/centres?status=ACTIVE';if(q)url+='&q='+encodeURIComponent(q);let r;if(coords){r=await dapi('/public/centres/nearby?lat='+coords.lat+'&lng='+coords.lng+'&radiusKm='+radius+'&limit=50');let arr=(r.data?.centres||[]);if(q)arr=arr.filter(c=>[c.name,c.location?.district,c.location?.state,c.centreCode].join(' ').toLowerCase().includes(q.toLowerCase()));r={data:arr}}else r=await dapi(url);const rows=r.data||[];const nearest=rows[0];const nbox=document.getElementById('nearestCentreCard');if(nearest){nbox.innerHTML=`<div class="panel" style="border:2px solid var(--green-700)"><div class="eyebrow">${coords?'NEAREST TO YOUR LOCATION':'CENTRE SEARCH RESULTS'}</div><h3 style="margin:4px 0">${escD(nearest.name)}</h3><p>${escD(nearest.location?.district)}, ${escD(nearest.location?.state)} · ${coords?escD(nearest.distanceKm)+' km away':'Location permission not enabled'}</p><div class="metric-row"><div class="metric"><small>Queue</small><strong>${Number(nearest.liveQueue||0)}</strong></div><div class="metric"><small>Estimated wait</small><strong>${Number(nearest.estimatedWait||0)} min</strong></div><div class="metric"><small>Status</small><strong>${escD(nearest.status)}</strong></div></div><button class="btn btn-primary btn-small" onclick="selectCentreForBooking('${nearest._id}')">Choose nearest centre</button></div>`}else nbox.innerHTML='<div class="empty">No centre found in the selected range.</div>';
document.getElementById('farmerCentreList').innerHTML=rows.length?rows.map(c=>`<div class="list-item"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><strong>${escD(c.name)}</strong><p>${escD(c.location?.district)}, ${escD(c.location?.state)} · ${escD(c.location?.address||'')}</p></div><strong>${c.distanceKm!=null?escD(c.distanceKm)+' km':''}</strong></div><div class="metric-row"><div class="metric"><small>Live queue</small><strong>${Number(c.liveQueue||0)}</strong></div><div class="metric"><small>Wait</small><strong>${Number(c.estimatedWait||0)} min</strong></div><div class="metric"><small>Daily capacity</small><strong>${Number(c.capacity?.daily||0)} qtl</strong></div></div><button class="btn btn-outline btn-small" onclick="selectCentreForBooking('${c._id}')">Book here</button></div>`).join(''):'<div class="empty">No procurement centres match your search.</div>';
 }catch(e){document.getElementById('farmerCentreList').innerHTML=`<div class="notice">${escD(e.message)}</div>`}};
 document.getElementById('useMyLocationBtn')?.addEventListener('click',()=>{if(!navigator.geolocation){alert('Geolocation is not supported by this browser.');return}navigator.geolocation.getCurrentPosition(p=>{coords={lat:p.coords.latitude,lng:p.coords.longitude};render()},()=>alert('Location permission was denied. You can still search by state, district or centre name.'),{enableHighAccuracy:true,timeout:10000,maximumAge:60000})});
 document.getElementById('farmerCentreSearch')?.addEventListener('input',render);document.getElementById('farmerCentreRadius')?.addEventListener('change',render);await render();
}

async function loadBooking(presetCentreId){
  const box=document.getElementById('bookingContent');
  const targetId = presetCentreId || window.pendingBookCentreId || null;
  try{
    const todayStr = getLocalDateStr();
    const [crops,centres]=await Promise.all([dapi('/public/crops'),dapi('/public/centres')]);
    
    box.innerHTML=`<form id="bookForm" class="card form-stack">
      <div><label>Procurement centre</label><select id="bookCentre" required>${centres.data.map(c=>`<option value="${c._id||c.id}">${escD(c.name)} — ${escD(c.location?.district)}</option>`).join('')}</select></div>
      <div><label>Crop</label><select id="bookCrop" required>${crops.data.map(c=>`<option value="${c._id||c.id}">${escD(c.name)}</option>`).join('')}</select></div>
      <div><label>Quantity (quintals)</label><input id="bookQty" type="number" min="0.01" step="0.01" placeholder="e.g. 50" required></div>
      <div><label>Date</label><input id="bookDate" type="date" value="${todayStr}" min="${todayStr}" required></div>
      <div><label>Available Slots for Selected Date</label><select id="bookSlot" required><option value="">Loading slots…</option></select></div>
      <div><button class="btn btn-outline btn-small" type="button" id="recommendSlotBtn">✨ Find Best Slot For Me</button><div id="slotRecommendation" class="small" style="margin-top:10px"></div></div>
      <button class="btn btn-primary" style="margin-top:10px">Confirm Slot Booking</button>
      <div id="bookMsg" style="margin-top:10px"></div>
    </form>`;

    const centreSelect = document.getElementById('bookCentre');
    const dateInput = document.getElementById('bookDate');
    const slotSelect = document.getElementById('bookSlot');

    if (targetId) {
      const targetStr = String(targetId).trim().toLowerCase();
      const matchOpt = Array.from(centreSelect.options).find(opt => 
        String(opt.value).trim().toLowerCase() === targetStr ||
        opt.text.toLowerCase().includes(targetStr)
      );
      if (matchOpt) {
        centreSelect.value = matchOpt.value;
      }
      window.pendingBookCentreId = null;
    }

    const loadSlots = async() => {
      const cId = centreSelect.value;
      const dVal = dateInput.value;
      if (!cId) return;
      slotSelect.innerHTML = '<option value="">Fetching date-specific slots…</option>';
      try {
        const url = `/public/centres/${cId}/slots` + (dVal ? `?date=${dVal}` : '');
        const r = await dapi(url);
        let slotList = r.data || [];
        if (dVal) {
          slotList = slotList.filter(s => getLocalDateStr(s.date) === dVal);
        }
        if (!slotList.length) {
          slotSelect.innerHTML = `<option value="" disabled>No slots available on this date (${dVal}). Please select another date.</option>`;
          return;
        }
        slotSelect.innerHTML = slotList.map(s => {
          const isFull = s.isFull || s.booked >= s.capacity || s.remaining <= 0;
          const label = `${new Date(s.date).toLocaleDateString('en-IN')} · ${s.startTime}–${s.endTime} · ${isFull ? '🔴 FULL (0 left)' : `🟢 ${s.remaining} spots left`}`;
          return `<option value="${s._id}" ${isFull ? 'disabled style="color:#b00"' : ''}>${label}</option>`;
        }).join('');
      } catch(x) {
        slotSelect.innerHTML = `<option value="" disabled>Error loading slots: ${escD(x.message)}</option>`;
      }
    };

    centreSelect.addEventListener('change', loadSlots);
    dateInput.addEventListener('change', loadSlots);

    document.getElementById('bookForm').addEventListener('submit', async e => {
      e.preventDefault();
      try {
        const r = await dapi('/farmer/bookings', {
          method: 'POST',
          body: JSON.stringify({
            centreId: centreSelect.value,
            cropId: document.getElementById('bookCrop').value,
            quantity: Number(document.getElementById('bookQty').value),
            slotId: slotSelect.value
          })
        });
        document.getElementById('bookMsg').innerHTML = `<div class="success">Slot confirmed! Your token is <strong>${escD(r.data.queue.token)}</strong>. Gate Pass ID: <strong>${escD(r.data.booking.gatePassId)}</strong>.</div>`;
        await loadSlots();
      } catch(x) {
        document.getElementById('bookMsg').innerHTML = `<div class="error">${escD(x.message)}</div>`;
      }
    });

    document.getElementById('recommendSlotBtn').addEventListener('click', async () => {
      const out = document.getElementById('slotRecommendation');
      const cropName = document.getElementById('bookCrop').options[document.getElementById('bookCrop').selectedIndex]?.text;
      const cId = centreSelect.value;
      const dVal = dateInput.value;
      out.innerHTML = '<span style="color:var(--green-900)">Calculating best available slot based on capacity and timing…</span>';

      try {
        let url = `/public/recommended-slots?centreId=${cId}&crop=${encodeURIComponent(cropName||'')}`;
        if (dVal) url += `&date=${dVal}`;
        
        const r = await dapi(url);
        const list = r.data?.recommended || [];
        if (!list.length) {
          out.innerHTML = '<div class="notice">No open slot recommendation found for the current selection.</div>';
          return;
        }

        const best = list[0];
        if (best.centre?._id) centreSelect.value = best.centre._id;
        if (best.slot?.date) dateInput.value = getLocalDateStr(best.slot.date);
        
        await loadSlots();
        
        if (best.slot?._id) slotSelect.value = best.slot._id;

        out.innerHTML = `<div class="success" style="padding:10px 14px;border-radius:10px;margin-top:6px">
          <strong>✨ Best Recommended Slot Auto-Selected:</strong><br>
          🏢 <strong>${escD(best.centre?.name)}</strong><br>
          🗓️ <strong>${new Date(best.slot.date).toLocaleDateString('en-IN')}</strong> (${escD(best.slot.startTime)}–${escD(best.slot.endTime)})<br>
          🟢 <strong>${best.remaining} spots available</strong> · ~${best.estimatedWait} min est. wait
        </div>`;
      } catch(e) {
        out.innerHTML = `<div class="error">${escD(e.message)}</div>`;
      }
    });

    await loadSlots();
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

async function selectRecommendedSlot(centreId,slotId){const c=document.getElementById('bookCentre');if(!c)return;c.value=centreId;await (async()=>{const r=await dapi('/public/centres/'+centreId+'/slots');document.getElementById('bookSlot').innerHTML=r.data.map(s=>`<option value="${s._id}">${new Date(s.date).toLocaleDateString('en-IN')} · ${s.startTime}–${s.endTime} · ${s.capacity-s.booked} left</option>`).join('')||'<option value="">No slots</option>'})();document.getElementById('bookSlot').value=slotId;document.getElementById('slotRecommendation').innerHTML='<div class="success">Recommended centre and slot selected.</div>'}

async function loadQueue(targetToken){
  const box=document.getElementById('queueContent');
  try{
    const r=await dapi('/farmer/status');
    const queues=r.data.queues||(r.data.queue?[r.data.queue]:[]);
    if(!queues.length){
      box.innerHTML='<div class="empty">No active queue yet. Book a slot first.</div>';
      return;
    }
    const tokenToFind = targetToken || window.pendingQueueToken || queues[0]?.token || queues[0]?._id;
    window.pendingQueueToken = null;
    
    let activeQ = queues.find(q => String(q.token) === String(tokenToFind) || String(q._id) === String(tokenToFind) || String(q.bookingId) === String(tokenToFind) || String(q.gatePassId) === String(tokenToFind)) || queues[0];

    box.innerHTML=`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div class="eyebrow" style="margin:0">LIVE QUEUE & TOKEN STATUS</div>
        ${queues.length > 1 ? `<div style="display:flex;gap:8px;flex-wrap:wrap">
          ${queues.map(q => `<button type="button" class="btn btn-small ${q.token === activeQ.token ? 'btn-primary' : 'btn-outline'}" onclick="showQueueForToken('${q.token}')">Token: ${escD(q.token)}</button>`).join('')}
        </div>` : ''}
      </div>
      <div class="token" style="font-size:2.5rem;font-weight:800;color:var(--green-900);letter-spacing:1px;margin:8px 0">${escD(activeQ.token)}</div>
      <p style="font-size:1.1rem;font-weight:700;color:var(--green-950);margin:0 0 16px 0">🏢 ${escD(activeQ.centreId?.name || 'Procurement Centre')}</p>
      <div class="metric-row" style="margin:16px 0;padding:16px;background:var(--paper);border-radius:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        <div class="metric"><small style="color:var(--ink-soft);font-size:0.75rem;text-transform:uppercase">Position in Queue</small><strong style="font-size:1.4rem;color:var(--green-900)">${activeQ.position}</strong></div>
        <div class="metric"><small style="color:var(--ink-soft);font-size:0.75rem;text-transform:uppercase">Farmers Ahead</small><strong style="font-size:1.4rem;color:var(--gold-dark,#b48312)">${Math.max(0, activeQ.position - 1)}</strong></div>
        <div class="metric"><small style="color:var(--ink-soft);font-size:0.75rem;text-transform:uppercase">Estimated Wait Time</small><strong style="font-size:1.4rem;color:var(--green-950)">⏱️ ${activeQ.estimatedWait || 0} min</strong></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid rgba(0,0,0,0.06)">
        <span>Queue Status: <strong class="status-pill status-active">${escD(activeQ.status)}</strong></span>
        <button type="button" class="btn btn-outline btn-small" onclick="loadQueue('${activeQ.token}')">🔄 Refresh Live Queue</button>
      </div>
    </div>`;
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

async function renderFarmerCrops(){
  const list=document.getElementById('cropList');
  if(!list)return;
  list.innerHTML='<div class="empty">Loading your registered crops from MongoDB…</div>';
  try{
    const r=await dapi('/farmer/crops');
    const crops=r.data||[];
    window.farmerCropsData = crops;
    list.innerHTML=crops.length?crops.map(c=>{
      const qc = c.latestQualityCheck && c.latestQualityCheck.checkedAt ? c.latestQualityCheck : null;
      const cropNameStr = escD(c.cropName||c.cropId?.name||'Crop');
      const gradePillLabel = qc ? escD(qc.grade || qc.result || 'Grade A') : 'Ungraded';
      const isPassGrade = qc && (qc.grade?.includes('Grade A') || qc.grade?.includes('FAQ') || qc.result === 'PASS');

      return `<div class="crop-card card">
        <div class="crop-card-header">
          <div>
            <h4 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--green-950)">🌾 ${cropNameStr}</h4>
            <span style="font-size:0.75rem;color:var(--ink-soft);margin-top:2px;display:block">Season: <strong>${escD(c.season||'Kharif')}</strong></span>
          </div>
          <span class="status-pill ${isPassGrade ? 'status-active' : 'status-warn'}" style="font-weight:700">${gradePillLabel}</span>
        </div>
        <div class="crop-card-body">
          <div>Expected Quantity: <strong style="color:var(--green-900);font-size:1rem">${c.expectedQuantity} qtl</strong></div>
          <div>Cultivated Land: <strong>${c.cultivatedArea||0} acres</strong></div>
          <div>Status: <span style="font-weight:600;color:var(--green-800)">${escD(c.status||'REGISTERED')}</span></div>
          
          ${qc ? `
            <div style="margin-top:12px; padding:10px 14px; background:rgba(42,89,69,0.06); border-radius:10px; border:1px solid rgba(42,89,69,0.2)">
              <div style="display:flex; justify-content:space-between; align-items:center">
                <span style="font-weight:700; font-size:0.85rem; color:var(--green-950)">🤖 Latest AI Quality Check</span>
                <span class="status-pill ${isPassGrade ? 'status-active' : 'status-warn'}" style="font-weight:700">${escD(qc.grade || qc.result || 'Grade A')}</span>
              </div>
              <div style="font-size:0.8rem; color:var(--ink-soft); margin:6px 0 10px 0">
                Confidence: <strong>${qc.confidence || 90}%</strong> · Checked: <strong>${new Date(qc.checkedAt).toLocaleDateString('en-IN')}</strong>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap">
                <button type="button" class="btn btn-primary btn-small" onclick="selectCropForQualityCheck('${c._id}')">👁️ View Result</button>
                <button type="button" class="btn btn-outline btn-small" onclick="selectCropForQualityCheck('${c._id}')">🔄 Re-Check Quality</button>
              </div>
            </div>
          ` : `
            <div style="margin-top:12px; padding:10px 14px; background:var(--paper); border-radius:10px; border:1px dashed rgba(0,0,0,0.15)">
              <div style="font-size:0.82rem; color:var(--ink-soft); margin-bottom:8px">No AI Quality Check performed yet.</div>
              <button type="button" class="btn btn-primary btn-small" onclick="selectCropForQualityCheck('${c._id}')">🤖 AI Grain Quality Check</button>
            </div>
          `}
        </div>
        <div class="crop-card-footer" style="margin-top:10px">
          <button class="btn btn-outline btn-small" style="color:#c6503e;border-color:rgba(198,80,62,0.3)" onclick="deleteFarmerCrop('${c._id}')">🗑️ Delete Crop</button>
        </div>
      </div>`;
    }).join(''):'<div class="empty">No crops registered in your profile yet. Use the form above to record your crop details.</div>';

    renderFarmerQualitySection();
  }catch(e){
    list.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

window.farmerQualitySectionState = {
  cropId: null,
  cropName: null,
  photos: []
};

function selectCropForQualityCheck(cropId) {
  const crops = window.farmerCropsData || [];
  const found = crops.find(c => String(c._id) === String(cropId));
  if (found) {
    window.farmerQualitySectionState = {
      cropId: found._id,
      cropName: found.cropName || found.cropId?.name || 'Crop',
      photos: []
    };
    renderFarmerQualitySection();
    document.getElementById('farmerQualityCheckSection')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function onFarmerQualityCropChange(cropId) {
  selectCropForQualityCheck(cropId);
}

function renderFarmerQualitySection() {
  const container = document.getElementById('farmerQualitySectionContent');
  if (!container) return;

  const crops = window.farmerCropsData || [];
  if (!crops.length) {
    container.innerHTML = `<div class="notice" style="background:var(--paper); color:var(--ink-soft)">No registered crops found in your account. Please record your crop details above to run an AI Quality Check.</div>`;
    return;
  }

  let state = window.farmerQualitySectionState;
  let activeCrop = crops.find(c => String(c._id) === String(state.cropId)) || crops[0];
  state.cropId = activeCrop._id;
  state.cropName = activeCrop.cropName || activeCrop.cropId?.name || 'Crop';

  const photoCount = state.photos.length;
  const isReady = photoCount >= 5;
  const suggestedAngles = ['Top View', 'Side View', 'Close-Up', 'Wide Angle', 'Grain Spread'];

  const hasRealQc = activeCrop.latestQualityCheck && activeCrop.latestQualityCheck.checkedAt && (activeCrop.latestQualityCheck.imageCount >= 5 || activeCrop.latestQualityCheck.confidence);

  container.innerHTML = `
    <!-- Crop selection & Upload instructions bar -->
    <div style="background:var(--paper,#f6f8f6); padding:14px; border-radius:12px; border:1px solid rgba(42,89,69,0.15); margin-bottom:16px">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px">
        <div style="flex:1; min-width:240px">
          <label style="font-size:0.75rem; text-transform:uppercase; color:var(--ink-soft); font-weight:700; display:block; margin-bottom:4px">Select Registered Crop to Inspect</label>
          <select id="farmerQualityCropSelect" onchange="onFarmerQualityCropChange(this.value)" style="font-size:1.05rem; font-weight:700; color:var(--green-950); padding:6px 12px; border-radius:8px; border:1px solid #b5c7bc; width:100%">
            ${crops.map(c => {
              const name = escD(c.cropName || c.cropId?.name || 'Crop');
              const isSel = String(c._id) === String(activeCrop._id);
              const hasQcPill = c.latestQualityCheck && c.latestQualityCheck.checkedAt ? ' (Passed AI Check)' : ' (Not Checked)';
              return `<option value="${c._id}" ${isSel ? 'selected' : ''}>🌾 ${name} (${c.expectedQuantity} qtl · ${c.season || 'Kharif'})${hasQcPill}</option>`;
            }).join('')}
          </select>
        </div>
        <div style="text-align:right">
          <span class="status-pill ${isReady ? 'status-active' : 'status-warn'}" style="font-size:0.85rem">
            Images uploaded: <strong>${photoCount} / 5</strong>
          </span>
        </div>
      </div>
      <p style="font-size:0.85rem; color:var(--ink-soft); margin:12px 0 0 0; line-height:1.4">
        📌 <strong>Instructions:</strong> Upload at least <strong>5 clear images</strong> of <strong>${escD(state.cropName)}</strong> from different angles (top view, side view, close-up, spread view) for an accurate quality assessment.
      </p>
    </div>

    <!-- Upload Header & Actions -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px">
      <h4 style="margin:0; color:var(--green-950); font-size:1.05rem">📸 Grain Sample Photos (${state.cropName})</h4>
      <div>
        <input type="file" id="farmerQualityFileInput" accept="image/*" multiple style="display:none" onchange="handleFarmerQualityPhotoAdd(this)">
        <button type="button" class="btn btn-outline btn-small" onclick="document.getElementById('farmerQualityFileInput').click()">
          ➕ Add Photos (Multi-select)
        </button>
      </div>
    </div>

    <!-- 5 Photo Slots Grid -->
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(115px, 1fr)); gap:12px; margin-bottom:18px">
      ${[0, 1, 2, 3, 4].map(idx => {
        const item = state.photos[idx];
        const angleLabel = suggestedAngles[idx] || `Angle ${idx + 1}`;
        if (item) {
          return `
            <div style="border: 1px solid var(--green-700,#2a5945); border-radius: 10px; padding: 8px; text-align: center; background: #fff; box-shadow:0 2px 6px rgba(0,0,0,0.05)">
              <div style="font-size: 0.75rem; font-weight:700; color:var(--green-900); margin-bottom:4px">
                Image ${idx + 1}
              </div>
              <img src="${item.dataUrl}" style="width:100%; height:75px; object-fit:cover; border-radius:6px; border:1px solid #eee">
              <div style="font-size:0.7rem; color:var(--ink-soft); margin:4px 0">${angleLabel}</div>
              <div style="display:flex; gap:4px; margin-top:6px">
                <input type="file" id="replaceInput-${idx}" accept="image/*" style="display:none" onchange="handleFarmerQualityPhotoReplace(${idx}, this)">
                <button type="button" class="btn btn-outline btn-small" style="font-size:0.65rem; padding:2px 4px; flex:1" onclick="document.getElementById('replaceInput-${idx}').click()">Replace</button>
                <button type="button" class="btn btn-outline btn-small" style="font-size:0.65rem; padding:2px 4px; color:#b00; border-color:#b00" onclick="removeFarmerQualityPhoto(${idx})">Delete</button>
              </div>
            </div>
          `;
        } else {
          return `
            <div style="border: 2px dashed #b5c7bc; border-radius: 10px; padding: 12px 8px; text-align: center; background: #fafafa; display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:130px">
              <div style="font-size: 0.75rem; font-weight:700; color:var(--ink-soft)">Image ${idx + 1}</div>
              <div style="font-size: 0.7rem; color:var(--ink-soft); margin:4px 0">${angleLabel}</div>
              <input type="file" id="slotInput-${idx}" accept="image/*" style="display:none" onchange="handleFarmerQualityPhotoSlot(${idx}, this)">
              <button type="button" class="btn btn-outline btn-small" style="font-size:0.7rem; padding:4px 8px; margin-top:6px" onclick="document.getElementById('slotInput-${idx}').click()">📷 Upload</button>
            </div>
          `;
        }
      }).join('')}
    </div>

    ${photoCount > 5 ? `
      <div style="margin-bottom:16px">
        <h5 style="margin:0 0 8px 0; color:var(--ink-soft)">Additional Photos (${photoCount - 5})</h5>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:10px">
          ${state.photos.slice(5).map((item, addIdx) => {
            const realIdx = addIdx + 5;
            return `
              <div style="border: 1px solid #ccc; border-radius: 8px; padding: 6px; text-align: center; background: #fff">
                <div style="font-size: 0.7rem; font-weight:700">Image ${realIdx + 1}</div>
                <img src="${item.dataUrl}" style="width:100%; height:60px; object-fit:cover; border-radius:4px">
                <button type="button" class="btn btn-outline btn-small" style="font-size:0.65rem; padding:2px 4px; color:#b00; margin-top:4px; width:100%" onclick="removeFarmerQualityPhoto(${realIdx})">Delete</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <div id="farmerQualityStatusMsg"></div>

    <button type="button" id="farmerRunQualityBtn" class="btn btn-primary" style="width:100%; padding:12px; font-size:1rem; font-weight:700; margin-top:8px" ${!isReady ? 'disabled' : ''} onclick="submitFarmerCropQualityCheck()">
      🤖 Run AI Quality Check (${isReady ? 'Ready — 5/5 Photos Uploaded' : `Upload ${5 - photoCount} More Photo${5 - photoCount > 1 ? 's' : ''}`})
    </button>

    <!-- Result Display Container -->
    <div id="farmerQualityResultBox" style="margin-top:18px">
      ${hasRealQc ? getQualityResultCertificateHTML(activeCrop.cropName || activeCrop.cropId?.name || 'Crop', activeCrop.latestQualityCheck) : `
        <div class="notice" style="background:var(--paper,#f6f8f6); color:var(--ink-soft,#666); font-size:0.88rem; border:1px dashed rgba(0,0,0,0.15); border-radius:10px; padding:14px; margin-top:14px">
          ℹ️ <strong>No Quality Check Performed Yet for ${escD(activeCrop.cropName || activeCrop.cropId?.name || 'Crop')}:</strong><br>
          Please upload <strong>at least 5 clear grain photos</strong> from different angles (top view, side view, close-up, wide angle, grain spread) above and click <strong>Run AI Quality Check</strong> to analyze your crop and generate an AI Quality Certificate.
        </div>
      `}
    </div>
  `;
}

async function handleFarmerQualityPhotoAdd(input) {
  if (!input.files || !input.files.length) return;
  const files = Array.from(input.files);
  for (const f of files) {
    const dataUrl = await new Promise(resolve => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(f);
    });
    window.farmerQualitySectionState.photos.push({
      id: Date.now() + Math.random(),
      dataUrl,
      name: f.name
    });
  }
  input.value = '';
  renderFarmerQualitySection();
}

function handleFarmerQualityPhotoSlot(slotIdx, input) {
  if (!input.files || !input.files[0]) return;
  const f = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    window.farmerQualitySectionState.photos[slotIdx] = {
      id: Date.now() + Math.random(),
      dataUrl: e.target.result,
      name: f.name
    };
    input.value = '';
    renderFarmerQualitySection();
  };
  reader.readAsDataURL(f);
}

function handleFarmerQualityPhotoReplace(index, input) {
  if (!input.files || !input.files[0]) return;
  const f = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    window.farmerQualitySectionState.photos[index] = {
      id: Date.now() + Math.random(),
      dataUrl: e.target.result,
      name: f.name
    };
    input.value = '';
    renderFarmerQualitySection();
  };
  reader.readAsDataURL(f);
}

function removeFarmerQualityPhoto(index) {
  window.farmerQualitySectionState.photos.splice(index, 1);
  renderFarmerQualitySection();
}

async function submitFarmerCropQualityCheck() {
  const state = window.farmerQualitySectionState;
  if (!state.cropId) return;
  if (state.photos.length < 5) {
    alert(`Minimum 5 photos required for AI analysis. Currently uploaded: ${state.photos.length}`);
    return;
  }

  const btn = document.getElementById('farmerRunQualityBtn');
  const statusMsg = document.getElementById('farmerQualityStatusMsg');
  const resultBox = document.getElementById('farmerQualityResultBox');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Analyzing Grain Samples with AI Microservice…';
  }
  if (statusMsg) {
    statusMsg.innerHTML = '<div class="notice" style="background:rgba(42,89,69,0.1); color:var(--green-950)">🔬 Transmitting 5 grain photos to AI microservice for color, foreign matter, moisture & broken grain analysis…</div>';
  }

  try {
    const images = state.photos.map(p => p.dataUrl);
    const r = await dapi(`/farmer/crops/${state.cropId}/quality-check`, {
      method: 'POST',
      body: JSON.stringify({ images })
    });

    const data = r.data || {};
    const qc = data.latestQualityCheck || data.quality || data;

    if (statusMsg) statusMsg.innerHTML = '';
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '✓ AI Quality Check Complete (Run Again)';
    }

    if (resultBox) {
      resultBox.innerHTML = getQualityResultCertificateHTML(state.cropName, qc);
    }

    await renderFarmerCrops();
  } catch (e) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🤖 Run AI Quality Check (Retry)';
    }
    if (statusMsg) {
      statusMsg.innerHTML = `<div class="notice" style="background:#fff0f0; color:#b00; border-color:#fbb">✕ ${escD(e.message)}</div>`;
    }
  }
}

function getQualityResultCertificateHTML(cropName, qc) {
  const isPass = (qc.grade || qc.result || '').includes('Grade A') || (qc.grade || qc.result || '').includes('FAQ') || qc.result === 'PASS';

  return `
    <div style="background:#fff; border:2px solid ${isPass ? 'var(--green-700,#2a5945)' : '#e67e22'}; border-radius:14px; padding:18px; margin-top:12px; box-shadow:0 4px 12px rgba(0,0,0,0.06)">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; border-bottom:1px solid #eee; padding-bottom:12px; margin-bottom:12px">
        <div>
          <span class="eyebrow" style="margin:0; color:var(--green-900)">AI GRAIN ANALYSIS CERTIFICATE</span>
          <h3 style="margin:2px 0 0 0; color:var(--green-950); font-size:1.3rem">🌾 ${escD(cropName)} Quality Results</h3>
        </div>
        <div style="text-align:right">
          <span class="status-pill ${isPass ? 'status-active' : 'status-warn'}" style="font-size:1rem; font-weight:800; padding:6px 14px">
            ${escD(qc.grade || qc.result || 'Grade A')}
          </span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:10px; background:var(--paper,#f6f8f6); padding:12px; border-radius:10px; margin-bottom:14px">
        <div><small style="color:var(--ink-soft); font-size:0.75rem; text-transform:uppercase">AI Confidence</small><br><strong style="font-size:1.1rem; color:var(--green-900)">${qc.confidence || 90}%</strong></div>
        <div><small style="color:var(--ink-soft); font-size:0.75rem; text-transform:uppercase">Images Analyzed</small><br><strong style="font-size:1.1rem; color:var(--green-950)">${qc.imageCount || 5} Photos</strong></div>
        <div><small style="color:var(--ink-soft); font-size:0.75rem; text-transform:uppercase">Inspection Date</small><br><strong style="font-size:0.95rem">${qc.checkedAt ? new Date(qc.checkedAt).toLocaleDateString('en-IN') : 'Just now'}</strong></div>
      </div>

      <div style="margin-bottom:14px">
        <h4 style="margin:0 0 6px 0; color:var(--green-950); font-size:0.95rem">🔎 Key AI Observations:</h4>
        <ul style="margin:0; padding-left:20px; font-size:0.88rem; color:var(--ink-main,#222); line-height:1.5">
          ${(qc.observations || ['Grain uniformity and surface color verified', 'Moisture level within MSP target parameters']).map(obs => `<li>${escD(obs)}</li>`).join('')}
        </ul>
      </div>

      ${qc.recommendations ? `
        <div style="padding:10px 12px; background:rgba(42,89,69,0.06); border-radius:8px; border-left:4px solid var(--green-900)">
          <strong style="font-size:0.85rem; color:var(--green-950)">💡 Mandi Procurement Recommendation:</strong>
          <p style="margin:4px 0 0 0; font-size:0.85rem; color:var(--ink-main)">${escD(qc.recommendations)}</p>
        </div>
      ` : ''}
    </div>
  `;
}


async function addFarmerCrop(){
  const type=document.getElementById('newCropType')?.value;
  const qty=Number(document.getElementById('newCropQty')?.value);
  const area=Number(document.getElementById('newCropArea')?.value||0);
  const grade=document.getElementById('newCropGrade')?.value||'Grade A';
  const season=document.getElementById('newCropSeason')?.value||'Kharif';

  if(!type){
    alert('Please select or enter a crop name.');
    return;
  }
  if(!qty||qty<=0){
    alert('Enter expected quantity greater than 0 quintals.');
    return;
  }
  if(area < 0){
    alert('Cultivated land area cannot be negative.');
    return;
  }

  try{
    await dapi('/farmer/crops',{method:'POST',body:JSON.stringify({cropName:type,expectedQuantity:qty,cultivatedArea:area,qualityGrade:grade,season})});
    if(document.getElementById('newCropQty')) document.getElementById('newCropQty').value='';
    if(document.getElementById('newCropArea')) document.getElementById('newCropArea').value='';
    renderFarmerCrops();
  }catch(x){
    alert(x.message);
  }
}
async function deleteFarmerCrop(id){if(!confirm('Remove this crop record from your MongoDB profile?'))return;try{await dapi('/farmer/crops/'+id,{method:'DELETE'});renderFarmerCrops()}catch(x){alert(x.message)}};
async function loadFarmerBookings(){const box=document.getElementById('myBookingsList');if(!box)return;box.innerHTML='<div class="empty">Loading your procurement bookings…</div>';try{const r=await dapi('/farmer/bookings');const bookings=r.data||[];box.innerHTML=bookings.length?bookings.map(b=>`<div class="card" style="margin-bottom:16px;padding:20px;border:1px solid rgba(21,71,52,0.12);border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.03)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px"><div><div class="eyebrow" style="margin-bottom:2px">BOOKING REFERENCE: ${escD(b.gatePassId||b._id)}</div><h3 style="margin:0;font-size:1.2rem;color:var(--green-950)">🏢 ${escD(b.centreId?.name||'Procurement Centre')}</h3><p style="margin:4px 0 0 0;font-size:0.875rem;color:var(--ink-soft)">📍 Location: ${escD(b.centreId?.location?.district||'')}, ${escD(b.centreId?.location?.state||'')}</p></div><span class="status-pill ${['BOOKED','CHECKED_IN','WAITING'].includes(b.status)?'status-active':['PROCURED','COMPLETED'].includes(b.status)?'status-active':'status-warn'}" style="font-weight:700">${escD(b.status)}</span></div><div class="metric-row" style="margin:14px 0;padding:12px 16px;background:var(--paper);border-radius:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px"><div class="metric"><small style="color:var(--ink-soft);font-size:0.75rem;text-transform:uppercase">Crop</small><strong style="color:var(--green-900);font-size:1rem">🌾 ${escD(b.cropId?.name||'Crop')}</strong></div><div class="metric"><small style="color:var(--ink-soft);font-size:0.75rem;text-transform:uppercase">Quantity</small><strong style="font-size:1rem">⚖️ ${b.quantity} qtl</strong></div><div class="metric"><small style="color:var(--ink-soft);font-size:0.75rem;text-transform:uppercase">Slot Time</small><strong style="font-size:1rem">⏱️ ${b.slotId?.startTime||'—'} – ${b.slotId?.endTime||'—'}</strong></div><div class="metric"><small style="color:var(--ink-soft);font-size:0.75rem;text-transform:uppercase">Date</small><strong style="font-size:1rem">🗓️ ${b.slotId?.date?new Date(b.slotId.date).toLocaleDateString('en-IN'):'—'}</strong></div></div><div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid rgba(0,0,0,0.05)"><span style="font-size:0.825rem;color:var(--ink-soft)">Gate Pass ID: <strong>${escD(b.gatePassId||'—')}</strong></span><button class="btn btn-outline btn-small" onclick="showQueueForToken('${b.queueId?.token || b.token || b.gatePassId || b._id}')">Track Live Queue →</button></div></div>`).join(''):'<div class="empty">You have no booking records yet. Use "Book Slot" to make your first booking.</div>'}catch(e){box.innerHTML=`<div class="notice">${escD(e.message)}</div>`}};
function initGrainQuality(){const input=document.getElementById('grainPhotoInput'),preview=document.getElementById('grainPreview'),btn=document.getElementById('analyzeGrainBtn'),out=document.getElementById('grainResultBox');if(!input||!btn||input.dataset.bound==='1')return;input.dataset.bound='1';let img=null;input.addEventListener('change',()=>{const file=input.files[0];if(!file)return;const url=URL.createObjectURL(file);preview.src=url;preview.style.display='block';img=new Image();img.onload=()=>btn.disabled=false;img.src=url});btn.addEventListener('click',()=>{if(!img)return;const r=analyzeFarmerGrain(img,2425);out.innerHTML=`<div class="grain-result"><div class="grain-grade">${escD(r.grade)}</div><div class="grain-metrics"><div><span>Discoloration</span><strong>${r.discolorationPct}%</strong></div><div><span>Foreign matter proxy</span><strong>${r.foreignMatterPct}%</strong></div><div><span>Broken grain proxy</span><strong>${r.brokenGrainPct}%</strong></div></div><div class="grain-price">Reference MSP ₹${r.mspRate.toLocaleString('en-IN')} → <strong>₹${r.adjustedRate.toLocaleString('en-IN')}/qtl</strong>${r.deductionPct?` (-${r.deductionPct}%)`:''}</div><p class="grain-note">Prototype image estimate only. Final procurement quality is decided by authorised mandi grading.</p></div>`})}
function analyzeFarmerGrain(imgEl,mspRate){const canvas=document.createElement('canvas'),w=240,h=240;canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.drawImage(imgEl,0,0,w,h);const data=ctx.getImageData(0,0,w,h).data;let n=0,discolored=0,darkSpots=0;const gray=new Float32Array(w*h);for(let i=0,p=0;i<data.length;i+=4,p++){const r=data[i],g=data[i+1],b=data[i+2],brightness=(r+g+b)/3;gray[p]=brightness;n++;const maxc=Math.max(r,g,b),minc=Math.min(r,g,b),sat=maxc===0?0:(maxc-minc)/maxc,warm=r>g&&g>=b&&r-b>15;if(!warm&&sat>.12)discolored++;if(brightness<60)darkSpots++}let edges=0;for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,gx=gray[i+1]-gray[i-1],gy=gray[i+w]-gray[i-w];if(Math.sqrt(gx*gx+gy*gy)>40)edges++}const discolorationPct=+(100*discolored/n).toFixed(1),foreignMatterPct=+(100*darkSpots/n).toFixed(1),brokenGrainPct=+Math.min(100,100*edges/(w*h)*3.4).toFixed(1),score=Math.max(0,100-(discolorationPct*1.1+foreignMatterPct*1.4+brokenGrainPct*.9));let grade,deductionPct;if(score>=85){grade='FAQ (Fair Average Quality)';deductionPct=0}else if(score>=70){grade='Grade A';deductionPct=3}else if(score>=50){grade='Grade B';deductionPct=8}else{grade='Below Grade — needs physical review';deductionPct=18}return{grade,deductionPct,adjustedRate:Math.round(mspRate*(1-deductionPct/100)),mspRate,discolorationPct,foreignMatterPct,brokenGrainPct}}
function renderPaymentTimeline(container,currentStepIndex){if(!container)return;const steps=['Payment initiated','Quality verified','Bill generated','PFMS processing','Bank credited','Completed'];container.innerHTML=`<div class="pfms-track">${steps.map((s,i)=>`<div class="pfms-step ${i<=currentStepIndex?'done':''} ${i===currentStepIndex?'current':''}"><div class="pfms-dot"></div><div class="pfms-label">${s}</div></div>`).join('')}</div>`}
async function loadFarmerPayments(){try{const r=await dapi('/farmer/status');renderPayments(r.data?.payments||[])}catch(e){renderPayments([])}}
function renderPayments(pays){const box=document.getElementById('paymentsContent');if(!box)return;const seeded=[{id:'MUS-0921',date:'5 Sep 2026',crop:'Mustard',qty:'18 qtl',amount:101700,status:'PAID'},{id:'WHT-0774',date:'22 Aug 2026',crop:'Wheat',qty:'32 qtl',amount:77600,status:'PAID'},{id:'WHT-0650',date:'9 Aug 2026',crop:'Wheat',qty:'20 qtl',amount:48500,status:'PROCESSING'}];const rows=(pays&&pays.length?pays.map((p,i)=>({id:p.reference||('PAY-'+String(i+1).padStart(4,'0')),date:new Date(p.createdAt||Date.now()).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),crop:p.procurementId?.cropId?.name||'Procurement',qty:p.procurementId?.acceptedQuantity?`${p.procurementId.acceptedQuantity} qtl`:'—',amount:Number(p.amount||0),status:p.status||'PENDING'})):seeded);const paid=rows.filter(x=>String(x.status).toUpperCase()==='PAID').reduce((a,x)=>a+x.amount,0);const processing=rows.filter(x=>String(x.status).toUpperCase()!=='PAID').reduce((a,x)=>a+x.amount,0);box.innerHTML=`<div class="payment-summary"><div class="kpi"><small>Total paid</small><strong>₹${paid.toLocaleString('en-IN')}</strong></div><div class="kpi"><small>In processing</small><strong>₹${processing.toLocaleString('en-IN')}</strong></div><div class="kpi"><small>Settlements</small><strong>${rows.length}</strong></div></div><div class="card payment-card"><div class="table-wrap"><table class="pay-table"><thead><tr><th>Date</th><th>Crop</th><th>Quantity</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td>${escD(x.date)}</td><td>${escD(x.crop)}</td><td>${escD(x.qty)}</td><td>₹${x.amount.toLocaleString('en-IN')}</td><td><span class="status-pill ${String(x.status).toUpperCase()==='PAID'?'status-active':'status-warn'}">${escD(x.status)}</span></td><td>${String(x.status).toUpperCase()==='PAID'?`<button class="link-btn" onclick='downloadFarmerReceipt(${JSON.stringify(x)})'>Receipt ↓</button>`:'<span style="color:var(--ink-soft);font-size:11px">Pending</span>'}</td></tr>`).join('')}</tbody></table></div></div><div class="card payment-card"><h3 style="font-size:16px;color:var(--green-900);margin:0 0 14px">Payment tracker — current settlement</h3><div id="farmerPaymentTimeline"></div><button class="btn btn-outline btn-small" style="margin-top:14px" type="button" onclick="downloadFarmerWeighbridgeSlip()">Download weighbridge slip (sample)</button></div>`;renderPaymentTimeline(document.getElementById('farmerPaymentTimeline'),2)}
function downloadFarmerReceipt(x){if(typeof generateReceiptPDF==='function')generateReceiptPDF({id:x.id,date:x.date,crop:x.crop,qty:x.qty,amount:'₹'+x.amount.toLocaleString('en-IN'),status:x.status});else alert('Receipt generator is not available.')}function downloadFarmerWeighbridgeSlip(){if(!window.jspdf?.jsPDF){alert('PDF generator failed to load.');return}const {jsPDF}=window.jspdf,doc=new jsPDF({unit:'pt',format:[320,420]});doc.setFillColor(22,38,31);doc.rect(0,0,320,60,'F');doc.setTextColor(255,255,255);doc.setFontSize(15);doc.text('Digital Weighbridge Slip',20,34);doc.setTextColor(22,38,31);let y=92;const row=(a,b)=>{doc.setFont(undefined,'bold');doc.text(a,20,y);doc.setFont(undefined,'normal');doc.text(String(b),165,y);y+=26};row('Token','FS-4821');row('Center','Configured procurement centre');row('Gross weight','3820 kg');row('Tare weight','1420 kg');row('Net weight','2400 kg');row('Geofence check','Passed (sample)');row('Issued',new Date().toLocaleString('en-IN'));doc.setFontSize(9);doc.setTextColor(90,90,90);doc.text('Fasal Setu · Prototype for demonstration (SIH 2026)',20,y+20);doc.save('FasalSetu-Weighbridge-FS-4821.pdf')}
async function loadGrievances(){
  const box=document.getElementById('grievanceContent');
  box.innerHTML=`<form id="gForm" class="card form-stack">
    <div><label>Category</label><select id="gCategory" required><option value="Slot Booking">Slot Booking</option><option value="Queue Management">Queue Management</option><option value="Payment">Payment</option><option value="Quality Check">Quality Check</option><option value="Centre Operations">Centre Operations</option><option value="Other">Other</option></select></div>
    <div><label>Subject</label><input id="gSubject" required maxlength="120" placeholder="e.g. Delay in weighment at Karnal Centre"></div>
    <div><label>Issue Description</label><textarea id="gDescription" required maxlength="1000" rows="5" placeholder="Describe the problem in detail so the centre officer can resolve it..."></textarea></div>
    <button class="btn btn-primary" type="submit">Submit Grievance</button>
    <div id="gMsg" style="margin-top:10px"></div>
  </form>`;

  document.getElementById('gForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const gMsg = document.getElementById('gMsg');
    const cat = document.getElementById('gCategory')?.value;
    const subj = document.getElementById('gSubject')?.value?.trim();
    const desc = document.getElementById('gDescription')?.value?.trim();

    if(!subj || subj.length < 3){
      gMsg.innerHTML = '<div class="error">Subject must be at least 3 characters.</div>';
      return;
    }
    if(!desc || desc.length < 5){
      gMsg.innerHTML = '<div class="error">Please describe your issue in detail (at least 5 characters).</div>';
      return;
    }

    try{
      await dapi('/farmer/grievances',{method:'POST',body:JSON.stringify({category:cat,subject:subj,description:desc})});
      gMsg.innerHTML = '<div class="success">✓ Grievance registered successfully! Your reference ID is created and assigned to the centre officer.</div>';
      e.target.reset();
    }catch(x){
      gMsg.innerHTML = `<div class="error">${escD(x.message)}</div>`;
    }
  });
}

async function loadFarmerTrolley() {
  const box = document.getElementById('trolleyContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading transport operators and your trolley bookings...</div>';

  try {
    const todayStr = getLocalDateStr();
    const [transRes, bookingsRes, myTripsRes] = await Promise.all([
      dapi('/farmer/transporters'),
      dapi('/farmer/bookings'),
      dapi('/farmer/transport-bookings')
    ]);

    const transporters = transRes.data || [];
    const bookings = (bookingsRes.data || []).filter(b => ['BOOKED', 'CHECKED_IN', 'WAITING'].includes(String(b.status).toUpperCase()));
    const myTrips = myTripsRes.data || [];

    let formHTML = '';
    if (!bookings.length) {
      formHTML = `
        <div class="card" style="margin-bottom:20px">
          <div class="eyebrow">BOOK TRACTOR TROLLEY</div>
          <h3 style="margin:4px 0 10px 0;color:var(--green-950)">🚜 Transport Service Booking</h3>
          <div class="notice" style="background:var(--paper);color:var(--ink-soft)">
            ℹ️ You currently have no active procurement slot bookings. Please <a href="javascript:void(0)" onclick="showSection('booking')" style="color:var(--green-900);font-weight:700">book a mandi slot first</a> to request a trolley.
          </div>
        </div>
      `;
    } else if (!transporters.length) {
      formHTML = `
        <div class="card" style="margin-bottom:20px">
          <div class="eyebrow">BOOK TRACTOR TROLLEY</div>
          <h3 style="margin:4px 0 10px 0;color:var(--green-950)">🚜 Transport Service Booking</h3>
          <div class="notice">No transport operators are currently listed in your region by Admin.</div>
        </div>
      `;
    } else {
      const defaultTrans = transporters[0] || {};
      const defaultTp = defaultTrans.transportProfile || {};
      formHTML = `
        <div class="card" style="margin-bottom:20px">
          <div class="eyebrow">BOOK TRACTOR TROLLEY</div>
          <h3 style="margin:4px 0 14px 0;color:var(--green-950)">🚜 Book Trolley Transport to Mandi</h3>
          <form id="trolleyBookingForm" class="form-grid" onsubmit="submitTrolleyBooking(event)">
            <div class="full">
              <label style="font-weight:700">Select Procurement Slot Booking</label>
              <select id="trolleyBookingSelect" required style="width:100%;padding:10px;border-radius:8px;border:1px solid #b5c7bc;font-size:0.95rem">
                ${bookings.map(b => `<option value="${b._id}">🌾 ${escD(b.cropId?.name || 'Crop')} (${b.quantity} qtl) @ 🏢 ${escD(b.centreId?.name || 'Centre')} on ${b.slotId?.date ? new Date(b.slotId.date).toLocaleDateString('en-IN') : 'Date'}</option>`).join('')}
              </select>
            </div>
            
            <div class="full">
              <label style="font-weight:700">Select Approved Transporter</label>
              <select id="trolleyTransporterSelect" required style="width:100%;padding:10px;border-radius:8px;border:1px solid #b5c7bc;font-size:0.95rem" onchange="updateTrolleyFarePreview()">
                ${transporters.map(t => {
                  const tp = t.transportProfile || {};
                  return `<option value="${t._id}" data-fare="${tp.farePerTrip || 500}" data-capacity="${tp.capacityQtl || 40}">🚜 ${escD(t.name)} — ${escD(tp.vehicleType || 'Tractor Trolley')} (${escD(tp.vehicleNo || 'HR-05-AB-1234')}) · Cap: ${tp.capacityQtl || 40} qtl · Fare: ₹${tp.farePerTrip || 500}/trip · 📍 ${escD(t.region || tp.serviceArea || 'Region')}</option>`;
                }).join('')}
              </select>
            </div>

            <div>
              <label>Pickup Location / Address</label>
              <input id="trolleyPickupLoc" required placeholder="e.g. Village Karnal, Farm House 12">
            </div>
            <div>
              <label>Pickup Date</label>
              <input id="trolleyPickupDate" type="date" value="${todayStr}" min="${todayStr}" required>
            </div>
            <div>
              <label>Load Quantity (Quintals)</label>
              <input id="trolleyQty" type="number" min="1" value="${bookings[0]?.quantity || 20}" required>
            </div>
            <div>
              <label>Estimated Trip Fare (₹)</label>
              <div id="trolleyFarePreview" style="font-size:1.2rem;font-weight:800;color:var(--green-900);padding:8px 0">₹${Number(defaultTp.farePerTrip || 500).toLocaleString('en-IN')}</div>
            </div>
            <div class="full">
              <label>Driver Notes / Instructions (Optional)</label>
              <input id="trolleyNotes" placeholder="e.g. Please arrive near the primary school gate by 7 AM">
            </div>
            <div class="full" style="margin-top:8px">
              <button class="btn btn-primary" type="submit">🚜 Confirm & Request Trolley</button>
              <div id="trolleyFormMsg" style="margin-top:10px"></div>
            </div>
          </form>
        </div>
      `;
    }

    const historyHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
          <div>
            <h3 style="margin:0;color:var(--green-950)">📋 Your Trolley Bookings & Trip Status (${myTrips.length})</h3>
            <p class="small" style="margin:2px 0 0 0">Live status of trolley requests sent to transport operators.</p>
          </div>
          <button class="btn btn-outline btn-small" onclick="loadFarmerTrolley()">🔄 Refresh Status</button>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Transporter / Driver</th>
                <th>Vehicle Info</th>
                <th>Procurement Centre</th>
                <th>Crop & Load Qty</th>
                <th>Pickup Date</th>
                <th>Trip Fare (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${myTrips.length ? myTrips.map(t => {
                const driverName = t.transporterId?.name || 'Transporter';
                const driverPhone = t.transporterId?.phone || '';
                const tp = t.transporterId?.transportProfile || {};
                const centreName = t.centreId?.name || 'Procurement Centre';

                return `<tr>
                  <td><code>${escD(t._id.slice(-8).toUpperCase())}</code></td>
                  <td><strong>${escD(driverName)}</strong><br><small style="color:var(--ink-soft)">${escD(driverPhone)}</small></td>
                  <td><small>${escD(tp.vehicleType || 'Tractor Trolley')} (${escD(tp.vehicleNo || '—')})</small></td>
                  <td>🏢 ${escD(centreName)}</td>
                  <td>🌾 <strong>${escD(t.crop || 'Crop')}</strong> (${t.quantity} qtl)</td>
                  <td>🗓️ ${t.pickupDate ? new Date(t.pickupDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td><strong style="color:var(--green-900)">₹${Number(t.fare || 0).toLocaleString('en-IN')}</strong></td>
                  <td><span class="status-pill ${['ACCEPTED', 'DRIVER_EN_ROUTE', 'PICKED_UP', 'IN_TRANSIT', 'COMPLETED'].includes(t.status) ? 'status-active' : 'status-warn'}">${escD(t.status)}</span></td>
                </tr>`;
              }).join('') : '<tr><td colspan="8" class="empty">No trolley bookings requested yet. Use the form above to book your trolley.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    box.innerHTML = formHTML + historyHTML;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

function updateTrolleyFarePreview() {
  const sel = document.getElementById('trolleyTransporterSelect');
  const preview = document.getElementById('trolleyFarePreview');
  if (sel && preview) {
    const opt = sel.options[sel.selectedIndex];
    const fare = opt ? opt.dataset.fare : 500;
    preview.textContent = `₹${Number(fare).toLocaleString('en-IN')}`;
  }
}

async function submitTrolleyBooking(e) {
  if (e) e.preventDefault();
  const msg = document.getElementById('trolleyFormMsg');
  try {
    const bookingId = document.getElementById('trolleyBookingSelect').value;
    const transporterId = document.getElementById('trolleyTransporterSelect').value;
    const pickupLocation = document.getElementById('trolleyPickupLoc').value;
    const pickupDate = document.getElementById('trolleyPickupDate').value;
    const quantity = Number(document.getElementById('trolleyQty').value);
    const notes = document.getElementById('trolleyNotes')?.value || '';

    if (!bookingId) throw new Error('Please select a mandi slot booking.');
    if (!transporterId) throw new Error('Please select an approved transporter.');
    if (!pickupLocation) throw new Error('Pickup location is required.');
    if (!pickupDate) throw new Error('Pickup date is required.');
    if (!quantity || quantity <= 0) throw new Error('Enter a valid load quantity in quintals.');

    await dapi('/farmer/transport-bookings', {
      method: 'POST',
      body: JSON.stringify({ bookingId, transporterId, pickupLocation, pickupDate, quantity, notes })
    });

    if (msg) msg.innerHTML = '<div class="success">✓ Trolley booking requested successfully! The transporter has been notified.</div>';
    loadFarmerTrolley();
  } catch (err) {
    if (msg) msg.innerHTML = `<div class="error">${escD(err.message)}</div>`;
  }
}

async function loadAdminCentres() {
  initAdminCentreForm();
  const box = document.getElementById('adminCentresContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading procurement centres from MongoDB...</div>';
  try {
    const r = await dapi('/admin/centres');
    const centres = r.data || [];
    window.adminCentresList = centres;

    const opSelect = document.getElementById('opCentre');
    if (opSelect) {
      opSelect.innerHTML = '<option value="">Select Procurement Centre</option>' +
        centres.map(c => `<option value="${c._id}">${escD(c.name)} (${escD(c.location?.district || '')})</option>`).join('');
    }

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">Registered Procurement Centres (${centres.length})</h3>
          <p class="small" style="margin:2px 0 0 0">All centers, operating parameters and geographic locations stored in MongoDB.</p>
        </div>
        <div style="display:flex;gap:8px">
          <input id="adminCentreSearch" placeholder="Search centre or district..." style="padding:6px 10px;border-radius:6px;border:1px solid #ccc;font-size:0.85rem" oninput="filterAdminCentresTable()">
          <button class="btn btn-outline btn-small" onclick="loadAdminCentres()">🔄 Refresh</button>
        </div>
      </div>
      <div class="table-wrap">
        <table id="adminCentresTable">
          <thead>
            <tr>
              <th>Code</th>
              <th>Centre Name</th>
              <th>Nodal Agency</th>
              <th>State & District</th>
              <th>Daily Cap.</th>
              <th>Counters</th>
              <th>Coordinates</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${centres.length ? centres.map(c => {
              const lat = c.location?.lat != null ? c.location.lat : '—';
              const lng = c.location?.lng != null ? c.location.lng : '—';
              return `<tr>
                <td><code>${escD(c.centreCode)}</code></td>
                <td><strong style="color:var(--green-900)">${escD(c.name)}</strong></td>
                <td>${escD(c.agency || 'NAFED / FCI')}</td>
                <td>${escD(c.location?.district || '—')}, ${escD(c.location?.state || '—')}</td>
                <td>${c.capacity?.daily || 0} qtl / ${c.capacity?.slots || 0} slots</td>
                <td>${c.capacity?.counters || 1} counter(s)</td>
                <td><small style="color:var(--ink-soft)">${lat}, ${lng}</small></td>
                <td><span class="status-pill ${c.status === 'ACTIVE' ? 'status-active' : 'status-warn'}">${escD(c.status)}</span></td>
                <td>
                  <button class="btn btn-outline btn-small" onclick="editAdminCentre('${c._id}')">✏️ Edit</button>
                  <button class="btn btn-outline btn-small" style="margin-left:4px" onclick="toggleCentreStatus('${c._id}', '${c.status === 'ACTIVE' ? 'TEMPORARILY_CLOSED' : 'ACTIVE'}')">${c.status === 'ACTIVE' ? 'Pause' : 'Activate'}</button>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="9" class="empty">No procurement centres configured yet. Use the form below to add one.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

function filterAdminCentresTable() {
  const q = document.getElementById('adminCentreSearch')?.value?.toLowerCase() || '';
  const rows = document.querySelectorAll('#adminCentresTable tbody tr');
  rows.forEach(tr => {
    const text = tr.textContent.toLowerCase();
    tr.style.display = text.includes(q) ? '' : 'none';
  });
}

async function editAdminCentre(id) {
  const c = (window.adminCentresList || []).find(x => String(x._id) === String(id));
  if (!c) return;
  const newName = prompt('Centre Name:', c.name);
  if (!newName) return;
  const newAgency = prompt('Nodal Agency:', c.agency || 'NAFED / FCI');
  const newDailyCap = prompt('Daily Capacity (quintals):', c.capacity?.daily || 500);
  const newCounters = prompt('Active Counters:', c.capacity?.counters || 2);

  try {
    await dapi('/admin/centres/' + id, {
      method: 'PATCH',
      body: JSON.stringify({
        name: newName,
        agency: newAgency,
        capacity: {
          daily: Number(newDailyCap) || c.capacity?.daily || 500,
          slots: c.capacity?.slots || 50,
          counters: Number(newCounters) || c.capacity?.counters || 2
        }
      })
    });
    alert('✓ Centre parameters updated successfully in MongoDB!');
    loadAdminCentres();
  } catch (e) {
    alert(e.message);
  }
}

async function toggleCentreStatus(id, newStatus) {
  try {
    await dapi('/admin/centres/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    loadAdminCentres();
  } catch (e) {
    alert(e.message);
  }
}

function initAdminCentreForm() {
  const cForm = document.getElementById('centreForm');
  if (cForm && !cForm.dataset.listenerAttached) {
    cForm.dataset.listenerAttached = 'true';
    cForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('centreFormMsg');
      if (msg) msg.textContent = 'Creating Procurement Centre...';
      try {
        const name = document.getElementById('newCentreName').value;
        const centreCode = document.getElementById('newCentreCode').value;
        const agency = document.getElementById('newCentreAgency').value;
        const state = document.getElementById('newCentreState').value;
        const district = document.getElementById('newCentreDistrict').value;
        const address = document.getElementById('newCentreAddress').value;
        const pincode = document.getElementById('newCentrePincode').value;
        const dailyCapacityQuintals = Number(document.getElementById('newCentreDaily').value);
        const slotsCapacity = Number(document.getElementById('newCentreSlots').value);
        const counters = Number(document.getElementById('newCentreCounters').value);
        const lat = Number(document.getElementById('newCentreLat').value) || 28.8524;
        const lng = Number(document.getElementById('newCentreLng').value) || 77.0945;

        await dapi('/admin/centres', {
          method: 'POST',
          body: JSON.stringify({
            name,
            centreCode,
            agency,
            location: { state, district, full: address, pincode, lat, lng },
            capacity: { daily: dailyCapacityQuintals, slots: slotsCapacity, counters },
            status: 'ACTIVE'
          })
        });

        if (msg) msg.innerHTML = '<span style="color:var(--green-800);font-weight:700">✓ Procurement Centre created successfully!</span>';
        cForm.reset();
        loadAdminCentres();
      } catch (err) {
        if (msg) msg.innerHTML = `<span style="color:#d32f2f;font-weight:600">❌ ${escD(err.message)}</span>`;
      }
    });
  }
}

async function addCentre() {
  const name = prompt('Centre name');
  if (!name) return;
  const code = prompt('Centre code');
  if (!code) return;
  const state = prompt('State', 'Haryana');
  const district = prompt('District', 'Karnal');
  try {
    await dapi('/admin/centres', {
      method: 'POST',
      body: JSON.stringify({
        name,
        centreCode: code,
        agency: 'Configured Agency',
        location: { state, district },
        capacity: { daily: 500, slots: 50, counters: 2 },
        status: 'ACTIVE'
      })
    });
    loadAdminCentres();
  } catch (e) {
    alert(e.message);
  }
}

async function loadOperators() {
  initAdminStaffForms();
  const box = document.getElementById('operatorsContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading Centre Operators from MongoDB...</div>';
  try {
    const r = await dapi('/admin/staff');
    const allStaff = r.data || [];
    const operators = allStaff.filter(u => u.role === 'OPERATOR');

    if (!window.adminCentresList) {
      const cRes = await dapi('/admin/centres');
      window.adminCentresList = cRes.data || [];
    }
    const centres = window.adminCentresList || [];
    const opSelect = document.getElementById('opCentre');
    if (opSelect) {
      opSelect.innerHTML = '<option value="">Select Procurement Centre</option>' +
        centres.map(c => `<option value="${c._id}">${escD(c.name)} (${escD(c.location?.district || '')})</option>`).join('');
    }

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">Centre Operator Registry (${operators.length})</h3>
          <p class="small" style="margin:2px 0 0 0">Authorised operators assigned to handle mandi check-in, quality testing, weighment & procurement.</p>
        </div>
        <button class="btn btn-outline btn-small" onclick="loadOperators()">🔄 Refresh Operators</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Operator Name</th>
              <th>Email Address</th>
              <th>Mobile Number</th>
              <th>Assigned Procurement Centre</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${operators.length ? operators.map(u => {
              const centreName = u.centreId?.name ? `🏢 ${u.centreId.name}` : '—';
              const districtStr = u.centreId?.location?.district ? ` (${u.centreId.location.district})` : '';

              return `<tr>
                <td><strong style="color:var(--green-950)">${escD(u.name)}</strong></td>
                <td>${escD(u.email || '—')}</td>
                <td><strong>${escD(u.phone || '—')}</strong></td>
                <td><strong>${escD(centreName)}${escD(districtStr)}</strong></td>
                <td><span class="status-pill ${u.isVerified !== false ? 'status-active' : 'status-warn'}">${u.isVerified !== false ? 'ACTIVE' : 'INACTIVE'}</span></td>
                <td>
                  <button class="btn btn-outline btn-small" onclick="reassignOperatorCentre('${u._id}')">🔄 Reassign Centre</button>
                  <button class="btn btn-outline btn-small" style="margin-left:4px" onclick="toggleStaffStatus('${u._id}', ${!u.isVerified})">${u.isVerified !== false ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="6" class="empty">No Centre Operators registered yet. Use the form below to register one.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadTransporters() {
  initAdminStaffForms();
  const box = document.getElementById('transportersContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading Transport Operators from MongoDB...</div>';
  try {
    const r = await dapi('/admin/staff');
    const allStaff = r.data || [];
    const transporters = allStaff.filter(u => u.role === 'LOGISTICS');

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">Transport Operator Registry (${transporters.length})</h3>
          <p class="small" style="margin:2px 0 0 0">Transporters available for farmer trolley bookings and crop logistics.</p>
        </div>
        <button class="btn btn-outline btn-small" onclick="loadTransporters()">🔄 Refresh Transporters</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Transporter Name</th>
              <th>Contact (Mobile / Email)</th>
              <th>Service Area / Region</th>
              <th>Vehicle & Trolley Info</th>
              <th>Capacity & Fare</th>
              <th>Listing Status</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${transporters.length ? transporters.map(u => {
              const tp = u.transportProfile || {};
              const vehicleStr = `${tp.vehicleType || 'Tractor Trolley'} (${tp.vehicleNo || '—'})`;
              const capFareStr = `${tp.capacityQtl || 40} qtl @ ₹${tp.farePerTrip || 0}/trip`;
              const isListed = tp.isListed !== false;

              return `<tr>
                <td><strong style="color:var(--green-950)">${escD(u.name)}</strong></td>
                <td><strong>${escD(u.phone || '—')}</strong><br><small style="color:var(--ink-soft)">${escD(u.email || '—')}</small></td>
                <td>📍 <strong>${escD(u.region || tp.serviceArea || '—')}</strong></td>
                <td><small>${escD(vehicleStr)}</small></td>
                <td><small>${escD(capFareStr)}</small></td>
                <td><span class="status-pill ${isListed ? 'status-active' : 'status-warn'}">${isListed ? 'LISTED' : 'UNLISTED'}</span></td>
                <td><span class="status-pill ${u.isVerified !== false ? 'status-active' : 'status-warn'}">${u.isVerified !== false ? 'ACTIVE' : 'INACTIVE'}</span></td>
                <td>
                  <button class="btn btn-outline btn-small" onclick="toggleStaffStatus('${u._id}', ${!u.isVerified})">${u.isVerified !== false ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="8" class="empty">No Transport Operators registered yet. Use the form below to register one.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadStaff() {
  loadOperators();
}

async function reassignOperatorCentre(userId) {
  const centres = window.adminCentresList || [];
  if (!centres.length) {
    alert('No centres available');
    return;
  }
  const optsStr = centres.map((c, i) => `${i + 1}. ${c.name} (${c.location?.district || ''})`).join('\n');
  const choice = prompt(`Select New Procurement Centre for Operator:\n\n${optsStr}`);
  const choiceNum = parseInt(choice, 10);
  if (choiceNum >= 1 && choiceNum <= centres.length) {
    const newCentreId = centres[choiceNum - 1]._id;
    try {
      await dapi('/admin/staff/' + userId, {
        method: 'PATCH',
        body: JSON.stringify({ centreId: newCentreId })
      });
      alert('✓ Operator successfully reassigned to ' + centres[choiceNum - 1].name);
      loadOperators();
    } catch (e) {
      alert(e.message);
    }
  }
}

async function toggleStaffStatus(userId, isVerified) {
  try {
    await dapi('/admin/staff/' + userId, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified })
    });
    if (document.getElementById('operatorsContent') && !document.getElementById('section-operators')?.classList.contains('hidden')) {
      loadOperators();
    } else {
      loadTransporters();
    }
  } catch (e) {
    alert(e.message);
  }
}

function initAdminStaffForms() {
  const opForm = document.getElementById('operatorForm');
  if (opForm && !opForm.dataset.listenerAttached) {
    opForm.dataset.listenerAttached = 'true';
    opForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('opMsg');
      if (msg) msg.textContent = 'Registering Centre Operator...';
      try {
        const name = document.getElementById('opName').value;
        const email = document.getElementById('opEmail').value;
        const phone = document.getElementById('opPhone').value;
        const password = document.getElementById('opPassword').value;
        const centreId = document.getElementById('opCentre').value;

        await dapi('/admin/staff', {
          method: 'POST',
          body: JSON.stringify({ name, email, phone, password, role: 'OPERATOR', centreId })
        });
        if (msg) msg.innerHTML = '<span style="color:var(--green-800);font-weight:700">✓ Centre Operator registered successfully!</span>';
        opForm.reset();
        loadOperators();
      } catch (err) {
        if (msg) msg.innerHTML = `<span style="color:#d32f2f;font-weight:600">❌ ${escD(err.message)}</span>`;
      }
    });
  }

  const trForm = document.getElementById('transportForm');
  if (trForm && !trForm.dataset.listenerAttached) {
    trForm.dataset.listenerAttached = 'true';
    trForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('trMsg');
      if (msg) msg.textContent = 'Registering Transport Operator...';
      try {
        const name = document.getElementById('trName').value;
        const email = document.getElementById('trEmail').value;
        const phone = document.getElementById('trPhone').value;
        const password = document.getElementById('trPassword').value;
        const region = document.getElementById('trRegion').value;
        const vehicleType = document.getElementById('trVehicleType').value;
        const vehicleNo = document.getElementById('trVehicleNo').value;
        const capacityQtl = document.getElementById('trCapacity').value;
        const farePerTrip = document.getElementById('trFare').value;
        const isListed = document.getElementById('trListed').checked;

        await dapi('/admin/staff', {
          method: 'POST',
          body: JSON.stringify({
            name, email, phone, password, role: 'LOGISTICS', region,
            vehicleType, vehicleNo, capacityQtl, farePerTrip, isListed
          })
        });
        if (msg) msg.innerHTML = '<span style="color:var(--green-800);font-weight:700">✓ Transport Operator registered successfully!</span>';
        trForm.reset();
        loadTransporters();
      } catch (err) {
        if (msg) msg.innerHTML = `<span style="color:#d32f2f;font-weight:600">❌ ${escD(err.message)}</span>`;
      }
    });
  }
}

async function addStaff(role) {
  const name = prompt('Full name');
  if (!name) return;
  const email = prompt('Email');
  if (!email) return;
  const phone = prompt('10-digit mobile');
  if (!/^[6-9]\d{9}$/.test(phone || '')) {
    alert('Invalid Indian mobile number');
    return;
  }
  const password = prompt('Temporary password for staff member');
  if (!password) return;

  let centreId = null;
  if (role === 'OPERATOR') {
    try {
      const centresRes = await dapi('/admin/centres');
      const centres = centresRes.data || [];
      if (!centres.length) {
        alert('No procurement centres exist. Please add a centre first.');
        return;
      }
      const centreOptionsStr = centres.map((c, idx) => `${idx + 1}. ${c.name} (${c.location?.district})`).join('\n');
      const choice = prompt(`Select Procurement Centre by entering number (1-${centres.length}):\n\n${centreOptionsStr}`);
      const choiceNum = parseInt(choice, 10);
      if (choiceNum >= 1 && choiceNum <= centres.length) {
        centreId = centres[choiceNum - 1]._id;
      } else {
        alert('Invalid selection.');
        return;
      }
    } catch (e) {
      alert('Failed to fetch centres list: ' + e.message);
      return;
    }
  }

  try {
    await dapi('/admin/staff', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, role, centreId })
    });
    alert(`Account created successfully for ${name}. Role: ${role}. Password: ${password}`);
    loadStaff();
  } catch (e) {
    alert(e.message);
  }
}

async function loadFarmers() {
  const box = document.getElementById('farmersContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading registered farmers from MongoDB...</div>';
  try {
    const r = await dapi('/admin/farmers');
    const farmers = r.data || [];

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">Registered Farmer Database (${farmers.length})</h3>
          <p class="small" style="margin:2px 0 0 0">Real farmer profiles, crops registered, bookings and payment histories.</p>
        </div>
        <div style="display:flex;gap:8px">
          <input id="adminFarmerSearch" placeholder="Search farmer name, phone or district..." style="padding:6px 10px;border-radius:6px;border:1px solid #ccc;font-size:0.85rem" oninput="filterAdminFarmersTable()">
          <button class="btn btn-outline btn-small" onclick="loadFarmers()">🔄 Refresh List</button>
        </div>
      </div>

      <div id="farmerDetailModal" style="display:none;margin-bottom:16px;padding:16px;background:var(--paper);border-radius:12px;border:1px solid var(--green-700)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h4 style="margin:0;color:var(--green-950)" id="farmerDetailName">Farmer Profile & Record</h4>
          <button class="btn btn-outline btn-small" onclick="document.getElementById('farmerDetailModal').style.display='none'">✕ Close Detail View</button>
        </div>
        <div id="farmerDetailContent" style="margin-top:12px"></div>
      </div>

      <div class="table-wrap">
        <table id="adminFarmersTable">
          <thead>
            <tr>
              <th>Farmer ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>State & District</th>
              <th>Registered Crops</th>
              <th>Bookings</th>
              <th>Procurements</th>
              <th>Payments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${farmers.length ? farmers.map(f => {
              const u = f.userId || {};
              return `<tr>
                <td><code>${escD(f.farmerId || f._id.slice(-8).toUpperCase())}</code></td>
                <td><strong style="color:var(--green-950)">${escD(u.name || 'Farmer')}</strong></td>
                <td><strong>${escD(u.phone || '—')}</strong></td>
                <td>${escD(f.address?.district || '—')}, ${escD(f.address?.state || '—')}</td>
                <td><span class="status-pill status-active">${f.cropCount || 0} Crop(s)</span></td>
                <td>${f.bookingCount || 0} booking(s)</td>
                <td>${f.procurementCount || 0} procured</td>
                <td>${f.paymentCount || 0} paid</td>
                <td>
                  <button class="btn btn-primary btn-small" onclick="loadFarmerDetail('${f._id}')">👁️ View Details</button>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="9" class="empty">No registered farmers found in database.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

function filterAdminFarmersTable() {
  const q = document.getElementById('adminFarmerSearch')?.value?.toLowerCase() || '';
  const rows = document.querySelectorAll('#adminFarmersTable tbody tr');
  rows.forEach(tr => {
    const text = tr.textContent.toLowerCase();
    tr.style.display = text.includes(q) ? '' : 'none';
  });
}

async function loadFarmerDetail(farmerId) {
  const modal = document.getElementById('farmerDetailModal');
  const box = document.getElementById('farmerDetailContent');
  const title = document.getElementById('farmerDetailName');
  if (!modal || !box) return;

  modal.style.display = 'block';
  box.innerHTML = '<div class="empty">Loading complete farmer history from MongoDB...</div>';
  modal.scrollIntoView({ behavior: 'smooth' });

  try {
    const r = await dapi('/admin/farmers/' + farmerId);
    const d = r.data || {};
    const f = d.farmer || {};
    const u = f.userId || {};

    if (title) title.textContent = `Farmer Details: ${u.name || 'Farmer'} (${f.farmerId || ''})`;

    box.innerHTML = `
      <div class="kpis" style="margin-bottom:14px">
        <div class="kpi"><small>Mobile Number</small><strong>${escD(u.phone || '—')}</strong></div>
        <div class="kpi"><small>Email Address</small><strong>${escD(u.email || '—')}</strong></div>
        <div class="kpi"><small>State / District</small><strong>${escD(f.address?.district || '')}, ${escD(f.address?.state || '')}</strong></div>
        <div class="kpi"><small>Village / Block</small><strong>${escD(f.address?.village || '')}, ${escD(f.address?.block || '')}</strong></div>
      </div>

      <div class="dash-grid" style="grid-template-columns:1fr 1fr;gap:14px">
        <div class="panel">
          <h5 style="margin:0 0 8px 0;color:var(--green-950)">🌾 Registered Crops (${(f.crops || []).length})</h5>
          ${(f.crops || []).length ? `<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
            ${f.crops.map(c => `<li style="padding:8px;background:#fff;border-radius:6px;border:1px solid #e0e0e0">
              <strong>${escD(c.cropName || c.cropId?.name || 'Crop')}</strong> — ${c.expectedQuantity || 0} qtl (${c.season || 'Kharif'}) · Grade: ${escD(c.qualityGrade || 'Standard')}
            </li>`).join('')}
          </ul>` : '<div class="empty">No crops registered.</div>'}
        </div>

        <div class="panel">
          <h5 style="margin:0 0 8px 0;color:var(--green-950)">📅 Booking History (${(d.bookings || []).length})</h5>
          ${(d.bookings || []).length ? `<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
            ${d.bookings.map(b => `<li style="padding:8px;background:#fff;border-radius:6px;border:1px solid #e0e0e0">
              <strong>${escD(b.cropId?.name || 'Crop')}</strong> (${b.quantity} qtl) @ ${escD(b.centreId?.name || 'Centre')} · Status: <strong>${escD(b.status)}</strong>
            </li>`).join('')}
          </ul>` : '<div class="empty">No booking history.</div>'}
        </div>

        <div class="panel">
          <h5 style="margin:0 0 8px 0;color:var(--green-950)">🌾 Procurement Records (${(d.procurements || []).length})</h5>
          ${(d.procurements || []).length ? `<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
            ${d.procurements.map(p => `<li style="padding:8px;background:#fff;border-radius:6px;border:1px solid #e0e0e0">
              Accepted: <strong>${p.acceptedQuantity || 0} qtl</strong> @ ₹${p.rate || 2425}/qtl · Bill: <code>${escD(p.billNo || '—')}</code> · Status: <strong>${escD(p.status)}</strong>
            </li>`).join('')}
          </ul>` : '<div class="empty">No procurement records.</div>'}
        </div>

        <div class="panel">
          <h5 style="margin:0 0 8px 0;color:var(--green-950)">₹ Payment Records (${(d.payments || []).length})</h5>
          ${(d.payments || []).length ? `<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
            ${d.payments.map(pay => `<li style="padding:8px;background:#fff;border-radius:6px;border:1px solid #e0e0e0">
              Amount: <strong style="color:var(--green-900)">₹${Number(pay.amount || 0).toLocaleString('en-IN')}</strong> · Ref: <code>${escD(pay.reference || '—')}</code> · Status: <span class="status-pill status-active">${escD(pay.status)}</span>
            </li>`).join('')}
          </ul>` : '<div class="empty">No payment records.</div>'}
        </div>
      </div>
    `;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadAdminBookings() {
  const box = document.getElementById('adminBookingsContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading system bookings from MongoDB...</div>';
  try {
    const r = await dapi('/admin/bookings');
    const bookings = r.data || [];

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">System-Wide Mandi Bookings (${bookings.length})</h3>
          <p class="small" style="margin:2px 0 0 0">All slot bookings created by registered farmers across connected procurement centres.</p>
        </div>
        <button class="btn btn-outline btn-small" onclick="loadAdminBookings()">🔄 Refresh Bookings</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Gate Pass ID</th>
              <th>Farmer</th>
              <th>Centre</th>
              <th>Crop & Quantity</th>
              <th>Slot Date & Time</th>
              <th>Token</th>
              <th>Status</th>
              <th>Procurement Status</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.length ? bookings.map(b => {
              const farmerName = b.farmerId?.userId?.name || 'Farmer';
              const farmerPhone = b.farmerId?.userId?.phone || '';
              const centreName = b.centreId?.name || 'Centre';
              const cropName = b.cropId?.name || 'Crop';
              const slotStr = b.slotId ? `${new Date(b.slotId.date).toLocaleDateString('en-IN')} (${b.slotId.startTime}–${b.slotId.endTime})` : '—';
              const tokenStr = b.queue?.token || '—';

              return `<tr>
                <td><code>${escD(b.gatePassId || b._id.slice(-8).toUpperCase())}</code></td>
                <td><strong>${escD(farmerName)}</strong><br><small style="color:var(--ink-soft)">${escD(farmerPhone)}</small></td>
                <td>🏢 ${escD(centreName)}</td>
                <td>🌾 <strong>${escD(cropName)}</strong> (${b.quantity} qtl)</td>
                <td>🗓️ ${escD(slotStr)}</td>
                <td>🎟️ <strong>${escD(tokenStr)}</strong></td>
                <td><span class="status-pill status-active">${escD(b.status)}</span></td>
                <td><span class="status-pill ${b.procurement?.status === 'PROCURED' ? 'status-active' : 'status-warn'}">${escD(b.procurement?.status || 'SLOT_BOOKED')}</span></td>
              </tr>`;
            }).join('') : '<tr><td colspan="8" class="empty">No bookings found in database.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadAdminProcurement() {
  const box = document.getElementById('adminProcurementContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading procurement records from MongoDB...</div>';
  try {
    const r = await dapi('/admin/procurement');
    const items = r.data || [];

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">Mandi Procurement Records (${items.length})</h3>
          <p class="small" style="margin:2px 0 0 0">Real-time monitoring of quality testing, weighments and confirmed procurement bills.</p>
        </div>
        <button class="btn btn-outline btn-small" onclick="loadAdminProcurement()">🔄 Refresh</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Farmer</th>
              <th>Procurement Centre</th>
              <th>Crop</th>
              <th>Accepted Quantity</th>
              <th>Quality Grade</th>
              <th>MSP Rate (₹/qtl)</th>
              <th>Total Amount (₹)</th>
              <th>Confirmed Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${items.length ? items.map(p => {
              const farmerName = p.farmerId?.userId?.name || 'Farmer';
              const farmerPhone = p.farmerId?.userId?.phone || '';
              const centreName = p.bookingId?.centreId?.name || 'Procurement Centre';
              const cropName = p.cropId?.name || 'Crop';
              const qty = p.acceptedQuantity || 0;
              const rate = p.rate || 2425;
              const totalAmount = Math.round(qty * rate);

              return `<tr>
                <td><code>${escD(p.billNo || 'Pending')}</code></td>
                <td><strong>${escD(farmerName)}</strong><br><small style="color:var(--ink-soft)">${escD(farmerPhone)}</small></td>
                <td>🏢 ${escD(centreName)}</td>
                <td>🌾 <strong>${escD(cropName)}</strong></td>
                <td><strong>${qty} qtl</strong></td>
                <td>${escD(p.quality?.grade || p.quality?.result || 'Grade A')}</td>
                <td>₹${rate.toLocaleString('en-IN')}</td>
                <td><strong style="color:var(--green-900)">₹${totalAmount.toLocaleString('en-IN')}</strong></td>
                <td>${p.confirmedAt ? new Date(p.confirmedAt).toLocaleDateString('en-IN') : '—'}</td>
                <td><span class="status-pill ${p.status === 'PROCURED' ? 'status-active' : 'status-warn'}">${escD(p.status)}</span></td>
              </tr>`;
            }).join('') : '<tr><td colspan="10" class="empty">No procurement records logged yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadAdminPayments() {
  const box = document.getElementById('adminPaymentsContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading payment analytics & records from MongoDB...</div>';
  try {
    const [paysRes, analyticsRes] = await Promise.all([
      dapi('/admin/payments'),
      dapi('/admin/payments/analytics')
    ]);
    const pays = paysRes.data || [];
    const a = analyticsRes.data || {};

    box.innerHTML = `<div class="kpis">
      <div class="kpi"><small>Total Payment Value</small><strong>₹${Number(a.totalAmount || 0).toLocaleString('en-IN')}</strong></div>
      <div class="kpi"><small>Total Bank Credited (Paid)</small><strong style="color:var(--green-900)">₹${Number(a.paidAmount || 0).toLocaleString('en-IN')}</strong></div>
      <div class="kpi"><small>Pending PFMS Settlement</small><strong style="color:var(--gold-dark,#b48312)">₹${Number(a.pendingAmount || 0).toLocaleString('en-IN')}</strong></div>
      <div class="kpi"><small>Total Payment Transactions</small><strong>${a.totalCount || 0}</strong></div>
    </div>

    <div class="card" style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <h3 style="margin:0;color:var(--green-950)">Payment Transactions Lifecycle (${pays.length})</h3>
        <button class="btn btn-outline btn-small" onclick="loadAdminPayments()">🔄 Refresh Payments</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Payment Ref</th>
              <th>Farmer Name</th>
              <th>Centre</th>
              <th>Crop</th>
              <th>Accepted Qty</th>
              <th>MSP Rate</th>
              <th>Amount (₹)</th>
              <th>Gateway</th>
              <th>Paid Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${pays.length ? pays.map(pay => {
              const farmerName = pay.farmerId?.userId?.name || 'Farmer';
              const farmerPhone = pay.farmerId?.userId?.phone || '';
              const proc = pay.procurementId || {};
              const cropName = proc.cropId?.name || 'Crop';
              const centreName = proc.bookingId?.centreId?.name || 'Procurement Centre';
              const qty = proc.acceptedQuantity || 0;
              const rate = proc.rate || 2425;

              return `<tr>
                <td><code>${escD(pay.reference || pay._id.slice(-8).toUpperCase())}</code></td>
                <td><strong>${escD(farmerName)}</strong><br><small style="color:var(--ink-soft)">${escD(farmerPhone)}</small></td>
                <td>🏢 ${escD(centreName)}</td>
                <td>🌾 ${escD(cropName)}</td>
                <td>${qty} qtl</td>
                <td>₹${rate.toLocaleString('en-IN')}</td>
                <td><strong style="color:var(--green-900);font-size:1.05rem">₹${Number(pay.amount || 0).toLocaleString('en-IN')}</strong></td>
                <td><small>${escD(pay.mode || 'DEMO_PFMS')}</small></td>
                <td>${pay.paidAt ? new Date(pay.paidAt).toLocaleDateString('en-IN') : '—'}</td>
                <td><span class="status-pill ${pay.status === 'PAID' ? 'status-active' : 'status-warn'}">${escD(pay.status)}</span></td>
              </tr>`;
            }).join('') : '<tr><td colspan="10" class="empty">No payment transactions recorded in MongoDB yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadAdminGrievances() {
  const box = document.getElementById('adminGrievancesContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading farmer grievances from MongoDB...</div>';
  try {
    const r = await dapi('/admin/grievances');
    const list = r.data || [];

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">Farmer Grievances & Redressal (${list.length})</h3>
          <p class="small" style="margin:2px 0 0 0">Review issues raised by farmers, update status, and post resolution notes.</p>
        </div>
        <button class="btn btn-outline btn-small" onclick="loadAdminGrievances()">🔄 Refresh Grievances</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ref ID</th>
              <th>Farmer</th>
              <th>Category</th>
              <th>Subject</th>
              <th>Description</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.length ? list.map(g => {
              const farmerName = g.farmerId?.userId?.name || 'Farmer';
              const farmerPhone = g.farmerId?.userId?.phone || '';

              return `<tr>
                <td><code>${escD(g._id.slice(-8).toUpperCase())}</code></td>
                <td><strong>${escD(farmerName)}</strong><br><small style="color:var(--ink-soft)">${escD(farmerPhone)}</small></td>
                <td><span class="status-pill status-active">${escD(g.category)}</span></td>
                <td><strong>${escD(g.subject)}</strong></td>
                <td><small style="max-width:260px;display:block;white-space:normal;line-height:1.3">${escD(g.description)}</small></td>
                <td>${new Date(g.createdAt).toLocaleDateString('en-IN')}</td>
                <td><span class="status-pill ${g.status === 'RESOLVED' || g.status === 'CLOSED' ? 'status-active' : 'status-warn'}">${escD(g.status)}</span></td>
                <td>
                  <button class="btn btn-primary btn-small" onclick="updateAdminGrievanceStatus('${g._id}', '${g.status}')">✏️ Update Status</button>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="8" class="empty">No grievances submitted yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function updateAdminGrievanceStatus(id, currentStatus) {
  const statusChoice = prompt(`Select New Grievance Status:\n1. IN_PROGRESS\n2. RESOLVED\n3. CLOSED\n4. OPEN\n\nCurrent Status: ${currentStatus}`);
  let newStatus = currentStatus;
  if (statusChoice === '1') newStatus = 'IN_PROGRESS';
  else if (statusChoice === '2') newStatus = 'RESOLVED';
  else if (statusChoice === '3') newStatus = 'CLOSED';
  else if (statusChoice === '4') newStatus = 'OPEN';
  else return;

  const notes = prompt('Resolution notes or message for farmer:', '');

  try {
    await dapi('/admin/grievances/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, resolutionNotes: notes })
    });
    alert('✓ Grievance status updated to ' + newStatus + '. Notification sent to farmer!');
    loadAdminGrievances();
  } catch (e) {
    alert(e.message);
  }
}

async function loadAdminReports() {
  const box = document.getElementById('adminReportsContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Generating system-wide analytics & reports from MongoDB...</div>';
  try {
    const r = await dapi('/admin/reports');
    const d = r.data || {};
    const b = d.bookings || {};
    const p = d.procurement || {};
    const pay = d.payments || {};
    const c = d.counts || {};

    box.innerHTML = `<div class="card">
      <h3 style="margin:0 0 14px 0;color:var(--green-950)">▤ System-Wide Operations & Analytics Report</h3>
      
      <div class="kpis">
        <div class="kpi"><small>Total Registered Farmers</small><strong>${c.farmers || 0}</strong></div>
        <div class="kpi"><small>Procurement Centres</small><strong>${c.centres || 0}</strong></div>
        <div class="kpi"><small>Centre Operators</small><strong>${c.operators || 0}</strong></div>
        <div class="kpi"><small>Transport Operators</small><strong>${c.transporters || 0}</strong></div>
        <div class="kpi"><small>Total Slot Bookings</small><strong>${b.total || 0}</strong></div>
        <div class="kpi"><small>Total Procured Quantity</small><strong>${Number(p.totalQuantityQtl || 0).toFixed(2)} qtl</strong></div>
        <div class="kpi"><small>Total Payout Value</small><strong>₹${Number(pay.totalAmount || 0).toLocaleString('en-IN')}</strong></div>
      </div>

      <div class="dash-grid" style="margin-top:20px;grid-template-columns:1fr 1fr">
        <div class="panel">
          <h4 style="margin:0 0 10px 0;color:var(--green-950)">🌾 Crop-wise Procurement Summary</h4>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Lots Procured</th>
                  <th>Total Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${(p.cropBreakdown || []).length ? (p.cropBreakdown || []).map(item => `<tr>
                  <td><strong>${escD(item._id || item.crop || 'Crop')}</strong></td>
                  <td>${item.count || 1}</td>
                  <td>${Number(item.qtl || item.totalQtl || 0).toFixed(2)} qtl</td>
                </tr>`).join('') : '<tr><td colspan="3" class="empty">No crop procurements logged yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <h4 style="margin:0 0 10px 0;color:var(--green-950)">₹ Payment Settlement Summary</h4>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
            <li style="padding:12px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between">
              <span>Total Initiated Payouts:</span>
              <strong style="color:var(--green-950)">₹${Number(pay.totalAmount || 0).toLocaleString('en-IN')}</strong>
            </li>
            <li style="padding:12px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between">
              <span>Bank Credited (Completed):</span>
              <strong style="color:var(--green-900)">₹${Number(pay.paidAmount || 0).toLocaleString('en-IN')}</strong>
            </li>
            <li style="padding:12px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between">
              <span>Pending Settlement:</span>
              <strong style="color:var(--gold-dark,#b48312)">₹${Number(pay.pendingAmount || 0).toLocaleString('en-IN')}</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadAdminAuditLogs() {
  const box = document.getElementById('adminAuditLogsContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading administrative audit logs from MongoDB...</div>';
  try {
    const r = await dapi('/admin/audit-logs');
    const logs = r.data || [];

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">System Audit Trail (${logs.length})</h3>
          <p class="small" style="margin:2px 0 0 0">Recorded audit events for administrative actions, centre updates, and status changes.</p>
        </div>
        <button class="btn btn-outline btn-small" onclick="loadAdminAuditLogs()">🔄 Refresh Audit Logs</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor / Officer</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Metadata / Notes</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length ? logs.map(l => {
              const actorName = l.actorId?.name || l.actorId?.email || 'System / Admin';
              const actorRole = l.actorId?.role || 'ADMIN';
              const metaStr = l.metadata ? JSON.stringify(l.metadata) : l.reason || '—';

              return `<tr>
                <td><small style="color:var(--ink-soft)">${new Date(l.createdAt).toLocaleString('en-IN')}</small></td>
                <td><strong>${escD(actorName)}</strong> <span class="status-pill status-active" style="font-size:0.7rem">${escD(actorRole)}</span></td>
                <td><strong style="color:var(--green-900)">${escD(l.action)}</strong></td>
                <td><code>${escD(l.entityType)}</code></td>
                <td><code>${escD(l.entityId || '—')}</code></td>
                <td><small style="max-width:240px;display:block;white-space:normal;overflow:hidden;text-overflow:ellipsis">${escD(metaStr)}</small></td>
              </tr>`;
            }).join('') : '<tr><td colspan="6" class="empty">No audit log entries recorded yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadOperatorQueue(){
  const box=document.getElementById('operatorQueueContent');
  if(!box)return;
  box.innerHTML='<div class="empty">Loading today\'s queue from MongoDB...</div>';
  try{
    const r=await dapi('/operator/queue');
    const queueList=r.data||[];
    box.innerHTML=`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <h3 style="margin:0;color:var(--green-950)">Real-time Mandi Token Queue (${queueList.length} total)</h3>
        <button class="btn btn-outline btn-small" onclick="loadOperatorQueue()">🔄 Refresh Queue</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Gate Pass ID</th>
              <th>Farmer</th>
              <th>Crop & Qty</th>
              <th>Slot Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${queueList.length?queueList.map(q=>{
              const farmerName=q.farmerId?.userId?.name||'Farmer';
              const farmerPhone=q.farmerId?.userId?.phone||'';
              const booking=q.bookingId||{};
              const cropName=booking.cropId?.name||'Crop';
              const qty=booking.quantity||0;
              const slotStr=booking.slotId?`${booking.slotId.startTime}–${booking.slotId.endTime}`:'—';
              const isCheckedIn=['CHECKED_IN','CALLED','QUALITY_PASSED','QUALITY_REJECTED','WEIGHED','COMPLETED'].includes(q.status);

              return `<tr>
                <td><strong style="color:var(--green-900);font-size:1.05rem">🎟️ ${escD(q.token)}</strong></td>
                <td><code>${escD(q.gatePassId||'—')}</code></td>
                <td><strong>${escD(farmerName)}</strong><br><span class="small" style="color:var(--ink-soft)">${escD(farmerPhone)}</span></td>
                <td>🌾 <strong>${escD(cropName)}</strong> (${qty} qtl)</td>
                <td>⏱️ ${escD(slotStr)}</td>
                <td><span class="status-pill ${isCheckedIn?'status-active':'status-warn'}">${escD(q.status)}</span></td>
                <td>
                  ${!isCheckedIn?`<button class="btn btn-primary btn-small" onclick="submitOperatorCheckin('${q.gatePassId||q.token}','Queue Table')">Gate Check-in</button>`:''}
                  <button class="btn btn-outline btn-small" onclick="showSection('quality')">Go to Quality Check →</button>
                </td>
              </tr>`;
            }).join(''):'<tr><td colspan="7" class="empty">No queue tokens for this centre today.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadOperatorCentreHeader(){
  try{
    const r=await dapi('/operator/centre');
    const c=r.data||{};
    const title=document.getElementById('headerCentreTitle');
    const meta=document.getElementById('headerCentreMeta');
    if(title)title.textContent=`🏢 ${c.name||'Procurement Centre'}`;
    if(meta)meta.textContent=`Code: ${c.centreCode||'—'} · District: ${c.location?.district||'—'}, ${c.location?.state||'—'} · Agency: ${c.agency||'NAFED / FCI'} · Status: ${c.status||'ACTIVE'}`;
  }catch(e){
    console.error('Failed to load operator centre header:',e);
    const title=document.getElementById('headerCentreTitle');
    const meta=document.getElementById('headerCentreMeta');
    if(title)title.textContent='🏢 Assigned Procurement Centre';
    if(meta)meta.textContent='Loaded default centre overview';
  }
}

async function loadOperatorCentreOverviewDetails(){
  const box=document.getElementById('overviewCentreDetails');
  const nameEl=document.getElementById('overviewCentreName');
  if(!box)return;
  try{
    const r=await dapi('/operator/centre');
    const c=r.data||{};
    if(nameEl)nameEl.textContent=c.name||'Assigned Procurement Centre';
    box.innerHTML=`<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
      <li><strong>Centre Code:</strong> ${escD(c.centreCode)}</li>
      <li><strong>Location:</strong> ${escD(c.location?.address||'')}, ${escD(c.location?.district)}, ${escD(c.location?.state)}</li>
      <li><strong>Nodal Agency:</strong> ${escD(c.agency)}</li>
      <li><strong>Operating Hours:</strong> ${escD(c.operatingHours?.start||'08:00')} AM – ${escD(c.operatingHours?.end||'17:00')} PM</li>
      <li><strong>Counters Active:</strong> ${c.capacity?.counters||1} Counters</li>
      <li><strong>Daily Capacity:</strong> ${c.capacity?.daily||0} quintals / ${c.capacity?.slots||0} slots</li>
    </ul>`;
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadOperatorProfile(){
  const box=document.getElementById('profileContent');
  if(!box)return;
  box.innerHTML='<div class="empty">Loading operator profile & centre assignments...</div>';
  try{
    const [p,c]=await Promise.all([dapi('/operator/profile'),dapi('/operator/centre')]);
    const u=p.data||{};
    const centre=c.data||{};
    box.innerHTML=`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0;color:var(--green-950)">👤 Operator Account & Assigned Mandi Profile</h3>
        <span class="status-pill status-active">OPERATOR ROLE</span>
      </div>
      <div class="form-grid">
        <div><label>Operator Name</label><div style="font-weight:700;font-size:1.05rem;color:var(--green-900)">${escD(u.name)}</div></div>
        <div><label>Email Address</label><div>${escD(u.email)}</div></div>
        <div><label>Phone Number</label><div>${escD(u.phone||'—')}</div></div>
        <div><label>Assigned Mandi / Centre</label><div style="font-weight:700;color:var(--green-950)">🏢 ${escD(centre.name||'Karnal Mandi Yard 2')}</div></div>
        <div><label>Centre Code</label><div>${escD(centre.centreCode||'—')}</div></div>
        <div><label>Agency</label><div>${escD(centre.agency||'NAFED / FCI')}</div></div>
        <div><label>District & State</label><div>${escD(centre.location?.district)}, ${escD(centre.location?.state)}</div></div>
        <div><label>Operational Status</label><div class="status-pill status-active">${escD(centre.status||'ACTIVE')}</div></div>
      </div>
    </div>`;
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

async function loadOperatorQuality(){
  const box=document.getElementById('qualityContent');
  if(!box)return;
  box.innerHTML='<div class="empty">Loading checked-in lots for quality testing...</div>';
  try{
    const r=await dapi('/operator/work-items');
    const items=(r.data||[]).filter(x=>['CHECKED_IN','CALLED','QUALITY_PASSED','QUALITY_REJECTED','WEIGHED','PROCURED','COMPLETED'].includes(x.queue?.status||x.procurement?.status));
    
    box.innerHTML=`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">🔬 Crop Quality Check & Multi-Photo AI Analysis</h3>
          <p class="small" style="margin:2px 0 0 0">Mandatory: Upload at least 5 crop photos (different angles) for AI grading analysis</p>
        </div>
        <span class="status-pill status-active">5-Image AI Engine Active</span>
      </div>

      ${items.length?items.map(x=>{
        const p=x.procurement||{};
        const q=x.queue||{};
        const b=x.booking||{};
        const isDone=['QUALITY_PASSED','QUALITY_REJECTED','WEIGHED','PROCURED','COMPLETED'].includes(p.status);

        return `<div class="panel" style="margin-top:16px;border: 1px solid rgba(42,89,69,0.2)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <span class="eyebrow">TOKEN: ${escD(q.token)} · GATE PASS: ${escD(b.gatePassId||q.gatePassId||'—')}</span>
              <h4 style="margin:4px 0 2px 0;font-size:1.1rem;color:var(--green-950)">🌾 ${escD(b.cropId?.name||p.cropId?.name||'Crop')} — ${b.quantity||0} quintals</h4>
              <p style="margin:0;font-size:0.85rem;color:var(--ink-soft)">Farmer: <strong>${escD(q.farmerId?.userId?.name||'Farmer')}</strong> (${escD(q.farmerId?.userId?.phone||'—')})</p>
            </div>
            <span class="status-pill ${p.status==='QUALITY_PASSED'?'status-active':p.status==='QUALITY_REJECTED'?'status-warn':'status-active'}">${escD(p.status||'PENDING_QUALITY')}</span>
          </div>

          ${!isDone?`
            <div style="margin-top:14px;padding:14px;background:var(--paper);border-radius:12px">
              <h5 style="margin:0 0 8px 0;color:var(--green-950)">📷 Upload 5 Crop Photos for AI Quality Grading</h5>
              
              <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px" id="imgGrid-${p._id}">
                ${[1,2,3,4,5].map(idx=>`
                  <div style="border: 2px dashed #b5c7bc; border-radius: 8px; padding: 10px; text-align: center; background: #fff">
                    <div style="font-size: 0.75rem; font-weight:700; color:var(--green-900)">Photo ${idx}</div>
                    <input type="file" accept="image/*" class="quality-img-input-${p._id}" style="margin-top:6px; font-size:0.7rem; width:100%" onchange="previewQualityImage(this, 'prev-${p._id}-${idx}')">
                    <img id="prev-${p._id}-${idx}" style="display:none; margin-top:6px; width:100%; height:60px; object-fit:cover; border-radius:4px">
                  </div>
                `).join('')}
              </div>

              <div style="margin-top:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
                <button class="btn btn-outline btn-small" type="button" onclick="runAIGrading('${p._id}', '${b.cropId?.name||p.cropId?.name||'Wheat'}')">🤖 Analyze with Python AI Microservice</button>
                <span class="small" id="aiStatus-${p._id}" style="color:var(--ink-soft)">Select 5 crop images to run AI test</span>
              </div>

              <div id="aiResultBox-${p._id}" style="margin-top:12px"></div>

              <div class="form-grid" style="margin-top:14px">
                <div>
                  <label>Final Mandi Quality Grade</label>
                  <select id="grade-${p._id}">
                    <option value="Grade A">Grade A (FAQ — Premium MSP)</option>
                    <option value="Grade B">Grade B (3% Price Deduction)</option>
                    <option value="Below Grade">Below Grade (Reject)</option>
                  </select>
                </div>
                <div>
                  <label>Grade Notes / Observations</label>
                  <input id="reason-${p._id}" placeholder="e.g. Clean grain, moisture 11.8%">
                </div>
              </div>

              <div style="margin-top:14px;display:flex;gap:12px">
                <button class="btn btn-primary btn-small" onclick="operatorQuality('${p._id}','PASS')">✓ Pass Quality & Send to Weighbridge</button>
                <button class="btn btn-outline btn-small" style="color:#b00;border-color:#b00" onclick="operatorQuality('${p._id}','REJECT')">✕ Reject Lot</button>
              </div>
            </div>
          `:`
            <div style="margin-top:10px;padding:10px 14px;background:rgba(42,89,69,0.05);border-radius:8px">
              <div>Quality Status: <strong>${escD(p.quality?.grade||p.status)}</strong></div>
              <div class="small">Observations: ${escD(p.quality?.recommendations||p.quality?.observations?.join(', ')||"Quality check completed")}</div>
              <button class="btn btn-outline btn-small" style="margin-top:8px" onclick="showSection('weighment')">Proceed to Weighment →</button>
            </div>
          `}
        </div>`;
      }).join(''):'<div class="empty">No checked-in lots waiting for quality evaluation.</div>'}
    </div>`;
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

function previewQualityImage(input, imgId) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById(imgId);
      if (img) {
        img.src = e.target.result;
        img.style.display = 'block';
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function runAIGrading(procId, cropName) {
  const inputs = document.querySelectorAll(`.quality-img-input-${procId}`);
  const statusEl = document.getElementById(`aiStatus-${procId}`);
  const resultBox = document.getElementById(`aiResultBox-${procId}`);
  
  const files = [];
  inputs.forEach(inp => {
    if (inp.files && inp.files[0]) files.push(inp.files[0]);
  });

  if (files.length < 5) {
    alert(`Please upload at least 5 photos of the crop. You currently have selected ${files.length} photo(s).`);
    return;
  }

  statusEl.textContent = 'Uploading 5 images to Python AI microservice for grading...';
  
  try {
    const dataUrls = await Promise.all(files.map(f => new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(f);
    })));

    const res = await dapi('/public/quality-check-ai', {
      method: 'POST',
      body: JSON.stringify({
        cropType: cropName,
        mspRate: 2425,
        images: dataUrls
      })
    });

    const ai = res.data || {};
    statusEl.textContent = '✓ AI Analysis Complete!';
    
    resultBox.innerHTML = `<div class="grain-result" style="background:#fff;border:1px solid var(--green-700);border-radius:10px;padding:12px;margin-top:8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong style="color:var(--green-950);font-size:1.1rem">AI Recommended Grade: ${escD(ai.overallGrade)}</strong>
        <span class="status-pill status-active">Confidence: ${ai.confidenceScore}%</span>
      </div>
      <div class="grain-metrics" style="margin:10px 0;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:var(--paper);padding:8px;border-radius:8px">
        <div><span>Moisture:</span> <strong>${ai.metrics?.moisturePct}%</strong></div>
        <div><span>Discoloration:</span> <strong>${ai.metrics?.discolorationPct}%</strong></div>
        <div><span>Foreign Matter:</span> <strong>${ai.metrics?.foreignMatterPct}%</strong></div>
        <div><span>Broken Grain:</span> <strong>${ai.metrics?.brokenGrainPct}%</strong></div>
      </div>
      <div style="font-weight:700;color:var(--green-900)">Suggested Rate: ₹${ai.adjustedRate?.toLocaleString('en-IN')}/qtl (Deduction: ${ai.deductionPct}%)</div>
      <p class="small" style="margin:4px 0 0 0;color:var(--ink-soft)">AI Observations: ${escD((ai.observations||[]).join('; '))}</p>
    </div>`;

    const gradeSelect = document.getElementById(`grade-${procId}`);
    if (gradeSelect) {
      if (ai.overallGrade?.includes('Grade A') || ai.overallGrade?.includes('FAQ')) gradeSelect.value = 'Grade A';
      else if (ai.overallGrade?.includes('Grade B')) gradeSelect.value = 'Grade B';
      else gradeSelect.value = 'Below Grade';
    }

    const reasonInput = document.getElementById(`reason-${procId}`);
    if (reasonInput) {
      reasonInput.value = `AI Score ${ai.confidenceScore}%: ${ai.overallGrade} (${ai.observations?.[0]||'Passed AI test'})`;
    }
  } catch (e) {
    statusEl.textContent = 'AI service error: ' + e.message;
    alert('AI Analysis failed: ' + e.message);
  }
}

async function loadOperatorWeighment() {
  const box = document.getElementById('weighmentContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading quality-passed lots for weighment...</div>';
  try {
    const r = await dapi('/operator/work-items');
    const items = (r.data || []).filter(x => ['QUALITY_PASSED', 'WEIGHED', 'PROCURED', 'COMPLETED'].includes(x.procurement?.status));
    
    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">⚖ Digital Weighbridge Integration</h3>
          <p class="small" style="margin:2px 0 0 0">Net Weight = Gross Weight - Tare Weight. Convert automatically to Quintals.</p>
        </div>
        <span class="status-pill status-active">Digital Scale Live</span>
      </div>

      ${items.length ? items.map(x => {
        const p = x.procurement || {};
        const q = x.queue || {};
        const b = x.booking || {};
        const isWeighed = ['WEIGHED', 'PROCURED', 'COMPLETED'].includes(p.status);
        const bookedKg = Number(b.quantity || 0) * 100;
        const defaultGross = bookedKg + 1400;

        return `<div class="panel" style="margin-top:14px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <span class="eyebrow">TOKEN: ${escD(q.token)} · GATE PASS: ${escD(b.gatePassId || '—')}</span>
              <h4 style="margin:4px 0 2px 0;font-size:1.1rem;color:var(--green-950)">🌾 ${escD(b.cropId?.name || 'Crop')} — Booked: ${b.quantity || 0} qtl</h4>
              <p style="margin:0;font-size:0.85rem;color:var(--ink-soft)">Farmer: <strong>${escD(q.farmerId?.userId?.name || 'Farmer')}</strong></p>
            </div>
            <span class="status-pill ${isWeighed ? 'status-active' : 'status-warn'}">${escD(p.status)}</span>
          </div>

          <div style="margin-top:14px;padding:14px;background:var(--paper);border-radius:12px">
            <div class="form-grid">
              <div>
                <label>Gross Weight (kg)</label>
                <input id="gross-${p._id}" type="number" value="${p.weighment?.grossKg || defaultGross}" oninput="calcNetWeight('${p._id}')">
              </div>
              <div>
                <label>Tare Weight (Trolley/Truck kg)</label>
                <input id="tare-${p._id}" type="number" value="${p.weighment?.tareKg || 1400}" oninput="calcNetWeight('${p._id}')">
              </div>
              <div>
                <label>Calculated Net Weight (kg)</label>
                <div id="netKgDisplay-${p._id}" style="font-size:1.2rem;font-weight:800;color:var(--green-900);padding:8px 0">
                  ${p.weighment?.netKg || (defaultGross - 1400)} kg
                </div>
              </div>
              <div>
                <label>Procured Net Quantity (Quintals)</label>
                <div id="netQtlDisplay-${p._id}" style="font-size:1.2rem;font-weight:800;color:var(--green-950);padding:8px 0">
                  ${p.acceptedQuantity || ((defaultGross - 1400) / 100).toFixed(2)} qtl
                </div>
              </div>
            </div>

            <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-primary btn-small" onclick="operatorWeigh('${p._id}')">💾 Record Digital Weighment</button>
              <button class="btn btn-outline btn-small" type="button" onclick="generateWeighbridgeSlipPDF('${q.token}', '${b.cropId?.name || 'Crop'}', '${p._id}')">📄 Download Weighbridge Slip (PDF)</button>
            </div>
          </div>
        </div>`;
      }).join('') : '<div class="empty">No quality-passed lots ready for weighment.</div>'}
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

function calcNetWeight(id) {
  const gross = Number(document.getElementById(`gross-${id}`)?.value || 0);
  const tare = Number(document.getElementById(`tare-${id}`)?.value || 0);
  const netKg = Math.max(0, gross - tare);
  const netQtl = (netKg / 100).toFixed(2);
  
  const kgEl = document.getElementById(`netKgDisplay-${id}`);
  const qtlEl = document.getElementById(`netQtlDisplay-${id}`);
  if (kgEl) kgEl.textContent = `${netKg} kg`;
  if (qtlEl) qtlEl.textContent = `${netQtl} qtl`;
}

function generateWeighbridgeSlipPDF(token, cropName, procId) {
  if (!window.jspdf?.jsPDF) { alert('PDF generator is loading...'); return; }
  const gross = Number(document.getElementById(`gross-${procId}`)?.value || 3820);
  const tare = Number(document.getElementById(`tare-${procId}`)?.value || 1400);
  const netKg = Math.max(0, gross - tare);
  const netQtl = (netKg / 100).toFixed(2);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: [360, 480] });

  doc.setFillColor(42, 89, 69);
  doc.rect(0, 0, 360, 64, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('OFFICIAL WEIGHBRIDGE SLIP', 20, 36);
  doc.setFontSize(10);
  doc.text('Fasal Setu Mandi Integration (SIH 2026)', 20, 52);

  doc.setTextColor(32, 38, 31);
  doc.setFontSize(11);
  let y = 96;

  const row = (label, val) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 24, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(val), 180, y);
    y += 24;
  };

  row('Token Number:', token);
  row('Crop Commodity:', cropName);
  row('Gross Weight:', `${gross} kg`);
  row('Tare Weight:', `${tare} kg`);
  row('Net Weight:', `${netKg} kg`);
  row('Accepted Net Quantity:', `${netQtl} Quintals`);
  row('Scale Serial No:', 'FS-SCALE-KRN-04');
  row('Geofence Verification:', 'PASSED (0.0 km from Mandi)');
  row('Weighment Timestamp:', new Date().toLocaleString('en-IN'));

  doc.setLineWidth(1);
  doc.setDrawColor(200, 200, 200);
  doc.line(24, y + 10, 336, y + 10);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Digitally Signed by Authorized Mandi Operator', 24, y + 30);
  doc.save(`Weighbridge-Slip-${token}.pdf`);
}

async function loadOperatorProcurement() {
  const box = document.getElementById('procurementContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading weighed lots for procurement & payment confirmation...</div>';
  try {
    const r = await dapi('/operator/work-items');
    const items = (r.data || []).filter(x => ['WEIGHED', 'PROCURED', 'COMPLETED'].includes(x.procurement?.status));

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">₹ Mandi Procurement & Payment Settlement</h3>
          <p class="small" style="margin:2px 0 0 0">Confirm weight and MSP rates, issue bill, and trigger Direct Benefit Transfer (DBT) demo payment.</p>
        </div>
        <span class="status-pill status-active">PFMS Gateway Ready</span>
      </div>

      ${items.length ? items.map(x => {
        const p = x.procurement || {};
        const q = x.queue || {};
        const b = x.booking || {};
        const pay = x.payment || {};
        const rate = p.rate || 2425;
        const qty = p.acceptedQuantity || b.quantity || 0;
        const totalPayable = Math.round(qty * rate);
        const isProcured = ['PROCURED', 'COMPLETED'].includes(p.status);
        const isPaid = String(pay.status || '').toUpperCase() === 'PAID';

        return `<div class="panel" style="margin-top:14px;border:1px solid rgba(42,89,69,0.2)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <span class="eyebrow">TOKEN: ${escD(q.token)} · GATE PASS: ${escD(b.gatePassId || '—')}</span>
              <h4 style="margin:4px 0 2px 0;font-size:1.1rem;color:var(--green-950)">🌾 ${escD(b.cropId?.name || 'Crop')} Procurement</h4>
              <p style="margin:0;font-size:0.85rem;color:var(--ink-soft)">Farmer: <strong>${escD(q.farmerId?.userId?.name || 'Farmer')}</strong> (${escD(q.farmerId?.userId?.phone || '—')})</p>
            </div>
            <span class="status-pill ${isPaid ? 'status-active' : 'status-warn'}">${escD(pay.status || p.status)}</span>
          </div>

          <div style="margin-top:14px;padding:14px;background:var(--paper);border-radius:12px">
            <div class="metric-row" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">
              <div class="metric"><small>Accepted Net Qty</small><strong style="font-size:1.1rem;color:var(--green-900)">${qty} qtl</strong></div>
              <div class="metric"><small>Mandi Rate (₹/qtl)</small><strong style="font-size:1.1rem;color:var(--green-950)">₹${rate.toLocaleString('en-IN')}</strong></div>
              <div class="metric"><small>Total Payable Amount</small><strong style="font-size:1.2rem;color:var(--green-900)">₹${totalPayable.toLocaleString('en-IN')}</strong></div>
              <div class="metric"><small>Bill Ref No</small><strong style="font-size:0.95rem">${escD(p.billNo || pay.reference || 'Pending Generation')}</strong></div>
            </div>

            ${!isProcured ? `
              <button class="btn btn-primary btn-small" onclick="operatorConfirmProcurement('${p._id}')">✓ Confirm Procurement & Generate Bill</button>
            ` : !isPaid ? `
              <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
                <button class="btn btn-primary btn-small" onclick="operatorProcessPayment('${pay._id || p._id}')">💳 Process Demo PFMS Payment (₹${totalPayable.toLocaleString('en-IN')})</button>
                <span class="small" style="color:var(--ink-soft)">Status: Payment Initiated</span>
              </div>
            ` : `
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
                <span style="color:var(--green-900);font-weight:700">✓ Payment Settled & Credited to Farmer Bank Account!</span>
                <button class="btn btn-outline btn-small" onclick="generateProcurementReceiptPDF('${q.token}', '${b.cropId?.name||'Crop'}', ${qty}, ${rate}, ${totalPayable}, '${p.billNo||pay.reference||'FS-BILL-4821'}')">📄 Download Final Receipt (PDF)</button>
              </div>
            `}
          </div>
        </div>`;
      }).join('') : '<div class="empty">No weighed lots ready for procurement confirmation.</div>'}
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

function generateProcurementReceiptPDF(token, crop, qty, rate, total, billNo) {
  if (!window.jspdf?.jsPDF) { alert('PDF generator loading...'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: [400, 520] });

  doc.setFillColor(42, 89, 69);
  doc.rect(0, 0, 400, 70, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('MANDI PROCUREMENT BILL & RECEIPT', 20, 38);
  doc.setFontSize(10);
  doc.text('Government of India — MSP Procurement System', 20, 56);

  doc.setTextColor(32, 38, 31);
  doc.setFontSize(11);
  let y = 104;

  const row = (label, val) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 24, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(val), 200, y);
    y += 24;
  };

  row('Bill Reference No:', billNo);
  row('Token Number:', token);
  row('Crop Commodity:', crop);
  row('Accepted Net Quantity:', `${qty} Quintals`);
  row('Approved MSP Rate:', `Rs. ${rate} / quintal`);
  row('Total Payable Amount:', `Rs. ${total.toLocaleString('en-IN')}`);
  row('Payment Status:', 'PAID (PFMS Bank Settlement)');
  row('Transaction Date:', new Date().toLocaleString('en-IN'));

  doc.setLineWidth(1);
  doc.setDrawColor(42, 89, 69);
  doc.line(24, y + 10, 376, y + 10);

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Fasal Setu Platform — Verified & Signed by Procurement Officer', 24, y + 32);
  doc.save(`FasalSetu-Receipt-${billNo}.pdf`);
}

async function operatorQuality(id,result){
  try{
    const gradeVal = document.getElementById('grade-'+id)?.value || 'Grade A';
    const reasonVal = document.getElementById('reason-'+id)?.value || '';
    await dapi('/operator/procurement/'+id+'/quality',{
      method:'PATCH',
      body:JSON.stringify({
        result,
        grade: gradeVal,
        reason: reasonVal,
        observations: [reasonVal || 'Visual and AI quality evaluation completed']
      })
    });
    alert(result==='PASS'?'✓ Quality grade recorded. Sent to Digital Weighbridge!':'✕ Lot marked as quality rejected.');
    loadOperatorQuality();
    loadOperatorWeighment();
  }catch(e){
    alert(e.message);
  }
}

async function operatorWeigh(id){
  try{
    const gross = Number(document.getElementById('gross-'+id).value);
    const tare = Number(document.getElementById('tare-'+id).value);
    await dapi('/operator/procurement/'+id+'/weighment',{
      method:'PATCH',
      body:JSON.stringify({ grossKg: gross, tareKg: tare })
    });
    alert('✓ Net weight (' + Math.max(0, gross - tare) + ' kg) recorded. Sent to Procurement Confirmation!');
    loadOperatorWeighment();
    loadOperatorProcurement();
  }catch(e){
    alert(e.message);
  }
}

async function operatorConfirmProcurement(id){
  try{
    const r=await dapi('/operator/procurement/'+id+'/confirm',{method:'POST',body:'{}'});
    alert('✓ Procurement confirmed & Bill generated! Payment initiated: ₹'+Number(r.data?.payment?.amount||0).toLocaleString('en-IN'));
    loadOperatorProcurement();
  }catch(e){
    alert(e.message);
  }
}

async function operatorProcessPayment(id){
  try{
    await dapi('/operator/payments/'+id+'/process',{method:'POST',body:'{}'});
    alert('✓ Demo PFMS Payment processed! Settlement notification sent to farmer.');
    loadOperatorProcurement();
  }catch(e){
    alert(e.message);
  }
}

async function loadOperatorCentreStatus(){
  const box=document.getElementById('centreStatusContent');
  if(!box)return;
  box.innerHTML='<div class="empty">Loading current centre operational parameters...</div>';
  try{
    const [summary,centre]=await Promise.all([dapi('/operator/summary'),dapi('/operator/centre')]);
    const s=summary.data||{};
    const c=centre.data||{};

    box.innerHTML=`<div class="card">
      <h3 style="margin:0 0 12px 0;color:var(--green-950)">● Centre Operational Status & Capacity Management</h3>
      
      <div class="form-stack">
        <div>
          <label>Operating Status</label>
          <select id="operatorCentreStatus">
            <option value="ACTIVE" ${c.status==='ACTIVE'?'selected':''}>Active — Normal Procurement Operations</option>
            <option value="TEMPORARILY_CLOSED" ${c.status==='TEMPORARILY_CLOSED'?'selected':''}>Temporarily Closed</option>
            <option value="PROCUREMENT_PAUSED" ${c.status==='PROCUREMENT_PAUSED'?'selected':''}>Procurement Paused</option>
            <option value="FULL_CAPACITY" ${c.status==='FULL_CAPACITY'?'selected':''}>Full Capacity — High Congestion</option>
          </select>
        </div>

        <div class="form-grid">
          <div>
            <label>Daily Procurement Capacity (Quintals)</label>
            <input type="number" id="operatorCentreCapDaily" value="${c.capacity?.daily||500}">
          </div>
          <div>
            <label>Daily Slots Available</label>
            <input type="number" id="operatorCentreCapSlots" value="${c.capacity?.slots||50}">
          </div>
          <div>
            <label>Active Weighment Counters</label>
            <input type="number" id="operatorCentreCounters" value="${c.capacity?.counters||2}">
          </div>
        </div>

        <div>
          <label>Status Update Note / Announcement for Farmers</label>
          <input id="operatorCentreReason" value="${escD(c.statusReason||'')}" placeholder="e.g. Counter 2 temporarily undergoing calibration till 2 PM">
        </div>

        <button class="btn btn-primary" style="margin-top:10px" onclick="saveOperatorCentreStatus()">Update Mandi Status & Alert Farmers</button>
      </div>
    </div>`;
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

async function saveOperatorCentreStatus(){
  try{
    const status=document.getElementById('operatorCentreStatus').value;
    const reason=document.getElementById('operatorCentreReason').value;
    const daily=Number(document.getElementById('operatorCentreCapDaily')?.value||500);
    const slots=Number(document.getElementById('operatorCentreCapSlots')?.value||50);
    const counters=Number(document.getElementById('operatorCentreCounters')?.value||2);

    await dapi('/operator/centre-status',{
      method:'PATCH',
      body:JSON.stringify({
        status,
        reason,
        capacity:{daily,slots,counters}
      })
    });
    alert('✓ Mandi operational status and capacity updated in MongoDB!');
    loadOperatorCentreStatus();
    loadOperatorCentreHeader();
  }catch(e){
    alert('Error updating status: '+e.message);
  }
}

async function loadOperatorReports(){
  const box=document.getElementById('reportsContent');
  if(!box)return;
  box.innerHTML='<div class="empty">Generating real-time mandi reports from MongoDB...</div>';
  try{
    const r=await dapi('/operator/reports');
    const d=r.data||{};
    const crops=d.cropBreakdown||[];

    box.innerHTML=`<div class="card">
      <h3 style="margin:0 0 14px 0;color:var(--green-950)">▤ Mandi Daily Operations & Analytics Report</h3>
      
      <div class="kpis">
        <div class="kpi"><small>Total Queue Entries</small><strong>${d.totalQueueEntries||0}</strong></div>
        <div class="kpi"><small>Gate Checked In</small><strong>${d.checkedIn||0}</strong></div>
        <div class="kpi"><small>Procurements Done</small><strong>${d.procured||0}</strong></div>
        <div class="kpi"><small>Procured Net Quantity</small><strong>${Number(d.procuredQuantityQtl||0).toFixed(2)} qtl</strong></div>
        <div class="kpi"><small>Total Settlement Value</small><strong>₹${Number(d.procurementValue||0).toLocaleString('en-IN')}</strong></div>
      </div>

      <div style="margin-top:20px">
        <h4 style="margin:0 0 8px 0;color:var(--green-950)">🌾 Crop-wise Procurement Summary</h4>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Crop Name</th>
                <th>Lots Procured</th>
                <th>Total Quintals</th>
                <th>Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${crops.length?crops.map(c=>`<tr>
                <td><strong>${escD(c.cropName||c._id||'Crop')}</strong></td>
                <td>${c.count||1}</td>
                <td>${Number(c.totalQuantity||0).toFixed(2)} qtl</td>
                <td>₹${Number(c.totalValue||0).toLocaleString('en-IN')}</td>
              </tr>`).join(''):'<tr><td colspan="4" class="empty">No crop procurement records found for today.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }catch(e){
    box.innerHTML=`<div class="notice">${escD(e.message)}</div>`;
  }
}

async function addStaff(role){
  const name=prompt('Full name');
  if(!name)return;
  const email=prompt('Email');
  if(!email)return;
  const phone=prompt('10-digit mobile');
  if(!/^[6-9]\d{9}$/.test(phone||'')){
    alert('Invalid Indian mobile number');
    return;
  }
  const password=prompt('Temporary password for staff member');
  if(!password)return;

  let centreId=null;
  if(role==='OPERATOR'){
    try{
      const centresRes=await dapi('/admin/centres');
      const centres=centresRes.data||[];
      if(!centres.length){
        alert('No procurement centres exist. Please add a centre first.');
        return;
      }
      const centreOptionsStr=centres.map((c,idx)=>`${idx+1}. ${c.name} (${c.location?.district})`).join('\n');
      const choice=prompt(`Select Procurement Centre by entering number (1-${centres.length}):\n\n${centreOptionsStr}`);
      const choiceNum=parseInt(choice,10);
      if(choiceNum>=1 && choiceNum<=centres.length){
        centreId=centres[choiceNum-1]._id;
      }else{
        alert('Invalid selection.');
        return;
      }
    }catch(e){
      alert('Failed to fetch centres list: '+e.message);
      return;
    }
  }

  try{
    await dapi('/admin/staff',{
      method:'POST',
      body:JSON.stringify({name,email,phone,password,role,centreId})
    });
    alert(`Account created successfully for ${name}. Role: ${role}. Password: ${password}`);
    loadStaff();
  }catch(e){
    alert(e.message);
  }
}

async function markAllFarmerNotifications(){try{await dapi('/farmer/notifications/read-all',{method:'PATCH',body:'{}'});loadOverview()}catch(e){alert(e.message)}}

async function updateTransportBooking(id, newStatus) {
  const statusLabels = {
    ACCEPTED: 'accept this transport request',
    REJECTED: 'decline this transport request',
    DRIVER_EN_ROUTE: 'mark Driver En Route for this trip',
    PICKED_UP: 'mark load Picked Up from farmer location',
    IN_TRANSIT: 'mark load In Transit to procurement centre',
    COMPLETED: 'mark delivery Completed at procurement centre'
  };

  const actionText = statusLabels[newStatus] || `update status to ${newStatus}`;
  if (!confirm(`Are you sure you want to ${actionText}?`)) return;

  try {
    const res = await dapi(`/logistics/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    alert(`✓ Transport request status updated to ${newStatus}!`);

    const currentRole = currentUser()?.role;
    if (currentRole === 'LOGISTICS') {
      const activeSection = document.querySelector('.dash-section:not(.hidden)')?.id;
      if (activeSection === 'section-transportBookings') loadTransportBookings();
      else if (activeSection === 'section-transportActive') loadTransportActive();
      else if (activeSection === 'section-transportCompleted') loadTransportCompleted();
      else loadOverview();
    } else if (currentRole === 'FARMER') {
      if (typeof loadFarmerTrolley === 'function') loadFarmerTrolley();
    }
  } catch (err) {
    alert(`❌ Failed to update transport booking: ${err.message}`);
  }
}

async function loadTransportBookings() {
  const box = document.getElementById('transportBookingsContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading transport booking requests...</div>';
  try {
    const r = await dapi('/logistics/bookings?status=ALL');
    const bookings = r.data || [];
    window.__logisticsBookingsCache = bookings;

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">Farmer Trolley & Transport Requests (${bookings.length})</h3>
          <p class="small" style="margin:2px 0 0 0">Real-time load requests created by farmers in your region.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input id="transportSearchInput" placeholder="Search farmer, crop, booking ID..." style="padding:6px 10px;border-radius:6px;border:1px solid #ccc;font-size:0.85rem" oninput="filterTransportBookingsTable()">
          <select id="transportStatusFilter" style="padding:6px 10px;border-radius:6px;border:1px solid #ccc;font-size:0.85rem" onchange="filterTransportBookingsTable()">
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">New Requests</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DRIVER_EN_ROUTE">En Route</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Declined</option>
          </select>
          <button class="btn btn-outline btn-small" onclick="loadTransportBookings()">🔄 Refresh</button>
        </div>
      </div>
      <div id="transportBookingsListContainer">
        ${renderTransportBookingsCards(bookings)}
      </div>
    </div>`;
  } catch (err) {
    box.innerHTML = `<div class="notice">${escD(err.message)}</div>`;
  }
}

function filterTransportBookingsTable() {
  const q = (document.getElementById('transportSearchInput')?.value || '').toLowerCase();
  const st = document.getElementById('transportStatusFilter')?.value || 'ALL';
  const bookings = window.__logisticsBookingsCache || [];

  const filtered = bookings.filter(b => {
    const matchesQ = !q || (
      (b.bookingId || '').toLowerCase().includes(q) ||
      (b.linkedBookingId || '').toLowerCase().includes(q) ||
      (b.farmerName || '').toLowerCase().includes(q) ||
      (b.farmerPhone || '').toLowerCase().includes(q) ||
      (b.crop || '').toLowerCase().includes(q) ||
      (b.pickupLocation || '').toLowerCase().includes(q) ||
      (b.centreName || '').toLowerCase().includes(q)
    );
    const matchesSt = st === 'ALL' || String(b.status).toUpperCase() === st;
    return matchesQ && matchesSt;
  });

  const container = document.getElementById('transportBookingsListContainer');
  if (container) {
    container.innerHTML = renderTransportBookingsCards(filtered);
  }
}

function renderTransportBookingsCards(bookings) {
  if (!bookings || !bookings.length) {
    return '<div class="empty" style="padding:24px;text-align:center">No transport requests found.</div>';
  }

  return bookings.map(b => {
    const status = String(b.status || 'REQUESTED').toUpperCase();
    const isNew = status === 'REQUESTED';

    let statusPillClass = 'status-active';
    if (status === 'REQUESTED') statusPillClass = 'status-pending';
    else if (status === 'COMPLETED') statusPillClass = 'status-completed';
    else if (status === 'REJECTED') statusPillClass = 'status-cancelled';

    return `<div class="list-item" style="border-radius:12px;padding:16px;margin-bottom:12px;background:var(--paper);border:1px solid rgba(42,89,69,0.15)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div>
          <span style="font-size:0.75rem;font-weight:700;color:var(--green-900);background:rgba(42,89,69,0.1);padding:2px 8px;border-radius:4px">
            ID: ${escD(b.bookingId || 'TS-REQ')}
          </span>
          ${b.linkedBookingId ? `<span style="font-size:0.75rem;font-weight:600;color:#1565c0;background:#e3f2fd;padding:2px 8px;border-radius:4px;margin-left:6px">
            Linked Slot: ${escD(b.linkedBookingId)}
          </span>` : ''}
          <h4 style="margin:6px 0 2px 0;font-size:1.1rem;color:var(--green-950)">
            🧑‍🌾 ${escD(b.farmerName || 'Farmer')} <small style="font-weight: normal; color: var(--ink-soft)">(📞 ${escD(b.farmerPhone || 'N/A')})</small>
          </h4>
        </div>
        <span class="status-pill ${statusPillClass}" style="font-weight:700">${escD(status.replace(/_/g, ' '))}</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;margin:12px 0;padding:10px 12px;background:rgba(0,0,0,0.02);border-radius:8px;font-size:0.88rem">
        <div>📍 <strong>Pickup:</strong> ${escD(b.pickupLocation || 'Farmer Location')}</div>
        <div>🏢 <strong>Destination:</strong> ${escD(b.centreName || 'Procurement Centre')}</div>
        <div>🌾 <strong>Crop & Load:</strong> ${escD(b.crop || 'Crop')} — <strong>${b.quantity || 0} qtl</strong></div>
        <div>📅 <strong>Pickup Date:</strong> ${escD(b.pickupDate ? new Date(b.pickupDate).toLocaleDateString('en-IN') : 'Scheduled')}</div>
        <div>💰 <strong>Trip Fare:</strong> ₹${Number(b.fare || 0).toLocaleString('en-IN')}</div>
        <div>🚛 <strong>Vehicle Requirement:</strong> ${escD(b.vehicleRequirement || 'Trolley / Tractor')}</div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div style="font-size:0.78rem;color:var(--ink-soft)">
          Created: ${b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : 'Just now'}
        </div>
        <div style="display:flex;gap:8px">
          ${isNew ? `
            <button class="btn btn-primary btn-small" onclick="updateTransportBooking('${b._id}', 'ACCEPTED')">✓ Accept Request</button>
            <button class="btn btn-outline btn-small" style="color:#c62828;border-color:#ef9a9a" onclick="updateTransportBooking('${b._id}', 'REJECTED')">✕ Decline</button>
          ` : status === 'ACCEPTED' ? `
            <button class="btn btn-primary btn-small" onclick="updateTransportBooking('${b._id}', 'DRIVER_EN_ROUTE')">🚗 Driver En Route</button>
          ` : status === 'DRIVER_EN_ROUTE' ? `
            <button class="btn btn-primary btn-small" onclick="updateTransportBooking('${b._id}', 'PICKED_UP')">📦 Mark Picked Up</button>
          ` : status === 'PICKED_UP' ? `
            <button class="btn btn-primary btn-small" onclick="updateTransportBooking('${b._id}', 'IN_TRANSIT')">🚚 Start Transit</button>
          ` : status === 'IN_TRANSIT' ? `
            <button class="btn btn-primary btn-small" onclick="updateTransportBooking('${b._id}', 'COMPLETED')">🏁 Complete Delivery</button>
          ` : `
            <span style="font-size:0.82rem;font-weight:600;color:var(--green-900)">Status: ${escD(status.replace(/_/g, ' '))}</span>
          `}
        </div>
      </div>
    </div>`;
  }).join('');
}

async function loadTransportActive() {
  const box = document.getElementById('transportActiveContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading active transport rides...</div>';
  try {
    const r = await dapi('/logistics/bookings?status=ACTIVE');
    const rides = r.data || [];

    if (!rides.length) {
      box.innerHTML = `<div class="card" style="text-align:center;padding:40px 20px">
        <div style="font-size:3rem;margin-bottom:10px">🚛</div>
        <h3 style="margin:0 0 6px 0;color:var(--green-950)">No Active Trips</h3>
        <p style="color:var(--ink-soft);max-width:400px;margin:0 auto 16px auto">You currently have no transport trips in progress. Accept incoming requests from the Booking Requests section.</p>
        <button class="btn btn-primary btn-small" onclick="showSection('transportBookings')">View Booking Requests</button>
      </div>`;
      return;
    }

    box.innerHTML = `<div class="card">
      <h3 style="margin:0 0 14px 0;color:var(--green-950)">Active Transport Operations (${rides.length})</h3>
      <p class="small" style="margin:-10px 0 16px 0">Track and update active load journeys step-by-step.</p>
      
      ${rides.map(r => renderActiveTripCard(r)).join('')}
    </div>`;
  } catch (err) {
    box.innerHTML = `<div class="notice">${escD(err.message)}</div>`;
  }
}

function renderActiveTripCard(b) {
  const status = String(b.status || 'ACCEPTED').toUpperCase();
  const stages = ['ACCEPTED', 'DRIVER_EN_ROUTE', 'PICKED_UP', 'IN_TRANSIT', 'COMPLETED'];
  const currentIndex = stages.indexOf(status);

  return `<div class="list-item" style="border-radius:14px;padding:18px;margin-bottom:16px;background:var(--paper);border:2px solid var(--green-700)">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
      <div>
        <span style="font-size:0.75rem;font-weight:700;color:var(--green-900);background:rgba(42,89,69,0.15);padding:3px 10px;border-radius:6px">TRIP ID: ${escD(b.bookingId)}</span>
        <h3 style="margin:6px 0 2px 0;color:var(--green-950)">🧑‍🌾 ${escD(b.farmerName || 'Farmer')} (${escD(b.farmerPhone || 'N/A')})</h3>
        <p style="margin:0;font-size:0.85rem;color:var(--ink-soft)">🌾 <strong>${escD(b.crop)}</strong> — ${b.quantity} Quintals | Fare: ₹${Number(b.fare||0).toLocaleString('en-IN')}</p>
      </div>
      <span class="status-pill status-active" style="font-size:0.9rem;padding:6px 14px;font-weight:700">${escD(status.replace(/_/g, ' '))}</span>
    </div>

    <!-- Timeline progress bar -->
    <div style="margin:20px 0 16px 0;padding:14px;background:rgba(42,89,69,0.04);border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;position:relative;margin-bottom:8px">
        ${stages.slice(0, 4).map((st, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const labels = { ACCEPTED: 'Accepted', DRIVER_EN_ROUTE: 'En Route', PICKED_UP: 'Picked Up', IN_TRANSIT: 'In Transit' };
          return `<div style="text-align:center;flex:1;z-index:2;position:relative">
            <div style="width:28px;height:28px;border-radius:50%;margin:0 auto 4px auto;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;background:${isDone ? 'var(--green-800)' : '#e0e0e0'};color:${isDone ? '#fff' : '#666'};border:${isCurrent ? '3px solid #eda335' : 'none'}">
              ${isDone ? '✓' : (idx + 1)}
            </div>
            <div style="font-size:0.75rem;font-weight:${isCurrent ? '700' : '500'};color:${isCurrent ? 'var(--green-950)' : 'var(--ink-soft)'}">${labels[st]}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;font-size:0.88rem;margin-bottom:14px">
      <div>📍 <strong>Pickup Point:</strong> ${escD(b.pickupLocation || 'Farmer Location')}</div>
      <div>🏢 <strong>Destination Mandi:</strong> ${escD(b.centreName || 'Procurement Centre')}</div>
      <div>🕒 <strong>Accepted At:</strong> ${b.acceptedAt ? new Date(b.acceptedAt).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) : '—'}</div>
      <div>🚚 <strong>Transit Start:</strong> ${b.inTransitAt ? new Date(b.inTransitAt).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) : 'Pending'}</div>
    </div>

    <div style="display:flex;justify-content:flex-end;gap:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,0.06)">
      ${status === 'ACCEPTED' ? `
        <button class="btn btn-primary" onclick="updateTransportBooking('${b._id}', 'DRIVER_EN_ROUTE')">🚗 Mark Driver En Route</button>
      ` : status === 'DRIVER_EN_ROUTE' ? `
        <button class="btn btn-primary" onclick="updateTransportBooking('${b._id}', 'PICKED_UP')">📦 Mark Picked Up</button>
      ` : status === 'PICKED_UP' ? `
        <button class="btn btn-primary" onclick="updateTransportBooking('${b._id}', 'IN_TRANSIT')">🚚 Start Transit to Mandi</button>
      ` : status === 'IN_TRANSIT' ? `
        <button class="btn btn-primary" style="background:#2e7d32" onclick="updateTransportBooking('${b._id}', 'COMPLETED')">🏁 Complete Delivery</button>
      ` : ''}
    </div>
  </div>`;
}

async function loadTransportCompleted() {
  const box = document.getElementById('transportCompletedContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading completed transport history...</div>';
  try {
    const r = await dapi('/logistics/bookings?status=COMPLETED');
    const list = r.data || [];

    if (!list.length) {
      box.innerHTML = `<div class="card" style="text-align:center;padding:40px 20px">
        <div style="font-size:3rem;margin-bottom:10px">📜</div>
        <h3 style="margin:0 0 6px 0;color:var(--green-950)">No Completed Trips Yet</h3>
        <p style="color:var(--ink-soft);max-width:400px;margin:0 auto">Trip history will appear here once you complete load deliveries.</p>
      </div>`;
      return;
    }

    const totalQty = list.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalFare = list.reduce((sum, item) => sum + (Number(item.fare) || 0), 0);

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">Completed Transport History (${list.length})</h3>
          <p class="small" style="margin:2px 0 0 0">Verified record of all loads delivered to procurement centres.</p>
        </div>
        <div style="display:flex;gap:12px">
          <div style="background:rgba(42,89,69,0.08);padding:6px 12px;border-radius:8px;font-size:0.85rem">
            Total Moved: <strong>${totalQty.toFixed(1)} qtl</strong>
          </div>
          <div style="background:rgba(42,89,69,0.08);padding:6px 12px;border-radius:8px;font-size:0.85rem">
            Total Earned: <strong>₹${totalFare.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Farmer</th>
              <th>Crop & Load</th>
              <th>Pickup Location</th>
              <th>Destination Mandi</th>
              <th>Completion Time</th>
              <th>Fare (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(b => `<tr>
              <td><strong style="color:var(--green-900)">${escD(b.bookingId)}</strong></td>
              <td>${escD(b.farmerName || 'Farmer')}<br><small style="color:var(--ink-soft)">${escD(b.farmerPhone || '')}</small></td>
              <td><strong>${escD(b.crop)}</strong> (${b.quantity} qtl)</td>
              <td>${escD(b.pickupLocation || 'Farmer Location')}</td>
              <td>${escD(b.centreName || 'Procurement Centre')}</td>
              <td>${b.completedAt ? new Date(b.completedAt).toLocaleString('en-IN') : 'Completed'}</td>
              <td><strong>₹${Number(b.fare||0).toLocaleString('en-IN')}</strong></td>
              <td><span class="status-pill status-completed">✓ Delivered</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (err) {
    box.innerHTML = `<div class="notice">${escD(err.message)}</div>`;
  }
}

async function loadTransportEarnings() {
  const box = document.getElementById('transportEarningsContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading transport earnings breakdown...</div>';
  try {
    const r = await dapi('/logistics/summary');
    const s = r.data || {};
    const completedListRes = await dapi('/logistics/bookings?status=COMPLETED');
    const completedList = completedListRes.data || [];

    const totalEarnings = s.earnings || 0;
    const completedTrips = s.completed || 0;
    const totalQty = s.totalQuantityQtl || 0;
    const avgFare = completedTrips > 0 ? (totalEarnings / completedTrips).toFixed(0) : 0;

    box.innerHTML = `<div class="card">
      <h3 style="margin:0 0 14px 0;color:var(--green-950)">💰 Transport Operations Earnings Statement</h3>
      
      <div class="kpis" style="margin-bottom:20px">
        <div class="kpi"><small>Total Net Earnings</small><strong>₹${Number(totalEarnings).toLocaleString('en-IN')}</strong></div>
        <div class="kpi"><small>Completed Trips</small><strong>${completedTrips}</strong></div>
        <div class="kpi"><small>Total Cargo Moved</small><strong>${Number(totalQty).toFixed(1)} qtl</strong></div>
        <div class="kpi"><small>Average Trip Fare</small><strong>₹${Number(avgFare).toLocaleString('en-IN')}</strong></div>
      </div>

      <h4 style="margin:0 0 10px 0;color:var(--green-950)">Trip-wise Fare Breakdown</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Farmer</th>
              <th>Crop</th>
              <th>Load (qtl)</th>
              <th>Date Completed</th>
              <th>Trip Fare (₹)</th>
              <th>Payout Status</th>
            </tr>
          </thead>
          <tbody>
            ${completedList.length ? completedList.map(b => `<tr>
              <td><strong>${escD(b.bookingId)}</strong></td>
              <td>${escD(b.farmerName || 'Farmer')}</td>
              <td>${escD(b.crop)}</td>
              <td>${b.quantity} qtl</td>
              <td>${b.completedAt ? new Date(b.completedAt).toLocaleDateString('en-IN') : '—'}</td>
              <td><strong style="color:var(--green-900)">₹${Number(b.fare||0).toLocaleString('en-IN')}</strong></td>
              <td><span class="status-pill status-completed">Direct Payout</span></td>
            </tr>`).join('') : '<tr><td colspan="7" class="empty">No completed trip earnings yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (err) {
    box.innerHTML = `<div class="notice">${escD(err.message)}</div>`;
  }
}

async function loadTransportProfile() {
  const box = document.getElementById('transportProfileContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Loading transport operator details...</div>';
  try {
    const r = await dapi('/logistics/profile');
    const u = r.data || currentUser() || {};

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">🚚 Transport Operator & Vehicle Profile</h3>
          <p class="small" style="margin:2px 0 0 0">Verified registration data from government mandi directory.</p>
        </div>
        <span class="status-pill status-active" style="font-weight:700">Account Active</span>
      </div>

      <div class="dash-grid" style="grid-template-columns:1fr 1fr;gap:16px">
        <div class="panel" style="background:var(--paper)">
          <h4 style="margin:0 0 12px 0;color:var(--green-950)">Operator Identity</h4>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:0.9rem">
            <div>👤 <strong>Full Name:</strong> ${escD(u.name || 'Transport Transporter')}</div>
            <div>📱 <strong>Mobile Phone:</strong> ${escD(u.phone || 'N/A')}</div>
            <div>✉️ <strong>Email Address:</strong> ${escD(u.email || 'N/A')}</div>
            <div>🛡️ <strong>System Role:</strong> <span style="background:rgba(42,89,69,0.1);padding:2px 6px;border-radius:4px;font-weight:600;color:var(--green-900)">LOGISTICS</span></div>
            <div>📍 <strong>Service Region / District:</strong> ${escD(u.region || 'Karnal, Haryana')}</div>
          </div>
        </div>

        <div class="panel" style="background:var(--paper)">
          <h4 style="margin:0 0 12px 0;color:var(--green-950)">Vehicle & Trolley Details</h4>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:0.9rem">
            <div>🚛 <strong>Vehicle Type:</strong> ${escD(u.vehicleType || 'Tractor Trolley')}</div>
            <div>🔢 <strong>Vehicle Registration No:</strong> <strong style="color:var(--green-900)">${escD(u.vehicleNo || 'HR-05-TR-1088')}</strong></div>
            <div>⚖️ <strong>Trolley Load Capacity:</strong> ${u.capacityQtl || 50} Quintals</div>
            <div>💵 <strong>Standard Trip Fare:</strong> ₹${Number(u.farePerTrip || 800).toLocaleString('en-IN')}</div>
            <div>🟢 <strong>Listing Status:</strong> ${u.isListed !== false ? '<span style="color:green;font-weight:700">✓ Listed in Mandi Directory</span>' : '<span style="color:red;font-weight:700">Unlisted</span>'}</div>
          </div>
        </div>
      </div>
    </div>`;
  } catch (err) {
    box.innerHTML = `<div class="notice">${escD(err.message)}</div>`;
  }
}

async function loadTransportReports() {
  const box = document.getElementById('transportReportsContent');
  if (!box) return;
  box.innerHTML = '<div class="empty">Generating real-time transport operations report from MongoDB...</div>';
  try {
    const r = await dapi('/logistics/reports');
    const d = r.data || {};
    const crops = d.cropBreakdown || [];
    const mandis = d.mandiBreakdown || [];
    const recent = d.recentCompletedTrips || [];

    box.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0;color:var(--green-950)">▤ Transport Operations & Load Performance Report</h3>
          <p class="small" style="margin:2px 0 0 0">Verified cargo movement and trip completion records from MongoDB.</p>
        </div>
        <button class="btn btn-outline btn-small" onclick="window.print()">🖨️ Print / Export Report</button>
      </div>
      
      <div class="kpis">
        <div class="kpi"><small>Total Requests Received</small><strong>${d.totalRequests || 0}</strong></div>
        <div class="kpi"><small>Delivered Trips</small><strong>${d.totalCompleted || 0}</strong></div>
        <div class="kpi"><small>Fulfillment Rate</small><strong>${d.completionRate || 0}%</strong></div>
        <div class="kpi"><small>Total Cargo Moved</small><strong>${Number(d.totalQuantity || 0).toFixed(1)} qtl</strong></div>
        <div class="kpi"><small>Total Gross Revenue</small><strong>₹${Number(d.totalEarnings || 0).toLocaleString('en-IN')}</strong></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px">
        <div>
          <h4 style="margin:0 0 8px 0;color:var(--green-950)">🌾 Crop-wise Load & Revenue Summary</h4>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Trips</th>
                  <th>Quantity (qtl)</th>
                  <th>Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${crops.length ? crops.map(c => `<tr>
                  <td><strong>${escD(c.crop)}</strong></td>
                  <td>${c.trips}</td>
                  <td>${Number(c.quantity).toFixed(1)} qtl</td>
                  <td>₹${Number(c.earnings).toLocaleString('en-IN')}</td>
                </tr>`).join('') : '<tr><td colspan="4" class="empty">No completed crop loads yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style="margin:0 0 8px 0;color:var(--green-950)">🏢 Destination Mandi Delivery Breakdown</h4>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Procurement Centre</th>
                  <th>Delivered Trips</th>
                  <th>Total Volume (qtl)</th>
                </tr>
              </thead>
              <tbody>
                ${mandis.length ? mandis.map(m => `<tr>
                  <td><strong>${escD(m.centre)}</strong></td>
                  <td>${m.trips}</td>
                  <td>${Number(m.quantity).toFixed(1)} qtl</td>
                </tr>`).join('') : '<tr><td colspan="3" class="empty">No Mandi deliveries recorded yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style="margin-top:20px">
        <h4 style="margin:0 0 8px 0;color:var(--green-950)">📜 Recent Completed Load Deliveries</h4>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Pickup Location</th>
                <th>Completed At</th>
                <th>Trip Fare (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${recent.length ? recent.map(b => `<tr>
                <td><strong>${escD(b.bookingId)}</strong></td>
                <td>${escD(b.crop)}</td>
                <td>${b.quantity} qtl</td>
                <td>${escD(b.pickupLocation || 'Farmer Location')}</td>
                <td>${b.completedAt ? new Date(b.completedAt).toLocaleString('en-IN') : '—'}</td>
                <td><strong>₹${Number(b.fare || 0).toLocaleString('en-IN')}</strong></td>
              </tr>`).join('') : '<tr><td colspan="6" class="empty">No recent deliveries.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice">${escD(e.message)}</div>`;
  }
}

window.showSection=showSection;
window.selectRecommendedSlot=selectRecommendedSlot;
if (typeof updateQueue !== 'undefined') window.updateQueue = updateQueue;
if (typeof updateTrip !== 'undefined') window.updateTrip = updateTrip;
window.addCentre=addCentre;
window.addStaff=addStaff;
window.addFarmerCrop=addFarmerCrop;
window.downloadFarmerReceipt=downloadFarmerReceipt;
window.downloadFarmerWeighbridgeSlip=downloadFarmerWeighbridgeSlip;
window.loadFarmerTrolley=loadFarmerTrolley;
window.updateTrolleyFarePreview=updateTrolleyFarePreview;
if (typeof submitTrolleyBooking !== 'undefined') window.submitTrolleyBooking=submitTrolleyBooking;
window.updateTransportBooking=updateTransportBooking;
window.loadTransportBookings=loadTransportBookings;
window.filterTransportBookingsTable=filterTransportBookingsTable;
window.loadTransportActive=loadTransportActive;
window.loadTransportCompleted=loadTransportCompleted;
window.loadTransportEarnings=loadTransportEarnings;
window.loadTransportProfile=loadTransportProfile;
window.loadTransportReports=loadTransportReports;
window.operatorQuality=operatorQuality;
window.operatorWeigh=operatorWeigh;
window.operatorConfirmProcurement=operatorConfirmProcurement;
window.operatorProcessPayment=operatorProcessPayment;
window.saveOperatorCentreStatus=saveOperatorCentreStatus;
window.markAllFarmerNotifications=markAllFarmerNotifications;
window.loadOperatorProfile=loadOperatorProfile;
window.loadOperatorCentreHeader=loadOperatorCentreHeader;
window.loadOperatorCentreOverviewDetails=loadOperatorCentreOverviewDetails;
window.loadOperatorQueue=loadOperatorQueue;
window.loadOperatorQuality=loadOperatorQuality;
window.loadOperatorWeighment=loadOperatorWeighment;
window.loadOperatorProcurement=loadOperatorProcurement;
window.loadOperatorCentreStatus=loadOperatorCentreStatus;
window.loadOperatorReports=loadOperatorReports;
window.previewQualityImage=previewQualityImage;
window.runAIGrading=runAIGrading;
window.calcNetWeight=calcNetWeight;
window.loadOperators=loadOperators;
window.loadTransporters=loadTransporters;
window.generateWeighbridgeSlipPDF=generateWeighbridgeSlipPDF;
window.generateProcurementReceiptPDF=generateProcurementReceiptPDF;

setInterval(()=>{try{if(currentUser()?.role==='FARMER'&&document.visibilityState==='visible'){if(document.getElementById('section-overview')&&!document.getElementById('section-overview').classList.contains('hidden'))loadOverview();if(document.getElementById('section-queue')&&!document.getElementById('section-queue').classList.contains('hidden'))loadQueue();}}catch(e){}},15000);
