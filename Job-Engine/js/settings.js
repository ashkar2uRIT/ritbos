/* settings.js — data export / management */
// ═══════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════
function exportJobsCSV(){
  var csv='Job#,Date,Client,Site,Description,Type,Subsidiary,Income,Expense,Profit,Status,Payment\n';
  _jobs.forEach(function(j){
    var p=(parseFloat(j.income)||0)-(parseFloat(j.expense)||0);
    csv+=[j.num,j.date,'"'+(j.client||'').replace(/"/g,'""')+'"','"'+(j.site||'').replace(/"/g,'""')+'"','"'+(j.desc||'').replace(/"/g,'""')+'"',j.type,j.sub,j.income||0,j.expense||0,p,j.status,j.payment||''].join(',')+'\n';
  });
  var blob=new Blob([csv],{type:'text/csv'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='RAKHSA_Jobs.csv';a.click();
  toast('Jobs exported as CSV.','success');
}

function exportAllJSON(){
  var data=JSON.stringify({jobs:_jobs,contracts:_contracts,calculator:_calc},null,2);
  var blob=new Blob([data],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='RAKHSA_JobEngine_Export.json';a.click();
  toast('All data exported.','success');
}

