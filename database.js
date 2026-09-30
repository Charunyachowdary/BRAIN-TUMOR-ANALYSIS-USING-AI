// ============================================================
// database.js — Student database (20 students, 7 departments)
// ============================================================

const STUDENTS = {
  '21UCECS001': {
    roll:'21UCECS001', name:'abhinav',
    password:'student123', branch:'CSE', year:'III Year',
    sem:'V Sem', course:'B.E. - CSE', dob:'15-Jun-2003',
    gender:'Male', mobile:'9876543210',
    email:'21ucecs001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:37000, feePaid:37000, cgpa:7.2,
    attendance:{
      'Design & Analysis of Algorithms':{ held:42, attended:36 },
      'Operating Systems':               { held:40, attended:30 },
      'Database Management Systems':     { held:38, attended:26 },
      'Computer Networks':               { held:36, attended:30 },
      'Software Engineering':            { held:30, attended:24 }
    },
    marks:{
      'Design & Analysis of Algorithms':{ mid1:22, mid2:24 },
      'Operating Systems':               { mid1:18, mid2:20 },
      'Database Management Systems':     { mid1:21, mid2:23 },
      'Computer Networks':               { mid1:19, mid2:22 },
      'Software Engineering':            { mid1:24, mid2:25 }
    }
  },
  '21UCECS002': {
    roll:'21UCECS002', name:'shashank',
    password:'shashank123', branch:'CSE', year:'III Year',
    sem:'V Sem', course:'B.E. - CSE', dob:'20-Aug-2003',
    gender:'Male', mobile:'9876543211',
    email:'21ucecs002@uceou.ac.in', category:'BC-B',
    feeStatus:'Paid', feeAmount:37000, feePaid:37000, cgpa:8.1,
    attendance:{
      'Design & Analysis of Algorithms':{ held:42, attended:40 },
      'Operating Systems':               { held:40, attended:38 },
      'Database Management Systems':     { held:38, attended:35 },
      'Computer Networks':               { held:36, attended:34 },
      'Software Engineering':            { held:30, attended:28 }
    },
    marks:{
      'Design & Analysis of Algorithms':{ mid1:24, mid2:25 },
      'Operating Systems':               { mid1:23, mid2:24 },
      'Database Management Systems':     { mid1:22, mid2:23 },
      'Computer Networks':               { mid1:21, mid2:22 },
      'Software Engineering':            { mid1:24, mid2:25 }
    }
  },
  '22UCEAIML001': {
    roll:'22UCEAIML001', name:'Arjun Reddy Nalla',
    password:'arjun123', branch:'AIML', year:'II Year',
    sem:'III Sem', course:'B.E. - AIML', dob:'05-Mar-2004',
    gender:'Male', mobile:'9876543212',
    email:'22uceaiml001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.8,
    attendance:{
      'Mathematics III':          { held:36, attended:30 },
      'Machine Learning':         { held:38, attended:32 },
      'Python Programming':       { held:34, attended:28 },
      'Data Structures':          { held:36, attended:33 },
      'Probability & Statistics': { held:30, attended:25 }
    },
    marks:{
      'Mathematics III':          { mid1:20, mid2:22 },
      'Machine Learning':         { mid1:21, mid2:23 },
      'Python Programming':       { mid1:22, mid2:24 },
      'Data Structures':          { mid1:19, mid2:21 },
      'Probability & Statistics': { mid1:18, mid2:20 }
    }
  },
  '22UCEAIML002': {
    roll:'22UCEAIML002', name:'Sneha Patel Varma',
    password:'sneha123', branch:'AIML', year:'II Year',
    sem:'III Sem', course:'B.E. - AIML', dob:'12-Nov-2003',
    gender:'Female', mobile:'9876543213',
    email:'22uceaiml002@uceou.ac.in', category:'SC',
    feeStatus:'Pending', feeAmount:50000, feePaid:0, cgpa:6.9,
    attendance:{
      'Mathematics III':          { held:36, attended:22 },
      'Machine Learning':         { held:38, attended:25 },
      'Python Programming':       { held:34, attended:26 },
      'Data Structures':          { held:36, attended:24 },
      'Probability & Statistics': { held:30, attended:18 }
    },
    marks:{
      'Mathematics III':          { mid1:15, mid2:17 },
      'Machine Learning':         { mid1:16, mid2:18 },
      'Python Programming':       { mid1:18, mid2:19 },
      'Data Structures':          { mid1:14, mid2:16 },
      'Probability & Statistics': { mid1:13, mid2:15 }
    }
  },
  '20UCEECE001': {
    roll:'20UCEECE001', name:'Karthik Suresh Iyer',
    password:'karthik123', branch:'ECE', year:'IV Year',
    sem:'VII Sem', course:'B.E. - ECE', dob:'08-Jan-2002',
    gender:'Male', mobile:'9876543214',
    email:'20uceece001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.9,
    attendance:{
      'VLSI Design':           { held:40, attended:36 },
      'Digital Communication': { held:38, attended:34 },
      'Embedded Systems':      { held:36, attended:32 },
      'Antenna Theory':        { held:34, attended:28 },
      'Microwave Engineering': { held:32, attended:26 }
    },
    marks:{
      'VLSI Design':           { mid1:22, mid2:23 },
      'Digital Communication': { mid1:21, mid2:22 },
      'Embedded Systems':      { mid1:23, mid2:24 },
      'Antenna Theory':        { mid1:19, mid2:20 },
      'Microwave Engineering': { mid1:18, mid2:19 }
    }
  },
  '20UCEECE002': {
    roll:'20UCEECE002', name:'Deepika Anand Rao',
    password:'deepika123', branch:'ECE', year:'IV Year',
    sem:'VII Sem', course:'B.E. - ECE', dob:'22-Apr-2002',
    gender:'Female', mobile:'9876543215',
    email:'20uceece002@uceou.ac.in', category:'BC-A',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:8.3,
    attendance:{
      'VLSI Design':           { held:40, attended:38 },
      'Digital Communication': { held:38, attended:36 },
      'Embedded Systems':      { held:36, attended:35 },
      'Antenna Theory':        { held:34, attended:32 },
      'Microwave Engineering': { held:32, attended:30 }
    },
    marks:{
      'VLSI Design':           { mid1:24, mid2:25 },
      'Digital Communication': { mid1:23, mid2:24 },
      'Embedded Systems':      { mid1:24, mid2:25 },
      'Antenna Theory':        { mid1:22, mid2:23 },
      'Microwave Engineering': { mid1:21, mid2:22 }
    }
  },
  '21UCEEEE001': {
    roll:'21UCEEEE001', name:'Rahul Naidu Babu',
    password:'rahul123', branch:'EEE', year:'III Year',
    sem:'V Sem', course:'B.E. - EEE', dob:'14-Jul-2003',
    gender:'Male', mobile:'9876543216',
    email:'21uceeee001@uceou.ac.in', category:'BC-D',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.1,
    attendance:{
      'Power Systems':            { held:40, attended:32 },
      'Electrical Machines':      { held:38, attended:30 },
      'Control Systems':          { held:36, attended:28 },
      'Power Electronics':        { held:34, attended:26 },
      'High Voltage Engineering': { held:30, attended:22 }
    },
    marks:{
      'Power Systems':            { mid1:20, mid2:21 },
      'Electrical Machines':      { mid1:19, mid2:20 },
      'Control Systems':          { mid1:18, mid2:20 },
      'Power Electronics':        { mid1:17, mid2:19 },
      'High Voltage Engineering': { mid1:16, mid2:18 }
    }
  },
  '21UCEEEE002': {
    roll:'21UCEEEE002', name:'Lavanya Srinivas Goud',
    password:'lavanya123', branch:'EEE', year:'III Year',
    sem:'V Sem', course:'B.E. - EEE', dob:'30-Sep-2003',
    gender:'Female', mobile:'9876543217',
    email:'21uceeee002@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.6,
    attendance:{
      'Power Systems':            { held:40, attended:37 },
      'Electrical Machines':      { held:38, attended:35 },
      'Control Systems':          { held:36, attended:33 },
      'Power Electronics':        { held:34, attended:31 },
      'High Voltage Engineering': { held:30, attended:27 }
    },
    marks:{
      'Power Systems':            { mid1:22, mid2:23 },
      'Electrical Machines':      { mid1:21, mid2:22 },
      'Control Systems':          { mid1:20, mid2:22 },
      'Power Electronics':        { mid1:19, mid2:21 },
      'High Voltage Engineering': { mid1:18, mid2:20 }
    }
  },
  '23UCEMECH001': {
    roll:'23UCEMECH001', name:'Sai Teja Venkat',
    password:'sai123', branch:'MECH', year:'I Year',
    sem:'I Sem', course:'B.E. - MECH', dob:'10-Feb-2005',
    gender:'Male', mobile:'9876543218',
    email:'23ucemech001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.0,
    attendance:{
      'Engineering Mathematics I': { held:36, attended:30 },
      'Engineering Physics':       { held:34, attended:28 },
      'Engineering Drawing':       { held:38, attended:32 },
      'Basic Mechanical Engg':     { held:34, attended:28 },
      'English Communication':     { held:30, attended:25 }
    },
    marks:{
      'Engineering Mathematics I': { mid1:19, mid2:21 },
      'Engineering Physics':       { mid1:18, mid2:20 },
      'Engineering Drawing':       { mid1:20, mid2:22 },
      'Basic Mechanical Engg':     { mid1:17, mid2:19 },
      'English Communication':     { mid1:16, mid2:18 }
    }
  },
  '23UCEMECH002': {
    roll:'23UCEMECH002', name:'Ananya Reddy Charan',
    password:'ananya123', branch:'MECH', year:'I Year',
    sem:'I Sem', course:'B.E. - MECH', dob:'25-Jun-2005',
    gender:'Female', mobile:'9876543219',
    email:'23ucemech002@uceou.ac.in', category:'ST',
    feeStatus:'Pending', feeAmount:50000, feePaid:25000, cgpa:6.5,
    attendance:{
      'Engineering Mathematics I': { held:36, attended:25 },
      'Engineering Physics':       { held:34, attended:22 },
      'Engineering Drawing':       { held:38, attended:28 },
      'Basic Mechanical Engg':     { held:34, attended:23 },
      'English Communication':     { held:30, attended:20 }
    },
    marks:{
      'Engineering Mathematics I': { mid1:15, mid2:17 },
      'Engineering Physics':       { mid1:14, mid2:16 },
      'Engineering Drawing':       { mid1:17, mid2:19 },
      'Basic Mechanical Engg':     { mid1:13, mid2:15 },
      'English Communication':     { mid1:12, mid2:14 }
    }
  },
  '20UCEMECH001': {
    roll:'20UCEMECH001', name:'Vijay Krishna Das',
    password:'vijay123', branch:'MECH', year:'IV Year',
    sem:'VII Sem', course:'B.E. - MECH', dob:'18-Mar-2002',
    gender:'Male', mobile:'9876543220',
    email:'20ucemech001@uceou.ac.in', category:'BC-C',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.4,
    attendance:{
      'CAD/CAM':                { held:40, attended:34 },
      'Heat Transfer':          { held:38, attended:33 },
      'Automobile Engineering': { held:36, attended:30 },
      'Industrial Engineering': { held:34, attended:28 },
      'Robotics':               { held:32, attended:26 }
    },
    marks:{
      'CAD/CAM':                { mid1:21, mid2:22 },
      'Heat Transfer':          { mid1:20, mid2:21 },
      'Automobile Engineering': { mid1:19, mid2:20 },
      'Industrial Engineering': { mid1:18, mid2:20 },
      'Robotics':               { mid1:20, mid2:22 }
    }
  },
  '22UCEMINING001': {
    roll:'22UCEMINING001', name:'Suresh Babu Nayak',
    password:'suresh123', branch:'MINING', year:'II Year',
    sem:'III Sem', course:'B.E. - Mining', dob:'07-Dec-2003',
    gender:'Male', mobile:'9876543221',
    email:'22ucemining001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:6.8,
    attendance:{
      'Mining Technology':      { held:36, attended:28 },
      'Rock Mechanics':         { held:34, attended:26 },
      'Mine Surveying':         { held:38, attended:30 },
      'Mine Ventilation':       { held:34, attended:25 },
      'Explosives Engineering': { held:30, attended:22 }
    },
    marks:{
      'Mining Technology':      { mid1:17, mid2:19 },
      'Rock Mechanics':         { mid1:16, mid2:18 },
      'Mine Surveying':         { mid1:18, mid2:20 },
      'Mine Ventilation':       { mid1:15, mid2:17 },
      'Explosives Engineering': { mid1:14, mid2:16 }
    }
  },
  '22UCEMINING002': {
    roll:'22UCEMINING002', name:'Padma Vathi Kota',
    password:'padma123', branch:'MINING', year:'II Year',
    sem:'III Sem', course:'B.E. - Mining', dob:'14-Apr-2004',
    gender:'Female', mobile:'9876543222',
    email:'22ucemining002@uceou.ac.in', category:'BC-B',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.2,
    attendance:{
      'Mining Technology':      { held:36, attended:31 },
      'Rock Mechanics':         { held:34, attended:29 },
      'Mine Surveying':         { held:38, attended:33 },
      'Mine Ventilation':       { held:34, attended:28 },
      'Explosives Engineering': { held:30, attended:25 }
    },
    marks:{
      'Mining Technology':      { mid1:19, mid2:21 },
      'Rock Mechanics':         { mid1:18, mid2:20 },
      'Mine Surveying':         { mid1:20, mid2:22 },
      'Mine Ventilation':       { mid1:17, mid2:19 },
      'Explosives Engineering': { mid1:16, mid2:18 }
    }
  },
  '21UCEBME001': {
    roll:'21UCEBME001', name:'Harish Chandra Reddy',
    password:'harish123', branch:'BIOMEDICAL', year:'III Year',
    sem:'V Sem', course:'B.E. - Biomedical', dob:'03-Oct-2003',
    gender:'Male', mobile:'9876543223',
    email:'21ucebme001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.5,
    attendance:{
      'Biomaterials':        { held:40, attended:34 },
      'Medical Electronics': { held:38, attended:32 },
      'Human Anatomy':       { held:36, attended:30 },
      'Bioinformatics':      { held:34, attended:28 },
      'Medical Imaging':     { held:32, attended:26 }
    },
    marks:{
      'Biomaterials':        { mid1:21, mid2:22 },
      'Medical Electronics': { mid1:20, mid2:22 },
      'Human Anatomy':       { mid1:19, mid2:21 },
      'Bioinformatics':      { mid1:18, mid2:20 },
      'Medical Imaging':     { mid1:20, mid2:21 }
    }
  },
  '21UCEBME002': {
    roll:'21UCEBME002', name:'Meena Kumari Sharma',
    password:'meena123', branch:'BIOMEDICAL', year:'III Year',
    sem:'V Sem', course:'B.E. - Biomedical', dob:'17-Jan-2003',
    gender:'Female', mobile:'9876543224',
    email:'21ucebme002@uceou.ac.in', category:'SC',
    feeStatus:'Pending', feeAmount:50000, feePaid:25000, cgpa:6.7,
    attendance:{
      'Biomaterials':        { held:40, attended:26 },
      'Medical Electronics': { held:38, attended:24 },
      'Human Anatomy':       { held:36, attended:22 },
      'Bioinformatics':      { held:34, attended:20 },
      'Medical Imaging':     { held:32, attended:18 }
    },
    marks:{
      'Biomaterials':        { mid1:16, mid2:17 },
      'Medical Electronics': { mid1:15, mid2:16 },
      'Human Anatomy':       { mid1:14, mid2:16 },
      'Bioinformatics':      { mid1:13, mid2:15 },
      'Medical Imaging':     { mid1:15, mid2:16 }
    }
  },
  '23UCECS001': {
    roll:'23UCECS001', name:'Rohit Verma Singh',
    password:'rohit123', branch:'CSE', year:'I Year',
    sem:'I Sem', course:'B.E. - CSE', dob:'11-May-2005',
    gender:'Male', mobile:'9876543225',
    email:'23ucecs001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:8.2,
    attendance:{
      'Engineering Mathematics I': { held:36, attended:34 },
      'Engineering Physics':       { held:34, attended:32 },
      'Introduction to Computing': { held:38, attended:36 },
      'Basic Electronics':         { held:34, attended:31 },
      'English Communication':     { held:30, attended:28 }
    },
    marks:{
      'Engineering Mathematics I': { mid1:23, mid2:24 },
      'Engineering Physics':       { mid1:22, mid2:23 },
      'Introduction to Computing': { mid1:24, mid2:25 },
      'Basic Electronics':         { mid1:21, mid2:22 },
      'English Communication':     { mid1:20, mid2:22 }
    }
  },
  '22UCEEEE001': {
    roll:'22UCEEEE001', name:'Aditya Narayana Rao',
    password:'aditya123', branch:'EEE', year:'II Year',
    sem:'III Sem', course:'B.E. - EEE', dob:'28-Aug-2004',
    gender:'Male', mobile:'9876543226',
    email:'22uceeee001@uceou.ac.in', category:'BC-A',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.3,
    attendance:{
      'Circuit Theory':          { held:36, attended:30 },
      'Electrical Measurements': { held:34, attended:28 },
      'Electromagnetic Theory':  { held:38, attended:32 },
      'Network Analysis':        { held:34, attended:29 },
      'Electronic Devices':      { held:30, attended:26 }
    },
    marks:{
      'Circuit Theory':          { mid1:20, mid2:22 },
      'Electrical Measurements': { mid1:19, mid2:21 },
      'Electromagnetic Theory':  { mid1:21, mid2:22 },
      'Network Analysis':        { mid1:18, mid2:20 },
      'Electronic Devices':      { mid1:17, mid2:19 }
    }
  },
  '20UCECS001': {
    roll:'20UCECS001', name:'Nisha Kumari Prasad',
    password:'nisha123', branch:'CSE', year:'IV Year',
    sem:'VII Sem', course:'B.E. - CSE', dob:'02-Dec-2001',
    gender:'Female', mobile:'9876543227',
    email:'20ucecs001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:8.5,
    attendance:{
      'Distributed Systems':  { held:40, attended:38 },
      'Cloud Computing':      { held:38, attended:36 },
      'Information Security': { held:36, attended:34 },
      'Machine Learning':     { held:34, attended:32 },
      'Project Work':         { held:30, attended:29 }
    },
    marks:{
      'Distributed Systems':  { mid1:24, mid2:25 },
      'Cloud Computing':      { mid1:23, mid2:24 },
      'Information Security': { mid1:24, mid2:25 },
      'Machine Learning':     { mid1:23, mid2:24 },
      'Project Work':         { mid1:25, mid2:25 }
    }
  },
  '23UCEAIML001': {
    roll:'23UCEAIML001', name:'Ganesh Kumar Yadav',
    password:'ganesh123', branch:'AIML', year:'I Year',
    sem:'I Sem', course:'B.E. - AIML', dob:'16-Sep-2005',
    gender:'Male', mobile:'9876543228',
    email:'23uceaiml001@uceou.ac.in', category:'BC-D',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:7.6,
    attendance:{
      'Engineering Mathematics I': { held:36, attended:32 },
      'Python Basics':             { held:34, attended:30 },
      'Introduction to AI':        { held:38, attended:34 },
      'Linear Algebra':            { held:34, attended:30 },
      'English Communication':     { held:30, attended:27 }
    },
    marks:{
      'Engineering Mathematics I': { mid1:21, mid2:23 },
      'Python Basics':             { mid1:22, mid2:24 },
      'Introduction to AI':        { mid1:23, mid2:24 },
      'Linear Algebra':            { mid1:20, mid2:22 },
      'English Communication':     { mid1:19, mid2:21 }
    }
  },
  '20UCEBME001': {
    roll:'20UCEBME001', name:'Pooja Devi Mishra',
    password:'pooja123', branch:'BIOMEDICAL', year:'IV Year',
    sem:'VII Sem', course:'B.E. - Biomedical', dob:'23-Feb-2002',
    gender:'Female', mobile:'9876543229',
    email:'20ucebme001@uceou.ac.in', category:'OC',
    feeStatus:'Paid', feeAmount:50000, feePaid:50000, cgpa:8.0,
    attendance:{
      'Biomedical Signal Processing': { held:40, attended:37 },
      'Rehabilitation Engineering':   { held:38, attended:35 },
      'Hospital Management':          { held:36, attended:33 },
      'Telemedicine':                 { held:34, attended:31 },
      'Project Work':                 { held:30, attended:29 }
    },
    marks:{
      'Biomedical Signal Processing': { mid1:23, mid2:24 },
      'Rehabilitation Engineering':   { mid1:22, mid2:23 },
      'Hospital Management':          { mid1:21, mid2:23 },
      'Telemedicine':                 { mid1:22, mid2:24 },
      'Project Work':                 { mid1:24, mid2:25 }
    }
  }
};

const ADMIN = {
  username: 'admin',
  password: 'admin@uceou123',
  name:     'Prof. Dr. K. Srinivas',
  role:     'HOD & System Admin'
};

module.exports = { STUDENTS, ADMIN };