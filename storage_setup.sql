-- Enable the storage extension if not already enabled (usually standard in Supabase)
-- Create the 'gallery' bucket
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Set up security policies for the 'gallery' bucket

-- 1. Allow public read access to everyone
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'gallery' );

-- 2. Allow upload access (In a real app, restrict this to authenticated admins)
-- For this prototype/admin panel without auth:
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'gallery' );

-- 3. Allow delete access
create policy "Allow Deletes"
  on storage.objects for delete
  using ( bucket_id = 'gallery' );
