-- Migration des bières existantes vers les sous-catégories pression/bouteille

-- ═══ Bières PRESSION ═══
-- Jupiler Pression → pression, prix actuel en 25cl
UPDATE drinks SET category = 'biere_pression', price_25cl = price, price = NULL
  WHERE name = 'JUPILER PRESSION';

-- Leffe Blonde → pression (courante au fût)
UPDATE drinks SET category = 'biere_pression', price_25cl = price, price = NULL
  WHERE name = 'LEFFE BLONDE';

-- Hoegaarden Blanche → pression (courante au fût)
UPDATE drinks SET category = 'biere_pression', price_25cl = price, price = NULL
  WHERE name = 'HOEGAARDEN BLANCHE';

-- Fada Blanche → pression
UPDATE drinks SET category = 'biere_pression', price_25cl = price, price = NULL
  WHERE name = 'FADA BLANCHE';

-- Girafe → pression (colonne de bière)
UPDATE drinks SET category = 'biere_pression'
  WHERE name = 'Girafe';

-- ═══ Bières BOUTEILLE ═══
UPDATE drinks SET category = 'biere_bouteille'
  WHERE category = 'biere'
  AND name IN (
    '1664 sans alcool',
    'AFFLIGEN 50CL',
    'Alaryk 75cl',
    'DESPERADOS',
    'Fada abricot',
    'FADA BLONDE',
    'GOOSE ISLAND IPA',
    'Heineken 0.0',
    'HEINEKEN 50CL',
    'HEINEKEN 65CL',
    'HOEGAARDEN ROSÉE',
    'LEFFE RUBY',
    'MORT SUBITE ROUGE',
    'PELFORTH BRUNE',
    'Saint Victor 33cl'
  );

-- Sécurité : migrer toute bière restante en catégorie "biere" vers bouteille
UPDATE drinks SET category = 'biere_bouteille'
  WHERE category = 'biere';
