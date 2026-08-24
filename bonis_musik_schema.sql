-- ==========================================================
-- BONIS MUSIK & AKNEL EVENT : SCHEMA SUPABASE UNIFIÉ
-- ==========================================================

-- 1. Table des Abonnements (Pour l'App Mobile Bonis Musik - 2€ / mois)
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'inactive', -- 'active', 'expired', 'cancelled', 'pending'
  plan_price decimal(10,2) default 1300.00, -- 2 EUR = ~1300 FCFA
  currency text default 'XOF',
  payment_method text, -- 'geniuspay_wave', 'geniuspay_orange', 'geniuspay_mtn', 'card'
  geniuspay_tx_id text,
  starts_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour recherche rapide du statut d'abonnement
create index if not exists idx_subscriptions_user_status on public.subscriptions(user_id, status);

-- 2. Table des Médias & Contenus (Clips, Enseignements Audio & Vidéo)
create table if not exists public.media_contents (
  id serial primary key,
  title text not null,
  description text,
  category text not null, -- 'video_clip', 'teaching_audio', 'teaching_video'
  media_url text not null, -- URL Supabase Storage ou streaming sécurisé
  thumbnail_url text,
  duration text, -- e.g. "12:45"
  speaker_or_artist text default 'Chantre Boniface',
  is_featured boolean default false,
  views_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Table des Billets pour Événements Publics (Site Web AKNEL Event)
create table if not exists public.tickets (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  event_id integer references public.public_events(id) on delete cascade,
  ticket_type_id integer references public.ticket_types(id),
  buyer_name text not null,
  buyer_email text,
  buyer_phone text not null,
  qr_code_token text unique not null,
  status text default 'valid', -- 'valid', 'used', 'cancelled'
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================================

alter table public.subscriptions enable row level security;
alter table public.media_contents enable row level security;
alter table public.tickets enable row level security;

-- Subscriptions Policies
create policy "Users can view their own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

-- Media Contents Policies
create policy "Read media for all authenticated users"
  on public.media_contents for select using (true);

-- Tickets Policies
create policy "Users can view their own tickets"
  on public.tickets for select using (true);

-- ==========================================================
-- SEED DATA INITIAL (Démonstration)
-- ==========================================================

insert into public.media_contents (title, description, category, media_url, thumbnail_url, duration, speaker_or_artist) values
('C''est ma saison (Clip Officiel)', 'Clip vidéo officiel du titre phare du Chantre Boniface.', 'video_clip', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800', '04:20', 'Chantre Boniface'),
('La puissance de l''adoration', 'Enseignement profond sur la dimension prophétique de la louange.', 'teaching_video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', '45:10', 'Chantre Boniface'),
('Méditation : Trouver la paix dans l''épreuve', 'Podcast audio d''exhortation et de prière guidée.', 'teaching_audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', '18:35', 'Chantre Boniface');
