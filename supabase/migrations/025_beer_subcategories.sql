-- Ajout des prix par taille pour les bières pression
ALTER TABLE drinks
  ADD COLUMN IF NOT EXISTS price_galopin numeric(5,2),
  ADD COLUMN IF NOT EXISTS price_25cl numeric(5,2),
  ADD COLUMN IF NOT EXISTS price_50cl numeric(5,2),
  ADD COLUMN IF NOT EXISTS price_1l numeric(5,2);

-- Mise à jour de la contrainte de catégorie pour inclure les sous-catégories bière
ALTER TABLE drinks DROP CONSTRAINT IF EXISTS drinks_category_check;
ALTER TABLE drinks ADD CONSTRAINT drinks_category_check
  CHECK (category IN ('soft', 'cocktail', 'biere', 'biere_pression', 'biere_bouteille', 'spiritueux', 'hot', 'autre'));
