-- Bucket wine-images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('wine-images', 'wine-images', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique
CREATE POLICY "storage_wine_images_select_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'wine-images');

-- Upload réservé aux authentifiés
CREATE POLICY "storage_wine_images_insert_auth"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wine-images');

-- Modification réservée aux authentifiés
CREATE POLICY "storage_wine_images_update_auth"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'wine-images') WITH CHECK (bucket_id = 'wine-images');

-- Suppression réservée aux authentifiés
CREATE POLICY "storage_wine_images_delete_auth"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'wine-images');
