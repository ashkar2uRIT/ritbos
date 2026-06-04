/* app.js — navigation router, UI helpers, boot */
// ═══════════════════════════════════════════════
// NAVIGATION (v1.1 horizontal)
// ═══════════════════════════════════════════════
// Top-tab views -> underlying job type filter for the shared jobs table
var JOB_VIEW_MAP={projects:{tab:'project',type:'Projects',title:'Projects',sub:'Project jobs'},
  service:{tab:'service_ticket',type:'Tickets',title:'Service Tickets',sub:'Service ticket jobs'},
  maintenance:{tab:'maintenance_ticket',type:'Maintenance',title:'Maintenance Tickets',sub:'Maintenance ticket jobs'},
  sales:{tab:'sales',type:'Sales',title:'Sales',sub:'Sales jobs'}};
var _currentJobType='Projects';

function showView(view,btn){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.topnav-tab').forEach(function(b){b.classList.remove('active');});
  if(btn) btn.classList.add('active');
  else{var t=document.querySelector('.topnav-tab[data-view="'+view+'"]');if(t)t.classList.add('active');}

  if(view==='alljobs'){document.getElementById('page-alljobs').classList.add('active');renderAllJobs();return;}
  if(JOB_VIEW_MAP[view]){
    var m=JOB_VIEW_MAP[view];
    _jobTab=m.tab; _currentJobType=m.type;
    document.getElementById('jobs-page-title').textContent=m.title;
    document.getElementById('jobs-page-sub').textContent=m.sub;
    document.getElementById('page-jobs').classList.add('active');
    renderJobsStats(); renderJobsTable();
    return;
  }
  if(view==='incoming'){document.getElementById('page-incoming').classList.add('active');renderContractStats();renderIncomingTab();return;}
  if(view==='outgoing'){document.getElementById('page-outgoing').classList.add('active');return;}
  if(view==='reports'){document.getElementById('page-reports').classList.add('active');renderReports();return;}
  if(view==='settings'){document.getElementById('page-settings').classList.add('active');return;}
  // dashboard (default)
  document.getElementById('page-dashboard').classList.add('active');renderDashboard();
}

function openJobFormForCurrentType(){
  openJobForm();
  var sel=document.getElementById('jf-type');
  if(sel){sel.value=_currentJobType;onJobTypeChange();}
}

// ── INCOMING SUBSIDIARY CONTRACTS secondary nav ──
var _incomingTab='wage';
function setIncomingTab(tab,btn){
  _incomingTab=tab;
  document.querySelectorAll('#incoming-tabs .dfev-tab').forEach(function(b){b.classList.remove('active');});
  if(btn) btn.classList.add('active');
  renderIncomingTab();
}
function renderIncomingTab(){
  var cv=document.getElementById('incoming-contract-view');
  var sv=document.getElementById('incoming-subjobs-view');
  var pv=document.getElementById('incoming-placeholder-view');
  var actions=document.getElementById('incoming-actions');
  cv.style.display='none'; sv.style.display='none'; pv.style.display='none';
  if(_incomingTab==='wage'||_incomingTab==='subprojects'){
    _contractTab=(_incomingTab==='wage')?'wage':'incoming';
    cv.style.display='';
    actions.innerHTML='<button class="btn btn-primary" onclick="openContractForm()">+ New Contract</button>';
    renderContractsTable();
  } else if(_incomingTab==='subservice'){
    sv.style.display='';
    actions.innerHTML='<button class="btn btn-primary" onclick="openJobFormForSubsidiary()">+ New Job</button>';
    renderSubJobsTable();
  } else {
    pv.style.display='';
    actions.innerHTML='<button class="btn btn-primary" onclick="openJobFormForSubsidiary()">+ New Job</button>';
  }
}
function openJobFormForSubsidiary(){
  openJobForm();
  var sel=document.getElementById('jf-type');
  if(sel){sel.value='Subsidiary Work';onJobTypeChange();}
}

// Subsidiary-work jobs table (reuses job data + drawer/form by id)
function renderSubJobsTable(){
  var q=(document.getElementById('subjob-search').value||'').toLowerCase();
  var filtered=_jobs.filter(function(j){
    if(j.type!=='Subsidiary Work') return false;
    if(q){var hay=[j.num,j.client,j.site,j.desc,j.sub].join(' ').toLowerCase();if(hay.indexOf(q)<0)return false;}
    return true;
  });
  var tbody=document.getElementById('subjobs-tbody');
  document.getElementById('subjobs-count-label').textContent=filtered.length+' records';
  if(!filtered.length){
    tbody.innerHTML='<tr class="empty-row"><td colspan="9">No subsidiary work jobs found. Create one with + New Job.</td></tr>';
    document.getElementById('subjobs-table-footer').textContent='0 records';
    return;
  }
  var html='';
  filtered.forEach(function(j){
    var sbadge='<span class="badge '+(STATUS_COLORS[j.status]||'badge-gray')+'">'+j.status+'</span>';
    var pbadge='<span class="badge '+(PAYMENT_COLORS[j.payment]||'badge-gray')+'" style="font-size:9px;">'+(j.payment||'—')+'</span>';
    html+='<tr class="clickable" onclick="openJobDrawer(\''+j.id+'\')">'
      +'<td><span class="mono fs-xs text-muted">'+j.num+'</span></td>'
      +'<td class="fs-xs text-muted">'+j.date+'</td>'
      +'<td><div style="font-weight:500;font-size:13px;">'+(j.client||'—')+'</div><div class="fs-xs text-muted">'+(j.site||'')+'</div></td>'
      +'<td style="max-width:200px;"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;">'+(j.desc||'—')+'</div></td>'
      +'<td class="fs-xs text-muted">'+(j.sub||'—')+'</td>'
      +'<td><span class="mono fs-xs text-accent">'+(j.income?fmtAED(j.income):'—')+'</span></td>'
      +'<td>'+sbadge+'</td>'
      +'<td>'+pbadge+'</td>'
      +'<td onclick="event.stopPropagation()" style="white-space:nowrap;">'
        +'<button class="btn btn-ghost btn-xs" onclick="openJobDrawer(\''+j.id+'\')">View</button> '
        +'<button class="btn btn-ghost btn-xs" onclick="openJobForm(\''+j.id+'\')">Edit</button> '
        +'<button class="btn btn-danger btn-xs" onclick="deleteJob(\''+j.id+'\')">×</button>'
      +'</td></tr>';
  });
  tbody.innerHTML=html;
  document.getElementById('subjobs-table-footer').textContent=filtered.length+' records';
}

// ═══════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function openDrawer(id){
  document.getElementById(id).classList.add('open');
  var ov=document.getElementById(id+'-overlay');
  if(ov) ov.classList.add('open');
}
function closeDrawer(id){
  document.getElementById(id).classList.remove('open');
  var ov=document.getElementById(id+'-overlay');
  if(ov) ov.classList.remove('open');
}
function toast(msg,type){
  type=type||'info';
  var icons={success:'✓',error:'✕',info:'ℹ'};
  var el=document.createElement('div');
  el.className='toast toast-'+type;
  el.innerHTML='<span>'+icons[type]+'</span>'+msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(function(){el.classList.add('show');},10);
  setTimeout(function(){el.classList.remove('show');setTimeout(function(){el.remove();},300);},2800);
}


// ═══════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded',function(){
  loadData();
  showView('dashboard');
});
