-- ============================================================
-- Seed : Boissons du Divino
-- Nettoyage complet + insertion depuis export caisse CSV
-- ============================================================

-- Vider la table avant réinsertion propre
TRUNCATE drinks;

-- ────────────────────────────────────────────────────────────
-- ☕  BOISSONS CHAUDES
-- ────────────────────────────────────────────────────────────

INSERT INTO drinks (name, category, price, available, sort_order) VALUES

-- Cafés
('Expresso',              'hot', 1.80, true, 1),
('Double expresso',       'hot', 3.60, true, 2),
('Ristretto',             'hot', 1.80, true, 3),
('Lungo',                 'hot', 1.90, true, 4),
('Noisette',              'hot', 2.10, true, 5),
('Décaféiné',             'hot', 2.10, true, 6),
('Macchiato',             'hot', 2.10, true, 7),
('Café crème',            'hot', 2.80, true, 8),
('Latte macchiato',       'hot', 2.80, true, 9),
('Cappuccino',            'hot', 3.50, true, 10),
('Café viennois',         'hot', 3.90, true, 11),
('Café frappé',           'hot', 3.90, true, 12),
('Café arrosé',           'hot', 3.80, true, 13),

-- Chocolats
('Petit chocolat',        'hot', 2.50, true, 14),
('Chocolat chaud',        'hot', 3.50, true, 15),
('Chocolat froid',        'hot', 3.50, true, 16),
('Chocolat viennois',     'hot', 4.20, true, 17),

-- Thés
('Thé vert',              'hot', 3.20, true, 18),
('Thé noir',              'hot', 3.20, true, 19),
('Thé à la menthe',       'hot', 3.20, true, 20),
('Thé fruits rouges',     'hot', 3.20, true, 21),

-- Infusions
('Infusion tilleul',      'hot', 3.20, true, 22),
('Infusion verveine',     'hot', 3.20, true, 23),

-- Autres boissons chaudes
('Lait chaud',            'hot', 2.50, true, 24),
('Irish Coffee',          'hot', 9.00, true, 25),
('Café gourmand',         'hot', 10.00, true, 26),

-- ────────────────────────────────────────────────────────────
-- 🥤  SOFTS & EAUX
-- ────────────────────────────────────────────────────────────

-- Sodas
('Coca-Cola',             'soft', 3.60, true, 30),
('Coca-Cola Zéro',        'soft', 3.60, true, 31),
('Fanta',                 'soft', 3.60, true, 32),
('Orangina',              'soft', 3.60, true, 33),
('Sprite',                'soft', 3.50, true, 34),
('Oasis',                 'soft', 3.60, true, 35),
('Ice Tea',               'soft', 3.20, true, 36),
('Schweppes Tonic',       'soft', 3.60, true, 37),
('Schweppes Agrumes',     'soft', 3.60, true, 38),
('Red Bull',              'soft', 4.00, true, 39),

-- Jus & sirops
('Jus de fruit',          'soft', 3.00, true, 40),
('Jus d''orange pressé',  'soft', 3.00, true, 41),
('Sirop à l''eau',        'soft', 2.10, true, 42),
('Diabolo',               'soft', 2.90, true, 43),
('Limonade',              'soft', 2.50, true, 44),
('Monaco',                'soft', 3.00, true, 45),
('Panaché',               'soft', 2.70, true, 46),

-- Eaux plates
('Cristaline',            'soft', 2.00, true, 47),
('Eau 50cl',              'soft', 1.50, true, 48),
('Evian 50cl',            'soft', 3.50, true, 49),
('Evian 1L',              'soft', 5.00, true, 50),
('Vittel 25cl',           'soft', 2.80, true, 51),

-- Eaux gazeuses
('Perrier',               'soft', 3.60, true, 52),
('San Pellegrino 50cl',   'soft', 3.50, true, 53),
('San Pellegrino 1L',     'soft', 6.00, true, 54),
('San Benedetto 50cl',    'soft', 3.50, true, 55),
('San Benedetto 1L',      'soft', 5.00, true, 56),

-- ────────────────────────────────────────────────────────────
-- 🍺  BIÈRES
-- ────────────────────────────────────────────────────────────

-- Pressions
('Jupiler pression',      'biere', 2.50, true, 60),

-- Bouteilles blondes
('Leffe blonde',          'biere', 3.50, true, 61),
('Leffe Ruby',            'biere', 5.00, true, 62),
('Desperados',            'biere', 5.00, true, 63),
('Affligen 50cl',         'biere', 5.00, true, 64),
('Heineken 50cl',         'biere', 5.00, true, 65),
('Heineken 65cl',         'biere', 6.50, true, 66),

-- Blanches & spéciales
('Hoegaarden blanche',    'biere', 3.50, true, 67),
('Hoegaarden rosée',      'biere', 5.00, true, 68),
('Goose Island IPA',      'biere', 5.00, true, 69),
('Pelforth brune',        'biere', 5.00, true, 70),
('Mort Subite rouge',     'biere', 5.50, true, 71),

-- Artisanales / locales
('Fada blonde',           'biere', 6.00, true, 72),
('Fada blanche',          'biere', 4.20, true, 73),
('Fada abricot',          'biere', 6.50, true, 74),
('Saint Victor 33cl',     'biere', 5.50, true, 75),
('Alaryk 75cl',           'biere', 15.00, true, 76),

-- Sans alcool
('1664 sans alcool',      'biere', 3.50, true, 77),
('Heineken 0.0',          'biere', 3.50, true, 78),

-- Grand format
('Girafe',                'biere', 30.00, true, 79),

-- ────────────────────────────────────────────────────────────
-- 🍹  COCKTAILS
-- ────────────────────────────────────────────────────────────

-- Classiques
('Spritz',                'cocktail', 9.50, true, 80),
('Mojito royal',          'cocktail', 10.00, true, 81),
('Gin Fizz',              'cocktail', 6.50, true, 82),
('Champagne royal',       'cocktail', 9.00, true, 83),
('Kir',                   'cocktail', 4.50, true, 84),

-- Maison
('Sangria — verre',       'cocktail', 7.50, true, 85),
('Sangria — demi-litre',  'cocktail', 12.00, true, 86),
('Sangria — litre',       'cocktail', 22.00, true, 87),
('Punch maison — verre',  'cocktail', 6.50, true, 88),
('Punch maison — litre',  'cocktail', 21.50, true, 89),

-- Shooters
('Shooter',               'cocktail', 3.50, true, 90),
('Shooter mètre',         'cocktail', 25.00, true, 91),

-- Avec alcool
('Vodka Red Bull',        'cocktail', 8.00, true, 92),
('Cocktail avec alcool',  'cocktail', 9.50, true, 93),
('Orgasm',                'cocktail', 7.50, true, 94),
('Baby cocktail',         'cocktail', 4.00, true, 95),

-- Sans alcool
('Cocktail sans alcool',  'cocktail', 7.50, true, 96),

-- ────────────────────────────────────────────────────────────
-- 🥃  SPIRITUEUX & APÉRITIFS
-- ────────────────────────────────────────────────────────────

-- Anisés
('Pastis 51',             'spiritueux', 2.50, true, 100),
('Ricard',                'spiritueux', 2.50, true, 101),
('Casanis',               'spiritueux', 2.50, true, 102),
('Picon bière',           'spiritueux', 4.80, true, 103),

-- Apéritifs
('Suze',                  'spiritueux', 4.50, true, 104),
('Campari',               'spiritueux', 4.50, true, 105),
('Martini',               'spiritueux', 4.50, true, 106),
('Porto',                 'spiritueux', 4.50, true, 107),
('Muscat de Frontignan',  'spiritueux', 4.50, true, 108),
('Apérol',                'spiritueux', 6.00, true, 109),

-- Spiritueux blancs
('Vodka',                 'spiritueux', 6.00, true, 110),
('Rhum',                  'spiritueux', 6.00, true, 111),
('Gin',                   'spiritueux', 6.00, true, 112),
('Malibu',                'spiritueux', 6.00, true, 113),
('Get 27',                'spiritueux', 6.00, true, 114),

-- Whiskies
('Whisky',                'spiritueux', 6.00, true, 115),
('Jack Daniel''s',        'spiritueux', 9.00, true, 116),
('Monkey Shoulder',       'spiritueux', 7.00, true, 117),

-- Liqueurs & digestifs
('Baileys',               'spiritueux', 6.00, true, 118),
('Limoncello maison',     'spiritueux', 6.00, true, 119),
('Liqueur de pêche',      'spiritueux', 2.00, true, 120),
('Cognac',                'spiritueux', 7.00, true, 121),
('Armagnac',              'spiritueux', 9.00, true, 122),
('Poire Williams',        'spiritueux', 9.00, true, 123),

-- ────────────────────────────────────────────────────────────
-- 🍾  AUTRES
-- ────────────────────────────────────────────────────────────
('Champagne — bouteille', 'autre', 60.00, true, 130),
('Supplément sirop',      'autre', 0.20, true, 131),
('Pot de lait',           'autre', 0.50, true, 132),
('Viennoiserie',          'autre', 2.00, true, 133);
