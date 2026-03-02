-- ============================================================
-- Le Divino — Migration initiale
-- 8 tables, RLS policies, seed data, 3 Storage buckets
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. categories
-- ============================================================
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  int not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.categories is 'Catégories de la carte (Entrées, Plats, Desserts, Boissons…)';

-- ============================================================
-- 2. dishes
-- ============================================================
create table public.dishes (
  id           uuid primary key default uuid_generate_v4(),
  category_id  uuid not null references public.categories(id) on delete cascade,
  name         text not null,
  description  text,
  price        numeric(8,2) not null,
  image_path   text,
  allergens    text[] default '{}',
  is_vegetarian boolean not null default false,
  is_signature  boolean not null default false,
  available    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_dishes_category on public.dishes(category_id);

comment on table public.dishes is 'Plats de la carte, rattachés à une catégorie';

-- ============================================================
-- 3. menus (formules)
-- ============================================================
create table public.menus (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  price       numeric(8,2) not null,
  courses     jsonb not null default '[]',
  available   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.menus is 'Menus/formules (ex : Menu Découverte, Menu Terroir)';
comment on column public.menus.courses is 'JSON array : [{"label":"Entrée","choices":["Gravlax de saumon","Oeuf mollet"]},…]';

-- ============================================================
-- 4. reservations
-- ============================================================
create type public.reservation_status as enum (
  'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
);

create table public.reservations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  phone       text not null,
  date        date not null,
  time        time not null,
  guests      int not null check (guests between 1 and 20),
  message     text,
  status      public.reservation_status not null default 'pending',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_reservations_date on public.reservations(date);
create index idx_reservations_status on public.reservations(status);

comment on table public.reservations is 'Réservations en ligne';

-- ============================================================
-- 5. events
-- ============================================================
create table public.events (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text not null unique,
  description   text,
  image_path    text,
  event_date    date not null,
  event_time    time,
  end_time      time,
  location      text,
  is_featured   boolean not null default false,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_events_date on public.events(event_date);

comment on table public.events is 'Événements et actualités du restaurant';

-- ============================================================
-- 6. gallery
-- ============================================================
create type public.gallery_tag as enum (
  'restaurant', 'dishes', 'events', 'team', 'ambiance'
);

create table public.gallery (
  id          uuid primary key default uuid_generate_v4(),
  image_path  text not null,
  alt_text    text,
  tag         public.gallery_tag not null default 'restaurant',
  sort_order  int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.gallery is 'Photos de la galerie publique';

-- ============================================================
-- 7. settings
-- ============================================================
create table public.settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

comment on table public.settings is 'Paramètres clé/valeur du restaurant (horaires, contact, etc.)';

-- ============================================================
-- 8. screen_slides
-- ============================================================
create type public.slide_type as enum (
  'image', 'dish', 'menu', 'event', 'custom'
);

create table public.screen_slides (
  id              uuid primary key default uuid_generate_v4(),
  type            public.slide_type not null default 'image',
  title           text,
  subtitle        text,
  image_path      text,
  reference_id    uuid,
  duration_ms     int not null default 8000,
  sort_order      int not null default 0,
  active          boolean not null default true,
  schedule_start  time,
  schedule_end    time,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.screen_slides is 'Slides pour l''écran 55" extérieur';
comment on column public.screen_slides.reference_id is 'UUID optionnel pointant vers un dish, menu ou event';

-- ============================================================
-- Trigger : updated_at automatique
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'categories','dishes','menus','reservations',
      'events','settings','screen_slides'
    ])
  loop
    execute format(
      'create trigger trg_%s_updated_at
       before update on public.%I
       for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Activer RLS sur toutes les tables
alter table public.categories     enable row level security;
alter table public.dishes         enable row level security;
alter table public.menus          enable row level security;
alter table public.reservations   enable row level security;
alter table public.events         enable row level security;
alter table public.gallery        enable row level security;
alter table public.settings       enable row level security;
alter table public.screen_slides  enable row level security;

-- —— categories ——
create policy "categories_select_public"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "categories_insert_auth"
  on public.categories for insert
  to authenticated
  with check (true);

create policy "categories_update_auth"
  on public.categories for update
  to authenticated
  using (true) with check (true);

create policy "categories_delete_auth"
  on public.categories for delete
  to authenticated
  using (true);

-- —— dishes ——
create policy "dishes_select_public"
  on public.dishes for select
  to anon, authenticated
  using (true);

create policy "dishes_insert_auth"
  on public.dishes for insert
  to authenticated
  with check (true);

create policy "dishes_update_auth"
  on public.dishes for update
  to authenticated
  using (true) with check (true);

create policy "dishes_delete_auth"
  on public.dishes for delete
  to authenticated
  using (true);

-- —— menus ——
create policy "menus_select_public"
  on public.menus for select
  to anon, authenticated
  using (true);

create policy "menus_insert_auth"
  on public.menus for insert
  to authenticated
  with check (true);

create policy "menus_update_auth"
  on public.menus for update
  to authenticated
  using (true) with check (true);

create policy "menus_delete_auth"
  on public.menus for delete
  to authenticated
  using (true);

-- —— reservations ——
-- Les visiteurs anonymes peuvent créer (INSERT) une réservation
create policy "reservations_insert_public"
  on public.reservations for insert
  to anon, authenticated
  with check (true);

-- Seuls les admins authentifiés peuvent lire / modifier / supprimer
create policy "reservations_select_auth"
  on public.reservations for select
  to authenticated
  using (true);

create policy "reservations_update_auth"
  on public.reservations for update
  to authenticated
  using (true) with check (true);

create policy "reservations_delete_auth"
  on public.reservations for delete
  to authenticated
  using (true);

-- —— events ——
create policy "events_select_public"
  on public.events for select
  to anon, authenticated
  using (true);

create policy "events_insert_auth"
  on public.events for insert
  to authenticated
  with check (true);

create policy "events_update_auth"
  on public.events for update
  to authenticated
  using (true) with check (true);

create policy "events_delete_auth"
  on public.events for delete
  to authenticated
  using (true);

-- —— gallery ——
create policy "gallery_select_public"
  on public.gallery for select
  to anon, authenticated
  using (true);

create policy "gallery_insert_auth"
  on public.gallery for insert
  to authenticated
  with check (true);

create policy "gallery_update_auth"
  on public.gallery for update
  to authenticated
  using (true) with check (true);

create policy "gallery_delete_auth"
  on public.gallery for delete
  to authenticated
  using (true);

-- —— settings ——
create policy "settings_select_public"
  on public.settings for select
  to anon, authenticated
  using (true);

create policy "settings_insert_auth"
  on public.settings for insert
  to authenticated
  with check (true);

create policy "settings_update_auth"
  on public.settings for update
  to authenticated
  using (true) with check (true);

create policy "settings_delete_auth"
  on public.settings for delete
  to authenticated
  using (true);

-- —— screen_slides ——
create policy "screen_slides_select_public"
  on public.screen_slides for select
  to anon, authenticated
  using (true);

create policy "screen_slides_insert_auth"
  on public.screen_slides for insert
  to authenticated
  with check (true);

create policy "screen_slides_update_auth"
  on public.screen_slides for update
  to authenticated
  using (true) with check (true);

create policy "screen_slides_delete_auth"
  on public.screen_slides for delete
  to authenticated
  using (true);

-- ============================================================
-- Storage Buckets
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('dishes',  'dishes',  true),
  ('gallery', 'gallery', true),
  ('posters', 'posters', true);

-- Lecture publique sur les 3 buckets
create policy "storage_dishes_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'dishes');

create policy "storage_gallery_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

create policy "storage_posters_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'posters');

-- Upload / modification / suppression réservés aux authentifiés
create policy "storage_dishes_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dishes');

create policy "storage_dishes_update_auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'dishes') with check (bucket_id = 'dishes');

create policy "storage_dishes_delete_auth"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'dishes');

create policy "storage_gallery_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery');

create policy "storage_gallery_update_auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery') with check (bucket_id = 'gallery');

create policy "storage_gallery_delete_auth"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery');

create policy "storage_posters_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'posters');

create policy "storage_posters_update_auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'posters') with check (bucket_id = 'posters');

create policy "storage_posters_delete_auth"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'posters');

-- ============================================================
-- SEED DATA
-- ============================================================

-- —— Catégories ——
insert into public.categories (id, name, slug, description, sort_order) values
  ('a0000000-0000-0000-0000-000000000001', 'Entrées',   'entrees',  'Nos entrées maison', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Plats',     'plats',    'Nos plats principaux', 2),
  ('a0000000-0000-0000-0000-000000000003', 'Desserts',  'desserts', 'Nos desserts faits maison', 3),
  ('a0000000-0000-0000-0000-000000000004', 'Boissons',  'boissons', 'Vins, cocktails et boissons', 4);

-- —— Entrées (4 plats) ——
insert into public.dishes (category_id, name, description, price, is_signature, sort_order) values
  ('a0000000-0000-0000-0000-000000000001',
   'Gravlax de saumon maison',
   'Saumon mariné aux herbes, émulsion chutney mangue, mesclun croquant',
   14.50, true, 1),
  ('a0000000-0000-0000-0000-000000000001',
   'Aumônière de chèvre, confiture de figues et oignons',
   'Croustillant de chèvre frais, confit figue-oignon, roquette',
   12.00, false, 2),
  ('a0000000-0000-0000-0000-000000000001',
   'Tartare de thon sauce asiatique',
   'Thon rouge snacké, sésame, sauce soja-gingembre, avocat',
   15.00, true, 3),
  ('a0000000-0000-0000-0000-000000000001',
   'Œuf mollet sur salade et chips de lard',
   'Œuf parfait 64°, salade frisée, lardons croustillants, vinaigrette tiède',
   11.50, false, 4);

-- —— Plats (4 plats) ——
insert into public.dishes (category_id, name, description, price, is_signature, sort_order) values
  ('a0000000-0000-0000-0000-000000000002',
   'Magret entier, réduction framboise balsamique',
   'Magret de canard du Sud-Ouest, réduction framboise-balsamique, légumes de saison',
   24.00, true, 1),
  ('a0000000-0000-0000-0000-000000000002',
   'Saumon à l''unilatéral, crème citron et persillade',
   'Pavé de saumon snacké côté peau, beurre citronné, persillade fraîche, riz basmati',
   22.00, false, 2),
  ('a0000000-0000-0000-0000-000000000002',
   'Suprême de volaille saveur d''Asie',
   'Poulet fermier laqué, sauce soja-miel-sésame, wok de légumes croquants',
   19.50, false, 3),
  ('a0000000-0000-0000-0000-000000000002',
   'Filet mignon à la crème',
   'Filet mignon de porc, sauce crème aux champignons, gratin dauphinois',
   21.00, true, 4);

-- —— Desserts (4 plats) ——
insert into public.dishes (category_id, name, description, price, sort_order) values
  ('a0000000-0000-0000-0000-000000000003',
   'Moelleux au chocolat cœur framboise',
   'Fondant chocolat noir 70%, cœur coulant framboise, glace vanille',
   10.50, 1),
  ('a0000000-0000-0000-0000-000000000003',
   'Tarte tatin maison',
   'Pommes caramélisées, pâte feuilletée, crème fraîche épaisse',
   9.50, 2),
  ('a0000000-0000-0000-0000-000000000003',
   'Crème brûlée à la vanille bourbon',
   'Crème onctueuse, gousses de vanille de Madagascar, caramel craquant',
   9.00, 3),
  ('a0000000-0000-0000-0000-000000000003',
   'Assiette de fromages affinés',
   'Sélection de 5 fromages régionaux, confiture de cerises noires, noix',
   11.00, 4);

-- —— Boissons (4 plats) ——
insert into public.dishes (category_id, name, description, price, sort_order) values
  ('a0000000-0000-0000-0000-000000000004',
   'Verre de vin rouge — Corbières AOP',
   'Corbières rouge, notes de garrigue et fruits noirs',
   6.50, 1),
  ('a0000000-0000-0000-0000-000000000004',
   'Verre de vin blanc — Picpoul de Pinet',
   'Picpoul de Pinet, vif et minéral, idéal avec poissons',
   6.00, 2),
  ('a0000000-0000-0000-0000-000000000004',
   'Cocktail Le Divino',
   'Cocktail signature : Aperol, prosecco, zeste d''orange, romarin frais',
   10.00, 3),
  ('a0000000-0000-0000-0000-000000000004',
   'Eau minérale / Café gourmand',
   'Eau plate ou gazeuse 75cl / Café accompagné de 3 mignardises',
   4.50, 4);

-- —— Menus / Formules (3) ——
insert into public.menus (name, description, price, courses, sort_order) values
  ('Menu Découverte',
   'Entrée + Plat ou Plat + Dessert',
   28.00,
   '[
     {"label": "Entrée (au choix)", "choices": ["Gravlax de saumon maison", "Aumônière de chèvre"]},
     {"label": "Plat (au choix)",   "choices": ["Saumon à l''unilatéral", "Suprême de volaille"]},
     {"label": "ou Dessert",        "choices": ["Moelleux chocolat", "Crème brûlée"]}
   ]'::jsonb,
   1),
  ('Menu Terroir',
   'Entrée + Plat + Dessert — Le meilleur du terroir',
   38.00,
   '[
     {"label": "Entrée",  "choices": ["Gravlax de saumon maison", "Tartare de thon sauce asiatique", "Œuf mollet"]},
     {"label": "Plat",    "choices": ["Magret réduction framboise", "Filet mignon à la crème"]},
     {"label": "Dessert", "choices": ["Tarte tatin maison", "Crème brûlée vanille bourbon"]}
   ]'::jsonb,
   2),
  ('Menu Enfant',
   'Plat + Dessert + Boisson (jusqu''à 12 ans)',
   14.00,
   '[
     {"label": "Plat",    "choices": ["Steak haché frites", "Pâtes beurre parmesan"]},
     {"label": "Dessert", "choices": ["Glace 2 boules", "Mousse au chocolat"]},
     {"label": "Boisson", "choices": ["Sirop à l''eau", "Jus de pomme"]}
   ]'::jsonb,
   3);

-- —— Réservations (exemples) ——
insert into public.reservations (name, email, phone, date, time, guests, status, message) values
  ('Marie Dupont',   'marie.dupont@email.fr',   '06 12 34 56 78', '2026-03-07', '19:30', 4, 'confirmed', 'Anniversaire, si possible table en terrasse'),
  ('Jean-Luc Martin','jlmartin@email.fr',       '06 98 76 54 32', '2026-03-08', '12:30', 2, 'confirmed', null),
  ('Sophie Bernard', 'sophie.b@email.fr',       '07 11 22 33 44', '2026-03-08', '20:00', 6, 'pending',   'Allergie aux fruits à coque');

-- —— Événements (6) ——
insert into public.events (title, slug, description, event_date, event_time, end_time, location, is_featured, published) values
  ('Soirée Jazz & Gastronomie',
   'soiree-jazz-gastronomie',
   'Concert live de jazz manouche avec menu dégustation spécial 5 services. Réservation conseillée.',
   '2026-03-15', '20:00', '23:30', 'Salle principale', true, true),
  ('Atelier Cuisine : Les Sauces',
   'atelier-cuisine-sauces',
   'Apprenez les secrets des grandes sauces françaises avec notre chef. Places limitées à 12 personnes.',
   '2026-03-22', '15:00', '17:30', 'Cuisine ouverte', false, true),
  ('Menu Spécial Fête des Mères',
   'menu-special-fete-des-meres',
   'Menu 5 services en l''honneur de toutes les mamans. Coupe de champagne offerte. Réservation obligatoire.',
   '2026-05-31', '12:00', '15:00', 'Tout le restaurant', true, true),
  ('Soirée Vins du Languedoc',
   'soiree-vins-languedoc',
   'Dégustation commentée de 6 vins régionaux accompagnés de tapas maison. Avec notre sommelier invité.',
   '2026-04-12', '19:30', '22:30', 'Bar & terrasse', false, true),
  ('Concert d''Été — Trio Méditerranée',
   'concert-ete-trio-mediterranee',
   'Musique live en terrasse : reprises et compositions originales, ambiance méditerranéenne.',
   '2026-07-10', '21:00', '23:30', 'Terrasse bord de l''eau', true, true),
  ('Brunch Dominical de Pâques',
   'brunch-dominical-paques',
   'Brunch festif avec viennoiseries maison, œufs Benedict, charcuterie fine et pâtisseries de saison.',
   '2026-04-05', '10:30', '14:00', 'Salle + terrasse', false, true);

-- —— Galerie (6 photos) ——
insert into public.gallery (image_path, alt_text, tag, sort_order) values
  ('restaurant/exterieur-enseigne.jpg',  'Façade du Divino, enseigne illuminée',        'restaurant', 1),
  ('restaurant/salle-bar.jpg',           'Vue de la salle et du bar',                    'ambiance',   2),
  ('restaurant/terrasse-herault.jpg',    'Terrasse au bord de l''Hérault',               'restaurant', 3),
  ('dishes/magret-framboise.jpg',        'Magret de canard, réduction framboise',        'dishes',     4),
  ('dishes/gravlax-saumon.jpg',          'Gravlax de saumon maison',                     'dishes',     5),
  ('events/soiree-jazz.jpg',             'Soirée jazz live au Divino',                   'events',     6);

-- —— Settings ——
insert into public.settings (key, value) values
  ('restaurant_info', '{
    "name": "Le Divino",
    "address": "5 Place Jean Jaurès, 34300 Agde",
    "phone": "04 48 17 78 75",
    "email": "contact@ledivino-agde.fr"
  }'::jsonb),
  ('opening_hours', '{
    "lundi": null,
    "mardi":    {"midi": "12:00–14:30", "soir": "19:00–22:30"},
    "mercredi": {"midi": "12:00–14:30", "soir": "19:00–22:30"},
    "jeudi":    {"midi": "12:00–14:30", "soir": "19:00–22:30"},
    "vendredi": {"midi": "12:00–14:30", "soir": "19:00–22:30"},
    "samedi":   {"midi": "12:00–14:30", "soir": "19:00–23:00"},
    "dimanche": {"midi": "12:00–14:30", "soir": "19:00–22:30"}
  }'::jsonb),
  ('social_links', '{
    "instagram": "",
    "facebook": "",
    "tripadvisor": "",
    "google_maps": ""
  }'::jsonb),
  ('seo', '{
    "meta_title": "Le Divino — Restaurant Agde | Cuisine traditionnelle française",
    "meta_description": "Restaurant de cuisine traditionnelle française au cœur d''Agde. Produits frais, terroir et savoir-faire.",
    "cuisine_type": "FrenchCuisine",
    "price_range": "$$"
  }'::jsonb);

-- —— Screen Slides (4 slides) ——
insert into public.screen_slides (type, title, subtitle, duration_ms, sort_order, schedule_start, schedule_end) values
  ('custom', 'Le Divino',            'Cuisine traditionnelle française',            10000, 1, '08:00', '23:00'),
  ('menu',   'Menu Découverte',      'Entrée + Plat ou Plat + Dessert — 28 €',      8000, 2, '11:00', '15:00'),
  ('menu',   'Menu Terroir',         'Entrée + Plat + Dessert — 38 €',              8000, 3, '18:00', '23:00'),
  ('event',  'Soirée Jazz',          'Samedi 15 mars — 20h — Réservez votre table',  8000, 4, '08:00', '23:00');
