-- Add 'type' column to gallery table to distinguish between 'image' and 'video'
alter table public.gallery 
add column if not exists type text default 'image';

-- Update existing records to be 'image' type
update public.gallery set type = 'image' where type is null or type = '';
