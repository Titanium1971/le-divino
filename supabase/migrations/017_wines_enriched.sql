ALTER TABLE wines ADD COLUMN IF NOT EXISTS vintage integer;
ALTER TABLE wines ADD COLUMN IF NOT EXISTS grape_variety text;
ALTER TABLE wines ADD COLUMN IF NOT EXISTS alcohol_degree text;
ALTER TABLE wines ADD COLUMN IF NOT EXISTS style text;
ALTER TABLE wines ADD COLUMN IF NOT EXISTS image_path text;
