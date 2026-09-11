const SUPABASE_URL='https://jylkcztuccjvxtjakscj.supabase.co';
const SUPABASE_KEY='sb_publishable_Z4eeyBX7LT-Dn1sqmI53gw_GBPPCtDP';
const STATE_ID=document.body.dataset.eventId||'fica-2026';

function sharedHeaders(){return {apikey:SUPABASE_KEY,'Content-Type':'application/json'};}
function ensureSyncUi(){if(document.getElementById('syncStatus'))return;const note=document.querySelector('#guests .small-note');if(!note)return;const wrap=document.createElement('div');wrap.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px';wrap.innerHTML='<button id="syncSaveBtn" type="button" style="border:1px solid #c7e3de;background:linear-gradient(135deg,#d8efeb,#bfe3dd);color:#163f3b;border-radius:12px;padding:8px 12px;font:inherit;font-weight:800;cursor:pointer">Sačuvaj</button><span id="syncStatus" style="font-size:12px;color:#667486">Spremno</span>';note.after(wrap);document.getElementById('syncSaveBtn').addEventListener('click',saveShared);}
function setSyncStatus(text,ok=true){const el=document.getElementById('syncStatus');if(!el)return;el.textContent=text;el.style.color=ok?'#167b73':'#b64d36';}
function migrateSharedState(data){
  const next={...data};
  const tasks=Array.isArray(data.tasks)?data.tasks.map(t=>({...t})):[];
  let changed=false;
  const rename=(from,to)=>{const t=tasks.find(x=>x.name===from);if(t){t.name=to;changed=true;}};
  if(STATE_ID==='uki-2026'){
    rename('Odabrati i poručiti ketering','Poručiti ketering');
    rename('Odabrati i poručiti tortu','Poručiti tortu');
    if(!tasks.some(t=>t.name==='Poručiti ketering')){tasks.push({done:false,name:'Poručiti ketering',due:'',note:''});changed=true;}
    if(!tasks.some(t=>t.name==='Poručiti tortu')){tasks.push({done:false,name:'Poručiti tortu',due:'',note:''});changed=true;}
    if(!tasks.some(t=>t.name==='Poslati pozivnice')){tasks.push({done:false,name:'Poslati pozivnice',due:'',note:'Tražiti potvrdu dolaska'});changed=true;}
  }
  if(STATE_ID==='fica-2026'){
    tasks.forEach(t=>{
      if(typeof t.name==='string' && /poručiti\s+krofne/i.test(t.name) && t.name!=='Poručiti krofne'){t.name='Poručiti krofne';changed=true;}
      if(typeof t.note==='string' && /pekara\s+miloš/i.test(t.note)){t.note=t.note.replace(/\s*[•\-–—]?\s*Pekara\s+Miloš\s*/gi,'').trim();changed=true;}
    });
  }
  next.tasks=tasks;
  return {data:next,changed};
}
async function saveShared(){localStorage.setItem(KEY,JSON.stringify(state));renderStats();setSyncStatus('Čuvam…');try{const r=await fetch(`${SUPABASE_URL}/rest/v1/birthday_state?on_conflict=id`,{method:'POST',headers:{...sharedHeaders(),Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify([{id:STATE_ID,data:state,updated_at:new Date().toISOString()}])});const text=await r.text();if(!r.ok){console.warn('Shared save failed',r.status,text);setSyncStatus(`Greška pri čuvanju (${r.status})`,false);return false;}setSyncStatus('✓ Sačuvano');return true;}catch(e){console.warn('Shared save failed',e);setSyncStatus('Greška pri čuvanju',false);return false;}}
async function loadShared(initial=false){try{const r=await fetch(`${SUPABASE_URL}/rest/v1/birthday_state?id=eq.${encodeURIComponent(STATE_ID)}&select=data,updated_at`,{headers:sharedHeaders(),cache:'no-store'});if(!r.ok){console.warn('Shared load failed',r.status,await r.text());setSyncStatus(`Greška pri učitavanju (${r.status})`,false);return;}const rows=await r.json();if(!rows.length){if(initial)await saveShared();return;}const migrated=migrateSharedState(rows[0].data||{});const d=migrated.data;const empty=['guests','tasks','budget'].every(k=>Array.isArray(d[k])&&d[k].length===0);if(initial&&empty){await saveShared();return;}if(!empty){const active=document.activeElement;const editing=active&&active.matches('input,select,textarea');if(editing)return;state={guests:Array.isArray(d.guests)&&d.guests.length?d.guests:base.guests,tasks:Array.isArray(d.tasks)&&d.tasks.length?d.tasks:base.tasks,budget:Array.isArray(d.budget)&&d.budget.length?d.budget:base.budget};localStorage.setItem(KEY,JSON.stringify(state));renderGuests();renderTasks();renderBudget();renderStats();setSyncStatus('✓ Sinhronizovano');if(migrated.changed)await saveShared();}}catch(e){console.warn('Shared load failed',e);setSyncStatus('Greška pri učitavanju',false);}}
ensureSyncUi();
document.addEventListener('change',()=>setTimeout(saveShared,0));
let inputTimer;document.addEventListener('input',e=>{if(!e.target.matches('#guestTable input,#budgetTable input'))return;clearTimeout(inputTimer);setSyncStatus('Promene nisu još sačuvane');inputTimer=setTimeout(saveShared,700);});

function applyFicaBookedSchedule(){if(STATE_ID!=='fica-2026')return;const rows=document.querySelectorAll('.event-card .event-row');const start=rows.length?rows[rows.length-1].querySelector('.event-value'):null;if(start)start.textContent='u 17:00';const times=['16:45','17:00','18:15','18:30','19:30'];document.querySelectorAll('#schedule .time').forEach((el,i)=>{if(times[i])el.textContent=times[i];});const donutNote=document.querySelector('#schedule .timeline-item:last-child .desc small');if(donutNote)donutNote.textContent='Umesto rođendanske torte';}
function ficaCountdown(){if(STATE_ID!=='fica-2026')return;const el=document.getElementById('countdown');if(!el)return;const target=new Date('2026-09-26T17:00:00+02:00');const d=target-new Date();if(d<=0){el.textContent='Vreme je za rođendan! 🎉';return;}const days=Math.floor(d/86400000),hrs=Math.floor((d%86400000)/3600000);el.textContent=`Još ${days} dana i ${hrs} h do početka`;}
applyFicaBookedSchedule();ficaCountdown();if(STATE_ID==='fica-2026')setInterval(ficaCountdown,10000);
loadShared(true);setInterval(()=>loadShared(false),4000);