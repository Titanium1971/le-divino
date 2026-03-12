CREATE TABLE drinks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description_fr text,
  description_en text,
  description_it text,
  description_es text,
  description_de text,
  category text CHECK (category IN ('soft', 'cocktail', 'biere', 'spiritueux', 'hot', 'autre')),
  price numeric(5,2),
  available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON drinks FOR SELECT USING (true);
CREATE POLICY "Auth write" ON drinks FOR ALL USING (auth.role() = 'authenticated');
