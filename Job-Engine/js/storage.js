/* storage.js — load/save/seed, localStorage abstraction, formatters */
// ═══════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════
var _jobs=[], _contracts=[], _calc=null;
var _editJobId=null, _editContractId=null;
var _contractType='incoming';
var _jobTab='all', _jobStatusFilter='all';
var _contractTab='all', _contractStatusFilter='all';

function loadData(){
  try{_jobs=JSON.parse(localStorage.getItem('rje_jobs')||'[]');}catch(e){_jobs=[];}
  try{_contracts=JSON.parse(localStorage.getItem('rje_contracts')||'[]');}catch(e){_contracts=[];}
  try{_calc=JSON.parse(localStorage.getItem('rje_calculator')||'null');}catch(e){_calc=null;}
  if(!_jobs.length) seedJobs();
  if(!_contracts.length) seedContracts();
  if(!_calc) initCalc();
}
function saveJobs(){localStorage.setItem('rje_jobs',JSON.stringify(_jobs));}
function saveContracts(){localStorage.setItem('rje_contracts',JSON.stringify(_contracts));}
function saveCalc(){localStorage.setItem('rje_calculator',JSON.stringify(_calc));}

function fmtAED(n){return 'AED '+(parseFloat(n)||0).toLocaleString('en-AE',{minimumFractionDigits:0,maximumFractionDigits:0});}
function uid(){return 'id_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);}
function today(){return new Date().toISOString().split('T')[0];}

// ═══════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════
function seedJobs(){
  var now=Date.now();
  _jobs=[
    {id:uid(),num:'PRJ-2026-0001',date:'2026-04-01',sub:'RIT',type:'Projects',inctype:'Fixed Price',client:'Al Futtaim Contracting',site:'Business Bay, Dubai',desc:'MEP Installation — Tower B, Floors 12–18',income:240000,expense:180000,status:'Ongoing',payment:'Partially Paid',remarks:'Phase 1 ongoing.',refParty:'Ahmed Al Sayed',refType:'Percentage',refPct:2,refAmount:4800,refPayment:'Pending',priority:'High',createdAt:now-86400000*20,updatedAt:now-86400000*2},
    {id:uid(),num:'TKT-2026-0001',date:'2026-05-15',sub:'DRT',type:'Tickets',inctype:'Fixed Price',client:'Green Valley Hotel',site:'JBR, Dubai',desc:'AC compressor fault — floor 24 server room',income:12500,expense:7200,status:'Completed',payment:'Fully Paid',remarks:'Resolved. Invoice raised.',refParty:'',refType:'',refPct:0,refAmount:0,refPayment:'',priority:'Critical',createdAt:now-86400000*8,updatedAt:now-86400000*1},
    {id:uid(),num:'MNT-2026-0001',date:'2026-06-15',sub:'RIT',type:'Maintenance',inctype:'Fixed Price',client:'Emaar Properties',site:'Downtown Dubai',desc:'Monthly chiller preventive maintenance',income:8000,expense:0,status:'Scheduled',payment:'Pending',remarks:'AMC — monthly visit.',refParty:'',refType:'',refPct:0,refAmount:0,refPayment:'',priority:'Normal',createdAt:now-86400000*5,updatedAt:now-86400000*5},
    {id:uid(),num:'SLS-2026-0001',date:'2026-05-20',sub:'ADT',type:'Sales',inctype:'Commission',client:'Transguard Group',site:'DIP, Dubai',desc:'Fire alarm panel supply and installation',income:54000,expense:39000,status:'In Progress',payment:'Partially Paid',remarks:'Delivery June 10.',refParty:'Ajay Sharma',refType:'Fixed Amount',refPct:0,refAmount:2500,refPayment:'Pending',priority:'High',createdAt:now-86400000*14,updatedAt:now-86400000*3},
    {id:uid(),num:'SUB-2026-0001',date:'2026-05-10',sub:'RIT',type:'Subsidiary Work',inctype:'Wages',client:'Rakhsa Infra (Internal)',site:'Marina Walk',desc:'Subcontracted painting — Building C',income:22000,expense:18500,status:'Ongoing',payment:'Pending',remarks:'Excel Painting LLC.',refParty:'',refType:'',refPct:0,refAmount:0,refPayment:'',priority:'Low',createdAt:now-86400000*24,updatedAt:now-86400000*4},
    {id:uid(),num:'PRJ-2026-0002',date:'2026-03-15',sub:'RIT',type:'Projects',inctype:'Fixed Price',client:'Sobha Realty',site:'Sobha Hartland',desc:'Electrical fit-out — Office Block B',income:460000,expense:310000,status:'Ongoing',payment:'Partially Paid',remarks:'Main contract. Quarterly billing.',refParty:'',refType:'',refPct:0,refAmount:0,refPayment:'',priority:'High',createdAt:now-86400000*30,updatedAt:now-86400000*6},
  ];
  saveJobs();
}

function seedContracts(){
  var now=Date.now();
  _contracts=[
    {id:uid(),num:'CON-IN-2026-0001',contractType:'incoming',title:'MEP Main Contract — Tower B',clientName:'Al Futtaim Contracting',status:'Active',startDate:'2026-03-01',endDate:'2026-10-31',signedDate:'2026-02-28',scope:'Full MEP works for Tower B floors 1-20.',contractValue:920000,paidAmount:460000,contractorName:'Al Futtaim Contracting',contractorRef:'AFCON-PO-2026-0341',retention:5,penalty:'2% per week delay',supervisor:'',wagesite:'',workers:[],createdAt:now-86400000*60},
    {id:uid(),num:'CON-OUT-2026-0001',contractType:'outgoing',title:'Subcontract — Plumbing Works',clientName:'Al Qudra Plumbing LLC',status:'Active',startDate:'2026-04-01',endDate:'2026-09-30',signedDate:'2026-03-25',scope:'All plumbing and sanitary works for floors 1-20.',contractValue:180000,paidAmount:90000,contractorName:'',contractorRef:'',retention:0,penalty:'',subconName:'Al Qudra Plumbing LLC',subconRef:'RAKHSA-SC-2026-001',retentionHeld:9000,warranty:'12 months',supervisor:'',wagesite:'',workers:[],createdAt:now-86400000*50},
    {id:uid(),num:'WAG-2026-0001',contractType:'wage',title:'Manpower Supply — Formwork Phase 2',clientName:'Arabtec Contracting',status:'Active',startDate:'2026-05-20',endDate:'2026-06-20',signedDate:'2026-05-18',scope:'Civil formwork manpower supply.',contractValue:32400,paidAmount:16200,supervisor:'Ahmed Raza',wagesite:'Business Bay Tower C',workers:[{id:uid(),name:'Ahmed Raza',trade:'Mason',rate:120,days:22},{id:uid(),name:'Kumar P.',trade:'Carpenter',rate:130,days:22},{id:uid(),name:'Biju Thomas',trade:'General Labour',rate:100,days:22}],contractorName:'',contractorRef:'',retention:0,penalty:'',createdAt:now-86400000*14},
  ];
  saveContracts();
}

