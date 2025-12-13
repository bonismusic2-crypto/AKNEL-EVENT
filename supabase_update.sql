-- 4. MESSAGES TABLE
create table if not exists public.messages (
  id serial primary key,
  name text,
  email text,
  subject text,
  date date,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Enable read access for all" on public.messages for select using (true);
create policy "Enable write access for all" on public.messages for all using (true) with check (true);

-- 5. RESERVATIONS TABLE
create table if not exists public.reservations (
  id serial primary key,
  client text,
  service text,
  date date,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reservations enable row level security;

create policy "Enable read access for all" on public.reservations for select using (true);
create policy "Enable write access for all" on public.reservations for all using (true) with check (true);

-- 6. STATS (Stored as a Page for simplicity or separate table)
-- Using 'pages' table to store general stats config/cache
insert into public.pages (slug, content)
values (
  'stats',
  '{
    "visitors": 1250,
    "new_messages": 5,
    "pending_reservations": 3,
    "growth": "+12%"
  }'::jsonb
) on conflict (slug) do nothing;

-- SEED DATA
insert into public.messages (name, email, subject, date, read) values
('Jean Dupont', 'jean@example.com', 'Mariage 2026', '2025-12-10', false),
('Sophie Martin', 'sophie@test.com', 'Devis Gala', '2025-12-09', true),
('Marc Levy', 'marc@business.com', 'Séminaire', '2025-12-08', true);

insert into public.reservations (client, service, date, status) values
('Pierre & Marie', 'Mariage', '2026-06-15', 'En attente'),
('Tech Corp', 'Gala Annuel', '2025-12-20', 'Confirmé'),
('Startup Nation', 'Lancement Produit', '2026-01-10', 'Terminé');
