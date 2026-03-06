-- Add featured and screen display flags to gallery items
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS show_on_screen BOOLEAN NOT NULL DEFAULT false;
