-- ============================================================
-- Le Divino — Migration 011 : Ajout colonnes allemand (DE)
-- ============================================================

ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS name_de text,
  ADD COLUMN IF NOT EXISTS description_de text;
