-- Worikambo R/C JHS: public school programme gallery
-- Run this file in Supabase Dashboard -> SQL Editor -> New query.
-- Images are publicly viewable; only headmaster/admin roles may upload, edit, or delete them.
create table if not exists public.school_gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_homepage boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.school_gallery add column if not exists title text;
alter table public.school_gallery add column if not exists image_url text;
alter table public.school_gallery add column if not exists alt_text text;
alter table public.school_gallery add column if not exists display_order integer not null default 0;
alter table public.school_gallery add column if not exists is_homepage boolean not null default false;
alter table public.school_gallery add column if not exists created_at timestamptz not null default now();

alter table public.school_gallery enable row level security;
drop policy if exists "Gallery photos are public to view" on public.school_gallery;
create policy "Gallery photos are public to view" on public.school_gallery for select using (true);
drop policy if exists "School leaders can add gallery photos" on public.school_gallery;
create policy "School leaders can add gallery photos" on public.school_gallery for insert to authenticated
with check (exists (select 1 from public.school_profiles p where p.id = auth.uid() and p.role in ('headmaster','admin')));
drop policy if exists "School leaders can update gallery photos" on public.school_gallery;
create policy "School leaders can update gallery photos" on public.school_gallery for update to authenticated
using (exists (select 1 from public.school_profiles p where p.id = auth.uid() and p.role in ('headmaster','admin')))
with check (exists (select 1 from public.school_profiles p where p.id = auth.uid() and p.role in ('headmaster','admin')));
drop policy if exists "School leaders can delete gallery photos" on public.school_gallery;
create policy "School leaders can delete gallery photos" on public.school_gallery for delete to authenticated
using (exists (select 1 from public.school_profiles p where p.id = auth.uid() and p.role in ('headmaster','admin')));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('school-gallery','school-gallery',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view school gallery files" on storage.objects;
create policy "Public can view school gallery files" on storage.objects for select using (bucket_id = 'school-gallery');
drop policy if exists "School leaders can upload gallery files" on storage.objects;
create policy "School leaders can upload gallery files" on storage.objects for insert to authenticated
with check (bucket_id = 'school-gallery' and exists (select 1 from public.school_profiles p where p.id = auth.uid() and p.role in ('headmaster','admin')));
drop policy if exists "School leaders can update gallery files" on storage.objects;
create policy "School leaders can update gallery files" on storage.objects for update to authenticated
using (bucket_id = 'school-gallery' and exists (select 1 from public.school_profiles p where p.id = auth.uid() and p.role in ('headmaster','admin')))
with check (bucket_id = 'school-gallery' and exists (select 1 from public.school_profiles p where p.id = auth.uid() and p.role in ('headmaster','admin')));
drop policy if exists "School leaders can delete gallery files" on storage.objects;
create policy "School leaders can delete gallery files" on storage.objects for delete to authenticated
using (bucket_id = 'school-gallery' and exists (select 1 from public.school_profiles p where p.id = auth.uid() and p.role in ('headmaster','admin')));
