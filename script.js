// ============================================================
// script.js — Student, Enrollment & Parent logic
// ============================================================

const API = 'http://localhost:3001';
let CU = null;
let sessionTimer = null, sessionCounter = 0;
let resumeData = { name:'', email:'', mobile:'', links:'', objective:'', skills:[], experience:'', projects:'' };
let enrollTemp  = {};
let currentJobPage = 1;

const SEARCH_ITEMS = [
  { label:'Home / Dashboard',  sec:'s-dashboard'     },
  { label:'My Profile',        sec:'s-profile'       },
  { label:'Attendance',        sec:'s-attendance'    },
  { label:'Internal Marks',    sec:'s-marks'         },
  { label:'Results',           sec:'s-results'       },
  { label:'Fee Details',       sec:'s-fees'          },
  { label:'Timetable',         sec:'s-timetable'     },
  { label:'Notifications',     sec:'s-notifications' },
  { label:'CGPA Calculator',   sec:'s-cgpa'          },
  { label:'Resume / Career',   sec:'s-resume'        }
];

const GRADE_PTS = { O:10,'A+':9, A:8,'B+':7, B:6, C:5, F:0 };

// ============================================================
// UTILS
// ============================================================
function show(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function toggleSb(id) {
  document.getElementById(id).classList.toggle('collapsed');
}

let toastT = null;
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'show' + (type ? ' toast-' + type : '');
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.className = ''; }, 3200);
}

function toggleTheme() {
  const html   = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.querySelectorAll('.btn-theme').forEach(b => b.textContent = isDark ? '🌙' : '☀️');
  localStorage.setItem('uceou-theme', isDark ? 'light' : 'dark');
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'text' ? 'password' : 'text';
  btn.textContent = inp.type === 'text' ? '🙈' : '👁';
}

function checkPwStrength(val, fillId, labelId) {
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ['','#e74c3c','#e67e22','#f5a623','#2ecc71'];
  const labels = ['','Weak','Fair','Good','Strong'];
  const widths = ['0%','25%','50%','75%','100%'];
  const fill  = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  if (fill)  { fill.style.width = widths[score]; fill.style.background = colors[score]; }
  if (label) { label.textContent = score ? labels[score] : ''; label.style.color = colors[score]; }
}

function tbl(rows, heads, adminStyle = false) {
  return `<table class="dtbl${adminStyle?' admin-tbl':''}">
    <thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody></table>`;
}

function attBar(pct) {
  const color = pct >= 75 ? '#2ecc71' : pct >= 65 ? '#f5a623' : '#e74c3c';
  return `<div style="display:flex;align-items:center;gap:8px">
    <div class="att-bar-wrap" style="width:80px"><div class="att-bar" style="width:${pct}%;background:${color}"></div></div>
    <span style="font-size:12px;font-weight:600;color:${color}">${pct}%</span>
  </div>`;
}

function branchPill(branch) {
  return `<span class="branch-pill bp-${branch}">${branch}</span>`;
}

// ============================================================
// CLOCK & INIT
// ============================================================
function startClock() {
  function tick() {
    const now = new Date();
    const str = now.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}) +
                '  |  ' + now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    document.querySelectorAll('#live-clock, #admin-clock').forEach(el => { if (el) el.textContent = str; });
  }
  tick();
  setInterval(tick, 1000);
}

window.addEventListener('load', () => {
  const saved = localStorage.getItem('uceou-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  document.querySelectorAll('.btn-theme').forEach(b => b.textContent = saved === 'dark' ? '☀️' : '🌙');
  startClock();
  const savedRoll = localStorage.getItem('uceou-saved-roll');
  if (savedRoll) {
    const el  = document.getElementById('s-roll');
    const chk = document.getElementById('s-remember');
    if (el)  el.value   = savedRoll;
    if (chk) chk.checked = true;
  }
});

// ============================================================
// SESSION
// ============================================================
function startSession() {
  clearTimeout(sessionTimer);
  sessionCounter = 60;
  sessionTimer   = setTimeout(() => {
    if (!CU) return;
    document.getElementById('session-modal').style.display = 'flex';
    const iv = setInterval(() => {
      sessionCounter--;
      const el = document.getElementById('session-countdown');
      if (el) el.textContent = sessionCounter;
      if (sessionCounter <= 0) {
        clearInterval(iv);
        document.getElementById('session-modal').style.display = 'none';
        logout('student');
        toast('Session expired.', 'warn');
      }
    }, 1000);
  }, 4 * 60 * 1000);
}

function resetSession() {
  document.getElementById('session-modal').style.display = 'none';
  startSession();
  toast('Session extended', 'ok');
}

['click','keydown','mousemove'].forEach(e =>
  document.addEventListener(e, () => { if (CU) startSession(); })
);

// ============================================================
// STUDENT LOGIN
// ============================================================
async function studentLogin() {
  const roll = document.getElementById('s-roll').value.trim().toUpperCase();
  const pwd  = document.getElementById('s-pwd').value;
  const err  = document.getElementById('s-login-err');
  if (!roll || !pwd) { err.textContent='Please fill in all fields.'; err.classList.add('show'); return; }
  try {
    const res  = await fetch(`${API}/api/student/login`, {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ roll, password: pwd })
    });
    const data = await res.json();
    if (!data.success) { err.textContent=data.message; err.classList.add('show'); return; }
    err.classList.remove('show');
    CU = data.student;
    if (document.getElementById('s-remember').checked) localStorage.setItem('uceou-saved-roll', roll);
    else localStorage.removeItem('uceou-saved-roll');
    document.getElementById('st-roll-display').textContent   = CU.roll;
    document.getElementById('st-name-display').textContent   = CU.name;
    document.getElementById('st-course-display').textContent = CU.course;
    resumeData.name   = CU.name;
    resumeData.email  = CU.email;
    resumeData.mobile = CU.mobile;
    resumeData.links  = resumeData.links || '';
    if (CU.skills) resumeData.skills = CU.skills;
    show('pg-student');
    startSession();
    toast('Welcome, ' + CU.name.split(' ')[0] + '! 👋', 'ok');
    sRender('s-dashboard');
  } catch (e) {
    err.textContent = 'Cannot connect to server. Make sure node server.js is running.';
    err.classList.add('show');
  }
}

// ============================================================
// PARENT LOGIN
// ============================================================
async function parentLogin() {
  const roll = document.getElementById('p-roll').value.trim().toUpperCase();
  const pwd  = document.getElementById('p-pwd').value;
  const err  = document.getElementById('p-login-err');
  if (!roll || !pwd) { err.textContent='Please fill in all fields.'; err.classList.add('show'); return; }
  try {
    const res  = await fetch(`${API}/api/student/login`, {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ roll, password: pwd })
    });
    const data = await res.json();
    if (!data.success) { err.textContent=data.message; err.classList.add('show'); return; }
    err.classList.remove('show');
    show('pg-parent');
    renderParentDash(data.student);
    toast('Parent login successful', 'ok');
  } catch (e) {
    err.textContent = 'Cannot connect to server.';
    err.classList.add('show');
  }
}

// ============================================================
// LOGOUT
// ============================================================
function logout(role) {
  CU = null;
  clearTimeout(sessionTimer);
  if (role === 'student') {
    document.getElementById('s-roll').value = '';
    document.getElementById('s-pwd').value  = '';
  }
  show('pg-landing');
  toast('Logged out successfully');
}

// ============================================================
// ENROLLMENT (3-STEP WITH SERVER)
// ============================================================
function enrollNext(step) {
  const err = document.getElementById('en-err');
  err.classList.remove('show');

  if (step === 1) {
    const roll   = document.getElementById('en-roll').value.trim().toUpperCase();
    const dob    = document.getElementById('en-dob').value.trim();
    const name   = document.getElementById('en-name').value.trim();
    const mobile = document.getElementById('en-mobile').value.trim();
    if (!roll || !dob || !name || !mobile) { err.textContent='Please fill all required fields.'; err.classList.add('show'); return; }
    if (!/^\d{10}$/.test(mobile)) { err.textContent='Enter a valid 10-digit mobile number.'; err.classList.add('show'); return; }
    enrollTemp = {
      roll, dob, name, mobile,
      email:    document.getElementById('en-email').value.trim(),
      gender:   document.getElementById('en-gender').value,
      category: document.getElementById('en-category').value
    };
    document.getElementById('en-step1').style.display = 'none';
    document.getElementById('en-step2').style.display = 'block';
    document.getElementById('es1').className = 'estep done';
    document.getElementById('es2').className = 'estep active';

  } else if (step === 2) {
    const branch = document.getElementById('en-branch').value;
    const year   = document.getElementById('en-year').value;
    const sem    = document.getElementById('en-sem').value;
    if (!branch || !year || !sem) { err.textContent='Please fill all required fields.'; err.classList.add('show'); return; }
    enrollTemp = { ...enrollTemp, branch, year, sem, adm: document.getElementById('en-adm').value };
    document.getElementById('en-step2').style.display = 'none';
    document.getElementById('en-step3').style.display = 'block';
    document.getElementById('es2').className = 'estep done';
    document.getElementById('es3').className = 'estep active';
  }
}

function enrollBack(step) {
  if (step === 1) {
    document.getElementById('en-step2').style.display = 'none';
    document.getElementById('en-step1').style.display = 'block';
    document.getElementById('es1').className = 'estep active';
    document.getElementById('es2').className = 'estep';
  } else {
    document.getElementById('en-step3').style.display = 'none';
    document.getElementById('en-step2').style.display = 'block';
    document.getElementById('es2').className = 'estep active';
    document.getElementById('es3').className = 'estep';
  }
}

async function submitEnrollment() {
  const pwd  = document.getElementById('en-pwd').value;
  const cpwd = document.getElementById('en-cpwd').value;
  const err  = document.getElementById('en-err');
  err.classList.remove('show');
  if (pwd.length < 8)  { err.textContent='Password must be at least 8 characters.'; err.classList.add('show'); return; }
  if (pwd !== cpwd)    { err.textContent='Passwords do not match.'; err.classList.add('show'); return; }

  const payload = { ...enrollTemp, password: pwd };

  try {
    const res  = await fetch(`${API}/api/enroll`, {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) { err.textContent=data.message; err.classList.add('show'); return; }

    document.getElementById('en-step3').style.display = 'none';
    document.getElementById('en-step4').style.display = 'block';
    document.getElementById('es3').className = 'estep done';
    document.getElementById('es4').className = 'estep active';
    toast('Enrollment successful!', 'ok');

    // Pre-fill login
    const rollInput = document.getElementById('s-roll');
    if (rollInput) rollInput.value = enrollTemp.roll;

  } catch (e) {
    err.textContent = 'Server error. Make sure node server.js is running.';
    err.classList.add('show');
  }
}

// ============================================================
// STUDENT NAV & SEARCH
// ============================================================
function sGo(sec, el) {
  if (el) {
    document.querySelectorAll('#student-sidebar .ni').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  }
  const found = SEARCH_ITEMS.find(x => x.sec === sec);
  const bc    = document.getElementById('s-bc');
  if (bc) bc.textContent = found ? found.label : sec;
  sRender(sec);
}

function liveSearch(q) {
  const box = document.getElementById('search-results');
  if (!q.trim()) { box.classList.remove('open'); return; }
  const res = SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(q.toLowerCase()));
  if (!res.length) { box.classList.remove('open'); return; }
  box.innerHTML = res.slice(0,6).map(r =>
    `<div class="search-item" onclick="sGo('${r.sec}',null);document.getElementById('global-search').value='';document.getElementById('search-results').classList.remove('open')">🔍 ${r.label}</div>`
  ).join('');
  box.classList.add('open');
}

document.addEventListener('click', e => {
  const b = document.getElementById('search-results');
  if (b && !b.contains(e.target) && e.target.id !== 'global-search') b.classList.remove('open');
  const ab = document.getElementById('admin-search-results');
  if (ab && !ab.contains(e.target) && e.target.id !== 'admin-search') ab.classList.remove('open');
});

// ============================================================
// RESUME SKILLS
// ============================================================
function addSkill() {
  const inp = document.getElementById('skill-input');
  if (!inp || !inp.value.trim()) return;
  const skill = inp.value.trim();
  if (!resumeData.skills.includes(skill)) {
    resumeData.skills.push(skill);
    renderSkillTags();
    inp.value = '';
    if (CU) saveSkillsToServer();
  }
}

function removeSkill(skill) {
  resumeData.skills = resumeData.skills.filter(s => s !== skill);
  renderSkillTags();
  if (CU) saveSkillsToServer();
}

function renderSkillTags() {
  const wrap = document.getElementById('skill-tags-wrap');
  if (!wrap) return;
  wrap.innerHTML = resumeData.skills.map(s =>
    `<div class="skill-tag">${s}<button onclick="removeSkill('${s}')">×</button></div>`
  ).join('');
}

async function saveSkillsToServer() {
  if (!CU) return;
  try {
    await fetch(`${API}/api/student/skills/${CU.roll}`, {
      method: 'PUT', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ skills: resumeData.skills })
    });
  } catch (e) { /* silent */ }
}

function saveResume() {
  const fields = ['res-name','res-email','res-mobile','res-links','res-objective','res-experience','res-projects'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) resumeData[id.replace('res-','')] = el.value;
  });
  saveSkillsToServer();
  toast('Resume saved!', 'ok');
  showResumeTab('preview');
}

function showResumeTab(tab) {
  document.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.resume-tab-content').forEach(c => c.style.display = 'none');
  const tEl = document.getElementById('rtab-' + tab);
  const cEl = document.getElementById('rcontent-' + tab);
  if (tEl) tEl.classList.add('active');
  if (cEl) cEl.style.display = 'block';
  if (tab === 'preview')       renderResumePreview();
  if (tab === 'opportunities') { currentJobPage = 1; fetchOpportunities(); }
}

function renderResumePreview() {
  const u  = CU;
  const r  = resumeData;
  const el = document.getElementById('resume-preview-content');
  if (!el) return;
  const contactItems = [
    `📧 ${r.email || u.email}`,
    `📱 ${r.mobile || u.mobile}`,
    ...(r.links ? [`🔗 <a href="${/^https?:\/\//i.test(r.links) ? r.links : 'https://' + r.links}" target="_blank" rel="noopener noreferrer">${r.links}</a>`] : []),
    `🎓 ${u.course} — ${u.year}`
  ];
  el.innerHTML = `
    <div class="resume-preview">
      <h1>${r.name || u.name}</h1>
      <div class="rcontact">${contactItems.join(' &nbsp;|&nbsp; ')}</div>
      ${r.objective ? `<h2>Objective</h2><p>${r.objective}</p>` : ''}
      <h2>Education</h2>
      <p><strong>B.E. ${u.branch}</strong> — University College of Engineering, Osmania University</p>
      <p>CGPA: ${u.cgpa} &nbsp;|&nbsp; ${u.year} (${u.sem})</p>
      ${r.skills.length ? `<h2>Skills</h2><div>${r.skills.map(s=>`<span class="skill-chip">${s}</span>`).join('')}</div>` : ''}
      ${r.experience ? `<h2>Experience</h2><p>${r.experience.replace(/\n/g,'<br>')}</p>` : ''}
      ${r.projects   ? `<h2>Projects</h2><p>${r.projects.replace(/\n/g,'<br>')}</p>`   : ''}
    </div>`;
}

// ============================================================
// REAL-TIME JOBS / INTERNSHIPS
// ============================================================
async function fetchOpportunities(searchQuery = '', page = 1) {
  const u  = CU;
  const el = document.getElementById('opp-content');
  if (!el || !u) return;

  const isThird  = u.year === 'III Year';
  const isFourth = u.year === 'IV Year';

  if (!isThird && !isFourth) {
    el.innerHTML = `<div class="card"><p style="font-size:13px;color:var(--text-muted)">
      🎯 Career opportunities are available for <strong>III Year</strong> (Internships) and <strong>IV Year</strong> (Jobs) students.<br>
      Build your skills and resume now to prepare!
    </p></div>`;
    return;
  }

  // Show skeleton loading
  el.innerHTML = `
    <div class="api-status loading">
      <div class="api-dot blue"></div>
      <span>Fetching live ${isThird?'internships':'jobs'} from Google Jobs...</span>
    </div>
    ${[1,2,3,4,5,6].map(()=>`
      <div class="skel-card">
        <div class="skel-line skeleton" style="width:40%;height:12px;margin-bottom:8px"></div>
        <div class="skel-line skeleton" style="width:70%;height:16px;margin-bottom:12px"></div>
        <div class="skel-line skeleton" style="width:90%;height:10px;margin-bottom:6px"></div>
        <div class="skel-line skeleton" style="width:60%;height:10px"></div>
      </div>`).join('')}`;

  try {
    const endpoint = isThird ? 'internships' : 'jobs';
    const skills   = resumeData.skills.join(',');
    const params   = new URLSearchParams({ branch: u.branch, skills, page });
    if (searchQuery) params.append('q', searchQuery);

    const res  = await fetch(`${API}/api/${endpoint}?${params}`);
    const data = await res.json();

    if (data.noKey) {
      renderSetupInstructions(el, isThird);
      return;
    }

    if (!data.success) throw new Error(data.message || 'API error');

    renderOpportunityCards(data.data, isThird ? 'internship' : 'job', data.total, page);

  } catch (err) {
    el.innerHTML = `
      <div class="api-status error">
        <div class="api-dot red"></div>
        <span>Could not fetch listings. ${err.message}</span>
      </div>`;
    renderSetupInstructions(el, isThird);
  }
}

function renderSetupInstructions(el, isThird) {
  el.innerHTML += `
    <div class="card">
      <h3>⚙️ Setup Required for Live ${isThird?'Internships':'Jobs'}</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
        To see real job listings from Google Jobs, configure the JSearch API key:
      </p>
      <div style="background:var(--bg-secondary);border-radius:var(--radius);padding:12px;font-family:monospace;font-size:12px;color:var(--text-primary);margin-bottom:14px;line-height:2">
        1. Go to <strong>rapidapi.com</strong> → Search "JSearch"<br>
        2. Subscribe to the <strong>free plan</strong> (100 requests/month)<br>
        3. Copy your API key<br>
        4. Add to <strong>.env</strong> file: JSEARCH_API_KEY=your_key_here<br>
        5. Restart: <strong>node server.js</strong>
      </div>
      <button class="btn-act" onclick="fetchOpportunities('',1)">🔄 Retry</button>
    </div>`;
}

function renderOpportunityCards(jobs, type, total, page) {
  const u  = CU;
  const el = document.getElementById('opp-content');
  if (!el) return;
  const sorted = [...(jobs||[])].sort((a,b) => b.match - a.match);
  el.innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin-bottom:4px">🎯 Live ${type==='internship'?'Internship':'Job'} Listings
            <span class="badge b-info" style="margin-left:8px">${total||sorted.length} found</span>
          </h3>
          <div class="api-status ok" style="padding:4px 10px;display:inline-flex;margin:0">
            <div class="api-dot green"></div>
            <span>Real-time data from Google Jobs via JSearch API</span>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-outline" style="font-size:11px;padding:5px 12px" onclick="fetchOpportunities('',${page-1})" ${page<=1?'disabled':''}>← Prev</button>
          <span style="font-size:12px;color:var(--text-muted);align-self:center">Page ${page}</span>
          <button class="btn-outline" style="font-size:11px;padding:5px 12px" onclick="fetchOpportunities('',${page+1})">Next →</button>
        </div>
      </div>
      ${resumeData.skills.length
        ? `<p style="font-size:12px;color:var(--text-muted);margin-top:8px">Matching your skills: <strong>${resumeData.skills.join(', ')}</strong></p>`
        : `<p style="font-size:12px;color:var(--text-muted);margin-top:8px">💡 Add skills in Resume Builder to improve match scores.</p>`}
    </div>
    <div class="filter-bar">
      <input type="text" id="opp-search-input" placeholder="🔍 Search by role, company, skill..."/>
      <button class="btn-act" onclick="fetchOpportunities(document.getElementById('opp-search-input').value,1)">Search</button>
      <button class="btn-outline" onclick="fetchOpportunities('',1)">Reset</button>
    </div>
    <div class="opp-grid">
      ${sorted.length ? sorted.map(job => renderJobCard(job, type)).join('') : `
        <div class="card" style="grid-column:1/-1;text-align:center;padding:32px">
          <div style="font-size:32px;margin-bottom:10px">🔍</div>
          <p style="color:var(--text-muted)">No listings found. Try a different search.</p>
        </div>`}
    </div>`;
}

function renderJobCard(job, type) {
  const matchColor = job.match >= 70 ? '#2ecc71' : job.match >= 40 ? '#f5a623' : '#e74c3c';
  const logoHtml   = job.logo
    ? `<img src="${job.logo}" onerror="this.parentElement.innerHTML='💼'" alt="${job.company}"/>`
    : '💼';
  return `
    <div class="opp-card">
      <div class="opp-head">
        <div class="opp-logo">${logoHtml}</div>
        <div style="flex:1;min-width:0">
          <div class="opp-company">${job.company}</div>
          <div class="opp-title">${job.title}</div>
        </div>
        ${job.isRemote ? `<span class="remote-badge">Remote</span>` : ''}
      </div>
      <div class="opp-meta">
        <span class="opp-meta-item">📍 ${job.location}</span>
        <span class="opp-meta-item">💼 ${job.type}</span>
        <span class="opp-meta-item">📅 ${job.posted}</span>
      </div>
      <div class="opp-tags">
        ${(job.skills||[]).map(s=>`<span class="opp-tag">${s}</span>`).join('')}
      </div>
      <div class="opp-match">
        <span class="opp-match-label">Match</span>
        <div class="opp-match-bar"><div class="opp-match-fill" style="width:${job.match}%;background:${matchColor}"></div></div>
        <span class="opp-match-pct" style="color:${matchColor}">${job.match}%</span>
      </div>
      <div class="opp-footer">
        <div>
          <div class="opp-salary">${type==='internship' ? job.salary : job.salary}</div>
          <div class="opp-deadline">Deadline: ${job.deadline}</div>
        </div>
        <a href="${job.applyLink}" target="_blank" rel="noopener noreferrer" class="opp-apply"
           onclick="toast('Opening ${job.company} application...','ok')">
          Apply ↗
        </a>
      </div>
    </div>`;
}

// ============================================================
// STUDENT RENDERER
// ============================================================
function sRender(s) {
  const mc = document.getElementById('student-mc');
  const u  = CU;
  if (!mc || !u) return;

  if (s === 's-dashboard') {
    const atts    = Object.values(u.attendance||{});
    const overall = atts.length ? Math.round(atts.reduce((t,a)=>t+a.attended,0)/atts.reduce((t,a)=>t+a.held,0)*100) : 0;
    const hasLow  = atts.some(a=>Math.round(a.attended/a.held*100)<75);
    mc.innerHTML = `
      <div class="inner">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <h2 style="margin-bottom:0">Dashboard</h2>
          <span style="font-size:12px;color:var(--text-muted)">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">Welcome back, <strong>${u.name}</strong></p>
        ${hasLow ? `<div class="att-warning">⚠️ One or more subjects have attendance below 75%. Please contact your faculty.</div>` : ''}
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Attendance</div><div class="stat-value" style="color:${overall>=75?'#2ecc71':'#e74c3c'}">${overall}%</div><div class="stat-sub">This semester</div></div>
          <div class="stat-card"><div class="stat-label">CGPA</div><div class="stat-value">${parseFloat(u.cgpa||0).toFixed(1)}</div><div class="stat-sub">Overall</div></div>
          <div class="stat-card"><div class="stat-label">Semester</div><div class="stat-value" style="font-size:15px">${u.sem}</div><div class="stat-sub">${u.year}</div></div>
          <div class="stat-card"><div class="stat-label">Fee Status</div><div class="stat-value" style="font-size:16px;color:${u.feeStatus==='Paid'?'#2ecc71':'#e74c3c'}">${u.feeStatus}</div><div class="stat-sub">2024–25</div></div>
        </div>
        <div class="two-col">
          <div class="card"><h3>📋 Attendance</h3>
            ${Object.entries(u.attendance||{}).map(([sub,a])=>{
              const pct=Math.round(a.attended/a.held*100);
              return `<div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                  <span style="color:var(--text-secondary)">${sub}</span>
                  <span>${a.attended}/${a.held}</span>
                </div>${attBar(pct)}</div>`;
            }).join('')}
          </div>
          <div class="card"><h3>📊 Internal Marks</h3>
            ${tbl(Object.entries(u.marks||{}).map(([sub,m])=>`
              <tr><td style="font-size:12px">${sub}</td><td>${m.mid1}</td><td>${m.mid2}</td><td><strong>${((m.mid1+m.mid2)/2).toFixed(1)}</strong></td></tr>`).join(''),
              ['Subject','Mid-1','Mid-2','Avg'])}
          </div>
        </div>
        <div class="card">
          <h3>📢 Important Updates</h3>
          ${tbl(`<tr><td>10-Mar-2025</td><td>EAF Fee deadline extended</td><td><span class="badge b-warn">Important</span></td></tr>
                 <tr><td>05-Mar-2025</td><td>${u.sem} Exam schedule released</td><td><span class="badge b-info">Exam</span></td></tr>`,
            ['Date','Message','Type'])}
        </div>
      </div>`;

  } else if (s === 's-profile') {
    mc.innerHTML = `
      <div class="inner"><h2>👤 My Profile</h2>
      <div class="two-col">
        <div class="card"><h3>Personal Details</h3>
          <div class="ir"><span class="l">Full Name</span><span class="v">${u.name}</span></div>
          <div class="ir"><span class="l">Roll No</span><span class="v">${u.roll}</span></div>
          <div class="ir"><span class="l">Date of Birth</span><span class="v">${u.dob}</span></div>
          <div class="ir"><span class="l">Gender</span><span class="v">${u.gender}</span></div>
          <div class="ir"><span class="l">Category</span><span class="v">${u.category}</span></div>
          <div class="ir"><span class="l">Mobile</span><span class="v">${u.mobile}</span></div>
          <div class="ir"><span class="l">Email</span><span class="v">${u.email}</span></div>
        </div>
        <div class="card"><h3>Academic Details</h3>
          <div class="ir"><span class="l">Program</span><span class="v">B.E.</span></div>
          <div class="ir"><span class="l">Branch</span><span class="v">${branchPill(u.branch)}</span></div>
          <div class="ir"><span class="l">Year</span><span class="v">${u.year}</span></div>
          <div class="ir"><span class="l">Semester</span><span class="v">${u.sem}</span></div>
          <div class="ir"><span class="l">CGPA</span><span class="v">${u.cgpa}</span></div>
          <div class="ir"><span class="l">College</span><span class="v">UCE, Osmania University</span></div>
        </div>
      </div></div>`;

  } else if (s === 's-attendance') {
    mc.innerHTML = `
      <div class="inner">
        <div class="section-header">
          <h2>📋 Attendance — ${u.sem}</h2>
          <button class="print-btn" onclick="window.print()">🖨 Print</button>
        </div>
        <div class="card">
          ${tbl(Object.entries(u.attendance||{}).map(([sub,a])=>{
            const pct=Math.round(a.attended/a.held*100);
            return `<tr><td>${sub}</td><td>${a.held}</td><td>${a.attended}</td><td>${attBar(pct)}</td>
              <td>${pct>=75?'<span class="badge b-ok">Good</span>':pct>=65?'<span class="badge b-warn">Borderline</span>':'<span class="badge b-err">Below 75%</span>'}</td></tr>`;
          }).join(''), ['Subject','Held','Attended','Progress','Status'])}
        </div>
      </div>`;

  } else if (s === 's-marks') {
    mc.innerHTML = `
      <div class="inner">
        <div class="section-header">
          <h2>📊 Internal Marks — ${u.sem}</h2>
          <button class="print-btn" onclick="window.print()">🖨 Print</button>
        </div>
        <div class="card">
          ${tbl(Object.entries(u.marks||{}).map(([sub,m])=>{
            const avg=((m.mid1+m.mid2)/2).toFixed(1);
            const grade=avg>=23?'<span class="badge b-ok">A+</span>':avg>=20?'<span class="badge b-ok">A</span>':avg>=17?'<span class="badge b-warn">B+</span>':'<span class="badge b-warn">B</span>';
            return `<tr><td>${sub}</td><td>${m.mid1}/30</td><td>${m.mid2}/30</td><td><strong>${avg}</strong></td><td>${grade}</td></tr>`;
          }).join(''), ['Subject','Mid-1','Mid-2','Average','Grade'])}
        </div>
      </div>`;

  } else if (s === 's-results') {
    const cgpa = parseFloat(u.cgpa||0);
    mc.innerHTML = `
      <div class="inner">
        <div class="section-header"><h2>🏆 Results</h2><button class="print-btn" onclick="window.print()">🖨 Print</button></div>
        <div class="two-col">
          <div class="card"><h3>Academic Performance</h3>
            <div class="ir"><span class="l">CGPA</span><span class="v"><strong>${cgpa.toFixed(2)}</strong></span></div>
            <div class="ir"><span class="l">Year / Semester</span><span class="v">${u.year} / ${u.sem}</span></div>
            <div class="ir"><span class="l">Branch</span><span class="v">${branchPill(u.branch)}</span></div>
            <div class="ir"><span class="l">Status</span><span class="v"><span class="badge b-ok">Regular</span></span></div>
          </div>
          <div class="card"><h3>CGPA Gauge</h3>
            <div class="gauge-wrap">
              <svg width="140" height="80" viewBox="0 0 140 80" style="overflow:visible">
                <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="#eee" stroke-width="12" stroke-linecap="round"/>
                <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="#1a3a6e" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(cgpa/10)*188.5} 188.5"/>
              </svg>
              <div class="gauge-label">${cgpa.toFixed(2)}</div>
              <div class="gauge-sub">Cumulative GPA / 10.0</div>
            </div>
          </div>
        </div>
      </div>`;

  } else if (s === 's-fees') {
    const due = (u.feeAmount||0) - (u.feePaid||0);
    mc.innerHTML = `
      <div class="inner">
        <div class="section-header"><h2>💰 Fee Details</h2><button class="print-btn" onclick="window.print()">🖨 Print</button></div>
        <div class="card"><h3>Fee Summary 2024–25</h3>
          <div class="ir"><span class="l">Total Fee</span><span class="v">₹${(u.feeAmount||0).toLocaleString('en-IN')}</span></div>
          <div class="ir"><span class="l">Amount Paid</span><span class="v"><span class="badge b-ok">₹${(u.feePaid||0).toLocaleString('en-IN')}</span></span></div>
          <div class="ir"><span class="l">Balance Due</span><span class="v"><span class="badge ${due>0?'b-err':'b-ok'}">₹${due.toLocaleString('en-IN')}</span></span></div>
          <div class="ir"><span class="l">Status</span><span class="v"><span class="badge ${u.feeStatus==='Paid'?'b-ok':'b-err'}">${u.feeStatus}</span></span></div>
        </div>
        ${due>0?`<div class="card"><h3>Pay Now</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">Balance due: <strong>₹${due.toLocaleString('en-IN')}</strong></p>
          <button class="btn-act btn-success" onclick="toast('Redirecting to payment gateway...','ok')">💳 Pay Now</button>
        </div>`:''}
      </div>`;

  } else if (s === 's-timetable') {
    const schedules = {
      CSE:       [['09:00','DAA','OS','DAA','CN','SE'],['10:00','OS','DBMS','OS','DAA','DBMS'],['11:00','Break','Break','Break','Break','Break'],['12:00','DBMS','CN','SE','DBMS','CN'],['01:00','Lunch','Lunch','Lunch','Lunch','Lunch'],['02:00','Lab','Lab','SE','Lab','Lab']],
      AIML:      [['09:00','ML','Python','Math','DS','Stats'],['10:00','Python','ML','DS','Math','ML'],['11:00','Break','Break','Break','Break','Break'],['12:00','DS','Stats','Python','DS','Math'],['01:00','Lunch','Lunch','Lunch','Lunch','Lunch'],['02:00','Lab','Lab','ML','Lab','Lab']],
      ECE:       [['09:00','VLSI','DC','Emb','Ant','Micro'],['10:00','DC','VLSI','DC','Emb','VLSI'],['11:00','Break','Break','Break','Break','Break'],['12:00','Emb','Ant','Micro','VLSI','Ant'],['01:00','Lunch','Lunch','Lunch','Lunch','Lunch'],['02:00','Lab','Lab','Emb','Lab','Lab']],
      EEE:       [['09:00','PS','EM','CS','PE','HV'],['10:00','EM','CS','PS','EM','CS'],['11:00','Break','Break','Break','Break','Break'],['12:00','CS','PE','HV','PS','PE'],['01:00','Lunch','Lunch','Lunch','Lunch','Lunch'],['02:00','Lab','Lab','PE','Lab','Lab']],
      MECH:      [['09:00','TOM','FME','MDes','Mfg','IE'],['10:00','FME','TOM','FME','MDes','TOM'],['11:00','Break','Break','Break','Break','Break'],['12:00','MDes','Mfg','IE','TOM','Mfg'],['01:00','Lunch','Lunch','Lunch','Lunch','Lunch'],['02:00','Lab','Lab','IE','Lab','Lab']],
      MINING:    [['09:00','MT','RM','MS','MV','EE'],['10:00','RM','MT','MT','MS','RM'],['11:00','Break','Break','Break','Break','Break'],['12:00','MS','MV','EE','MT','MV'],['01:00','Lunch','Lunch','Lunch','Lunch','Lunch'],['02:00','Lab','Lab','EE','Lab','Lab']],
      BIOMEDICAL:[['09:00','BM','ME','HA','BI','MI'],['10:00','ME','BM','BM','HA','BM'],['11:00','Break','Break','Break','Break','Break'],['12:00','HA','BI','MI','BM','BI'],['01:00','Lunch','Lunch','Lunch','Lunch','Lunch'],['02:00','Lab','Lab','MI','Lab','Lab']]
    };
    const sched = schedules[u.branch] || schedules['CSE'];
    mc.innerHTML = `
      <div class="inner"><h2>📅 Timetable — ${u.sem}</h2>
      <div class="card" style="overflow-x:auto">
        <div class="timetable-grid" style="min-width:500px">
          ${['Time','Mon','Tue','Wed','Thu','Fri'].map(d=>`<div class="tt-hdr">${d}</div>`).join('')}
          ${sched.map(row=>`<div class="tt-time">${row[0]}</div>${row.slice(1).map(c=>`<div class="tt-cell ${c==='Break'||c==='Lunch'?'break':c==='—'?'':'has-class'}">${c}</div>`).join('')}`).join('')}
        </div>
      </div></div>`;

  } else if (s === 's-notifications') {
    mc.innerHTML = `
      <div class="inner"><h2>🔔 Notifications</h2>
      <div class="card">
        ${tbl(`<tr><td>10-Mar-2025</td><td>EAF Fee deadline extended to 20-Mar-2025</td><td><span class="badge b-warn">Important</span></td></tr>
               <tr><td>05-Mar-2025</td><td>${u.sem} Regular Exam schedule released</td><td><span class="badge b-info">Exam</span></td></tr>
               <tr><td>01-Mar-2025</td><td>Attendance shortage warning issued</td><td><span class="badge b-err">Alert</span></td></tr>
               <tr><td>15-Feb-2025</td><td>Scholarship application portal open</td><td><span class="badge b-ok">Info</span></td></tr>`,
          ['Date','Message','Type'])}
      </div></div>`;

  } else if (s === 's-cgpa') {
    const subs = Object.keys(u.marks||{}).slice(0,5);
    mc.innerHTML = `
      <div class="inner"><h2>🧮 CGPA / SGPA Calculator</h2>
      <div class="card"><h3>Enter Grades — ${u.sem}</h3>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:14px">Scale: O=10, A+=9, A=8, B+=7, B=6, C=5, F=0</p>
        <table class="dtbl" style="margin-bottom:14px">
          <thead><tr><th>#</th><th>Subject</th><th>Credits</th><th>Grade</th></tr></thead>
          <tbody>
            ${subs.map((sub,i)=>`
              <tr><td>${i+1}</td><td>${sub}</td>
                <td><input type="number" id="cgpa-cr-${i}" value="4" min="1" max="6" style="width:50px;padding:4px 6px;border:1px solid var(--border);border-radius:4px;background:var(--bg-input);color:var(--text-primary);font-family:inherit"/></td>
                <td><select id="cgpa-gr-${i}" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;background:var(--bg-input);color:var(--text-primary);font-family:inherit">
                  ${['O','A+','A','B+','B','C','F'].map(g=>`<option value="${g}" ${g==='A'?'selected':''}>${g}</option>`).join('')}
                </select></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <button class="btn-act" onclick="calcSGPA(${subs.length})">Calculate SGPA</button>
        <div class="calc-result" id="cgpa-result" style="display:none;margin-top:14px">
          <div class="big-num" id="cgpa-val">0.00</div>
          <div id="cgpa-desc" style="font-size:14px;color:var(--text-secondary);margin-top:6px"></div>
        </div>
      </div></div>`;

  } else if (s === 's-resume') {
    const isThird  = u.year === 'III Year';
    const isFourth = u.year === 'IV Year';
    mc.innerHTML = `
      <div class="inner">
        <h2>💼 Resume Builder & Career Portal</h2>
        <div class="card" style="margin-bottom:14px">
          <h3>${isThird?'🎯 III Year — Live Internship Portal':isFourth?'💼 IV Year — Live Job Portal':'📄 Resume Builder'}</h3>
          <p style="font-size:12px;color:var(--text-muted)">
            ${isThird?'Build your resume and get matched with real internship listings from Google Jobs — with direct apply links.'
              :isFourth?'Build your resume and explore real job openings matched to your skills — with direct Apply links from Google Jobs.'
              :'Build your resume now. Career opportunities will be available in III & IV year.'}
          </p>
        </div>
        <div class="resume-tabs">
          <div class="rtab active" id="rtab-build"         onclick="showResumeTab('build')">✏️ Build Resume</div>
          <div class="rtab"        id="rtab-preview"       onclick="showResumeTab('preview')">👁 Preview</div>
          <div class="rtab"        id="rtab-opportunities" onclick="showResumeTab('opportunities')">
            ${isThird?'🎯 Live Internships':isFourth?'💼 Live Jobs':'🚀 Opportunities'}
          </div>
        </div>

        <!-- BUILD -->
        <div id="rcontent-build" class="resume-tab-content">
          <div class="card">
            <div class="resume-form-section"><h4>Personal Information</h4>
              <div class="two-col">
                <div class="fg"><label>Full Name</label><input type="text" id="res-name" value="${resumeData.name||u.name}"/></div>
                <div class="fg"><label>Email</label><input type="email" id="res-email" value="${resumeData.email||u.email}"/></div>
                <div class="fg"><label>Mobile</label><input type="text" id="res-mobile" value="${resumeData.mobile||u.mobile}"/></div>
                <div class="fg"><label>LinkedIn / GitHub</label><input type="text" id="res-links" value="${resumeData.links||''}" placeholder="linkedin.com/in/yourname"/></div>
              </div>
              <div class="fg"><label>Career Objective</label><textarea class="fg" id="res-objective" rows="3" placeholder="2-3 lines about your career goals..." style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-input);color:var(--text-primary);font-family:inherit;resize:vertical;outline:none">${resumeData.objective||''}</textarea></div>
            </div>
            <div class="resume-form-section"><h4>Technical Skills</h4>
              <div style="display:flex;gap:8px;margin-bottom:8px">
                <input type="text" id="skill-input" placeholder="Add skill (Python, Java, SQL...)"
                  style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-input);color:var(--text-primary);font-family:inherit;outline:none"
                  onkeydown="if(event.key==='Enter')addSkill()"/>
                <button class="btn-act" onclick="addSkill()">+ Add</button>
              </div>
              <div class="skill-tags" id="skill-tags-wrap">
                ${resumeData.skills.map(sk=>`<div class="skill-tag">${sk}<button onclick="removeSkill('${sk}')">×</button></div>`).join('')}
              </div>
              <p style="font-size:11px;color:var(--text-muted);margin-top:6px">💡 Skills are matched against live job listings to calculate your match score.</p>
            </div>
            <div class="resume-form-section"><h4>Experience / Internships</h4>
              <textarea id="res-experience" rows="3" placeholder="Company — Role (Duration)&#10;• Key responsibility 1&#10;• Key responsibility 2"
                style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-input);color:var(--text-primary);font-family:inherit;resize:vertical;outline:none">${resumeData.experience||''}</textarea>
            </div>
            <div class="resume-form-section"><h4>Projects</h4>
              <textarea id="res-projects" rows="3" placeholder="Project Title — Tech Stack&#10;• Brief description"
                style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-input);color:var(--text-primary);font-family:inherit;resize:vertical;outline:none">${resumeData.projects||''}</textarea>
            </div>
            <div style="display:flex;gap:10px">
              <button class="btn-act" onclick="saveResume()">💾 Save Resume</button>
              <button class="btn-outline" onclick="showResumeTab('preview')">👁 Preview</button>
            </div>
          </div>
        </div>

        <!-- PREVIEW -->
        <div id="rcontent-preview" class="resume-tab-content" style="display:none">
          <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
            <button class="print-btn" onclick="window.print()">🖨 Print / Download PDF</button>
          </div>
          <div id="resume-preview-content"></div>
        </div>

        <!-- OPPORTUNITIES -->
        <div id="rcontent-opportunities" class="resume-tab-content" style="display:none">
          <div id="opp-content"></div>
        </div>
      </div>`;
    renderSkillTags();
  }
}

function calcSGPA(count) {
  let pts = 0, creds = 0;
  for (let i = 0; i < count; i++) {
    const g = (document.getElementById('cgpa-gr-' + i)||{}).value || 'B';
    const c = parseInt((document.getElementById('cgpa-cr-' + i)||{}).value) || 4;
    pts   += (GRADE_PTS[g]||0) * c;
    creds += c;
  }
  const sgpa = creds ? (pts/creds).toFixed(2) : '0.00';
  document.getElementById('cgpa-result').style.display = 'block';
  document.getElementById('cgpa-val').textContent  = sgpa;
  document.getElementById('cgpa-desc').textContent =
    sgpa>=9?'🏆 Outstanding':sgpa>=8?'⭐ Excellent':sgpa>=7?'✅ Very Good':sgpa>=6?'👍 Good':'📚 Needs Improvement';
  toast('SGPA: ' + sgpa);
}

// ============================================================
// PARENT DASHBOARD
// ============================================================
function renderParentDash(student) {
  const mc = document.getElementById('parent-mc');
  const u  = student;
  const atts = Object.entries(u.attendance||{});
  const overallPct = atts.length
    ? Math.round(atts.reduce((s,[,a])=>s+a.attended,0) / atts.reduce((s,[,a])=>s+a.held,0) * 100)
    : 0;
  mc.innerHTML = `
    <div class="inner">
      <h2>👨‍👩‍👧 Parent Dashboard</h2>
      <div class="card" style="border-left:4px solid #2ecc71">
        <h3>Ward: ${u.name}</h3>
        <div class="ir"><span class="l">Roll No</span><span class="v">${u.roll}</span></div>
        <div class="ir"><span class="l">Branch</span><span class="v">${branchPill(u.branch)}</span></div>
        <div class="ir"><span class="l">Year / Sem</span><span class="v">${u.year} / ${u.sem}</span></div>
        <div class="ir"><span class="l">CGPA</span><span class="v">${u.cgpa}</span></div>
        <div class="ir"><span class="l">Fee Status</span><span class="v"><span class="badge ${u.feeStatus==='Paid'?'b-ok':'b-err'}">${u.feeStatus}</span></span></div>
        ${u.feeStatus!=='Paid'?`<div class="ir"><span class="l">Balance Due</span><span class="v" style="color:#e74c3c;font-weight:700">₹${((u.feeAmount||0)-(u.feePaid||0)).toLocaleString('en-IN')}</span></div>`:''}
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Attendance</div><div class="stat-value" style="color:${overallPct>=75?'#2ecc71':'#e74c3c'}">${overallPct}%</div></div>
        <div class="stat-card"><div class="stat-label">CGPA</div><div class="stat-value">${u.cgpa}</div></div>
        <div class="stat-card"><div class="stat-label">Fee</div><div class="stat-value" style="font-size:16px;color:${u.feeStatus==='Paid'?'#2ecc71':'#e74c3c'}">${u.feeStatus}</div></div>
        <div class="stat-card"><div class="stat-label">Low Attendance Subs</div><div class="stat-value" style="color:#e74c3c">${atts.filter(([,a])=>Math.round(a.attended/a.held*100)<75).length}</div></div>
      </div>
      <div class="card"><h3>Attendance Details</h3>
        ${tbl(atts.map(([sub,a])=>{
          const pct=Math.round(a.attended/a.held*100);
          return `<tr><td>${sub}</td><td>${a.held}</td><td>${a.attended}</td><td>${attBar(pct)}</td>
            <td>${pct>=75?'<span class="badge b-ok">Good</span>':pct>=65?'<span class="badge b-warn">Borderline</span>':'<span class="badge b-err">Action Needed</span>'}</td></tr>`;
        }).join(''), ['Subject','Held','Attended','Progress','Status'])}
      </div>
      <div style="text-align:center;margin-top:14px">
        <button class="btn-act" onclick="logout('parent')">→ Log Out</button>
      </div>
    </div>`;
}

// ============================================================
// KEYBOARD
// ============================================================
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const active = document.querySelector('.page.active')?.id;
    if (active === 'pg-student-login') studentLogin();
    if (active === 'pg-admin-login')   adminLogin();
    if (active === 'pg-parent-login')  parentLogin();
  }
});