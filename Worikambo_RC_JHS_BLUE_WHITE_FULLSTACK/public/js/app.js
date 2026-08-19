const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

$("#menuBtn").addEventListener("click",()=>$("#nav").classList.toggle("open"));
$$("nav a").forEach(a=>a.addEventListener("click",()=>$("#nav").classList.remove("open")));

const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")});
},{threshold:.12});
$$(".reveal").forEach(el=>observer.observe(el));

let counted=false;
const statsObserver=new IntersectionObserver(entries=>{
 if(entries[0].isIntersecting&&!counted){
  counted=true;
  $$("[data-count]").forEach(el=>{
   const target=+el.dataset.count; let n=0; const step=Math.max(1,Math.ceil(target/35));
   const timer=setInterval(()=>{n=Math.min(target,n+step);el.textContent=n+(target>90?"+":"");if(n>=target)clearInterval(timer)},35);
  });
 }
});
if($(".stats")) statsObserver.observe($(".stats"));

if($("#loginBtn")) $("#loginBtn").addEventListener("click",()=>{
 const id=$("#studentId").value.trim(), pass=$("#password").value.trim(), msg=$("#loginMessage");
 if(!id||!pass){msg.textContent="Please enter your Student ID and password.";msg.style.color="#a33";return}
 msg.textContent="Demo login successful. Connect this form to your real authentication backend.";
 msg.style.color="#0d5c46"; showToast("Welcome to the Student Portal");
});

$("#alumniBtn").addEventListener("click",e=>{
 e.preventDefault(); showToast("Old Student access is ready for backend authentication.");
});

let filtered=false;
$("#filterBtn").addEventListener("click",()=>{
 filtered=!filtered;
 $("#filterBtn").textContent=filtered?"Show all updates":"Show events only";
 $$(".news-card").forEach(card=>card.style.display=filtered&&card.dataset.type!=="event"?"none":"block");
});

function showToast(text){
 const t=$("#toast");t.textContent=text;t.classList.add("show");
 setTimeout(()=>t.classList.remove("show"),2800);
}
