-- Migration 020: Add image support for drinks
-- Adds image_path column + drink-images bucket with RLS policies

-- Add image_path column to drinks table
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS image_path text;

-- Create drink-images storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('drink-images', 'drink-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for drink-images bucket
CREATE POLICY "drink_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'drink-images');

CREATE POLICY "drink_images_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'drink-images' AND auth.role() = 'authenticated');

CREATE POLICY "drink_images_auth_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'drink-images' AND auth.role() = 'authenticated');

CREATE POLICY "drink_images_auth_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'drink-images' AND auth.role() = 'authenticated');
