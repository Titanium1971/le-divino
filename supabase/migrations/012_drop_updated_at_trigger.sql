-- ============================================================
-- Le Divino — Migration 012 : Supprime trigger updated_at sur dishes
-- ============================================================

-- Supprime le trigger updated_at sur dishes s'il existe
DROP TRIGGER IF EXISTS set_updated_at ON dishes;
DROP TRIGGER IF EXISTS update_updated_at ON dishes;
DROP TRIGGER IF EXISTS handle_updated_at ON dishes;

-- Au cas où la colonne existe encore
ALTER TABLE dishes DROP COLUMN IF EXISTS updated_at;
