/* reports.js — financial & job-type reports (reads unified job data) */
// ═══════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════
function renderReports(){
  var totalIncome=_jobs.reduce(function(s,j){return s+(parseFloat(j.income)||0);},0);
  var totalExpense=_jobs.reduce(function(s,j){return s+(parseFloat(j.expense)||0);},0);
  var netProfit=totalIncome-totalExpense;
  var totalContractValue=_contracts.reduce(function(s,c){return s+(parseFloat(c.contractValue)||0);},0);
  var totalContractPaid=_contracts.reduce(function(s,c){return s+(parseFloat(c.paidAmount)||0);},0);

  var byType=['Projects','Tickets','Maintenance','Sales','Subsidiary Work'].map(function(t){
    var tj=_jobs.filter(function(j){return j.type===t;});
    return{type:t,count:tj.length,income:tj.reduce(function(s,j){return s+(parseFloat(j.income)||0);},0),expense:tj.reduce(function(s,j){return s+(parseFloat(j.expense)||0);},0)};
  });

  var html='<div class="stats-row" style="margin-bottom:20px;">';
  html+='<div class="stat-card"><div class="stat-label">Total Jobs</div><div class="stat-value">'+_jobs.length+'</div></div>';
  html+='<div class="stat-card"><div class="stat-label">Total Income</div><div class="stat-value amber" style="font-size:15px;">'+fmtAED(totalIncome)+'</div></div>';
  html+='<div class="stat-card"><div class="stat-label">Total Expense</div><div class="stat-value red" style="font-size:15px;">'+fmtAED(totalExpense)+'</div></div>';
  html+='<div class="stat-card"><div class="stat-label">Net Profit</div><div class="stat-value '+(netProfit>=0?'green':'red')+'" style="font-size:15px;">'+fmtAED(netProfit)+'</div></div>';
  html+='<div class="stat-card"><div class="stat-label">Contract Value</div><div class="stat-value amber" style="font-size:15px;">'+fmtAED(totalContractValue)+'</div></div>';
  html+='<div class="stat-card"><div class="stat-label">Balance Due</div><div class="stat-value red" style="font-size:15px;">'+fmtAED(totalContractValue-totalContractPaid)+'</div></div>';
  html+='</div>';

  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
  html+='<div class="table-wrap"><div style="padding:12px 14px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;">Income by Job Type</div><table><thead><tr><th>Type</th><th style="text-align:right;">Count</th><th style="text-align:right;">Income</th><th style="text-align:right;">Profit</th></tr></thead><tbody>';
  byType.forEach(function(t){
    var p=t.income-t.expense;
    html+='<tr><td class="fs-xs">'+t.type+'</td><td class="mono fs-xs" style="text-align:right;">'+t.count+'</td><td class="mono fs-xs text-success" style="text-align:right;">'+fmtAED(t.income)+'</td><td class="mono fs-xs '+(p>=0?'text-success':'text-danger')+'" style="text-align:right;">'+fmtAED(p)+'</td></tr>';
  });
  html+='</tbody></table></div>';

  html+='<div class="table-wrap"><div style="padding:12px 14px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;">Contract Works Summary</div>';
  html+='<div style="padding:14px;">';
  var ctypes=[{t:'incoming',label:'📥 Incoming',color:'badge-blue'},{t:'outgoing',label:'📤 Outgoing',color:'badge-amber'},{t:'wage',label:'💰 Wage Jobs',color:'badge-gray'}];
  ctypes.forEach(function(ct){
    var contracts=_contracts.filter(function(c){return c.contractType===ct.t;});
    var val=contracts.reduce(function(s,c){return s+(parseFloat(c.contractValue)||0);},0);
    html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">';
    html+='<div style="display:flex;align-items:center;gap:8px;"><span class="badge '+ct.color+'" style="font-size:10px;">'+ct.label+'</span><span class="fs-xs text-muted">'+contracts.length+' contracts</span></div>';
    html+='<span class="mono fs-xs text-accent">'+fmtAED(val)+'</span></div>';
  });
  if(totalIncome>0){
    var marginPct=((netProfit/totalIncome)*100).toFixed(1);
    html+='<div style="margin-top:12px;"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span style="color:var(--muted);">Profit Margin</span><span class="mono '+(netProfit>=0?'text-success':'text-danger')+'">'+marginPct+'%</span></div>';
    html+='<div class="progress-bar"><div class="progress-fill" style="width:'+Math.max(0,Math.min(100,parseFloat(marginPct)))+'%;background:'+(netProfit>=0?'var(--success)':'var(--danger)')+'"></div></div></div>';
  }
  html+='</div></div>';
  html+='</div>';

  document.getElementById('reports-content').innerHTML=html;
}

