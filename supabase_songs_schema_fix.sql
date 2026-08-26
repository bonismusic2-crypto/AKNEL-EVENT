-- ==========================================================
-- SCRIPT DE MISE À NIVEAU DU SCHÉMA DES CHANSONS & CLIPS D'ALBUMS
-- ==========================================================

-- 1. Ajout de la colonne audio_url sur la table songs si absente (ou compatibilité file_url / url)
alter table if exists public.songs 
  add column if not exists audio_url text,
  add column if not exists file_url text,
  add column if not exists url text,
  add column if not exists duration text default '04:30',
  add column if not exists artist_name text default 'Chantre Boniface',
  add column if not exists track_number integer default 1;

-- 2. Ajout de la colonne album_id sur media_contents pour rattacher les clips aux albums
alter table if exists public.media_contents
  add column if not exists album_id bigint references public.albums(id) on delete set null;

-- 3. Politiques RLS permissives pour la table 'songs'
alter table public.songs enable row level security;

drop policy if exists "Lecture publique des chansons" on public.songs;
create policy "Lecture publique des chansons"
  on public.songs for select
  using (true);

drop policy if exists "Insertion autorisee des chansons" on public.songs;
create policy "Insertion autorisee des chansons"
  on public.songs for insert
  with check (true);

drop policy if exists "Modification autorisee des chansons" on public.songs;
create policy "Modification autorisee des chansons"
  on public.songs for update
  using (true);

drop policy if exists "Suppression autorisee des chansons" on public.songs;
create policy "Suppression autorisee des chansons"
  on public.songs for delete
  using (true);

-- 4. Politiques RLS pour albums et media_contents
drop policy if exists "Insertion autorisee albums" on public.albums;
create policy "Insertion autorisee albums"
  on public.albums for insert
  with check (true);

drop policy if exists "Modification autorisee albums" on public.albums;
create policy "Modification autorisee albums"
  on public.albums for update
  using (true);

drop policy if exists "Suppression autorisee albums" on public.albums;
create policy "Suppression autorisee albums"
  on public.albums for delete
  using (true);

drop policy if exists "Insertion autorisee media_contents" on public.media_contents;
create policy "Insertion autorisee media_contents"
  on public.media_contents for insert
  with check (true);

drop policy if exists "Modification autorisee media_contents" on public.media_contents;
create policy "Modification autorisee media_contents"
  on public.media_contents for update
  using (true);

drop policy if exists "Suppression autorisee media_contents" on public.media_contents;
create policy "Suppression autorisee media_contents"
  on public.media_contents for delete
  using (true);

-- 5. Publication Realtime pour songs et albums
alter publication supabase_realtime add table public.songs;
alter publication supabase_realtime add table public.albums;
