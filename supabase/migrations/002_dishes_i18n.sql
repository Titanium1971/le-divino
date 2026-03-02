-- ============================================================
-- Le Divino — Migration 002 : i18n pour dishes (name, description)
-- Convertit text → jsonb {"fr":"…","en":"…","it":"…","es":"…"}
-- ============================================================

-- 1. Ajouter les nouvelles colonnes JSONB
alter table public.dishes add column name_i18n jsonb;
alter table public.dishes add column description_i18n jsonb;

-- 2. Migrer les données existantes (text → jsonb avec clé "fr")
update public.dishes
set
  name_i18n = jsonb_build_object('fr', name, 'en', '', 'it', '', 'es', ''),
  description_i18n = jsonb_build_object('fr', coalesce(description, ''), 'en', '', 'it', '', 'es', '');

-- 3. Rendre les nouvelles colonnes NOT NULL
alter table public.dishes alter column name_i18n set not null;
alter table public.dishes alter column name_i18n set default '{"fr":"","en":"","it":"","es":""}'::jsonb;
alter table public.dishes alter column description_i18n set not null;
alter table public.dishes alter column description_i18n set default '{"fr":"","en":"","it":"","es":""}'::jsonb;

-- 4. Supprimer les anciennes colonnes
alter table public.dishes drop column name;
alter table public.dishes drop column description;

-- 5. Renommer pour garder des noms propres
alter table public.dishes rename column name_i18n to name;
alter table public.dishes rename column description_i18n to description;
