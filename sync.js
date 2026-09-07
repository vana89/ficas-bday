const SUPABASE_URL='https://jylkcztyuccjvxtjakscj.supabase.co';
const SUPABASE_KEY='sb_publishable_Z4eeyBX7LT-Dn1sqmI53gw_GBPPCtDP';
const STATE_ID='fica-2026';

function sharedHeaders(){
  return {
    apikey: SUPABASE_KEY,
    'Content-Type':'application/json'
  };
}

function ensureSyncUi(){
  if(document.getElementById('syncStatus')) return;
  const note=document.querySelector('#guests .small-note');
  if(!note) return;
  const wrap=document.createElement('div');
  wrap.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px';
  wrap.innerHTML='<button id="syncSaveBtn" type="button" style="border:1px solid #c7e3de;background:linear-gradient(135deg,#d8efeb,#bfe3dd);color:#163f3b;border-radius:12px;padding:8px 12px;font:inherit;font-weight:800;cursor:pointer">Sačuvaj promene</button><span id="syncStatus" style="font-size:12px;color:#667486">Spremno</span>';
  note.after(wrap);
  document.getElementById('syncSaveBtn').addEventListener('click',saveShared);
}

function setSyncStatus(text,ok=true){
  const el=document.getElementById('syncStatus');
  if(!el) return;
  el.textContent=text;
  el.style.color=ok?'#167b73':'#b64d36';
}

async function saveShared(){
  localStorage.setItem(KEY,JSON.stringify(state));
  renderStats();
  setSyncStatus('Čuvam…');
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/birthday_state?on_conflict=id`,{
      method:'POST',
      headers:{...sharedHeaders(),Prefer:'resolution=merge-duplicates,return=representation'},
      body:JSON.stringify([{
        id:STATE_ID,
        data:state,
        updated_at:new Date().toISOString()
      }])
    });
    const text=await r.text();
    if(!r.ok){
      console.warn('Shared save failed',r.status,text);
      setSyncStatus(`Greška pri čuvanju (${r.status})`,false);
      return false;
    }
    setSyncStatus('✓ Sačuvano');
    return true;
  }catch(e){
    console.warn('Shared save failed',e);
    setSyncStatus('Greška pri čuvanju',false);
    return false;
  }
}

async function loadShared(initial=false){
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/birthday_state?id=eq.${encodeURIComponent(STATE_ID)}&select=data,updated_at`,{
      headers:sharedHeaders(),cache:'no-store'
    });
    if(!r.ok){
      console.warn('Shared load failed',r.status,await r.text());
      setSyncStatus(`Greška pri učitavanju (${r.status})`,false);
      return;
    }
    const rows=await r.json();
    if(!rows.length) return;
    const d=rows[0].data||{};
    const empty=['guests','tasks','budget'].every(k=>Array.isArray(d[k])&&d[k].length===0);
    if(initial&&empty){
      await saveShared();
      return;
    }
    if(!empty){
      // Do not overwrite someone while they are actively editing a field.
      const active=document.activeElement;
      const editing=active && (active.matches('input,select,textarea'));
      if(editing) return;
      state={
        guests:Array.isArray(d.guests)&&d.guests.length?d.guests:base.guests,
        tasks:Array.isArray(d.tasks)&&d.tasks.length?d.tasks:base.tasks,
        budget:Array.isArray(d.budget)&&d.budget.length?d.budget:base.budget
      };
      localStorage.setItem(KEY,JSON.stringify(state));
      renderGuests();renderTasks();renderBudget();renderStats();
      setSyncStatus('✓ Sinhronizovano');
    }
  }catch(e){
    console.warn('Shared load failed',e);
    setSyncStatus('Greška pri učitavanju',false);
  }
}

ensureSyncUi();

// Existing page handlers update `state` first; these handlers then persist it online.
document.addEventListener('change',()=>{
  setTimeout(saveShared,0);
});

let inputTimer;
document.addEventListener('input',e=>{
  if(!e.target.matches('#guestTable input,#budgetTable input')) return;
  clearTimeout(inputTimer);
  setSyncStatus('Promene nisu još sačuvane');
  inputTimer=setTimeout(saveShared,700);
});

loadShared(true);
setInterval(()=>loadShared(false),4000);
