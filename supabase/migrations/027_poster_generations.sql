-- Table pour stocker l'historique des affiches générées
CREATE TABLE IF NOT EXISTS poster_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  template_id TEXT NOT NULL,
  orientation TEXT NOT NULL DEFAULT 'portrait'
    CHECK (orientation IN ('portrait', 'landscape')),
  variables JSONB NOT NULL DEFAULT '{}',
  ai_prompt TEXT NOT NULL,
  image_path TEXT,
  image_width INT,
  image_height INT,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  pushed_to_screen BOOLEAN NOT NULL DEFAULT FALSE,
  screen_slide_id UUID REFERENCES screen_slides(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poster_generations_event ON poster_generations(event_id);
CREATE INDEX IF NOT EXISTS idx_poster_generations_template ON poster_generations(template_id);

-- RLS
ALTER TABLE poster_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage poster_generations"
  ON poster_generations FOR ALL
  USING (auth.role() = 'authenticated');

-- Bucket "posters" pour stocker les images générées
INSERT INTO storage.buckets (id, name, public)
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

-- Policies storage pour le bucket posters
CREATE POLICY "Public can view posters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posters');

CREATE POLICY "Authenticated can upload posters"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posters' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update posters"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'posters' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete posters"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posters' AND auth.role() = 'authenticated');
