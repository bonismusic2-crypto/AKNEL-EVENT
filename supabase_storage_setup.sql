-- ==========================================================
-- SCRIPT DE CRÉATION DES BUCKETS DE STOCKAGE SUPABASE STORAGE
-- ==========================================================

-- 1. Création des buckets de stockage publics
insert into storage.buckets (id, name, public)
values 
  ('media', 'media', true),
  ('covers', 'covers', true),
  ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- 2. Politiques RLS pour Storage (Upload, Download, Delete)

-- Permettre l'accès en lecture public à tous les fichiers
create policy "Public Access pour les médias"
  on storage.objects for select
  using (bucket_id in ('media', 'covers', 'gallery'));

-- Permettre l'upload de fichiers (images, mp3, mp4) depuis le Dashboard et l'app
create policy "Upload autorise pour les médias"
  on storage.objects for insert
  with check (bucket_id in ('media', 'covers', 'gallery'));

-- Permettre la modification et suppression
create policy "Modification autorisee pour les médias"
  on storage.objects for update
  using (bucket_id in ('media', 'covers', 'gallery'));

create policy "Suppression autorisee pour les médias"
  on storage.objects for delete
  using (bucket_id in ('media', 'covers', 'gallery'));
