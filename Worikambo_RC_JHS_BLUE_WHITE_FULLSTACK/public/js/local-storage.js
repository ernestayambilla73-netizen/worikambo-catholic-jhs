// Local storage layer: caches non-sensitive school data for faster/offline viewing.
// Passwords are NEVER stored in localStorage.
const LocalStore={
  set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}},
  get(key,fallback=null){try{const x=localStorage.getItem(key);return x?JSON.parse(x):fallback}catch(e){return fallback}},
  remove(key){try{localStorage.removeItem(key)}catch(e){}}
};
async function cachePublicData(){
  for(const key of ["leaders","hall-of-fame","news"]){
    try{
      const r=await fetch("/api/"+key);
      if(r.ok) LocalStore.set("worikambo_"+key,await r.json());
    }catch(e){}
  }
}
cachePublicData();
