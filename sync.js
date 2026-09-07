const SUPABASE_URL='https://jylkcztyuccjvxtjakscj.supabase.co';
const SUPABASE_KEY='sb_publishable_Z4eeyBX7LT-Dn1sqmI53gw_GBPPCtDP';
const STATE_ID='fica-2026';

function sharedHeaders(){
  return {
    apikey: SUPABASE_KEY,
    'Content-Type':'application/json'
  };
}

async function saveShared(){
  localStorage.setItem(KEY,JSON.stringify(state));
  renderStats();
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/birthday_state?id=eq.${encodeURIComponent(STATE_ID)}`,{
      method:'PATCH',
      headers:{...sharedHeaders(),Prefer:'return=minimal'},
      body:JSON.stringify({data:state,updated_at:new Date().toISOString()})
    });
    if(!r.ok){
      const text=await r.text();
      console.warn('Shared save failed',r.status,text);
      return false;
    }
    return true;
  }catch(e){
    console.warn('Shared save failed',e);
    return false;
  }
}

async function loadShared(initial=false){
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/birthday_state?id=eq.${encodeURIComponent(STATE_ID)}&select=data`,{
      headers:sharedHeaders(),cache:'no-store'
    });
    if(!r.ok){
      console.warn('Shared load failed',r.status,await r.text());
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
      state={
        guests:Array.isArray(d.guests)&&d.guests.length?d.guests:base.guests,
        tasks:Array.isArray(d.tasks)&&d.tasks.length?d.tasks:base.tasks,
        budget:Array.isArray(d.budget)&&d.budget.length?d.budget:base.budget
      };
      localStorage.setItem(KEY,JSON.stringify(state));
      renderGuests();renderTasks();renderBudget();renderStats();
    }
  }catch(e){
    console.warn('Shared load failed',e);
  }
}

// Existing page handlers update `state` locally. These listeners then persist
// the updated state to Supabase, regardless of the original local save function.
document.addEventListener('change',()=>{
  setTimeout(saveShared,0);
});

let inputTimer;
document.addEventListener('input',e=>{
  if(!e.target.matches('#budgetTable input')) return;
  clearTimeout(inputTimer);
  inputTimer=setTimeout(saveShared,350);
});

loadShared(true);
setInterval(()=>loadShared(false),4000);
