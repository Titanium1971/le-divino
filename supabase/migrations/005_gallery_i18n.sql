-- Le Divino — Migration 005 : i18n pour gallery (alt_text → caption jsonb)

-- 1. Ajouter la nouvelle colonne JSONB
alter table public.gallery add column caption jsonb;

-- 2. Migrer les données existantes (alt_text → jsonb avec clé "fr")
update public.gallery
set caption = jsonb_build_object(
  'fr', coalesce(alt_text, ''),
  'en', '',
  'it', '',
  'es', '',
  'de', ''
);

-- 3. Rendre la colonne NOT NULL avec défaut
alter table public.gallery alter column caption set not null;
alter table public.gallery alter column caption set default '{"fr":"","en":"","it":"","es":"","de":""}'::jsonb;

-- 4. Supprimer l'ancienne colonne
alter table public.gallery drop column alt_text;
