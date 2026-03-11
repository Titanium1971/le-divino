-- ============================================================
-- Le Divino — Migration 009 : ajout menu_type sur dishes
-- Permet de distinguer carte / marche / express
-- ============================================================

-- 1. Ajouter la colonne menu_type avec valeur par défaut 'carte'
alter table public.dishes
  add column if not exists menu_type text not null default 'carte';

-- 2. Contrainte check pour limiter les valeurs acceptées
alter table public.dishes
  add constraint dishes_menu_type_check
  check (menu_type in ('carte', 'marche', 'express'));

-- 3. Index pour filtrer par menu_type
create index if not exists idx_dishes_menu_type on public.dishes (menu_type);
