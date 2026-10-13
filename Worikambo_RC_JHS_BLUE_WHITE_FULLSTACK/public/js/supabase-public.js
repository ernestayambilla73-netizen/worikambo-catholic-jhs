/* Public-only Supabase integration. Never place a service-role key in browser code. */
(function(){
  const SUPABASE_URL = "https://xuscdioeuhxdcftetirx.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CNG8Bix04QC1RGFnCkwj0w_obPIYt4t";
  if (!window.supabase || !window.supabase.createClient) return;
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  window.schoolSupabase = client;

  async function loadGallery(){
    const {data,error}=await client.from('school_gallery').select('id,title,image_url,alt_text,display_order,is_homepage').order('display_order',{ascending:true}).limit(12);
    if(error || !data || !data.length) return;
    const container=document.querySelector('.school-slideshow');
    if(!container) return;
    const controls=container.querySelector('.slide-controls');
    const first=container.querySelector('.slide-image');
    const dots=container.querySelector('.slide-dots');
    data.forEach((photo,index)=>{
      if(!photo.image_url || index===0) return;
      const slide=document.createElement('div');
      slide.className='slide-image';
      slide.setAttribute('role','img');
      slide.setAttribute('aria-label',photo.alt_text || photo.title || 'School gallery photograph');
      slide.style.backgroundImage='url("'+String(photo.image_url).replace(/["\\]/g,'')+'")';
      container.insertBefore(slide,controls);
      if(dots){const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label','Show photo '+(index+1));dots.appendChild(dot);}
    });
    if(window.initSchoolSlideshow) window.initSchoolSlideshow();
  }

  async function loadAnnouncements(){
    const {data,error}=await client.from('school_announcements').select('id,title,body,category,created_at').eq('published',true).order('created_at',{ascending:false}).limit(4);
    if(error || !data || !data.length) return;
    const main=document.querySelector('main');
    if(!main) return;
    const section=document.createElement('section');
    section.className='section school-announcements';
    section.innerHTML='<div class="section-heading"><div><span class="eyebrow">SCHOOL BULLETIN</span><h2>Latest announcements</h2></div><p>Updates from the school community.</p></div><div class="feature-grid"></div>';
    const grid=section.querySelector('.feature-grid');
    data.forEach(item=>{
      const card=document.createElement('article');card.className='feature-card';
      const category=document.createElement('div');category.className='eyebrow';category.textContent=item.category||'General';
      const title=document.createElement('h3');title.textContent=item.title;
      const body=document.createElement('p');body.textContent=item.body;
      card.append(category,title,body);grid.appendChild(card);
    });
    const hero=main.querySelector('#home');
    if(hero) hero.insertAdjacentElement('afterend',section); else main.prepend(section);
  }
  document.addEventListener('DOMContentLoaded',()=>{loadGallery();loadAnnouncements();});
})();