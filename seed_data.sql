-- SEED DATA for Aknel Event Platform

-- 1. Albums
insert into public.albums (title, artist_name, price, cover_url) values
('C\'est ma saison', 'Chantre Aknel', 5000, 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800'),
('Louange Sublime', 'Chantre Aknel', 3500, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'),
('Grace Infinie', 'Chantre Aknel', 4500, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800');

-- 2. Public Events
insert into public.public_events (title, description, date, venue_name, location, image_url, status) values
('Concert de Louange', 'Une soirée unique avec le Chantre Aknel et ses invités pour célébrer la grâce.', '2026-08-20 19:00:00+00', 'Aknel Hall', 'Riviera Palmeraie, Abidjan', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', 'upcoming'),
('Dîner de Gala Aknel', 'Célébration annuelle de la communauté Aknel avec prestations live.', '2026-12-15 20:00:00+00', 'Aknel Hall', 'Riviera Palmeraie, Abidjan', 'https://images.unsplash.com/photo-1469488863264-0761e9f90263?w=800', 'upcoming');

-- 3. Ticket Types (assuming ids 1 and 2 for events)
insert into public.ticket_types (event_id, label, price, stock) values 
(1, 'Standard', 5000, 500), 
(1, 'VIP', 15000, 100),
(2, 'Table Corporate', 250000, 20),
(2, 'Individuel VIP', 25000, 50);

-- 4. Mock Orders (for Dashboard stats)
-- user_id is null since we don't have user IDs yet, but orders table allows null
insert into public.orders (item_type, item_id, quantity, total_amount, payment_status) values 
('album', 1, 10, 50000, 'completed'),
('album', 2, 5, 17500, 'completed'),
('ticket', 1, 20, 100000, 'completed'),
('ticket', 2, 2, 500000, 'completed');
