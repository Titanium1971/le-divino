-- ============================================================
-- Le Divino — Migration 010 : Refonte complète carte & menus
-- ============================================================

-- 1. Nettoyage
TRUNCATE TABLE dishes CASCADE;
DROP TABLE IF EXISTS menu_dishes CASCADE;
DROP TABLE IF EXISTS menus CASCADE;

-- 2. Supprimer colonnes JSONB et ajouter colonnes plates
ALTER TABLE dishes
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS menu_type,
  DROP COLUMN IF EXISTS allergens,
  DROP COLUMN IF EXISTS is_vegetarian,
  DROP COLUMN IF EXISTS is_signature,
  DROP COLUMN IF EXISTS updated_at;

-- Supprimer la contrainte si elle existe
ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_menu_type_check;
DROP INDEX IF EXISTS idx_dishes_menu_type;

-- 3. Ajouter les nouvelles colonnes
ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS name_fr text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_it text,
  ADD COLUMN IF NOT EXISTS name_es text,
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_it text,
  ADD COLUMN IF NOT EXISTS description_es text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'plat',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'carte';

-- 4. Contraintes
ALTER TABLE dishes ADD CONSTRAINT dishes_category_check
  CHECK (category IN ('entree', 'plat', 'dessert'));

ALTER TABLE dishes ADD CONSTRAINT dishes_source_check
  CHECK (source IN ('carte', 'marche'));

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes (category);
CREATE INDEX IF NOT EXISTS idx_dishes_source ON dishes (source);

-- 6. Table menus (formules)
CREATE TABLE menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  description_fr text,
  price numeric(6,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('entree_plat', 'plat_dessert', 'entree_plat_dessert')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 7. Table menu_dishes (liaison formule ↔ plat)
CREATE TABLE menu_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES menus(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES dishes(id) ON DELETE CASCADE,
  available_today boolean DEFAULT false,
  UNIQUE(menu_id, dish_id)
);

-- 8. RLS
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_dishes ENABLE ROW LEVEL SECURITY;

-- Dishes: lecture publique, écriture admin
DROP POLICY IF EXISTS "dishes_public_read" ON dishes;
CREATE POLICY "dishes_public_read" ON dishes FOR SELECT USING (true);
DROP POLICY IF EXISTS "dishes_admin_write" ON dishes;
CREATE POLICY "dishes_admin_write" ON dishes FOR ALL USING (auth.role() = 'authenticated');

-- Menus: lecture publique, écriture admin
CREATE POLICY "menus_public_read" ON menus FOR SELECT USING (true);
CREATE POLICY "menus_admin_write" ON menus FOR ALL USING (auth.role() = 'authenticated');

-- Menu_dishes: lecture publique, écriture admin
CREATE POLICY "menu_dishes_public_read" ON menu_dishes FOR SELECT USING (true);
CREATE POLICY "menu_dishes_admin_write" ON menu_dishes FOR ALL USING (auth.role() = 'authenticated');
