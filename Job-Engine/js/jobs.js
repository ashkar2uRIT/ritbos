/* jobs.js — All Jobs register, jobs, contracts, incoming, forms, drawers */
// ═══════════════════════════════════════════════
// ALL JOBS — unified master register (no new storage)
// ═══════════════════════════════════════════════
function _ymd(ts){if(!ts)return '';var d=new Date(ts);if(isNaN(d))return '';return d.toISOString().split('T')[0];}
var PRIORITY_RANK={Critical:4,High:3,Normal:2,Low:1};

// Aggregate every job record from existing arrays. Jobs + surfaced contracts (wage, incoming).
function getAllJobRecords(){
  var rows=[];
  _jobs.forEach(function(j){
    rows.push({src:'job',id:j.id,num:j.num,
      created:j.date||_ymd(j.createdAt),createdTs:j.createdAt||0,
      type:j.type,category:(j.type==='Subsidiary Work'?'Subsidiary':'Direct'),
      client:j.client||'',title:j.desc||'',status:j.status||'',priority:j.priority||'Normal',
      assignee:j.assignee||'',revenue:parseFloat(j.income)||0,updatedTs:j.updatedAt||j.createdAt||0});
  });
  _contracts.forEach(function(c){
    if(c.contractType!=='wage'&&c.contractType!=='incoming') return; // outgoing parked
    rows.push({src:'contract',id:c.id,num:c.num,
      created:c.startDate||_ymd(c.createdAt),createdTs:c.createdAt||0,
      type:(c.contractType==='wage'?'Wage Job':'Subsidiary Project'),category:'Subsidiary',
      client:c.clientName||'',title:c.title||'',status:c.status||'',priority:'—',
      assignee:'—',revenue:parseFloat(c.contractValue)||0,updatedTs:c.updatedAt||c.createdAt||0});
  });
  return rows;
}

function _ajPopulateFilters(rows){
  var typeSel=document.getElementById('aj-f-type'),
      statSel=document.getElementById('aj-f-status'),
      cliSel=document.getElementById('aj-f-client');
  function fill(sel,vals,keep){
    var cur=keep?sel.value:'all';
    var h='<option value="all">All</option>';
    vals.forEach(function(v){h+='<option'+(v===cur?' selected':'')+'>'+v+'</option>';});
    sel.innerHTML=h; if(keep) sel.value=cur;
  }
  var types=[],stats=[],clients=[];
  rows.forEach(function(r){
    if(r.type&&types.indexOf(r.type)<0)types.push(r.type);
    if(r.status&&stats.indexOf(r.status)<0)stats.push(r.status);
    if(r.client&&clients.indexOf(r.client)<0)clients.push(r.client);
  });
  types.sort();stats.sort();clients.sort();
  // only (re)build when option set changed, to preserve current selections
  if(typeSel.options.length!==types.length+1) fill(typeSel,types,false); 
  if(statSel.options.length!==stats.length+1) fill(statSel,stats,false);
  if(cliSel.options.length!==clients.length+1) fill(cliSel,clients,false);
}

function resetAllJobsFilters(){
  ['aj-f-type','aj-f-status','aj-f-priority','aj-f-client'].forEach(function(id){document.getElementById(id).value='all';});
  document.getElementById('aj-f-from').value='';
  document.getElementById('aj-f-to').value='';
  document.getElementById('aj-search').value='';
  document.getElementById('aj-sort').value='newest';
  renderAllJobs();
}

function _ajFilterSort(){
  var rows=getAllJobRecords();
  _ajPopulateFilters(rows);
  var q=(document.getElementById('aj-search').value||'').toLowerCase();
  var fType=document.getElementById('aj-f-type').value;
  var fStat=document.getElementById('aj-f-status').value;
  var fPri=document.getElementById('aj-f-priority').value;
  var fCli=document.getElementById('aj-f-client').value;
  var fFrom=document.getElementById('aj-f-from').value;
  var fTo=document.getElementById('aj-f-to').value;
  rows=rows.filter(function(r){
    if(fType!=='all'&&r.type!==fType) return false;
    if(fStat!=='all'&&r.status!==fStat) return false;
    if(fPri!=='all'&&r.priority!==fPri) return false;
    if(fCli!=='all'&&r.client!==fCli) return false;
    if(fFrom&&r.created&&r.created<fFrom) return false;
    if(fTo&&r.created&&r.created>fTo) return false;
    if(q){var hay=[r.num,r.client,r.title,r.type,r.category,r.assignee,r.status].join(' ').toLowerCase();if(hay.indexOf(q)<0)return false;}
    return true;
  });
  var sort=document.getElementById('aj-sort').value;
  rows.sort(function(a,b){
    if(sort==='oldest') return a.createdTs-b.createdTs;
    if(sort==='revenue') return b.revenue-a.revenue;
    if(sort==='priority') return (PRIORITY_RANK[b.priority]||0)-(PRIORITY_RANK[a.priority]||0);
    if(sort==='status') return (a.status||'').localeCompare(b.status||'');
    return b.createdTs-a.createdTs; // newest
  });
  return rows;
}

function renderAllJobs(){
  var rows=_ajFilterSort();
  // stats
  var total=rows.length;
  var revenue=rows.reduce(function(s,r){return s+r.revenue;},0);
  var direct=rows.filter(function(r){return r.category==='Direct';}).length;
  var subs=rows.filter(function(r){return r.category==='Subsidiary';}).length;
  document.getElementById('alljobs-stats').innerHTML=
    '<div class="stat-card"><div class="stat-label">Records</div><div class="stat-value">'+total+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Direct Jobs</div><div class="stat-value blue">'+direct+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Subsidiary</div><div class="stat-value">'+subs+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value amber" style="font-size:15px;">'+fmtAED(revenue)+'</div></div>';
  var tbody=document.getElementById('alljobs-tbody');
  if(!rows.length){
    tbody.innerHTML='<tr class="empty-row"><td colspan="11">No job records match the current filters.</td></tr>';
    document.getElementById('alljobs-table-footer').textContent='0 records';
    return;
  }
  var catBadge={Direct:'badge-blue',Subsidiary:'badge-purple'};
  var html='';
  rows.forEach(function(r){
    var open=r.src==='job'?"openJobDrawer('"+r.id+"')":"openContractDrawer('"+r.id+"')";
    var sbadge='<span class="badge '+(STATUS_COLORS[r.status]||'badge-gray')+'">'+(r.status||'—')+'</span>';
    var tbadge='<span class="badge '+(TYPE_COLORS[r.type]||'badge-gray')+'" style="font-size:9px;">'+r.type+'</span>';
    var cbadge='<span class="badge '+(catBadge[r.category]||'badge-gray')+'" style="font-size:9px;">'+r.category+'</span>';
    html+='<tr class="clickable" onclick="'+open+'">'
      +'<td><span class="mono fs-xs text-muted">'+r.num+'</span></td>'
      +'<td class="fs-xs text-muted">'+(r.created||'—')+'</td>'
      +'<td>'+tbadge+'</td>'
      +'<td>'+cbadge+'</td>'
      +'<td class="fs-xs">'+(r.client||'—')+'</td>'
      +'<td style="max-width:220px;"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;">'+(r.title||'—')+'</div></td>'
      +'<td>'+sbadge+'</td>'
      +'<td class="fs-xs">'+(r.priority||'—')+'</td>'
      +'<td class="fs-xs text-muted">'+(r.assignee||'—')+'</td>'
      +'<td><span class="mono fs-xs text-accent">'+(r.revenue?fmtAED(r.revenue):'—')+'</span></td>'
      +'<td class="fs-xs text-muted">'+(_ymd(r.updatedTs)||'—')+'</td>'
      +'</tr>';
  });
  tbody.innerHTML=html;
  document.getElementById('alljobs-table-footer').textContent=total+' records';
}

function exportAllJobsCSV(){
  var rows=_ajFilterSort();
  var csv='Job#,Created,Type,Category,Client,Title,Status,Priority,AssignedTo,Revenue,LastUpdated\n';
  rows.forEach(function(r){
    csv+=[r.num,r.created,r.type,r.category,'"'+(r.client||'').replace(/"/g,'""')+'"','"'+(r.title||'').replace(/"/g,'""')+'"',r.status,r.priority,'"'+(r.assignee||'').replace(/"/g,'""')+'"',r.revenue,_ymd(r.updatedTs)].join(',')+'\n';
  });
  var blob=new Blob([csv],{type:'text/csv'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='RAKHSA_AllJobs.csv';a.click();
  toast('All Jobs exported as CSV.','success');
}


var TYPE_COLORS={Projects:'badge-blue',Tickets:'badge-amber',Maintenance:'badge-gray',Sales:'badge-green',
  'Subsidiary Work':'badge-purple','Wage Job':'badge-green','Subsidiary Project':'badge-blue'};
var STATUS_COLORS={Ongoing:'badge-blue','In Progress':'badge-teal',Scheduled:'badge-amber',Completed:'badge-green',
  Cancelled:'badge-red',Draft:'badge-gray'};
var PAYMENT_COLORS={'Fully Paid':'badge-green','Partially Paid':'badge-teal',Pending:'badge-amber',
  'Payment Due':'badge-red',Waived:'badge-gray'};

function renderJobsStats(){
  var total=_jobs.length;
  var ongoing=_jobs.filter(function(j){return ['Ongoing','In Progress','Scheduled'].indexOf(j.status)>=0;}).length;
  var completed=_jobs.filter(function(j){return j.status==='Completed';}).length;
  var payDue=_jobs.filter(function(j){return j.payment==='Payment Due'||j.payment==='Pending';}).length;
  var totalIncome=_jobs.reduce(function(s,j){return s+(parseFloat(j.income)||0);},0);
  var totalExpense=_jobs.reduce(function(s,j){return s+(parseFloat(j.expense)||0);},0);
  var profit=totalIncome-totalExpense;
  document.getElementById('jobs-stats').innerHTML=
    '<div class="stat-card"><div class="stat-label">Total Jobs</div><div class="stat-value">'+total+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Ongoing</div><div class="stat-value blue">'+ongoing+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Completed</div><div class="stat-value green">'+completed+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Payment Due</div><div class="stat-value amber">'+payDue+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Total Income</div><div class="stat-value amber" style="font-size:15px;">'+fmtAED(totalIncome)+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Net Profit</div><div class="stat-value '+(profit>=0?'green':'red')+'" style="font-size:15px;">'+fmtAED(profit)+'</div></div>';
  var njc=document.getElementById('nav-jobs-count'); if(njc) njc.textContent=total;
}

function setJobTab(tab,btn){
  _jobTab=tab;
  document.querySelectorAll('#jobs-tabs .dfev-tab').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  renderJobsTable();
}

function setJobStatusFilter(f,btn){
  _jobStatusFilter=f;
  document.querySelectorAll('.filter-tabs .ftab').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  renderJobsTable();
}

function getFilteredJobs(){
  var q=(document.getElementById('job-search').value||'').toLowerCase();
  return _jobs.filter(function(j){
    if(_jobTab!=='all'){
      var typeMap={project:'Projects',service_ticket:'Tickets',maintenance_ticket:'Maintenance',sales:'Sales',subsidiary:'Subsidiary Work'};
      if(j.type!==typeMap[_jobTab]) return false;
    }
    if(_jobStatusFilter==='ongoing' && ['Ongoing','Scheduled','In Progress'].indexOf(j.status)<0) return false;
    if(_jobStatusFilter==='completed' && j.status!=='Completed') return false;
    if(_jobStatusFilter==='pending-payment' && ['Payment Due','Pending'].indexOf(j.payment)<0) return false;
    if(q){
      var hay=[j.num,j.client,j.site,j.desc,j.sub,j.type].join(' ').toLowerCase();
      if(hay.indexOf(q)<0) return false;
    }
    return true;
  });
}

function renderJobsTable(){
  var filtered=getFilteredJobs();
  var tbody=document.getElementById('jobs-tbody');
  document.getElementById('jobs-count-label').textContent=filtered.length+' records';
  if(!filtered.length){
    tbody.innerHTML='<tr class="empty-row"><td colspan="10">No jobs found. Create one with + New Job.</td></tr>';
    document.getElementById('jobs-table-footer').textContent='0 records';
    return;
  }
  var html='';
  filtered.forEach(function(j){
    var sbadge='<span class="badge '+(STATUS_COLORS[j.status]||'badge-gray')+'">'+j.status+'</span>';
    var pbadge='<span class="badge '+(PAYMENT_COLORS[j.payment]||'badge-gray')+'" style="font-size:9px;">'+(j.payment||'—')+'</span>';
    var tbadge='<span class="badge '+(TYPE_COLORS[j.type]||'badge-gray')+'" style="font-size:9px;">'+j.type+'</span>';
    html+='<tr class="clickable" onclick="openJobDrawer(\''+j.id+'\')">'
      +'<td><span class="mono fs-xs text-muted">'+j.num+'</span></td>'
      +'<td class="fs-xs text-muted">'+j.date+'</td>'
      +'<td><div style="font-weight:500;font-size:13px;">'+(j.client||'—')+'</div><div class="fs-xs text-muted">'+(j.site||'')+'</div></td>'
      +'<td style="max-width:200px;"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;">'+(j.desc||'—')+'</div></td>'
      +'<td>'+tbadge+'</td>'
      +'<td class="fs-xs text-muted">'+(j.sub||'—')+'</td>'
      +'<td><span class="mono fs-xs text-accent">'+(j.income?fmtAED(j.income):'—')+'</span></td>'
      +'<td>'+sbadge+'</td>'
      +'<td>'+pbadge+'</td>'
      +'<td onclick="event.stopPropagation()" style="white-space:nowrap;">'
        +'<button class="btn btn-ghost btn-xs" onclick="openJobDrawer(\''+j.id+'\')">View</button> '
        +'<button class="btn btn-ghost btn-xs" onclick="openJobForm(\''+j.id+'\')">Edit</button> '
        +'<button class="btn btn-danger btn-xs" onclick="deleteJob(\''+j.id+'\')">×</button>'
      +'</td>'
      +'</tr>';
  });
  tbody.innerHTML=html;
  document.getElementById('jobs-table-footer').textContent=filtered.length+' records';
}

// ── JOB FORM ──
function openJobForm(editId){
  _editJobId=editId||null;
  var j=editId?_jobs.find(function(x){return x.id===editId;}):null;
  document.getElementById('job-modal-title').textContent=j?'Edit Job — '+j.num:'New Job';
  // Reset all fields
  var fields={
    'jf-sub':j?j.sub:'','jf-type':j?j.type:'','jf-num':j?j.num:'',
    'jf-date':j?j.date:today(),'jf-client':j?j.client:'','jf-site':j?j.site:'',
    'jf-desc':j?j.desc:'','jf-status':j?j.status:'Ongoing','jf-priority':j?j.priority:'Normal',
    'jf-inctype':j?j.inctype:'Profit Sharing','jf-payment':j?j.payment:'',
    'jf-income':j?j.income:'','jf-expense':j?j.expense:'',
    'jf-ref-party':j?j.refParty:'','jf-ref-type':j?j.refType:'',
    'jf-ref-pct':j?j.refPct:'','jf-ref-amount':j?j.refAmount:'',
    'jf-ref-payment':j?j.refPayment:'',
    'jf-remarks':j?j.remarks:'','jf-due-date':j?j.dueDate||'':'',
    'jf-assignee':j?j.assignee||'':''
  };
  Object.keys(fields).forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.value=fields[id];
  });
  // Reset extra fields
  document.getElementById('wage-workers-list').innerHTML='';
  if(j&&j.wageWorkers) j.wageWorkers.forEach(function(w){addWageWorkerRow(w);});
  onJobTypeChange();
  updateJobProfit();
  updateRefCalc();
  // Activate basic tab
  document.querySelectorAll('#job-modal .modal-tab').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('#job-modal .modal-tab-content').forEach(function(el){el.classList.remove('active');});
  document.querySelector('#job-modal .modal-tab').classList.add('active');
  document.getElementById('jf-basic').classList.add('active');
  document.getElementById('job-form-error').style.display='none';
  openModal('job-modal');
}

function jobFormTab(tab,btn){
  document.querySelectorAll('#job-modal .modal-tab').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('#job-modal .modal-tab-content').forEach(function(el){el.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById('jf-'+tab).classList.add('active');
}

function onJobTypeChange(){
  var type=document.getElementById('jf-type').value;
  document.getElementById('jf-maint-fields').style.display=(type==='Maintenance')?'':'none';
  document.getElementById('jf-ticket-fields').style.display=(type==='Tickets')?'':'none';
  document.getElementById('jf-wage-section').style.display=(type==='Subsidiary Work')?'':'none';
  if(type&&!_editJobId){
    var prefixes={Projects:'PRJ',Tickets:'TKT',Maintenance:'MNT',Sales:'SLS','Subsidiary Work':'SUB'};
    var prefix=prefixes[type]||'JOB';
    var year=new Date().getFullYear();
    var count=_jobs.filter(function(j){return j.type===type;}).length+1;
    document.getElementById('jf-num').value=prefix+'-'+year+'-'+String(count).padStart(4,'0');
  }
}

function updateJobProfit(){
  var income=parseFloat(document.getElementById('jf-income').value)||0;
  var expense=parseFloat(document.getElementById('jf-expense').value)||0;
  var profit=income-expense;
  document.getElementById('jp-income').textContent=fmtAED(income);
  document.getElementById('jp-expense').textContent=fmtAED(expense);
  document.getElementById('jp-profit').textContent=fmtAED(profit);
  document.getElementById('jp-profit').className='mono '+(profit>=0?'text-success':'text-danger');
  var pct=income>0?Math.max(0,Math.min(100,(profit/income)*100)):0;
  document.getElementById('jp-bar').style.width=pct+'%';
  document.getElementById('jp-bar').style.background=profit>=0?'var(--success)':'var(--danger)';
  updateRefCalc();
}

function updateRefCalc(){
  var income=parseFloat(document.getElementById('jf-income').value)||0;
  var pct=parseFloat(document.getElementById('jf-ref-pct').value)||0;
  var amount=income*(pct/100);
  var el=document.getElementById('jf-ref-amount');
  if(el&&pct>0) el.value=amount.toFixed(2);
}

function addWageWorker(){addWageWorkerRow({});}
function addWageWorkerRow(w){
  var div=document.createElement('div');
  div.className='worker-row';
  div.innerHTML='<input type="text" placeholder="Name" value="'+(w.name||'')+'"/>'
    +'<select><option>General Labour</option><option>Electrician</option><option>Plumber</option><option>Carpenter</option><option>Mason</option><option>Painter</option><option>Welder</option><option>Other</option></select>'
    +'<input type="number" placeholder="0" value="'+(w.rate||'')+'" oninput="calcWageTotal()" style="text-align:right;"/>'
    +'<input type="number" placeholder="0" value="'+(w.days||'')+'" oninput="calcWageTotal()" style="text-align:right;"/>'
    +'<input type="number" placeholder="0" readonly style="opacity:0.6;text-align:right;"/>'
    +'<button class="rm" onclick="this.parentElement.remove();calcWageTotal()">×</button>';
  if(w.trade){var sel=div.querySelector('select');for(var i=0;i<sel.options.length;i++){if(sel.options[i].text===w.trade){sel.selectedIndex=i;break;}}}
  document.getElementById('wage-workers-list').appendChild(div);
  calcWageTotal();
}
function calcWageTotal(){
  var total=0;
  document.querySelectorAll('#wage-workers-list .worker-row').forEach(function(row){
    var inputs=row.querySelectorAll('input[type="number"]');
    var rate=parseFloat(inputs[0].value)||0,days=parseFloat(inputs[1].value)||0;
    var t=rate*days; inputs[2].value=t>0?t.toFixed(0):''; total+=t;
  });
  document.getElementById('wage-total').textContent=fmtAED(total);
  if(total>0){document.getElementById('jf-income').value=total;updateJobProfit();}
}
function getWageWorkers(){
  var workers=[];
  document.querySelectorAll('#wage-workers-list .worker-row').forEach(function(row){
    var inputs=row.querySelectorAll('input[type="number"]');
    var sel=row.querySelector('select');
    workers.push({name:row.querySelectorAll('input[type="text"]')[0].value,trade:sel?sel.value:'',rate:parseFloat(inputs[0].value)||0,days:parseFloat(inputs[1].value)||0});
  });
  return workers;
}

function saveJob(){_doSaveJob('Ongoing');}
function saveJobDraft(){_doSaveJob('Draft');}
function _doSaveJob(overrideStatus){
  var sub=document.getElementById('jf-sub').value;
  var type=document.getElementById('jf-type').value;
  var date=document.getElementById('jf-date').value;
  if(!sub||!type||!date){
    document.getElementById('job-form-error').textContent='• Subsidiary, Job Type and Date are required.';
    document.getElementById('job-form-error').style.display='';
    return;
  }
  document.getElementById('job-form-error').style.display='none';
  var status=overrideStatus==='Draft'?'Draft':document.getElementById('jf-status').value;
  var job={
    id:_editJobId||uid(),
    num:document.getElementById('jf-num').value,
    date:date,sub:sub,type:type,
    inctype:document.getElementById('jf-inctype').value,
    client:document.getElementById('jf-client').value,
    site:document.getElementById('jf-site').value,
    desc:document.getElementById('jf-desc').value,
    income:parseFloat(document.getElementById('jf-income').value)||0,
    expense:parseFloat(document.getElementById('jf-expense').value)||0,
    status:status,priority:document.getElementById('jf-priority').value,
    payment:document.getElementById('jf-payment').value,
    remarks:document.getElementById('jf-remarks').value,
    dueDate:document.getElementById('jf-due-date').value,
    assignee:document.getElementById('jf-assignee').value,
    refParty:document.getElementById('jf-ref-party').value,
    refType:document.getElementById('jf-ref-type').value,
    refPct:parseFloat(document.getElementById('jf-ref-pct').value)||0,
    refAmount:parseFloat(document.getElementById('jf-ref-amount').value)||0,
    refPayment:document.getElementById('jf-ref-payment').value,
    wageWorkers:getWageWorkers(),
    createdAt:_editJobId?(_jobs.find(function(j){return j.id===_editJobId;})||{}).createdAt||Date.now():Date.now(),
    updatedAt:Date.now()
  };
  if(_editJobId){var idx=_jobs.findIndex(function(j){return j.id===_editJobId;});if(idx>=0)_jobs[idx]=job;else _jobs.push(job);}
  else _jobs.unshift(job);
  saveJobs();
  closeModal('job-modal');
  renderJobsStats();renderJobsTable();if(document.getElementById("subjobs-tbody"))renderSubJobsTable();if(document.getElementById("alljobs-tbody"))renderAllJobs();
  toast(_editJobId?'Job updated.':'Job created.','success');
  _editJobId=null;
}

function deleteJob(id){
  if(!confirm('Delete this job?')) return;
  _jobs=_jobs.filter(function(j){return j.id!==id;});
  saveJobs();
  closeDrawer('job-drawer');
  renderJobsStats();renderJobsTable();if(document.getElementById("subjobs-tbody"))renderSubJobsTable();if(document.getElementById("alljobs-tbody"))renderAllJobs();
  toast('Job deleted.','error');
}

// ── JOB DRAWER ──
function openJobDrawer(id){
  var j=_jobs.find(function(x){return x.id===id;});
  if(!j) return;
  document.getElementById('drawer-job-num').textContent=j.num;
  document.getElementById('drawer-job-meta').textContent=j.type+' · '+j.sub+' · '+j.date;
  document.getElementById('drawer-edit-btn').onclick=function(){closeDrawer('job-drawer');openJobForm(j.id);};
  document.getElementById('drawer-delete-btn').onclick=function(){deleteJob(j.id);};
  var profit=(parseFloat(j.income)||0)-(parseFloat(j.expense)||0);
  var html='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">'
    +'<span class="badge '+(STATUS_COLORS[j.status]||'badge-gray')+'">'+j.status+'</span>'
    +'<span class="badge '+(TYPE_COLORS[j.type]||'badge-gray')+'" style="font-size:9px;">'+j.type+'</span>'
    +(j.payment?'<span class="badge '+(PAYMENT_COLORS[j.payment]||'badge-gray')+'" style="font-size:9px;">'+j.payment+'</span>':'')
    +'</div>';
  html+='<div class="drawer-section">Job Information</div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Job #</span><span class="mono fs-xs">'+j.num+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Date</span><span>'+j.date+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Client</span><span style="font-weight:500;">'+(j.client||'—')+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Site</span><span>'+(j.site||'—')+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Subsidiary</span><span>'+(j.sub||'—')+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Priority</span><span>'+(j.priority||'Normal')+'</span></div>';
  if(j.assignee) html+='<div class="drawer-row"><span class="drawer-row-label">Assignee</span><span>'+j.assignee+'</span></div>';
  if(j.dueDate) html+='<div class="drawer-row"><span class="drawer-row-label">Due Date</span><span>'+j.dueDate+'</span></div>';
  if(j.desc) html+='<div style="padding:10px 0;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border);">'+j.desc+'</div>';
  html+='<div class="drawer-section">Financials</div>';
  html+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:12px;">';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center;">';
  html+='<div><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">INCOME</div><div class="mono text-success">'+fmtAED(j.income)+'</div></div>';
  html+='<div><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">EXPENSE</div><div class="mono text-danger">'+fmtAED(j.expense)+'</div></div>';
  html+='<div><div style="font-size:10px;color:var(--muted);margin-bottom:4px;">PROFIT</div><div class="mono '+(profit>=0?'text-success':'text-danger')+'">'+fmtAED(profit)+'</div></div>';
  html+='</div></div>';
  if(j.refParty){
    html+='<div class="drawer-section">Referral</div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Party</span><span>'+j.refParty+'</span></div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Fee</span><span class="mono">'+fmtAED(j.refAmount||0)+'</span></div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Status</span><span>'+(j.refPayment||'—')+'</span></div>';
  }
  if(j.wageWorkers&&j.wageWorkers.length){
    html+='<div class="drawer-section">Wage Workers ('+j.wageWorkers.length+')</div>';
    html+='<table style="width:100%;font-size:12px;border-collapse:collapse;"><thead><tr><th style="text-align:left;padding:4px 8px;font-size:10px;color:var(--muted);">Name</th><th style="padding:4px 8px;font-size:10px;color:var(--muted);">Trade</th><th style="text-align:right;padding:4px 8px;font-size:10px;color:var(--muted);">Days</th><th style="text-align:right;padding:4px 8px;font-size:10px;color:var(--muted);">Total</th></tr></thead><tbody>';
    j.wageWorkers.forEach(function(w){html+='<tr><td style="padding:4px 8px;">'+(w.name||'—')+'</td><td style="padding:4px 8px;color:var(--muted);">'+w.trade+'</td><td style="padding:4px 8px;text-align:right;">'+w.days+'</td><td style="padding:4px 8px;text-align:right;" class="mono text-accent">'+fmtAED(w.rate*w.days)+'</td></tr>';});
    html+='</tbody></table>';
  }
  if(j.remarks) html+='<div class="drawer-section">Notes</div><div style="font-size:12px;color:var(--muted);line-height:1.7;">'+j.remarks+'</div>';
  document.getElementById('job-drawer-body').innerHTML=html;
  openDrawer('job-drawer');
}

// ═══════════════════════════════════════════════
// JOBS
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// CONTRACTS
// ═══════════════════════════════════════════════
function renderContractStats(){
  var total=_contracts.length;
  var incoming=_contracts.filter(function(c){return c.contractType==='incoming';}).length;
  var outgoing=_contracts.filter(function(c){return c.contractType==='outgoing';}).length;
  var wage=_contracts.filter(function(c){return c.contractType==='wage';}).length;
  var totalValue=_contracts.reduce(function(s,c){return s+(parseFloat(c.contractValue)||0);},0);
  var totalPaid=_contracts.reduce(function(s,c){return s+(parseFloat(c.paidAmount)||0);},0);
  document.getElementById('contracts-stats').innerHTML=
    '<div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">'+total+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Incoming</div><div class="stat-value blue">'+incoming+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Outgoing</div><div class="stat-value amber">'+outgoing+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Wage Jobs</div><div class="stat-value">'+wage+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Total Value</div><div class="stat-value amber" style="font-size:15px;">'+fmtAED(totalValue)+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Balance Due</div><div class="stat-value red" style="font-size:15px;">'+fmtAED(totalValue-totalPaid)+'</div></div>';
}

function setContractTab(tab,btn){
  _contractTab=tab;
  document.querySelectorAll('#page-contracts .dfev-tab').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  renderContractsTable();
}

function setContractStatusFilter(f,btn){
  _contractStatusFilter=f;
  document.querySelectorAll('#page-incoming .filter-tabs .ftab').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  renderContractsTable();
}

function renderContractsTable(){
  var q=(document.getElementById('contract-search').value||'').toLowerCase();
  var filtered=_contracts.filter(function(c){
    if(_contractTab!=='all'&&c.contractType!==_contractTab) return false;
    if(_contractStatusFilter!=='all'&&c.status!==_contractStatusFilter) return false;
    if(q){var hay=(c.title||'')+(c.clientName||'')+(c.num||''); if(hay.toLowerCase().indexOf(q)<0) return false;}
    return true;
  });
  var statusColors={Draft:'badge-gray',Active:'badge-blue',Completed:'badge-green',Suspended:'badge-amber',Cancelled:'badge-red'};
  var typeIcons={incoming:'📥',outgoing:'📤',wage:'💰'};
  var tbody=document.getElementById('contracts-tbody');
  if(!filtered.length){
    tbody.innerHTML='<tr class="empty-row"><td colspan="10">No contracts found.</td></tr>';
    document.getElementById('contracts-table-footer').textContent='0 records';
    return;
  }
  var html='';
  filtered.forEach(function(c){
    var balance=(parseFloat(c.contractValue)||0)-(parseFloat(c.paidAmount)||0);
    html+='<tr class="clickable" onclick="openContractDrawer(\''+c.id+'\')">'
      +'<td><span class="mono fs-xs text-muted">'+c.num+'</span></td>'
      +'<td style="font-weight:500;font-size:13px;">'+(c.title||'—')+'</td>'
      +'<td><span style="font-size:14px;">'+(typeIcons[c.contractType]||'')+'</span> <span class="fs-xs">'+(c.contractType||'—')+'</span></td>'
      +'<td class="fs-xs">'+(c.clientName||'—')+'</td>'
      +'<td class="fs-xs text-muted">'+(c.startDate||'—')+' → '+(c.endDate||'—')+'</td>'
      +'<td class="mono fs-xs text-accent">'+(c.contractValue?fmtAED(c.contractValue):'—')+'</td>'
      +'<td class="mono fs-xs text-success">'+(c.paidAmount?fmtAED(c.paidAmount):'—')+'</td>'
      +'<td class="mono fs-xs '+(balance>0?'text-danger':'text-success')+'">'+fmtAED(balance)+'</td>'
      +'<td><span class="badge '+(statusColors[c.status]||'badge-gray')+'">'+c.status+'</span></td>'
      +'<td onclick="event.stopPropagation()" style="white-space:nowrap;">'
        +'<button class="btn btn-ghost btn-xs" onclick="openContractDrawer(\''+c.id+'\')">View</button> '
        +'<button class="btn btn-ghost btn-xs" onclick="openContractForm(\''+c.id+'\')">Edit</button> '
        +'<button class="btn btn-danger btn-xs" onclick="deleteContract(\''+c.id+'\')">×</button>'
      +'</td>'
      +'</tr>';
  });
  tbody.innerHTML=html;
  document.getElementById('contracts-table-footer').textContent=filtered.length+' records';
}

// ── CONTRACT FORM ──
function openContractForm(editId){
  _editContractId=editId||null;
  var c=editId?_contracts.find(function(x){return x.id===editId;}):null;
  document.getElementById('contract-modal-title').textContent=c?'Edit Contract — '+c.num:'New Contract';
  var fields={
    'ct-title':c?c.title:'','ct-client':c?c.clientName:'','ct-status':c?c.status:'Draft',
    'ct-start':c?c.startDate:'','ct-end':c?c.endDate:'','ct-signed':c?c.signedDate||'':'',
    'ct-scope':c?c.scope||'':'','ct-value':c?c.contractValue:'','ct-paid':c?c.paidAmount:'',
    'ct-contractor':c?c.contractorName||'':'','ct-contractor-ref':c?c.contractorRef||'':'',
    'ct-retention':c?c.retention||'':'','ct-penalty':c?c.penalty||'':'',
    'ct-subcon':c?c.subconName||'':'','ct-subcon-ref':c?c.subconRef||'':'',
    'ct-retention-held':c?c.retentionHeld||'':'','ct-warranty':c?c.warranty||'':'',
    'ct-supervisor':c?c.supervisor||'':'','ct-wage-site':c?c.wagesite||'':''
  };
  Object.keys(fields).forEach(function(id){var el=document.getElementById(id);if(el) el.value=fields[id];});
  document.getElementById('ct-workers-list').innerHTML='';
  if(c&&c.workers) c.workers.forEach(function(w){addContractWorkerRow(w);});
  selectContractType(c?c.contractType:'incoming');
  updateContractBalance();
  document.querySelectorAll('#contract-modal .modal-tab').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('#contract-modal .modal-tab-content').forEach(function(el){el.classList.remove('active');});
  document.querySelector('#contract-modal .modal-tab').classList.add('active');
  document.getElementById('ctf-basic').classList.add('active');
  document.getElementById('contract-form-error').style.display='none';
  openModal('contract-modal');
}

function ctFormTab(tab,btn){
  document.querySelectorAll('#contract-modal .modal-tab').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('#contract-modal .modal-tab-content').forEach(function(el){el.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById('ctf-'+tab).classList.add('active');
}

function selectContractType(type){
  _contractType=type;
  ['incoming','outgoing','wage'].forEach(function(t){
    document.getElementById('ct-btn-'+t).classList.toggle('selected',t===type);
  });
  document.getElementById('ct-incoming-fields').style.display=type==='incoming'?'':'none';
  document.getElementById('ct-outgoing-fields').style.display=type==='outgoing'?'':'none';
  document.getElementById('ct-wage-fields').style.display=type==='wage'?'':'none';
  document.getElementById('ct-workers-tab-btn').style.display=type==='wage'?'':'none';
}

function updateContractBalance(){
  var val=parseFloat(document.getElementById('ct-value').value)||0;
  var paid=parseFloat(document.getElementById('ct-paid').value)||0;
  var balance=val-paid;
  document.getElementById('ctb-value').textContent=fmtAED(val);
  document.getElementById('ctb-paid').textContent=fmtAED(paid);
  document.getElementById('ctb-balance').textContent=fmtAED(balance);
  document.getElementById('ctb-balance').className='mono '+(balance>0?'text-danger':'text-success');
}

function addContractWorker(){addContractWorkerRow({});}
function addContractWorkerRow(w){
  var div=document.createElement('div');
  div.className='worker-row';
  div.innerHTML='<input type="text" placeholder="Name" value="'+(w.name||'')+'"/>'
    +'<select><option>General Labour</option><option>Electrician</option><option>Plumber</option><option>Carpenter</option><option>Mason</option><option>Other</option></select>'
    +'<input type="number" placeholder="0" value="'+(w.rate||'')+'" oninput="calcContractWageTotal()" style="text-align:right;"/>'
    +'<input type="number" placeholder="0" value="'+(w.days||'')+'" oninput="calcContractWageTotal()" style="text-align:right;"/>'
    +'<input type="number" placeholder="0" readonly style="opacity:0.6;text-align:right;"/>'
    +'<button class="rm" onclick="this.parentElement.remove();calcContractWageTotal()">×</button>';
  if(w.trade){var sel=div.querySelector('select');for(var i=0;i<sel.options.length;i++){if(sel.options[i].text===w.trade){sel.selectedIndex=i;break;}}}
  document.getElementById('ct-workers-list').appendChild(div);
  calcContractWageTotal();
}
function calcContractWageTotal(){
  var total=0;
  document.querySelectorAll('#ct-workers-list .worker-row').forEach(function(row){
    var inputs=row.querySelectorAll('input[type="number"]');
    var rate=parseFloat(inputs[0].value)||0,days=parseFloat(inputs[1].value)||0;
    var t=rate*days; inputs[2].value=t>0?t.toFixed(0):''; total+=t;
  });
  document.getElementById('ct-wage-total').textContent=fmtAED(total);
  if(total>0){document.getElementById('ct-value').value=total;updateContractBalance();}
}
function getContractWorkers(){
  var workers=[];
  document.querySelectorAll('#ct-workers-list .worker-row').forEach(function(row){
    var inputs=row.querySelectorAll('input[type="number"]');
    var sel=row.querySelector('select');
    workers.push({id:uid(),name:row.querySelectorAll('input[type="text"]')[0].value,trade:sel?sel.value:'',rate:parseFloat(inputs[0].value)||0,days:parseFloat(inputs[1].value)||0});
  });
  return workers;
}

function saveContract(){
  var title=document.getElementById('ct-title').value.trim();
  if(!title){
    document.getElementById('contract-form-error').textContent='• Title is required.';
    document.getElementById('contract-form-error').style.display='';
    return;
  }
  document.getElementById('contract-form-error').style.display='none';
  var workers=getContractWorkers();
  var wages=workers.reduce(function(s,w){return s+w.rate*w.days;},0);
  var type=_contractType;
  var prefixes={incoming:'CON-IN',outgoing:'CON-OUT',wage:'WAG'};
  var year=new Date().getFullYear();
  var existingNum=_editContractId?(_contracts.find(function(c){return c.id===_editContractId;})||{}).num:'';
  var num=existingNum||prefixes[type]+'-'+year+'-'+String(_contracts.filter(function(c){return c.contractType===type;}).length+1).padStart(4,'0');
  var contract={
    id:_editContractId||uid(),num:num,
    contractType:type,title:title,
    clientName:document.getElementById('ct-client').value,
    status:document.getElementById('ct-status').value,
    startDate:document.getElementById('ct-start').value,
    endDate:document.getElementById('ct-end').value,
    signedDate:document.getElementById('ct-signed').value,
    scope:document.getElementById('ct-scope').value,
    contractValue:type==='wage'?wages:parseFloat(document.getElementById('ct-value').value)||0,
    paidAmount:parseFloat(document.getElementById('ct-paid').value)||0,
    contractorName:document.getElementById('ct-contractor').value,
    contractorRef:document.getElementById('ct-contractor-ref').value,
    retention:parseFloat(document.getElementById('ct-retention').value)||0,
    penalty:document.getElementById('ct-penalty').value,
    subconName:document.getElementById('ct-subcon').value,
    subconRef:document.getElementById('ct-subcon-ref').value,
    retentionHeld:parseFloat(document.getElementById('ct-retention-held').value)||0,
    warranty:document.getElementById('ct-warranty').value,
    supervisor:document.getElementById('ct-supervisor').value,
    wagesite:document.getElementById('ct-wage-site').value,
    workers:workers,
    createdAt:_editContractId?(_contracts.find(function(c){return c.id===_editContractId;})||{}).createdAt||Date.now():Date.now(),
    updatedAt:Date.now()
  };
  if(_editContractId){var idx=_contracts.findIndex(function(c){return c.id===_editContractId;});if(idx>=0)_contracts[idx]=contract;else _contracts.push(contract);}
  else _contracts.unshift(contract);
  saveContracts();
  closeModal('contract-modal');
  renderContractStats();renderContractsTable();if(document.getElementById("alljobs-tbody"))renderAllJobs();
  toast(_editContractId?'Contract updated.':'Contract created.','success');
  _editContractId=null;
}

function deleteContract(id){
  if(!confirm('Delete this contract?')) return;
  _contracts=_contracts.filter(function(c){return c.id!==id;});
  saveContracts();
  closeDrawer('contract-drawer');
  renderContractStats();renderContractsTable();if(document.getElementById("alljobs-tbody"))renderAllJobs();
  toast('Contract deleted.','error');
}

function openContractDrawer(id){
  var c=_contracts.find(function(x){return x.id===id;});
  if(!c) return;
  document.getElementById('cdrawer-title').textContent=c.title||c.num;
  document.getElementById('cdrawer-meta').textContent=c.num+' · '+(c.contractType||'')+' · '+(c.status||'');
  document.getElementById('cdrawer-edit-btn').onclick=function(){closeDrawer('contract-drawer');openContractForm(c.id);};
  document.getElementById('cdrawer-delete-btn').onclick=function(){deleteContract(c.id);};
  var balance=(parseFloat(c.contractValue)||0)-(parseFloat(c.paidAmount)||0);
  var paidPct=c.contractValue>0?Math.round((parseFloat(c.paidAmount)||0)/c.contractValue*100):0;
  var typeIcons={incoming:'📥 Incoming',outgoing:'📤 Outgoing',wage:'💰 Wage Job'};
  var statusColors={Draft:'badge-gray',Active:'badge-blue',Completed:'badge-green',Suspended:'badge-amber',Cancelled:'badge-red'};
  var html='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">'
    +'<span class="badge '+(statusColors[c.status]||'badge-gray')+'">'+c.status+'</span>'
    +'<span class="badge badge-gray fs-xs">'+(typeIcons[c.contractType]||c.contractType)+'</span></div>';
  html+='<div class="drawer-section">Contract Information</div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Contract #</span><span class="mono fs-xs">'+c.num+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Client / Party</span><span style="font-weight:500;">'+(c.clientName||'—')+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Start Date</span><span>'+(c.startDate||'—')+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">End Date</span><span>'+(c.endDate||'—')+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Signed Date</span><span>'+(c.signedDate||'—')+'</span></div>';
  if(c.scope) html+='<div style="padding:8px 0;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border);">'+c.scope+'</div>';
  html+='<div class="drawer-section">Financial Summary</div>';
  html+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:12px;">';
  html+='<div class="drawer-row"><span class="drawer-row-label">Contract Value</span><span class="mono" style="font-weight:700;">'+fmtAED(c.contractValue)+'</span></div>';
  html+='<div class="drawer-row"><span class="drawer-row-label">Amount Paid</span><span class="mono text-success">'+fmtAED(c.paidAmount)+'</span></div>';
  html+='<div class="drawer-row" style="font-weight:700;"><span class="drawer-row-label">Balance Due</span><span class="mono '+(balance>0?'text-danger':'text-success')+'">'+fmtAED(balance)+'</span></div>';
  if(c.contractValue>0) html+='<div class="progress-bar" style="margin-top:8px;"><div class="progress-fill" style="width:'+paidPct+'%;"></div></div><div style="text-align:right;font-size:10px;color:var(--muted);margin-top:4px;">'+paidPct+'% collected</div>';
  html+='</div>';
  if(c.contractType==='incoming'&&c.contractorName){
    html+='<div class="drawer-section">Incoming Contract Details</div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Contractor</span><span>'+c.contractorName+'</span></div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Contractor Ref</span><span class="mono fs-xs">'+c.contractorRef+'</span></div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Retention</span><span>'+(c.retention||0)+'%</span></div>';
  }
  if(c.contractType==='outgoing'&&c.subconName){
    html+='<div class="drawer-section">Outgoing Contract Details</div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Subcontractor</span><span>'+c.subconName+'</span></div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Ref</span><span class="mono fs-xs">'+c.subconRef+'</span></div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Retention Held</span><span class="mono">'+fmtAED(c.retentionHeld||0)+'</span></div>';
  }
  if(c.contractType==='wage'&&c.workers&&c.workers.length){
    html+='<div class="drawer-section">Wage Workers ('+c.workers.length+')</div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Supervisor</span><span>'+(c.supervisor||'—')+'</span></div>';
    html+='<div class="drawer-row"><span class="drawer-row-label">Site</span><span>'+(c.wagesite||'—')+'</span></div>';
    var totalWages=c.workers.reduce(function(s,w){return s+w.rate*w.days;},0);
    html+='<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px;"><thead><tr><th style="text-align:left;padding:4px 8px;font-size:10px;color:var(--muted);">Name</th><th style="padding:4px 8px;font-size:10px;color:var(--muted);">Trade</th><th style="text-align:right;padding:4px 8px;font-size:10px;color:var(--muted);">Days</th><th style="text-align:right;padding:4px 8px;font-size:10px;color:var(--muted);">Total</th></tr></thead><tbody>';
    c.workers.forEach(function(w){html+='<tr><td style="padding:4px 8px;">'+(w.name||'—')+'</td><td style="padding:4px 8px;color:var(--muted);">'+w.trade+'</td><td style="padding:4px 8px;text-align:right;">'+w.days+'</td><td style="padding:4px 8px;text-align:right;" class="mono text-accent">'+fmtAED(w.rate*w.days)+'</td></tr>';});
    html+='</tbody><tfoot><tr><td colspan="3" style="padding:6px 8px;font-weight:700;font-size:11px;text-align:right;border-top:1px solid var(--border);color:var(--muted);">TOTAL</td><td style="padding:6px 8px;text-align:right;font-weight:700;border-top:1px solid var(--border);" class="mono text-accent">'+fmtAED(totalWages)+'</td></tr></tfoot></table>';
  }
  document.getElementById('contract-drawer-body').innerHTML=html;
  openDrawer('contract-drawer');
}

// ═══════════════════════════════════════════════
// CALCULATOR
// ═══════════════════════════════════════════════
var CALC_SECTIONS=[
  {id:'material',label:'Material Costs'},
  {id:'labour',label:'Labour Costs'},
  {id:'transport',label:'Transportation'},
  {id:'rental',label:'Equipment Rental'},
  {id:'food',label:'Food & Accommodation'},
  {id:'referral',label:'Referral Costs'},
  {id:'misc',label:'Miscellaneous'}
];

function initCalc(){
  _calc={title:'Project Calculator',contractValue:0,contingencyPct:0,vatApplicable:false,vatPct:5,sections:{}};
  CALC_SECTIONS.forEach(function(s){_calc.sections[s.id]=[];});
  saveCalc();
}

function calcSectionTotal(secId){
  return (_calc.sections[secId]||[]).reduce(function(s,item){return s+(parseFloat(item.qty)||0)*(parseFloat(item.rate)||0);},0);
}

function calcTotalCost(){
  return CALC_SECTIONS.reduce(function(s,sec){return s+calcSectionTotal(sec.id);},0);
}

function renderCalc(){
  // Section tabs
  CALC_SECTIONS.forEach(function(sec){
    var el=document.getElementById('calc-tab-'+sec.id);
    if(!el) return;
    var items=_calc.sections[sec.id]||[];
    var html='<div class="calc-section-header"><div class="calc-section-title">'+sec.label+'</div><button class="btn btn-primary btn-sm" onclick="calcAddItem(\''+sec.id+'\')">+ Add Item</button></div>';
    if(!items.length){html+='<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px;">No items yet. Click + Add Item.</div>';}
    else{
      html+='<div class="table-wrap"><div style="overflow-x:auto;"><table><thead><tr><th>Description</th><th>Unit</th><th style="text-align:right;">Qty</th><th style="text-align:right;">Rate (AED)</th><th style="text-align:right;">Total (AED)</th><th></th></tr></thead><tbody>';
      items.forEach(function(item,idx){
        var total=(parseFloat(item.qty)||0)*(parseFloat(item.rate)||0);
        html+='<tr>'
          +'<td><input type="text" value="'+(item.desc||'')+'" style="background:transparent;border:1px solid transparent;border-radius:4px;padding:3px 6px;color:var(--text);font-size:12px;width:100%;" onchange="calcUpdateItem(\''+sec.id+'\','+idx+',\'desc\',this.value)"/></td>'
          +'<td><input type="text" value="'+(item.unit||'pcs')+'" style="background:transparent;border:1px solid transparent;border-radius:4px;padding:3px 6px;color:var(--muted);font-size:12px;width:64px;" onchange="calcUpdateItem(\''+sec.id+'\','+idx+',\'unit\',this.value)"/></td>'
          +'<td style="text-align:right;"><input type="number" value="'+(item.qty||0)+'" style="background:transparent;border:1px solid transparent;border-radius:4px;padding:3px 6px;color:var(--text);font-size:12px;width:72px;text-align:right;" oninput="calcUpdateItem(\''+sec.id+'\','+idx+',\'qty\',this.value)"/></td>'
          +'<td style="text-align:right;"><input type="number" value="'+(item.rate||0)+'" style="background:transparent;border:1px solid transparent;border-radius:4px;padding:3px 6px;color:var(--text);font-size:12px;width:90px;text-align:right;" oninput="calcUpdateItem(\''+sec.id+'\','+idx+',\'rate\',this.value)"/></td>'
          +'<td style="text-align:right;" class="mono text-accent">'+total.toLocaleString()+'</td>'
          +'<td><button class="btn btn-danger btn-xs" onclick="calcRemoveItem(\''+sec.id+'\','+idx+')">×</button></td>'
          +'</tr>';
      });
      var secTotal=calcSectionTotal(sec.id);
      html+='<tr><td colspan="4" style="text-align:right;font-size:11px;color:var(--muted);font-weight:600;padding:10px 14px;">SUBTOTAL</td><td style="text-align:right;" class="mono text-accent" style="font-weight:600;">'+secTotal.toLocaleString()+'</td><td></td></tr>';
      html+='</tbody></table></div></div>';
    }
    el.innerHTML=html;
  });

  // Summary tab
  var totalCost=calcTotalCost();
  var contractValue=parseFloat(_calc.contractValue)||0;
  var contingency=totalCost*((_calc.contingencyPct||0)/100);
  var totalWithCont=totalCost+contingency;
  var profit=contractValue-totalWithCont;
  var profitPct=contractValue>0?(profit/contractValue*100).toFixed(1):0;
  var markup=totalWithCont>0?(profit/totalWithCont*100).toFixed(1):0;
  var vat=_calc.vatApplicable?contractValue*((_calc.vatPct||5)/100):0;

  var summaryEl=document.getElementById('calc-tab-summary');
  var html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';

  // Left: breakdown table
  html+='<div class="table-wrap"><div style="padding:12px 14px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;">Cost Breakdown</div><table><thead><tr><th>Section</th><th style="text-align:right;">Subtotal</th><th style="text-align:right;">%</th></tr></thead><tbody>';
  CALC_SECTIONS.forEach(function(sec){
    var st=calcSectionTotal(sec.id);
    var pct=totalCost>0?((st/totalCost)*100).toFixed(1):'0.0';
    html+='<tr><td class="fs-xs">'+sec.label+'</td><td class="mono fs-xs text-accent" style="text-align:right;">'+(st>0?st.toLocaleString():'—')+'</td><td class="fs-xs text-muted" style="text-align:right;">'+pct+'%</td></tr>';
  });
  html+='<tr style="border-top:1px solid var(--border2);"><td style="font-weight:600;font-size:12px;">TOTAL COST</td><td class="mono" style="text-align:right;font-weight:600;color:var(--accent);">'+totalCost.toLocaleString()+'</td><td></td></tr>';
  html+='</tbody></table></div>';

  // Right: profit analysis
  html+='<div>';
  html+='<div class="table-wrap" style="margin-bottom:12px;"><div style="padding:12px 14px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;">Profit Analysis</div>';
  html+='<div style="padding:14px;">';
  html+='<div class="form-row"><div class="form-group"><label>Contract Value (AED)</label><input type="number" value="'+(contractValue||'')+'" placeholder="0" style="background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius);padding:7px 10px;color:var(--text);outline:none;font-size:13px;width:100%;" oninput="_calc.contractValue=parseFloat(this.value)||0;saveCalc();renderCalc();"/></div><div class="form-group"><label>Contingency %</label><input type="number" value="'+(_calc.contingencyPct||0)+'" min="0" max="50" style="background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius);padding:7px 10px;color:var(--text);outline:none;font-size:13px;width:100%;" oninput="_calc.contingencyPct=parseFloat(this.value)||0;saveCalc();renderCalc();"/></div></div>';

  var rows=[
    ['Total Direct Cost',fmtAED(totalCost),'text-accent'],
    ['Contingency ('+(_calc.contingencyPct||0)+'%)',fmtAED(contingency),'text-muted'],
    ['Total with Contingency',fmtAED(totalWithCont),'text-accent'],
    ['Contract Value',fmtAED(contractValue),'text-accent'],
    ['Gross Profit',fmtAED(profit),profit>=0?'text-success':'text-danger'],
    ['Profit Margin',profitPct+'%',profit>=0?'text-success':'text-danger'],
    ['Markup',markup+'%',profit>=0?'text-success':'text-danger'],
  ];
  rows.forEach(function(r){
    html+='<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;"><span style="color:var(--muted);">'+r[0]+'</span><span class="mono '+r[2]+'">'+r[1]+'</span></div>';
  });
  html+='<div style="display:flex;align-items:center;gap:8px;margin-top:10px;">';
  html+='<label style="font-size:12px;display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" '+ (_calc.vatApplicable?'checked':'')+' onchange="_calc.vatApplicable=this.checked;saveCalc();renderCalc();" style="cursor:pointer;"/> Apply VAT '+(_calc.vatPct||5)+'%</label>';
  html+='<span class="mono fs-xs text-muted">= '+fmtAED(vat)+'</span>';
  html+='</div>';
  if(_calc.vatApplicable) html+='<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border2);font-size:13px;font-weight:700;margin-top:8px;"><span>Total incl. VAT</span><span class="mono text-success">'+fmtAED(contractValue+vat)+'</span></div>';
  html+='</div></div></div>';
  html+='</div>'; // end grid

  summaryEl.innerHTML=html;
}

function calcShowTab(tab,btn){
  document.querySelectorAll('#page-calculator .dfev-tab-content').forEach(function(el){el.classList.remove('active');});
  document.getElementById('calc-tab-'+tab).classList.add('active');
  document.querySelectorAll('#page-calculator .dfev-tab').forEach(function(b){b.classList.remove('active');});
  if(btn) btn.classList.add('active');
}

function calcAddItem(secId){
  if(!_calc.sections[secId]) _calc.sections[secId]=[];
  _calc.sections[secId].push({desc:'',unit:'pcs',qty:1,rate:0});
  saveCalc();
  renderCalc();
  // Activate that section tab
  document.querySelectorAll('#page-calculator .dfev-tab-content').forEach(function(el){el.classList.remove('active');});
  document.getElementById('calc-tab-'+secId).classList.add('active');
  document.querySelectorAll('#page-calculator .dfev-tab').forEach(function(b){b.classList.remove('active');});
  var btn=document.querySelector('#page-calculator .dfev-tab[onclick*="\''+secId+'\'"]');
  if(btn) btn.classList.add('active');
}

function calcUpdateItem(secId,idx,field,value){
  if(!_calc.sections[secId]||!_calc.sections[secId][idx]) return;
  _calc.sections[secId][idx][field]=value;
  saveCalc();
}

function calcRemoveItem(secId,idx){
  if(!_calc.sections[secId]) return;
  _calc.sections[secId].splice(idx,1);
  saveCalc();
  renderCalc();
  document.querySelectorAll('#page-calculator .dfev-tab-content').forEach(function(el){el.classList.remove('active');});
  document.getElementById('calc-tab-'+secId).classList.add('active');
}

function calcSave(){saveCalc();toast('Calculator saved.','success');}
function calcReset(){
  if(!confirm('Reset calculator? All items will be cleared.')) return;
  initCalc();
  renderCalc();
  toast('Calculator reset.','info');
}

