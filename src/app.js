import {METRICS, MEASUREMENT_GUIDES, ROUTINES, validateRecord, parseImport, assess, hasUnusualTrend, demoRecords, csv} from './model.js';
import {actionGuidance} from './actions.js';
const $ = s => document.querySelector(s);
const KEY = 'orbit-health-v1', ROUTINE_KEY = 'orbit-routine-v1';
let records = [], storageAvailable = true, checked = [];
const escape = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDay = () => new Date().toLocaleDateString('en-CA');
const localInputTime = () => {const now=new Date(); return new Date(+now-now.getTimezoneOffset()*60000).toISOString().slice(0,16);};
const displayDate = date => new Date(date).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
try {
  const raw = localStorage.getItem(KEY);
  if (raw) records = parseImport(JSON.parse(raw));
  const routine = JSON.parse(localStorage.getItem(ROUTINE_KEY) || '{}');
  if (routine.day === localDay() && Array.isArray(routine.checked)) checked = routine.checked.filter(i=>Number.isInteger(i)&&i>=0&&i<ROUTINES.length);
} catch { $('#data-message').textContent = 'Stored data could not be read. It was not overwritten. Export or clear browser data before continuing.'; storageAvailable=false; }
function persist(next) {
  // Commit state only after storage succeeds. Do not pretend failed writes are saved.
  try {localStorage.setItem(KEY, JSON.stringify({version:1,records:next})); records=next; storageAvailable=true; updateConnection(); return true;}
  catch {storageAvailable=false; updateConnection(); $('#data-message').textContent='Could not save: browser storage is unavailable or full. Export your existing records.'; return false;}
}
function updateConnection(){ $('#connection').textContent = !storageAvailable ? 'Storage unavailable' : navigator.onLine ? 'Local storage · online' : 'Local storage · offline'; }
for (const [key,m] of Object.entries(METRICS)) {
  const guide=MEASUREMENT_GUIDES[key];
  $('#metric-fields').insertAdjacentHTML('beforeend',`<div class="metric-input"><label>${m.label} (${m.unit})<input type="number" name="${key}" min="${m.min}" max="${m.max}" step="${m.step}" required inputmode="decimal"></label><details class="measurement-guide"><summary>How to measure</summary><div class="guide-content"><p>${escape(guide.intro)}</p><p><b>Equipment</b><br>${escape(guide.equipment)}</p><b>How to measure</b><ol>${guide.steps.map(step=>`<li>${escape(step)}</li>`).join('')}</ol><p class="space-tip"><b>ⓘ Space tip</b><br>${escape(guide.spaceTip)}</p></div></details></div>`);
  $('#chart-metric').insertAdjacentHTML('beforeend',`<option value="${key}">${m.label}</option>`);
}
$('#chart-metric').value='sleep'; $('#measurement-time').value=localInputTime();
function renderRoutine(){
  $('#routines').innerHTML=ROUTINES.map((text,i)=>`<label class="routine-item"><input type="checkbox" data-routine="${i}" ${checked.includes(i)?'checked':''}>${text}</label>`).join('');
  $('#routine-progress').style.width=`${checked.length/ROUTINES.length*100}%`;
  $('#routine-count').textContent=`${checked.length} of ${ROUTINES.length} complete · resets each local calendar day`;
}
$('#routines').addEventListener('change',e=>{
  const index=Number(e.target.dataset.routine); if(!Number.isInteger(index))return;
  const next=e.target.checked?[...new Set([...checked,index])]:checked.filter(i=>i!==index);
  try{localStorage.setItem(ROUTINE_KEY,JSON.stringify({day:localDay(),checked:next}));checked=next;renderRoutine();}
  catch {$('#routine-count').textContent='Could not save routine progress.'; e.target.checked=!e.target.checked;}
});
function table(rows, keys){return `<table><thead><tr><th>Time (local)</th>${keys.map(k=>`<th>${METRICS[k].label} (${METRICS[k].unit})</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td>${escape(displayDate(r.date))}</td>${keys.map(k=>`<td>${r[k]}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function renderChart(){
  const key=$('#chart-metric').value, metric=METRICS[key], rows=records.slice(-14);
  const unusual=hasUnusualTrend(rows,key);
  $('#chart-table').innerHTML=rows.length?table(rows,[key]):'No values yet.';
  $('#chart-caption').textContent=rows.length?`${rows.length} check-ins · ${metric.unit}${unusual?' · unusual change detected':''}`:'No measurements';
  if(!rows.length){$('#chart').innerHTML='<p class="empty-state">Your trend starts with one check-in.<br>Or load the fictional 14-day demo below.</p>';return;}
  const values=rows.map(r=>r[key]), lo=Math.min(...values), hi=Math.max(...values), pad=Math.max((hi-lo)*.3,metric.step), min=lo-pad,max=hi+pad;
  const x=i=>48+(rows.length===1?234:i/(rows.length-1)*468), y=v=>162-(v-min)/(max-min)*132;
  const points=values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
  $('#chart').innerHTML=`<svg viewBox="0 0 540 205" role="img" aria-label="${metric.label} across ${rows.length} check-ins.${unusual?' Unusual change detected.':''} Exact values are in the table below."><title>${metric.label} (${metric.unit})</title>${[min,(min+max)/2,max].map(v=>`<line class="grid" x1="48" x2="516" y1="${y(v)}" y2="${y(v)}"/><text x="3" y="${y(v)+4}">${v.toFixed(1)}</text>`).join('')}<polyline class="line${unusual?' alert':''}" points="${points}"/>${values.map((v,i)=>`<circle class="point${unusual?' alert':''}" cx="${x(i)}" cy="${y(v)}" r="3"><title>${escape(displayDate(rows[i].date))}: ${v} ${metric.unit}</title></circle>`).join('')}<text x="48" y="193">${escape(displayDate(rows[0].date))}</text><text x="516" y="193" text-anchor="end">${rows.length>1?escape(displayDate(rows.at(-1).date)):''}</text></svg>`;
}
function renderActions(latest){
  const actions=actionGuidance(latest);
  $('#action-guidance').innerHTML=actions.length?actions.map(action=>{
    const priority=action.type==='symptoms'?' priority':'';
    const body=action.type==='flag'?`<ol><li><b>Check the measurement and units.</b> ${action.check}</li><li><b>Record context.</b> ${action.context}</li><li><b>Follow up.</b> ${action.followUp}</li></ol>`:`<p>${action.detail}</p>`;
    const buttons=`<div class="action-buttons">${action.trend?`<button type="button" data-trend="${action.key}">View ${METRICS[action.key].label} trend</button>`:''}${action.followUp?`<button type="button" data-follow-up="${action.type}">${action.type==='stale'?'Record fresh check-in':'Record a follow-up'}</button>`:''}</div>`;
    return `<article class="action-card${priority}"><h3>${action.title}</h3>${body}${buttons}</article>`;
  }).join(''):'<p class="empty-state">No follow-up actions from the latest check-in. Fictional sample ranges do not establish health or rule out illness.</p>';
}
function render(){
  const latest=records.at(-1), result=assess(latest);
  $('#latest-time').textContent=latest?'Last entry · '+displayDate(latest.date):'No check-ins yet';
  $('#summary').className='summary '+result.state;
  $('#summary').innerHTML=`<b>${result.title}</b>${result.stale?'<p>Last check-in is over 24 hours old. This snapshot is stale.</p>':''}${latest?.symptoms?'<p>Do not wait for app feedback or a connection. Use the established onboard medical response procedure and notify the designated medical officer.</p>':''}${result.flags.length?'<ul>'+result.flags.map(f=>`<li>${f.message}</li>`).join('')+'</ul><p>Verify the entry and measurement context; review with the designated medical officer under mission procedures. These flags do not diagnose a condition.</p>':latest?'<p>No fictional demo range flags. This does not establish health or rule out illness.</p>':'<p>Enter measurements or load the synthetic demo to explore the console.</p>'}`;
  $('#metrics').innerHTML=Object.entries(METRICS).map(([key,m])=>{const flag=result.flags.some(f=>f.key===key);return `<div class="metric-card"><div class="label">${m.label}</div><div class="metric-value">${latest?latest[key]:'—'}<small>${m.unit}</small></div><div class="metric-status ${!latest?'empty':flag?'flag':''}">${!latest?'AWAITING MEASUREMENT':flag?'△ UNHEALTHY RANGE':'• HEALTHY RANGE'}</div></div>`;}).join('');
  $('#record-count').textContent=`${records.length} CHECK-INS`;
  $('#history').innerHTML=records.length?table(records.slice(-30).reverse(),Object.keys(METRICS))+'<p class="muted">Showing latest 30 records. Exports include all records and notes.</p>':'<p class="empty-state">No check-ins saved yet.</p>';
  $('#export-json').disabled=$('#export-csv').disabled=!records.length;
  renderActions(latest);
  renderChart();
}
$('#chart-metric').addEventListener('change',renderChart);
$('#action-guidance').addEventListener('click',e=>{
  const trend=e.target.closest('[data-trend]');
  if(trend){$('#chart-metric').value=trend.dataset.trend;renderChart();$('#trends').scrollIntoView({behavior:'smooth'});$('#chart-metric').focus();return;}
  const followUp=e.target.closest('[data-follow-up]');
  if(followUp){$('#measurement-time').value=localInputTime();$('#checkin').scrollIntoView({behavior:'smooth'});(followUp.dataset.followUp==='symptoms'?$('#checkin-form [name="symptoms"]'):$('#measurement-time')).focus();}
});
$('#checkin-form').addEventListener('submit',e=>{
  e.preventDefault(); const data=new FormData(e.target);
  try{
    if(records.length>=500)throw new Error('500-check-in demo limit reached. Export and clear records to start a new dataset.');
    const input={date:new Date(data.get('date')).toISOString(),symptoms:data.has('symptoms'),notes:String(data.get('notes')||'')};
    for(const key of Object.keys(METRICS))input[key]=Number(data.get(key));
    const record=validateRecord(input);
    if(records.some(r=>r.date===record.date))throw new Error('A check-in already exists at this time. Choose another measurement time.');
    const next=[...records,record].sort((a,b)=>a.date.localeCompare(b.date));
    if(!persist(next))throw new Error('Check-in not saved. Browser storage is unavailable or full.');
    e.target.reset();$('#measurement-time').value=localInputTime();render();
    $('#form-message').textContent='Check-in saved on this device.';
  }catch(err){$('#form-message').textContent=err.message;}
});
const systems={
  cardio:{title:'Cardiovascular signals',body:'Spaceflight changes the demands on the cardiovascular system. A single reading cannot explain why a measurement changed.',measure:'This app records resting heart rate and systolic pressure only. It does not capture diastolic pressure, posture, device calibration, or activity context in structured fields.'},
  mind:{title:'Sleep & behavioral wellbeing',body:'Isolation and confinement are among NASA’s five spaceflight hazards. Regular sleep records can help a crew member communicate observations over time.',measure:'Sleep duration is a self-reported observation, not a health screening or diagnosis.'},
  immune:{title:'Immune health context',body:'NASA studies changes in human health during spaceflight, including immune function. Temperature is only one observation and cannot assess immune function on its own.',measure:'Enter measured temperature in degrees Celsius. A fictional range flag should prompt a review of measurement context; an unflagged value does not rule out illness.'},
  nutrition:{title:'Nutrition & metabolic context',body:'Food intake and metabolic measurements need context, including meal timing and measurement method.',measure:'Blood glucose is entered manually in mg/dL. The demo does not distinguish fasting and post-meal readings and must not be used to guide diet, medication, or treatment.'},
  bone:{title:'Bone & muscle health',body:'Altered gravity is one of the hazards NASA investigates. This app does not measure bone density, muscle strength, or exercise effectiveness.',measure:'Use the routine checklist to review the exercise plan assigned by the mission team. A checked task is a completion record, not evidence of improved bone or muscle health.'}
};
function showSystem(key){const s=systems[key];$('#system-detail').innerHTML=`<h3>${s.title}</h3><p>${s.body}</p><p>${s.measure}</p><a href="https://www.nasa.gov/humans-in-space/the-human-body-in-space/" target="_blank" rel="noopener noreferrer">Read NASA’s human body in space overview ↗</a>`;document.querySelectorAll('[data-system]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.system===key)));}
document.querySelectorAll('[data-system]').forEach(b=>b.addEventListener('click',()=>showSystem(b.dataset.system)));
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#export-json').addEventListener('click',()=>download(JSON.stringify({version:1,exportedAt:new Date().toISOString(),records},null,2),'orbit-health-records.json','application/json'));
$('#export-csv').addEventListener('click',()=>download(csv(records),'orbit-health-records.csv','text/csv'));
$('#load-demo').addEventListener('click',()=>{if(records.length&&!confirm('Replace existing check-ins with 14 fictional demo records? Export first if you want to keep them.'))return;if(persist(demoRecords())){$('#data-message').textContent='Loaded 14 fictional check-ins. No real astronaut data is used.';render();}});
$('#import').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>1000000)throw new Error('Import must be smaller than 1 MB.');const next=parseImport(JSON.parse(await file.text()));if(!confirm(`Replace ${records.length} check-ins with ${next.length} imported check-ins?`))return;if(persist(next)){$('#data-message').textContent='Import complete.';render();}}
  catch(err){$('#data-message').textContent='Import failed: '+err.message;}
  finally{e.target.value='';}
});
$('#clear').addEventListener('click',()=>{
  if(!confirm('Permanently clear all Orbit Health check-ins and routine progress on this browser?'))return;
  try{localStorage.removeItem(KEY);localStorage.removeItem(ROUTINE_KEY);records=[];checked=[];storageAvailable=true;updateConnection();render();renderRoutine();$('#data-message').textContent='Local records and routine progress cleared.';}
  catch{$('#data-message').textContent='Could not clear local data. Use your browser’s site data controls.';}
});
window.addEventListener('online',updateConnection);window.addEventListener('offline',updateConnection);
// Refresh age status and daily checklist when an open tab crosses midnight.
let day=localDay();setInterval(()=>{render();if(day!==localDay()){day=localDay();checked=[];renderRoutine();}},60000);
showSystem('cardio');renderRoutine();render();updateConnection();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{$('#data-message').textContent='Offline caching is unavailable. Keep this tab open or reconnect to reload.';});
