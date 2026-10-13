(function(){
'use strict';
const SUPABASE_URL='https://xuscdioeuhxdcftetirx.supabase.co';
const SUPABASE_KEY='sb_publishable_CNG8Bix04QC1RGFnCkwj0w_obPIYt4t';
const BUCKET='school-gallery';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
let currentUser=null,currentProfile=null,photos=[];
const safeName=name=>String(name||'programme-image').normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g,'-').replace(/-+/g,'-').slice(-90);
function status(id,message){$(id).textContent=message||''}
function allowed(){return ['headmaster','admin'].includes(currentProfile?.role)}
async function checkSession(){
 const {data,error}=await db.auth.getSession();if(error)throw error;
 currentUser=data.session?.user||null;currentProfile=null;
 if(currentUser){const {data:profile,error:pError}=await db.from('school_profiles').select('id,role,full_name').eq('id',currentUser.id).maybeSingle();if(pError)throw pError;currentProfile=profile}
 $('staffAccess').hidden=!allowed();$('signInPanel').hidden=!!currentUser;
 if(currentUser&&!allowed())status('uploadStatus','Signed in as '+(currentProfile?.role||'unassigned')+'. Gallery uploads require headmaster or administrator access.');
}
async function loadPhotos(){
 const grid=$('galleryGrid');grid.replaceChildren();
 const {data,error}=await db.from('school_gallery').select('id,title,image_url,alt_text,display_order,is_homepage').order('display_order',{ascending:true}).limit(100);
 if(error){const p=document.createElement('p');p.className='gallery-empty';p.textContent='The gallery is not connected yet. The administrator needs to run the setup SQL file in the project.';grid.append(p);console.error(error);return}
 photos=data||[];
 if(!photos.length){const p=document.createElement('p');p.className='gallery-empty';p.textContent='No programme pictures have been published yet. School leadership can upload the first pictures using the upload panel.';grid.append(p);return}
 photos.forEach(photo=>{
  const card=document.createElement('article');card.className='gallery-card';
  const img=document.createElement('img');img.src=photo.image_url;img.alt=photo.alt_text||photo.title||'Worikambo school programme';img.loading='lazy';
  const body=document.createElement('div');body.className='gallery-card-body';
  const title=document.createElement('h3');title.textContent=photo.title||'School programme';
  const desc=document.createElement('p');desc.textContent=photo.alt_text||'Worikambo Roman Catholic JHS school community';
  body.append(title,desc);
  if(allowed()){const del=document.createElement('button');del.className='delete';del.type='button';del.textContent='Remove picture';del.onclick=()=>removePhoto(photo);body.append(del)}
  card.append(img,body);grid.append(card);
 });
}
async function removePhoto(photo){
 if(!allowed()||!confirm('Remove this programme picture from the school gallery?'))return;
 try{
  const path=photo.image_url.split('/storage/v1/object/public/'+BUCKET+'/')[1];
  const {error}=await db.from('school_gallery').delete().eq('id',photo.id);if(error)throw error;
  if(path){const result=await db.storage.from(BUCKET).remove([decodeURIComponent(path)]);if(result.error)console.warn('Gallery row removed, but image cleanup failed:',result.error)}
  status('uploadStatus','Picture removed from the gallery.');await loadPhotos();
 }catch(e){status('uploadStatus',e.message||'Could not remove this picture.')}
}
$('galleryLogin').addEventListener('submit',async e=>{
 e.preventDefault();status('loginStatus','Signing in…');
 try{const {error}=await db.auth.signInWithPassword({email:$('staffEmail').value.trim(),password:$('staffPassword').value});if(error)throw error;await checkSession();if(!allowed()){await db.auth.signOut();currentUser=null;currentProfile=null;throw Error('This account does not have headmaster or administrator access.')}status('loginStatus','Signed in successfully.');await loadPhotos()}catch(err){status('loginStatus',err.message||'Sign-in failed.')}
});
$('galleryForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!allowed()){status('uploadStatus','Only the headmaster or administrator can upload programme pictures.');return}
 const showOnHome=$('homepageCheck').checked;const file=$('photoFile').files[0];if(!file){status('uploadStatus','Choose a picture from your device first.');return}
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status('uploadStatus','Choose a JPG, PNG or WebP picture.');return}
 if(file.size>5*1024*1024){status('uploadStatus','The picture must be 5 MB or smaller.');return}
 const button=$('uploadBtn');button.disabled=true;button.textContent='Uploading…';status('uploadStatus','Uploading picture securely…');
 let path='';
 try{
  path=currentUser.id+'/'+Date.now()+'-'+safeName(file.name);
  const upload=await db.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});if(upload.error)throw upload.error;
  const {data:publicData}=db.storage.from(BUCKET).getPublicUrl(path);
  const {data:existing,error:readError}=await db.from('school_gallery').select('display_order').order('display_order',{ascending:false}).limit(1);
  if(readError)throw readError;
  const nextOrder=(existing?.[0]?.display_order||0)+1;
  const {error}=await db.from('school_gallery').insert({title:$('photoTitle').value.trim(),image_url:publicData.publicUrl,alt_text:$('photoAlt').value.trim()||$('photoTitle').value.trim(),display_order:nextOrder,is_homepage:showOnHome});
  if(error)throw error;
  $('galleryForm').reset();status('uploadStatus','Picture published. It is now available in the school gallery'+(showOnHome?' and homepage slideshow':'')+'.');await loadPhotos();
 }catch(err){
  if(path){const clean=await db.storage.from(BUCKET).remove([path]);if(clean.error)console.warn(clean.error)}
  status('uploadStatus',err.message||'Upload failed. Please try again.');
 }finally{button.disabled=false;button.textContent='Upload programme picture'}
});
document.addEventListener('DOMContentLoaded',async()=>{try{await checkSession();await loadPhotos()}catch(e){console.error(e);status('loginStatus',e.message||'Could not connect to the school portal.')}});
})();