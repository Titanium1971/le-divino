CREATE TABLE wines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description_fr text,
  description_en text,
  description_it text,
  description_es text,
  description_de text,
  region text,
  appellation text,
  color text CHECK (color IN ('rouge', 'blanc', 'rosé', 'petillant')),
  price_bottle numeric(6,2),
  price_glass numeric(5,2),
  available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON wines FOR SELECT USING (true);
CREATE POLICY "Auth write" ON wines FOR ALL USING (auth.role() = 'authenticated');
