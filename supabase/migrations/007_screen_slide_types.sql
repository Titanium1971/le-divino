-- Le Divino — Migration 007 : ajout de types de slides pour l'écran 55"
-- Ajoute daily_special, poster, gallery au enum slide_type
-- Renomme 'image' → on garde pour rétrocompat, 'dish' → on garde aussi

alter type public.slide_type add value if not exists 'daily_special';
alter type public.slide_type add value if not exists 'poster';
alter type public.slide_type add value if not exists 'gallery';

-- Ajouter colonne content jsonb pour les slides custom (texte libre, couleurs, etc.)
alter table public.screen_slides add column if not exists content jsonb default '{}'::jsonb;
