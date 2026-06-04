/* dashboard.js — dashboard metrics & activity */
// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════
function renderDashboard(){
  var totalIncome=_jobs.reduce(function(s,j){return s+(parseFloat(j.income)||0);},0);
  var netProfit=totalIncome-_jobs.reduce(function(s,j){return s+(parseFloat(j.expense)||0);},0);
  var ongoing=_jobs.filter(function(j){return ['Ongoing','In Progress','Scheduled'].indexOf(j.status)>=0;}).length;
  var payDue=_jobs.filter(function(j){return j.payment==='Payment Due'||j.payment==='Pending';}).length;
  document.getElementById('dash-stats').innerHTML=
    '<div class="stat-card"><div class="stat-label">Total Jobs</div><div class="stat-value">'+_jobs.length+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Ongoing</div><div class="stat-value blue">'+ongoing+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Payment Pending</div><div class="stat-value amber">'+payDue+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Contracts</div><div class="stat-value">'+_contracts.length+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Total Income</div><div class="stat-value amber" style="font-size:14px;">'+fmtAED(totalIncome)+'</div></div>'+
    '<div class="stat-card"><div class="stat-label">Net Profit</div><div class="stat-value '+(netProfit>=0?'green':'red')+'" style="font-size:14px;">'+fmtAED(netProfit)+'</div></div>';

  var recentJobs=_jobs.slice(0,6);
  var dotColors={Ongoing:'#5ba8e8','In Progress':'#5bb8a0',Scheduled:'#e8b86d',Completed:'#5bb87a',Cancelled:'#e8614a',Draft:'#6b6966'};
  var TYPE_VIEW={Projects:'projects',Tickets:'service',Maintenance:'maintenance',Sales:'sales','Subsidiary Work':'incoming'};
  var jHtml=recentJobs.length?recentJobs.map(function(j){
    return '<div class="activity-item" onclick="showView(\''+(TYPE_VIEW[j.type]||'projects')+'\');openJobDrawer(\''+j.id+'\')">'
      +'<div class="activity-dot" style="background:'+(dotColors[j.status]||'#6b6966')+'"></div>'
      +'<div class="activity-info"><div class="activity-title">'+(j.client||'—')+' — '+(j.desc||j.type||'Job')+'</div>'
      +'<div class="activity-meta">'+j.num+' · '+j.type+' · '+j.sub+'</div></div>'
      +'<div class="activity-amount" style="color:var(--success);">'+(j.income?fmtAED(j.income):'—')+'</div>'
      +'</div>';
  }).join(''):'<div class="activity-item"><div style="color:var(--muted);font-size:12px;padding:8px 0;">No jobs yet. <a href="#" onclick="showView(\'projects\');openJobFormForCurrentType();return false;" style="color:var(--accent);">Create one →</a></div></div>';

  var recentContracts=_contracts.slice(0,6);
  var ctypeDots={incoming:'#5ba8e8',outgoing:'#e8b86d',wage:'#5bb87a'};
  var cHtml=recentContracts.length?recentContracts.map(function(c){
    return '<div class="activity-item" onclick="showView(\'incoming\');openContractDrawer(\''+c.id+'\')">'
      +'<div class="activity-dot" style="background:'+(ctypeDots[c.contractType]||'#6b6966')+'"></div>'
      +'<div class="activity-info"><div class="activity-title">'+c.title+'</div>'
      +'<div class="activity-meta">'+c.num+' · '+c.contractType+' · '+c.status+'</div></div>'
      +'<div class="activity-amount" style="color:var(--accent);">'+(c.contractValue?fmtAED(c.contractValue):'—')+'</div>'
      +'</div>';
  }).join(''):'<div class="activity-item"><div style="color:var(--muted);font-size:12px;padding:8px 0;">No contracts yet.</div></div>';

  document.getElementById('dash-recent-jobs').innerHTML=jHtml;
  document.getElementById('dash-recent-contracts').innerHTML=cHtml;
}

