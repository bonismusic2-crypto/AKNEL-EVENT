-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. PAGES TABLE (Home, About, Contact)
create table if not exists public.pages (
  slug text primary key,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pages enable row level security;

create policy "Enable read access for all users"
on public.pages for select
using (true);

create policy "Enable insert/update for anon (admin prototype)"
on public.pages for all
using (true)
with check (true);

-- 2. SERVICES TABLE
create table if not exists public.services (
  id serial primary key,
  title text not null,
  description text,
  features text[],
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;

create policy "Enable read access for all users"
on public.services for select
using (true);

create policy "Enable write access for all users (admin prototype)"
on public.services for all
using (true)
with check (true);

-- 3. GALLERY TABLE
create table if not exists public.gallery (
  id serial primary key,
  category text,
  src text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.gallery enable row level security;

create policy "Enable read access for all users"
on public.gallery for select
using (true);

create policy "Enable write access for all users (admin prototype)"
on public.gallery for all
using (true)
with check (true);

-- INITIAL DATA SEEDING (Based on our db.json)

-- Home
insert into public.pages (slug, content)
values (
  'home',
  '{
    "hero": {
      "title": "Transformez votre événement en un moment inoubliable",
      "subtitle": "L''excellence et le raffinement au service de vos plus beaux souvenirs.",
      "buttonText": "Découvrir nos services",
      "buttonUrl": "/services"
    },
    "intro": {
      "title": "L''Art de créer l''exceptionnel",
      "text": "AKNEL Event est bien plus qu''une simple agence d''organisation d''événements. C''est le partenaire privilégié de vos instants les plus précieux.",
      "values": [
        "Service haut de gamme et personnalisé",
        "Coordination rigoureuse et sans faille"
      ]
    },
    "cta": {
      "title": "Prêt à réaliser votre rêve ?",
      "text": "Contactez-nous dès aujourd''hui pour discuter de votre projet et obtenir un devis personnalisé."
    }
  }'::jsonb
) on conflict (slug) do nothing;

-- About
insert into public.pages (slug, content)
values (
  'about',
  '{
    "hero_title": "Notre Histoire",
    "main_title": "Une vision, une passion, une réalité.",
    "text": "Fondée avec l''ambition de redéfinir l''événementiel de luxe, AKNEL Event est née de la passion pour l''élégance et l''organisation parfaite...",
    "values": [
      { "title": "Passion", "desc": "Nous mettons tout notre cœur dans chaque détail." },
      { "title": "Excellence", "desc": "La recherche de la perfection est notre standard." },
      { "title": "Innovation", "desc": "Nous créons des expériences uniques et modernes." }
    ]
  }'::jsonb
) on conflict (slug) do nothing;

-- Contact
insert into public.pages (slug, content)
values (
  'contact',
  '{
    "phone": "+225 07 00 00 00 00",
    "email": "contact@aknelevent.com",
    "address": "Abidjan, Côte d''Ivoire",
    "whatsapp": "https://wa.me/2250700000000"
  }'::jsonb
) on conflict (slug) do nothing;

-- Services
insert into public.services (title, description, features) values
('Mariages & Célébrations', 'Le plus beau jour de votre vie mérite une attention particulière.', ARRAY['Organisation complète', 'Coordination', 'Design & Décoration']),
('Galas & Soirées Privées', 'Pour vos dîners de gala, anniversaires prestigieux ou réceptions privées.', ARRAY['Scénographie', 'Gestion des invités', 'Traiteur']),
('Événements d''Entreprise', 'Séminaires, lancements de produits ou fêtes de fin d''année.', ARRAY['Logistique', 'Branding', 'Recherche de lieux']);
