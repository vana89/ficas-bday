const SUPABASE_URL='https://jylkcztuccjvxtjakscj.supabase.co';
const SUPABASE_KEY='sb_publishable_Z4eeyBX7LT-Dn1sqmI53gw_GBPPCtDP';
const STATE_ID=document.body.dataset.eventId||'fica-2026';

function sharedHeaders(){return {apikey:SUPABASE_KEY,'Content-Type':'application/json'};}

function ensureSyncUi(){
  if(document.getElementById('syncStatus'))return;
  const note=document.querySelector('#guests .small-note');if(!note)return;
  const uki=STATE_ID==='uki-2026';
  const wrap=document.createElement('div');
  wrap.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px';
  wrap.innerHTML=`<button id="syncSaveBtn" type="button" style="border:1px solid ${uki?'#c9e0e8':'#c7e3de'};background:${uki?'#e8f3f7':'linear-gradient(135deg,#d8efeb,#bfe3dd)'};color:${uki?'#315f70':'#163f3b'};border-radius:12px;padding:8px 12px;font:inherit;font-weight:800;cursor:pointer">Sačuvaj</button><span id="syncStatus" style="font-size:12px;color:${uki?'#39758a':'#667486'}">Spremno</span>`;
  note.after(wrap);
  document.getElementById('syncSaveBtn').addEventListener('click',saveShared);
}

function ensureGuestAddButton(){
  if(document.getElementById('addGuestBtn'))return;
  const guests=document.getElementById('guests');if(!guests)return;
  const head=guests.querySelector('.panel-head');if(!head)return;
  const btn=document.createElement('button');
  btn.id='addGuestBtn';btn.type='button';btn.textContent='＋ Dodaj gosta';
  btn.style.cssText=STATE_ID==='uki-2026'
    ?'border:1px solid #d2e5eb;background:#f8fcfd;color:#315f70;border-radius:12px;padding:8px 12px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(57,117,138,.06)'
    :'border:1px solid #d8e3e3;background:#fff;color:#315f70;border-radius:12px;padding:8px 12px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(57,117,138,.06)';
  btn.addEventListener('click',async()=>{
    if(!Array.isArray(state.guests))state.guests=[];
    state.guests.push(STATE_ID==='uki-2026'?{name:'',adults:0,childNames:'',children:0,rsvp:'Čekamo'}:{name:'',rsvp:'Čekamo'});
    localStorage.setItem(KEY,JSON.stringify(state));renderGuests();renderStats();setSyncStatus('Čuvam…');await saveShared();
    const rows=document.querySelectorAll('#guestTable tbody tr'),last=rows[rows.length-1];if(last){const input=last.querySelector('input');if(input)input.focus();}
  });
  head.appendChild(btn);
}

function setSyncStatus(text,ok=true){
  const el=document.getElementById('syncStatus');if(!el)return;
  el.textContent=text;el.style.color=ok?(STATE_ID==='uki-2026'?'#39758a':'#167b73'):'#b64d36';
}

function normalizeFicaTasks(tasks){
  let changed=false;
  const out=(Array.isArray(tasks)?tasks:[]).map(t=>{const n={...t};if(typeof n.name==='string'&&/krofne/i.test(n.name)&&n.name!=='Poručiti krofne'){n.name='Poručiti krofne';changed=true;}if(typeof n.note==='string'&&/pekara\s+miloš/i.test(n.note)){n.note=n.note.replace(/\s*[•\-–—]?\s*Pekara\s+Miloš\s*/gi,'').trim();changed=true;}return n;});
  return {tasks:out,changed};
}

function migrateSharedState(data){
  const next={...data};let tasks=Array.isArray(data.tasks)?data.tasks.map(t=>({...t})):[];let changed=false;
  const rename=(from,to)=>{const t=tasks.find(x=>x.name===from);if(t){t.name=to;changed=true;}};
  if(STATE_ID==='uki-2026'){
    rename('Odabrati i poručiti ketering','Poručiti ketering');rename('Odabrati i poručiti tortu','Poručiti tortu');
    if(!tasks.some(t=>t.name==='Poručiti ketering')){tasks.push({done:false,name:'Poručiti ketering',due:'',note:''});changed=true;}
    if(!tasks.some(t=>t.name==='Poručiti tortu')){tasks.push({done:false,name:'Poručiti tortu',due:'',note:''});changed=true;}
    if(!tasks.some(t=>t.name==='Poslati pozivnice')){tasks.push({done:false,name:'Poslati pozivnice',due:'',note:'Tražiti potvrdu dolaska'});changed=true;}
    if(Array.isArray(data.guests))next.guests=data.guests.map(g=>{
      if(!g)return {name:'',adults:0,childNames:'',children:0,rsvp:'Čekamo'};
      const migrated={...g};
      if(migrated.adults===undefined){migrated.adults=String(migrated.name||'').trim()?1:0;changed=true;}
      if(migrated.childNames===undefined){migrated.childNames='';changed=true;}
      if(migrated.children===undefined){migrated.children=0;changed=true;}
      return migrated;
    });
  }
  if(STATE_ID==='fica-2026'){const r=normalizeFicaTasks(tasks);tasks=r.tasks;changed=changed||r.changed;}
  next.tasks=tasks;return {data:next,changed};
}

async function saveShared(){
  localStorage.setItem(KEY,JSON.stringify(state));renderStats();setSyncStatus('Čuvam…');
  try{const r=await fetch(`${SUPABASE_URL}/rest/v1/birthday_state?on_conflict=id`,{method:'POST',headers:{...sharedHeaders(),Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify([{id:STATE_ID,data:state,updated_at:new Date().toISOString()}])});const text=await r.text();if(!r.ok){console.warn('Shared save failed',r.status,text);setSyncStatus(`Greška pri čuvanju (${r.status})`,false);return false;}setSyncStatus('✓ Sačuvano');return true;}catch(e){console.warn('Shared save failed',e);setSyncStatus('Greška pri čuvanju',false);return false;}
}

async function loadShared(initial=false){
  try{const r=await fetch(`${SUPABASE_URL}/rest/v1/birthday_state?id=eq.${encodeURIComponent(STATE_ID)}&select=data,updated_at`,{headers:sharedHeaders(),cache:'no-store'});if(!r.ok){console.warn('Shared load failed',r.status,await r.text());setSyncStatus(`Greška pri učitavanju (${r.status})`,false);return;}const rows=await r.json();if(!rows.length){if(initial)await saveShared();return;}const migrated=migrateSharedState(rows[0].data||{}),d=migrated.data;const empty=['guests','tasks','budget'].every(k=>Array.isArray(d[k])&&d[k].length===0);if(initial&&empty){await saveShared();return;}if(!empty){const active=document.activeElement,editing=active&&active.matches('input,select,textarea');if(editing)return;state={guests:Array.isArray(d.guests)&&d.guests.length?d.guests:base.guests,tasks:Array.isArray(d.tasks)&&d.tasks.length?d.tasks:base.tasks,budget:Array.isArray(d.budget)&&d.budget.length?d.budget:base.budget};if(STATE_ID==='fica-2026')state.tasks=normalizeFicaTasks(state.tasks).tasks;localStorage.setItem(KEY,JSON.stringify(state));renderGuests();renderTasks();renderBudget();renderStats();forceFicaLabels();ensureGuestAddButton();setSyncStatus('✓ Sinhronizovano');if(migrated.changed)await saveShared();}}
  catch(e){console.warn('Shared load failed',e);setSyncStatus('Greška pri učitavanju',false);}
}

function forceFicaLabels(){if(STATE_ID!=='fica-2026')return;if(Array.isArray(state&&state.tasks)){const r=normalizeFicaTasks(state.tasks);if(r.changed){state.tasks=r.tasks;localStorage.setItem(KEY,JSON.stringify(state));renderTasks();}}document.querySelectorAll('#taskTable tbody tr').forEach(tr=>{const td=tr.children[1];if(td&&/krofne/i.test(td.textContent))td.textContent='Poručiti krofne';});document.querySelectorAll('#schedule .desc small').forEach(el=>{if(/pekara\s+miloš/i.test(el.textContent)||/umesto rođendanske torte/i.test(el.textContent))el.textContent='Umesto rođendanske torte';});}

ensureSyncUi();ensureGuestAddButton();
document.addEventListener('change',()=>setTimeout(saveShared,0));
let inputTimer;document.addEventListener('input',e=>{if(!e.target.matches('#guestTable input,#budgetTable input'))return;clearTimeout(inputTimer);setSyncStatus('Promene nisu još sačuvane');inputTimer=setTimeout(saveShared,700);});

function applyFicaBookedSchedule(){if(STATE_ID!=='fica-2026')return;const rows=document.querySelectorAll('.event-card .event-row');const start=rows.length?rows[rows.length-1].querySelector('.event-value'):null;if(start)start.textContent='u 17:00';const times=['16:45','17:00','18:15','18:30','19:30'];document.querySelectorAll('#schedule .time').forEach((el,i)=>{if(times[i])el.textContent=times[i];});forceFicaLabels();}
function ficaCountdown(){if(STATE_ID!=='fica-2026')return;const el=document.getElementById('countdown');if(!el)return;const target=new Date('2026-09-26T17:00:00+02:00'),d=target-new Date();if(d<=0){el.textContent='Vreme je za rođendan! 🎉';return;}const days=Math.floor(d/86400000),hrs=Math.floor((d%86400000)/3600000);el.textContent=`Još ${days} dana i ${hrs} h do početka`;}
if(STATE_ID==='fica-2026'){state.tasks=normalizeFicaTasks(state.tasks).tasks;localStorage.setItem(KEY,JSON.stringify(state));renderTasks();forceFicaLabels();setTimeout(forceFicaLabels,500);setTimeout(forceFicaLabels,2000);}
applyFicaBookedSchedule();ficaCountdown();if(STATE_ID==='fica-2026')setInterval(ficaCountdown,10000);
loadShared(true);setInterval(()=>loadShared(false),4000);