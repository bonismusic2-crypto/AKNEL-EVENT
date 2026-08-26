-- ==========================================================
-- SCRIPT DE CONFIGURATION TEMPS RÉEL SUPABASE POUR BONIS MUSIK & AKNEL EVENT
-- ==========================================================

-- 1. Table des Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null default 'general', -- 'subscription', 'clip', 'teaching', 'concert', 'general'
  title text not null,
  message text not null,
  is_read boolean default false,
  badge text,
  badge_bg text,
  badge_text_color text,
  action_type text,
  action_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour requêtes ultra-rapides
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- Activation RLS
alter table public.notifications enable row level security;

-- Politiques RLS
create policy "Les utilisateurs voient leurs notifications ou celles globales"
  on public.notifications for select
  using (auth.uid() = user_id or user_id is null);

create policy "Les utilisateurs peuvent marquer leurs notifications comme lues"
  on public.notifications for update
  using (auth.uid() = user_id or user_id is null);

-- ✅ AUTORISATION D'INSERTION : Permet l'envoi de notifications depuis l'application et les webhooks
create policy "Autoriser l'insertion des notifications"
  on public.notifications for insert
  with check (true);

-- ==========================================================
-- 2. ÉTAPE CLÉ : REPLICA IDENTITY FULL (Pour recevoir les anciennes et nouvelles valeurs)
-- ==========================================================
alter table public.subscriptions replica identity full;
alter table public.profiles replica identity full;
alter table public.notifications replica identity full;
alter table public.media_contents replica identity full;

-- ==========================================================
-- 3. ÉTAPE CLÉ : ACTIVATION DE LA PUBLICATION REALTIME SUPABASE
-- ==========================================================
alter publication supabase_realtime add table public.subscriptions;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.media_contents;
