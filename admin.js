// ============================================================
// admin.js — Admin panel logic
// ============================================================

const ADMIN_API= typeof API !== 'undefined' ? API : 'http://localhost:3000';
let allStudents = [];

// ============================================================
// ADMIN LOGIN
// ============================================================
async function adminLogin() {
  const user = document.getElementById('a-user').value.trim();
  const pwd  = document.getElementById('a-pwd').value;
  const err  = document.getElementById('a-login-err');
  if (!user || !pwd) { err.textContent='Please fill in all fields.'; err.classList.add('show'); return; }
  try {
    const res  = await fetch(`${ADMIN_API}/api/admin/login`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username: user, password: pwd })
    });
    const data = await res.json();
    if (!data.success) { err.textContent=data.message; err.classList.add('show'); return; }
    err.classList.remove('show');
    document.getElementById('admin-name-display').textContent = data.admin.name;
    document.getElementById('admin-role-display').textContent = data.admin.role;
    show('pg-admin');
    toast('Admin login successful 🔐', 'ok');
    await loadAllStudents();
    aRender('a-dashboard');
  } catch (e) {
    err.textContent = 'Cannot connect to server. Run: node server.js';
    err.classList.add('show');
  }
}

// ============================================================
// LOAD STUDENTS
// ============================================================
async function loadAllStudents() {
  try {
    const res  = await fetch(`${ADMIN_API}/api/admin/students`);
    const data = await res.json();
    if (data.success) allStudents = data.data;
  } catch (e) { toast('Could not load students', 'err'); }
}

// ============================================================
// ADMIN NAV
// ============================================================
function aGo(sec, el) {
  if (el) {
    document.querySelectorAll('#admin-sidebar .ni').forEach(n => n.classList.remove('active','admin-active'));
    el.classList.add('active','admin-active');
  }
  const labels = {
    'a-dashboard':'Dashboard','a-students':'All Students','a-marks':'Upload Marks',
    'a-attendance':'Upload Attendance','a-fees':'Update Fee Status',
    'a-add-student':'Add Student','a-reports':'Reports'
  };
  const bc = document.getElementById('a-bc');
  if (bc) bc.textContent = labels[sec] || sec;
  aRender(sec);
}

// ============================================================
// ADMIN SEARCH
// ============================================================
function adminSearch(q) {
  const box = document.getElementById('admin-search-results');
  if (!q.trim() || !allStudents.length) { box.classList.remove('open'); return; }
  const res = allStudents.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.roll.toLowerCase().includes(q.toLowerCase()) ||
    s.branch.toLowerCase().includes(q.toLowerCase())
  );
  if (!res.length) { box.classList.remove('open'); return; }
  box.innerHTML = res.slice(0,6).map(s =>
    `<div class="search-item" onclick="viewStudent('${s.roll}')">🎓 ${s.name} — ${s.roll} (${s.branch})</div>`
  ).join('');
  box.classList.add('open');
}

function viewStudent(roll) {
  document.getElementById('admin-search').value = '';
  document.getElementById('admin-search-results').classList.remove('open');
  aRender('a-student-detail', roll);
  const bc = document.getElementById('a-bc');
  const s  = allStudents.find(x => x.roll === roll);
  if (bc && s) bc.textContent = s.name;
}

// ============================================================
// RENDER STUDENT TABLE ROWS
// ============================================================
function renderStudentRows(students, filterBranch = '', filterYear = '') {
  let filtered = students;
  if (filterBranch) filtered = filtered.filter(s => s.branch === filterBranch);
  if (filterYear)   filtered = filtered.filter(s => s.year   === filterYear);
  return filtered.map((s,i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${s.roll}</strong></td>
      <td>${s.name}</td>
      <td>${branchPill(s.branch)}</td>
      <td>${s.year}</td>
      <td><span class="badge ${s.feeStatus==='Paid'?'b-ok':'b-err'}">${s.feeStatus}</span></td>
      <td>${s.cgpa}</td>
      <td style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="btn-act" style="padding:4px 10px;font-size:11px" onclick="viewStudent('${s.roll}')">View</button>
        <button class="btn-act btn-success" style="padding:4px 10px;font-size:11px" onclick="aGo('a-marks',null);document.getElementById('marks-roll').value='${s.roll}';loadForEdit('marks','${s.roll}')">Marks</button>
        <button class="btn-act btn-warning" style="padding:4px 10px;font-size:11px" onclick="aGo('a-attendance',null);document.getElementById('att-roll').value='${s.roll}';loadForEdit('attendance','${s.roll}')">Att</button>
      </td>
    </tr>`).join('');
}

function filterTable() {
  const branch = (document.getElementById('filter-branch')||{}).value || '';
  const year   = (document.getElementById('filter-year')  ||{}).value || '';
  const tbody  = document.getElementById('students-tbody');
  if (tbody) tbody.innerHTML = renderStudentRows(allStudents, branch, year);
}

// ============================================================
// ADMIN MAIN RENDERER
// ============================================================
async function aRender(s, extra) {
  const mc = document.getElementById('admin-mc');
  if (!mc) return;

  // ---- DASHBOARD ----
  if (s === 'a-dashboard') {
    try {
      const res  = await fetch(`${API}/api/admin/stats`);
      const data = await res.json();
      const branchColors = { CSE:'#2980b9',AIML:'#8e44ad',ECE:'#e67e22',EEE:'#27ae60',MECH:'#e74c3c',MINING:'#f39c12',BIOMEDICAL:'#e91e8c' };
      const maxB = Math.max(...Object.values(data.byBranch||{}));
      const maxY = Math.max(...Object.values(data.byYear||{}));
      mc.innerHTML = `
        <div class="inner">
          <h2>📊 Admin Dashboard</h2>
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Students</div><div class="stat-value">${data.total}</div><div class="stat-sub">All branches</div></div>
            <div class="stat-card"><div class="stat-label">Fee Paid</div><div class="stat-value" style="color:#2ecc71">${data.feePaid}</div><div class="stat-sub">Students</div></div>
            <div class="stat-card"><div class="stat-label">Fee Pending</div><div class="stat-value" style="color:#e74c3c">${data.feePending}</div><div class="stat-sub">Students</div></div>
            <div class="stat-card"><div class="stat-label">Departments</div><div class="stat-value">${Object.keys(data.byBranch||{}).length}</div><div class="stat-sub">Active</div></div>
          </div>
          <div class="two-col">
            <div class="card"><h3>Students by Branch</h3>
              <div class="bar-chart">
                ${Object.entries(data.byBranch||{}).map(([b,n])=>`
                  <div class="bar-item">
                    <div class="bar-val">${n}</div>
                    <div class="bar-fill" style="height:${Math.round(n/maxB*90)}px;background:${branchColors[b]||'#1a3a6e'}"></div>
                    <div class="bar-label">${b.substring(0,4)}</div>
                  </div>`).join('')}
              </div>
            </div>
            <div class="card"><h3>Students by Year</h3>
              <div class="bar-chart">
                ${Object.entries(data.byYear||{}).map(([y,n])=>`
                  <div class="bar-item">
                    <div class="bar-val">${n}</div>
                    <div class="bar-fill" style="height:${Math.round(n/(maxY||1)*90)}px;background:#1a3a6e"></div>
                    <div class="bar-label">${y.split(' ')[0]}</div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
          <div class="card"><h3>Quick Actions</h3>
            <div style="display:flex;flex-wrap:wrap;gap:10px">
              <button class="btn-act" onclick="aGo('a-students',null)">👥 All Students</button>
              <button class="btn-act btn-success" onclick="aGo('a-marks',null)">📝 Upload Marks</button>
              <button class="btn-act btn-warning" onclick="aGo('a-attendance',null)">📋 Attendance</button>
              <button class="btn-act btn-danger" onclick="aGo('a-fees',null)">💰 Update Fees</button>
              <button class="btn-act" style="background:#8e44ad" onclick="aGo('a-add-student',null)">➕ Add Student</button>
              <button class="btn-act" style="background:#27ae60" onclick="aGo('a-reports',null)">📈 Reports</button>
            </div>
          </div>
        </div>`;
    } catch (e) {
      mc.innerHTML = `<div class="inner"><div class="card"><p style="color:var(--text-muted)">Could not load stats. Is the server running?<br><code>node server.js</code></p></div></div>`;
    }

  // ---- ALL STUDENTS ----
  } else if (s === 'a-students') {
    await loadAllStudents();
    mc.innerHTML = `
      <div class="inner">
        <div class="section-header">
          <h2>👥 All Students (${allStudents.length})</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <select id="filter-branch" onchange="filterTable()" style="padding:6px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-input);color:var(--text-primary);font-family:inherit;font-size:12px">
              <option value="">All Branches</option>
              ${['CSE','AIML','ECE','EEE','MECH','MINING','BIOMEDICAL'].map(b=>`<option value="${b}">${b}</option>`).join('')}
            </select>
            <select id="filter-year" onchange="filterTable()" style="padding:6px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-input);color:var(--text-primary);font-family:inherit;font-size:12px">
              <option value="">All Years</option>
              <option>I Year</option><option>II Year</option><option>III Year</option><option>IV Year</option>
            </select>
            <button class="print-btn" onclick="window.print()">🖨 Print</button>
          </div>
        </div>
        <div class="card" style="overflow-x:auto">
          <table class="dtbl admin-tbl">
            <thead><tr><th>#</th><th>Roll No</th><th>Name</th><th>Branch</th><th>Year</th><th>Fee</th><th>CGPA</th><th>Actions</th></tr></thead>
            <tbody id="students-tbody">${renderStudentRows(allStudents)}</tbody>
          </table>
        </div>
      </div>`;

  // ---- STUDENT DETAIL ----
  } else if (s === 'a-student-detail' && extra) {
    try {
      const res  = await fetch(`${API}/api/student/${extra}`);
      const data = await res.json();
      if (!data.success) { toast('Student not found','err'); return; }
      const u = data.data;
      mc.innerHTML = `
        <div class="inner">
          <div class="section-header">
            <h2>📋 ${u.name}</h2>
            <button class="btn-outline" onclick="aGo('a-students',null)">← Back</button>
          </div>
          <div class="two-col">
            <div class="card"><h3>Personal Details</h3>
              <div class="ir"><span class="l">Roll No</span><span class="v">${u.roll}</span></div>
              <div class="ir"><span class="l">Branch</span><span class="v">${branchPill(u.branch)}</span></div>
              <div class="ir"><span class="l">Year / Sem</span><span class="v">${u.year} / ${u.sem}</span></div>
              <div class="ir"><span class="l">Mobile</span><span class="v">${u.mobile}</span></div>
              <div class="ir"><span class="l">Email</span><span class="v">${u.email}</span></div>
              <div class="ir"><span class="l">Category</span><span class="v">${u.category}</span></div>
            </div>
            <div class="card"><h3>Academic & Fee</h3>
              <div class="ir"><span class="l">CGPA</span><span class="v">${u.cgpa}</span></div>
              <div class="ir"><span class="l">Fee Status</span><span class="v"><span class="badge ${u.feeStatus==='Paid'?'b-ok':'b-err'}">${u.feeStatus}</span></span></div>
              <div class="ir"><span class="l">Total Fee</span><span class="v">₹${(u.feeAmount||0).toLocaleString('en-IN')}</span></div>
              <div class="ir"><span class="l">Paid</span><span class="v">₹${(u.feePaid||0).toLocaleString('en-IN')}</span></div>
              <div class="ir"><span class="l">Balance</span><span class="v">₹${((u.feeAmount||0)-(u.feePaid||0)).toLocaleString('en-IN')}</span></div>
            </div>
          </div>
          <div class="card"><h3>📋 Attendance</h3>
            <table class="dtbl admin-tbl"><thead><tr><th>Subject</th><th>Held</th><th>Attended</th><th>%</th><th>Status</th></tr></thead><tbody>
              ${Object.entries(u.attendance||{}).map(([sub,a])=>{
                const pct=Math.round(a.attended/a.held*100);
                return `<tr><td>${sub}</td><td>${a.held}</td><td>${a.attended}</td><td>${attBar(pct)}</td>
                  <td>${pct>=75?'<span class="badge b-ok">Good</span>':pct>=65?'<span class="badge b-warn">Borderline</span>':'<span class="badge b-err">Below 75%</span>'}</td></tr>`;
              }).join('')}
            </tbody></table>
          </div>
          <div class="card"><h3>📊 Internal Marks</h3>
            <table class="dtbl admin-tbl"><thead><tr><th>Subject</th><th>Mid-1</th><th>Mid-2</th><th>Average</th></tr></thead><tbody>
              ${Object.entries(u.marks||{}).map(([sub,m])=>`
                <tr><td>${sub}</td><td>${m.mid1}/30</td><td>${m.mid2}/30</td><td>${((m.mid1+m.mid2)/2).toFixed(1)}</td></tr>
              `).join('')}
            </tbody></table>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:4px">
            <button class="btn-act btn-success" onclick="aGo('a-marks',null);setTimeout(()=>{document.getElementById('marks-roll').value='${u.roll}';loadForEdit('marks','${u.roll}')},100)">📝 Edit Marks</button>
            <button class="btn-act btn-warning" onclick="aGo('a-attendance',null);setTimeout(()=>{document.getElementById('att-roll').value='${u.roll}';loadForEdit('attendance','${u.roll}')},100)">📋 Edit Attendance</button>
            <button class="btn-act btn-danger" onclick="aGo('a-fees',null);setTimeout(()=>{document.getElementById('fee-roll').value='${u.roll}';loadForEdit('fee','${u.roll}')},100)">💰 Edit Fee</button>
          </div>
        </div>`;
    } catch (e) { toast('Error loading student','err'); }

  // ---- UPLOAD MARKS ----
  } else if (s === 'a-marks') {
    mc.innerHTML = `
      <div class="inner"><h2>📝 Upload / Edit Internal Marks</h2>
      <div class="card"><h3>Select Student</h3>
        <div class="admin-form-grid">
          <div class="form-row"><label>Roll Number</label>
            <input type="text" id="marks-roll" placeholder="e.g. 21UCECS001" oninput="this.value=this.value.toUpperCase()" list="marks-list"/>
            <datalist id="marks-list">${allStudents.map(s=>`<option value="${s.roll}">${s.name}</option>`).join('')}</datalist>
          </div>
          <div class="form-row" style="display:flex;align-items:flex-end">
            <button class="btn-act btn-success" style="width:100%" onclick="loadForEdit('marks',document.getElementById('marks-roll').value)">Load Student</button>
          </div>
        </div>
      </div>
      <div id="marks-edit-area"></div></div>`;

  // ---- UPLOAD ATTENDANCE ----
  } else if (s === 'a-attendance') {
    mc.innerHTML = `
      <div class="inner"><h2>📋 Upload / Edit Attendance</h2>
      <div class="card"><h3>Select Student</h3>
        <div class="admin-form-grid">
          <div class="form-row"><label>Roll Number</label>
            <input type="text" id="att-roll" placeholder="e.g. 21UCECS001" oninput="this.value=this.value.toUpperCase()" list="att-list"/>
            <datalist id="att-list">${allStudents.map(s=>`<option value="${s.roll}">${s.name}</option>`).join('')}</datalist>
          </div>
          <div class="form-row" style="display:flex;align-items:flex-end">
            <button class="btn-act btn-warning" style="width:100%" onclick="loadForEdit('attendance',document.getElementById('att-roll').value)">Load Student</button>
          </div>
        </div>
      </div>
      <div id="att-edit-area"></div></div>`;

  // ---- UPDATE FEES ----
  } else if (s === 'a-fees') {
    mc.innerHTML = `
      <div class="inner"><h2>💰 Update Fee Status</h2>
      <div class="card"><h3>Select Student</h3>
        <div class="admin-form-grid">
          <div class="form-row"><label>Roll Number</label>
            <input type="text" id="fee-roll" placeholder="e.g. 21UCECS001" oninput="this.value=this.value.toUpperCase()" list="fee-list"/>
            <datalist id="fee-list">${allStudents.map(s=>`<option value="${s.roll}">${s.name}</option>`).join('')}</datalist>
          </div>
          <div class="form-row" style="display:flex;align-items:flex-end">
            <button class="btn-act btn-danger" style="width:100%" onclick="loadForEdit('fee',document.getElementById('fee-roll').value)">Load Student</button>
          </div>
        </div>
      </div>
      <div id="fee-edit-area"></div></div>`;

  // ---- ADD STUDENT ----
  } else if (s === 'a-add-student') {
    mc.innerHTML = `
      <div class="inner"><h2>➕ Add New Student</h2>
      <div class="card">
        <div class="ok-box" id="add-ok"></div>
        <div class="err"    id="add-err"></div>
        <div class="admin-form-grid">
          <div class="form-row"><label>Roll Number *</label><input type="text" id="add-roll" placeholder="e.g. 23UCECS003" oninput="this.value=this.value.toUpperCase()"/></div>
          <div class="form-row"><label>Full Name *</label><input type="text" id="add-name" placeholder="Full name as per records"/></div>
          <div class="form-row"><label>Password *</label><input type="password" id="add-pwd" placeholder="Set login password"/></div>
          <div class="form-row"><label>Date of Birth</label><input type="text" id="add-dob" placeholder="DD-Mon-YYYY"/></div>
          <div class="form-row"><label>Branch *</label>
            <select id="add-branch"><option value="">Select</option><option>CSE</option><option>AIML</option><option>ECE</option><option>EEE</option><option>MECH</option><option>MINING</option><option>BIOMEDICAL</option></select>
          </div>
          <div class="form-row"><label>Year *</label>
            <select id="add-year"><option value="">Select</option><option>I Year</option><option>II Year</option><option>III Year</option><option>IV Year</option></select>
          </div>
          <div class="form-row"><label>Semester *</label>
            <select id="add-sem"><option value="">Select</option>${['I Sem','II Sem','III Sem','IV Sem','V Sem','VI Sem','VII Sem','VIII Sem'].map(s=>`<option>${s}</option>`).join('')}</select>
          </div>
          <div class="form-row"><label>Gender</label>
            <select id="add-gender"><option>Male</option><option>Female</option><option>Other</option></select>
          </div>
          <div class="form-row"><label>Mobile *</label><input type="text" id="add-mobile" placeholder="10-digit mobile"/></div>
          <div class="form-row"><label>Email</label><input type="email" id="add-email" placeholder="roll@uceou.ac.in"/></div>
          <div class="form-row"><label>Category</label>
            <select id="add-cat"><option>OC</option><option>BC-A</option><option>BC-B</option><option>BC-C</option><option>BC-D</option><option>SC</option><option>ST</option></select>
          </div>
          <div class="form-row"><label>Fee Amount (₹)</label><input type="number" id="add-fee" value="37000"/></div>
        </div>
        <div style="margin-top:14px;display:flex;gap:10px">
          <button class="btn-act btn-success" onclick="submitAddStudent()">➕ Add Student</button>
          <button class="btn-outline" onclick="aGo('a-students',null)">Cancel</button>
        </div>
      </div></div>`;

  // ---- REPORTS ----
  } else if (s === 'a-reports') {
    await loadAllStudents();
    const byBranch = {};
    allStudents.forEach(s => {
      if (!byBranch[s.branch]) byBranch[s.branch] = [];
      byBranch[s.branch].push(s);
    });
    const lowAtt     = allStudents.filter(s => Object.values(s.attendance||{}).some(a=>Math.round(a.attended/a.held*100)<75));
    const feePending = allStudents.filter(s => s.feeStatus !== 'Paid');
    mc.innerHTML = `
      <div class="inner">
        <div class="section-header">
          <h2>📈 Reports</h2>
          <button class="print-btn" onclick="window.print()">🖨 Print Report</button>
        </div>
        <div class="card"><h3>Branch-wise Summary</h3>
          <table class="dtbl admin-tbl"><thead><tr><th>Branch</th><th>Students</th><th>Fee Paid</th><th>Fee Pending</th><th>Avg CGPA</th></tr></thead><tbody>
            ${Object.entries(byBranch).map(([branch,students])=>{
              const paid    = students.filter(s=>s.feeStatus==='Paid').length;
              const pending = students.length - paid;
              const avgCgpa = (students.reduce((t,s)=>t+parseFloat(s.cgpa||0),0)/students.length).toFixed(2);
              return `<tr><td>${branchPill(branch)}</td><td>${students.length}</td><td><span class="badge b-ok">${paid}</span></td><td><span class="badge b-err">${pending}</span></td><td>${avgCgpa}</td></tr>`;
            }).join('')}
          </tbody></table>
        </div>
        <div class="card"><h3>⚠️ Low Attendance (Below 75%)</h3>
          ${lowAtt.length ? `
          <table class="dtbl admin-tbl"><thead><tr><th>Roll No</th><th>Name</th><th>Branch</th><th>Subject</th><th>%</th></tr></thead><tbody>
            ${lowAtt.flatMap(s=>Object.entries(s.attendance||{})
              .filter(([,a])=>Math.round(a.attended/a.held*100)<75)
              .map(([sub,a])=>`<tr><td>${s.roll}</td><td>${s.name}</td><td>${branchPill(s.branch)}</td><td>${sub}</td><td><span class="badge b-err">${Math.round(a.attended/a.held*100)}%</span></td></tr>`)).join('')}
          </tbody></table>` : `<p style="font-size:13px;color:var(--text-muted)">All students above 75%.</p>`}
        </div>
        <div class="card"><h3>💰 Fee Pending Students</h3>
          ${feePending.length ? `
          <table class="dtbl admin-tbl"><thead><tr><th>Roll No</th><th>Name</th><th>Branch</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead><tbody>
            ${feePending.map(s=>`<tr><td>${s.roll}</td><td>${s.name}</td><td>${branchPill(s.branch)}</td>
              <td>₹${(s.feeAmount||0).toLocaleString('en-IN')}</td>
              <td>₹${(s.feePaid||0).toLocaleString('en-IN')}</td>
              <td><span class="badge b-err">₹${((s.feeAmount||0)-(s.feePaid||0)).toLocaleString('en-IN')}</span></td></tr>`).join('')}
          </tbody></table>` : `<p style="font-size:13px;color:var(--text-muted)">All fees cleared.</p>`}
        </div>
      </div>`;
  }
}

// ============================================================
// LOAD STUDENT FOR EDITING
// ============================================================
async function loadForEdit(type, roll) {
  if (!roll) { toast('Please enter a Roll Number','warn'); return; }
  roll = roll.trim().toUpperCase();
  try {
    const res  = await fetch(`${API}/api/student/${roll}`);
    const data = await res.json();
    if (!data.success) { toast('Student not found: ' + roll,'err'); return; }
    const u = data.data;

    if (type === 'marks') {
      const area = document.getElementById('marks-edit-area');
      if (!area) return;
      area.innerHTML = `
        <div class="card"><h3>Edit Marks — ${u.name} (${u.roll})</h3>
          <div class="ok-box" id="marks-ok"></div>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${branchPill(u.branch)} | ${u.year} | ${u.sem}</p>
          <table class="dtbl admin-tbl" style="margin-bottom:14px">
            <thead><tr><th>Subject</th><th>Mid-1 (max 25)</th><th>Mid-2 (max 25)</th><th>Average</th></tr></thead>
            <tbody>
              ${Object.entries(u.marks||{}).map(([sub,m],i)=>`
                <tr>
                  <td>${sub}<input type="hidden" id="m-sub-${i}" value="${sub}"/></td>
                  <td><input type="number" id="m-mid1-${i}" value="${m.mid1}" min="0" max="25"
                    style="width:65px;padding:4px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg-input);color:var(--text-primary);font-family:inherit"/></td>
                  <td><input type="number" id="m-mid2-${i}" value="${m.mid2}" min="0" max="25"
                    style="width:65px;padding:4px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg-input);color:var(--text-primary);font-family:inherit"/></td>
                  <td id="m-avg-${i}" style="font-weight:600">${((m.mid1+m.mid2)/2).toFixed(1)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
          <button class="btn-act btn-success" onclick="saveMarks('${roll}',${Object.keys(u.marks||{}).length})">💾 Save All Marks</button>
        </div>`;

    } else if (type === 'attendance') {
      const area = document.getElementById('att-edit-area');
      if (!area) return;
      area.innerHTML = `
        <div class="card"><h3>Edit Attendance — ${u.name} (${u.roll})</h3>
          <div class="ok-box" id="att-ok"></div>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${branchPill(u.branch)} | ${u.year} | ${u.sem}</p>
          <table class="dtbl admin-tbl" style="margin-bottom:14px">
            <thead><tr><th>Subject</th><th>Classes Held</th><th>Attended</th><th>Current %</th></tr></thead>
            <tbody>
              ${Object.entries(u.attendance||{}).map(([sub,a],i)=>{
                const pct=Math.round(a.attended/a.held*100);
                return `<tr>
                  <td>${sub}<input type="hidden" id="a-sub-${i}" value="${sub}"/></td>
                  <td><input type="number" id="a-held-${i}" value="${a.held}" min="0"
                    style="width:65px;padding:4px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg-input);color:var(--text-primary);font-family:inherit"/></td>
                  <td><input type="number" id="a-att-${i}" value="${a.attended}" min="0"
                    style="width:65px;padding:4px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg-input);color:var(--text-primary);font-family:inherit"/></td>
                  <td>${attBar(pct)}</td>
                </tr>`;}).join('')}
            </tbody>
          </table>
          <button class="btn-act btn-warning" onclick="saveAttendance('${roll}',${Object.keys(u.attendance||{}).length})">💾 Save All Attendance</button>
        </div>`;

    } else if (type === 'fee') {
      const area = document.getElementById('fee-edit-area');
      if (!area) return;
      area.innerHTML = `
        <div class="card"><h3>Edit Fee — ${u.name} (${u.roll})</h3>
          <div class="ok-box" id="fee-ok"></div>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${branchPill(u.branch)} | ${u.year} | ${u.sem}</p>
          <div class="admin-form-grid">
            <div class="form-row"><label>Total Fee (₹)</label><input type="number" id="fee-amount" value="${u.feeAmount||37000}"/></div>
            <div class="form-row"><label>Amount Paid (₹)</label><input type="number" id="fee-paid" value="${u.feePaid||0}"/></div>
            <div class="form-row"><label>Fee Status</label>
              <select id="fee-status">
                <option value="Paid" ${u.feeStatus==='Paid'?'selected':''}>Paid</option>
                <option value="Pending" ${u.feeStatus==='Pending'?'selected':''}>Pending</option>
              </select>
            </div>
          </div>
          <button class="btn-act btn-danger" style="margin-top:10px" onclick="saveFee('${roll}')">💾 Save Fee Status</button>
        </div>`;
    }
  } catch (e) { toast('Server error: ' + e.message,'err'); }
}

// ============================================================
// SAVE FUNCTIONS
// ============================================================
async function saveMarks(roll, count) {
  let ok = true;
  for (let i = 0; i < count; i++) {
    const sub  = (document.getElementById('m-sub-'  + i)||{}).value;
    const mid1 = (document.getElementById('m-mid1-' + i)||{}).value;
    const mid2 = (document.getElementById('m-mid2-' + i)||{}).value;
    if (!sub) continue;
    try {
      const res  = await fetch(`${API}/api/admin/marks/${roll}`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ subject:sub, mid1:parseInt(mid1), mid2:parseInt(mid2) })
      });
      const data = await res.json();
      if (!data.success) ok = false;
      // Update average display
      const avgEl = document.getElementById('m-avg-' + i);
      if (avgEl) avgEl.textContent = ((parseInt(mid1)+parseInt(mid2))/2).toFixed(1);
    } catch (e) { ok = false; }
  }
  const okEl = document.getElementById('marks-ok');
  if (okEl) { okEl.textContent = ok ? '✓ All marks saved successfully!' : '⚠ Some marks could not be saved.'; okEl.classList.add('show'); }
  toast(ok ? 'Marks saved for ' + roll : 'Error saving marks', ok ? 'ok' : 'err');
}

async function saveAttendance(roll, count) {
  let ok = true;
  for (let i = 0; i < count; i++) {
    const sub      = (document.getElementById('a-sub-'  + i)||{}).value;
    const held     = (document.getElementById('a-held-' + i)||{}).value;
    const attended = (document.getElementById('a-att-'  + i)||{}).value;
    if (!sub) continue;
    try {
      const res  = await fetch(`${API}/api/admin/attendance/${roll}`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ subject:sub, held:parseInt(held), attended:parseInt(attended) })
      });
      const data = await res.json();
      if (!data.success) ok = false;
    } catch (e) { ok = false; }
  }
  const okEl = document.getElementById('att-ok');
  if (okEl) { okEl.textContent = ok ? '✓ Attendance saved!' : '⚠ Some records could not be saved.'; okEl.classList.add('show'); }
  toast(ok ? 'Attendance saved for ' + roll : 'Error saving attendance', ok ? 'ok' : 'err');
}

async function saveFee(roll) {
  const feeStatus = (document.getElementById('fee-status') ||{}).value;
  const feePaid   = (document.getElementById('fee-paid')   ||{}).value;
  const feeAmount = (document.getElementById('fee-amount') ||{}).value;
  try {
    const res  = await fetch(`${API}/api/admin/fee/${roll}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ feeStatus, feePaid:parseInt(feePaid), feeAmount:parseInt(feeAmount) })
    });
    const data = await res.json();
    const okEl = document.getElementById('fee-ok');
    if (okEl) { okEl.textContent = data.success ? '✓ Fee status updated!' : '⚠ Update failed.'; okEl.classList.add('show'); }
    toast(data.success ? 'Fee updated for '+roll : 'Error updating fee', data.success ? 'ok' : 'err');
  } catch (e) { toast('Server error','err'); }
}

async function submitAddStudent() {
  const roll   = (document.getElementById('add-roll')   ||{}).value?.trim().toUpperCase();
  const name   = (document.getElementById('add-name')   ||{}).value?.trim();
  const pwd    = (document.getElementById('add-pwd')    ||{}).value;
  const branch = (document.getElementById('add-branch') ||{}).value;
  const year   = (document.getElementById('add-year')   ||{}).value;
  const sem    = (document.getElementById('add-sem')    ||{}).value;
  const mobile = (document.getElementById('add-mobile') ||{}).value?.trim();
  const err    = document.getElementById('add-err');
  const okEl   = document.getElementById('add-ok');
  err.classList.remove('show');
  okEl.classList.remove('show');
  if (!roll||!name||!pwd||!branch||!year||!sem||!mobile) { err.textContent='Please fill all required fields.'; err.classList.add('show'); return; }
  if (!/^\d{10}$/.test(mobile)) { err.textContent='Enter a valid 10-digit mobile.'; err.classList.add('show'); return; }
  const newStudent = {
    roll, name, password:pwd, branch, year, sem,
    course: 'B.E. - '+branch,
    dob:    (document.getElementById('add-dob')||{}).value || 'N/A',
    gender: (document.getElementById('add-gender')||{}).value || 'Male',
    mobile,
    email:  (document.getElementById('add-email')||{}).value || roll.toLowerCase()+'@uceou.ac.in',
    category: (document.getElementById('add-cat')||{}).value || 'OC',
    feeStatus:'Pending', feeAmount:parseInt((document.getElementById('add-fee')||{}).value)||37000,
    feePaid:0, cgpa:0.0, skills:[], attendance:{}, marks:{}
  };
  try {
    const res  = await fetch(`${API}/api/admin/students`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(newStudent)
    });
    const data = await res.json();
    if (data.success) {
      okEl.textContent = '✓ Student ' + roll + ' added successfully!';
      okEl.classList.add('show');
      toast('Student added: '+roll,'ok');
      await loadAllStudents();
    } else {
      err.textContent = data.message;
      err.classList.add('show');
    }
  } catch (e) {
    err.textContent = 'Server error: ' + e.message;
    err.classList.add('show');
  }
}