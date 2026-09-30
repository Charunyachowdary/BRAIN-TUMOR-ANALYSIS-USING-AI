// ============================================================
// server.js — Express backend with Jobs/Internships API
// ============================================================
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const axios      = require('axios');
const NodeCache  = require('node-cache');
let { STUDENTS, ADMIN } = require('./database');

const app   = express();
const cache = new NodeCache({ stdTTL: 3600 });
const PORT  = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// ============================================================
// HELPERS
// ============================================================
function getBranchKeywords(branch) {
  const map = {
    CSE:       ['software developer', 'full stack developer', 'backend developer', 'frontend developer'],
    AIML:      ['machine learning engineer', 'data scientist', 'AI engineer', 'data analyst'],
    ECE:       ['embedded engineer', 'VLSI design engineer', 'hardware engineer', 'IoT developer'],
    EEE:       ['electrical engineer', 'power systems engineer', 'automation engineer'],
    MECH:      ['mechanical engineer', 'design engineer', 'CAD engineer', 'manufacturing engineer'],
    MINING:    ['mining engineer', 'geotechnical engineer', 'site engineer'],
    BIOMEDICAL:['biomedical engineer', 'medical devices engineer', 'clinical engineer']
  };
  return map[branch] || ['engineer'];
}

function calcMatch(desc, skills) {
  if (!skills || !skills.length) return Math.floor(Math.random() * 30) + 35;
  const d = (desc || '').toLowerCase();
  let matched = 0;
  skills.forEach(s => {
    if (d.includes(s.toLowerCase())) matched++;
  });
  return Math.min(Math.round((matched / skills.length) * 100) + 20, 99);
}

function transformJob(job, skills) {
  const commonSkills = [
    'Python','Java','JavaScript','React','Node.js','SQL','MySQL','MongoDB',
    'AWS','Docker','Git','HTML','CSS','C++','C#','Angular','Spring','Django',
    'TypeScript','Machine Learning','TensorFlow','Excel','Linux','Embedded C',
    'MATLAB','AutoCAD','SolidWorks','VLSI','PCB','Power BI','Tableau',
    'Pandas','NumPy','Scikit-learn','Flask','Vue','Kubernetes','Azure','GCP'
  ];
  const desc = (job.job_description || '').toLowerCase();
  const detectedSkills = commonSkills.filter(s => desc.includes(s.toLowerCase())).slice(0, 6);

  let salary = 'Not disclosed';
  if (job.job_min_salary && job.job_max_salary) {
    const min = Math.round(job.job_min_salary / 100000);
    const max = Math.round(job.job_max_salary / 100000);
    salary = min > 0 ? `₹${min}–${max} LPA` : 'Competitive';
  } else if (job.job_salary_period === 'MONTH' && job.job_min_salary) {
    salary = `₹${Math.round(job.job_min_salary).toLocaleString('en-IN')}/mo`;
  }

  const postedDate = job.job_posted_at_datetime_utc
    ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
    : 'Recently';

  const deadline = job.job_offer_expiration_datetime_utc
    ? new Date(job.job_offer_expiration_datetime_utc).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
    : 'Open until filled';

  return {
    id:          job.job_id,
    title:       job.job_title,
    company:     job.employer_name,
    logo:        job.employer_logo || null,
    location:    [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'India / Remote',
    type:        job.job_employment_type || 'Full Time',
    salary,
    posted:      postedDate,
    deadline,
    skills:      detectedSkills.length ? detectedSkills : ['Engineering'],
    description: (job.job_description || '').substring(0, 280) + '...',
    applyLink:   job.job_apply_link   || job.job_google_link || '#',
    isRemote:    job.job_is_remote    || false,
    match:       calcMatch(job.job_description, skills),
    source:      'Google Jobs via JSearch'
  };
}

async function fetchJSearch(query, employmentType, page) {
  const options = {
    method: 'GET',
    url:    'https://jsearch.p.rapidapi.com/search',
    params: {
      query:            query + ' India',
      page:             String(page || 1),
      num_pages:        '1',
      date_posted:      'month',
      employment_types: employmentType
    },
    headers: {
      'X-RapidAPI-Key':  process.env.JSEARCH_API_KEY,
      'X-RapidAPI-Host': process.env.JSEARCH_API_HOST
    }
  };
  const response = await axios.request(options);
  return response.data.data || [];
}

// ============================================================
// AUTH ROUTES
// ============================================================
app.post('/api/student/login', (req, res) => {
  const { roll, password } = req.body;
  const s = STUDENTS[roll?.toUpperCase()];
  if (!s || s.password !== password)
    return res.json({ success: false, message: 'Invalid Roll No or Password' });
  const { password: _, ...safe } = s;
  res.json({ success: true, student: safe });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN.username || password !== ADMIN.password)
    return res.json({ success: false, message: 'Invalid Admin Credentials' });
  res.json({ success: true, admin: { name: ADMIN.name, role: ADMIN.role } });
});

// ============================================================
// STUDENT ENROLLMENT (NEW USER)
// ============================================================
app.post('/api/enroll', (req, res) => {
  const data = req.body;
  const roll = data.roll?.toUpperCase();
  if (!roll || !data.name || !data.password || !data.branch || !data.year)
    return res.json({ success: false, message: 'Missing required fields' });
  if (STUDENTS[roll])
    return res.json({ success: false, message: 'Roll number already registered' });

  STUDENTS[roll] = {
    roll,
    name:      data.name,
    password:  data.password,
    branch:    data.branch,
    year:      data.year,
    sem:       data.sem || 'I Sem',
    course:    'B.E. - ' + data.branch,
    dob:       data.dob || 'N/A',
    gender:    data.gender || 'Male',
    mobile:    data.mobile || '',
    email:     data.email || roll.toLowerCase() + '@uceou.ac.in',
    category:  data.category || 'OC',
    feeStatus: 'Pending',
    feeAmount: 37000,
    feePaid:   0,
    cgpa:      0.0,
    skills:    [],
    attendance:{},
    marks:     {}
  };
  res.json({ success: true, message: 'Enrollment successful! You can now log in.' });
});

// ============================================================
// STUDENT DATA ROUTES
// ============================================================
app.get('/api/admin/students', (req, res) => {
  const list = Object.values(STUDENTS).map(s => { const { password:_, ...safe } = s; return safe; });
  res.json({ success: true, data: list });
});

app.get('/api/student/:roll', (req, res) => {
  const s = STUDENTS[req.params.roll.toUpperCase()];
  if (!s) return res.json({ success: false, message: 'Student not found' });
  const { password:_, ...safe } = s;
  res.json({ success: true, data: safe });
});

app.put('/api/admin/marks/:roll', (req, res) => {
  const s = STUDENTS[req.params.roll.toUpperCase()];
  if (!s) return res.json({ success: false, message: 'Student not found' });
  const { subject, mid1, mid2 } = req.body;
  if (!s.marks[subject]) s.marks[subject] = {};
  s.marks[subject].mid1 = Number(mid1);
  s.marks[subject].mid2 = Number(mid2);
  res.json({ success: true, message: 'Marks updated' });
});

app.put('/api/admin/attendance/:roll', (req, res) => {
  const s = STUDENTS[req.params.roll.toUpperCase()];
  if (!s) return res.json({ success: false, message: 'Student not found' });
  const { subject, held, attended } = req.body;
  if (!s.attendance[subject]) s.attendance[subject] = {};
  s.attendance[subject].held     = Number(held);
  s.attendance[subject].attended = Number(attended);
  res.json({ success: true, message: 'Attendance updated' });
});

app.put('/api/admin/fee/:roll', (req, res) => {
  const s = STUDENTS[req.params.roll.toUpperCase()];
  if (!s) return res.json({ success: false, message: 'Student not found' });
  const { feeStatus, feePaid, feeAmount } = req.body;
  if (feeStatus)             s.feeStatus  = feeStatus;
  if (feePaid !== undefined) s.feePaid    = Number(feePaid);
  if (feeAmount!==undefined) s.feeAmount  = Number(feeAmount);
  res.json({ success: true, message: 'Fee updated' });
});

app.post('/api/admin/students', (req, res) => {
  const data = req.body;
  const roll = data.roll?.toUpperCase();
  if (!roll || STUDENTS[roll])
    return res.json({ success: false, message: 'Roll number exists or missing' });
  STUDENTS[roll] = { ...data, roll };
  res.json({ success: true, message: 'Student added' });
});

app.put('/api/student/skills/:roll', (req, res) => {
  const s = STUDENTS[req.params.roll.toUpperCase()];
  if (!s) return res.json({ success: false, message: 'Student not found' });
  s.skills = req.body.skills || [];
  res.json({ success: true, message: 'Skills saved' });
});

app.get('/api/admin/stats', (req, res) => {
  const all = Object.values(STUDENTS);
  const byBranch = {}, byYear = { 'I Year':0, 'II Year':0, 'III Year':0, 'IV Year':0 };
  let feePaid = 0, feePending = 0;
  all.forEach(s => {
    byBranch[s.branch] = (byBranch[s.branch] || 0) + 1;
    if (byYear[s.year] !== undefined) byYear[s.year]++;
    if (s.feeStatus === 'Paid') feePaid++; else feePending++;
  });
  res.json({ success:true, total:all.length, byBranch, byYear, feePaid, feePending });
});

// ============================================================
// JOBS / INTERNSHIPS — REAL DATA FROM JSEARCH
// ============================================================
app.get('/api/internships', async (req, res) => {
  const { branch = 'CSE', skills = '', page = 1 } = req.query;
  const skillList = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const cacheKey  = `internships_${branch}_p${page}`;
  const cached    = cache.get(cacheKey);

  if (cached) {
    const withMatch = cached.map(j => ({ ...j, match: calcMatch(j.description, skillList) }));
    return res.json({ success: true, data: withMatch, source: 'cache' });
  }

  if (!process.env.JSEARCH_API_KEY || process.env.JSEARCH_API_KEY === 'your_rapidapi_key_here') {
    return res.json({ success: false, noKey: true, message: 'API key not configured' });
  }

  try {
    const query   = getBranchKeywords(branch)[0] + ' internship fresher';
    const rawJobs = await fetchJSearch(query, 'INTERN', page);
    const jobs    = rawJobs.map(j => transformJob(j, skillList));
    cache.set(cacheKey, jobs.map(j => ({ ...j, match: 50 })));
    res.json({ success: true, data: jobs.sort((a,b) => b.match - a.match), total: jobs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  const { branch = 'CSE', skills = '', page = 1 } = req.query;
  const skillList = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const cacheKey  = `jobs_${branch}_p${page}`;
  const cached    = cache.get(cacheKey);

  if (cached) {
    const withMatch = cached.map(j => ({ ...j, match: calcMatch(j.description, skillList) }));
    return res.json({ success: true, data: withMatch, source: 'cache' });
  }

  if (!process.env.JSEARCH_API_KEY || process.env.JSEARCH_API_KEY === 'your_rapidapi_key_here') {
    return res.json({ success: false, noKey: true, message: 'API key not configured' });
  }

  try {
    const query   = getBranchKeywords(branch)[0] + ' fresher entry level 0-2 years';
    const rawJobs = await fetchJSearch(query, 'FULLTIME', page);
    const jobs    = rawJobs.map(j => transformJob(j, skillList));
    cache.set(cacheKey, jobs.map(j => ({ ...j, match: 50 })));
    res.json({ success: true, data: jobs.sort((a,b) => b.match - a.match), total: jobs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/search-jobs', async (req, res) => {
  const { q = '', branch = 'CSE', type = 'FULLTIME', skills = '' } = req.query;
  const skillList = skills ? skills.split(',').map(s => s.trim()) : [];
  const query     = q || getBranchKeywords(branch)[0];

  if (!process.env.JSEARCH_API_KEY || process.env.JSEARCH_API_KEY === 'your_rapidapi_key_here') {
    return res.json({ success: false, noKey: true, message: 'API key not configured' });
  }

  try {
    const rawJobs = await fetchJSearch(query, type, 1);
    const jobs    = rawJobs.map(j => transformJob(j, skillList)).sort((a,b) => b.match - a.match);
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status:  'running',
    apiKey:  process.env.JSEARCH_API_KEY && process.env.JSEARCH_API_KEY !== 'your_rapidapi_key_here' ? 'configured' : 'MISSING',
    students: Object.keys(STUDENTS).length
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ UCEOU Portal running → http://localhost:${PORT}`);
  console.log(`   Admin: admin / admin@uceou123`);
  const keyOk = process.env.JSEARCH_API_KEY && process.env.JSEARCH_API_KEY !== 'your_rapidapi_key_here';
  console.log(`   JSearch API: ${keyOk ? '✅ Configured' : '⚠️  Not configured (add to .env)'}\n`);
});