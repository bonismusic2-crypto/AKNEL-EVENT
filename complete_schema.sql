-- 1. Profiles Table (Extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Music Module
create table if not exists public.albums (
  id serial primary key,
  artist_name text default 'Aknel',
  title text not null,
  cover_url text,
  price decimal(10,2) not null default 0,
  release_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.songs (
  id serial primary key,
  album_id integer references public.albums(id) on delete cascade,
  title text not null,
  file_url text,
  preview_url text,
  duration text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Public Events & Ticketing
create table if not exists public.public_events (
  id serial primary key,
  title text not null,
  description text,
  date timestamp with time zone not null,
  venue_name text default 'Aknel Hall',
  location text,
  image_url text,
  status text default 'upcoming', -- upcoming, past, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ticket_types (
  id serial primary key,
  event_id integer references public.public_events(id) on delete cascade,
  label text not null, -- e.g. 'Standard', 'VIP'
  price decimal(10,2) not null,
  stock integer default null, -- null for unlimited
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Unified Orders (Music & Tickets)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  item_type text not null, -- 'album', 'ticket'
  item_id integer not null, -- references either album_id or ticket_type_id
  quantity integer default 1,
  total_amount decimal(10,2) not null,
  payment_status text default 'pending', -- pending, completed, failed
  pawa_pay_ref text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for new tables
alter table public.albums enable row level security;
alter table public.songs enable row level security;
alter table public.public_events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;

create policy "Enable read for all on public content" on public.albums for select using (true);
create policy "Enable read for all on public content" on public.songs for select using (true);
create policy "Enable read for all on public content" on public.public_events for select using (true);
create policy "Enable read for all on public content" on public.ticket_types for select using (true);

create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);

-- SEED DATA for Artists & Events
insert into public.albums (title, artist_name, price, cover_url) values
('C\'est ma saison', 'Chantre Aknel', 5000, 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800');

insert into public.public_events (title, description, date, location, image_url) values
('Concert de Louange', 'Une soirée unique avec le Chantre Aknel et ses invités.', '2026-08-20 19:00:00+00', 'Aknel Hall, Abidjan', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800');

-- Add ticket types for the event (assuming id 1 for simple seed)
-- insert into public.ticket_types (event_id, label, price, stock) values (1, 'Standard', 5000, 500), (1, 'VIP', 15000, 100);
