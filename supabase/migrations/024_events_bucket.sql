-- Bucket events (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique
CREATE POLICY "storage_events_select_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'events');

-- Upload réservé aux authentifiés
CREATE POLICY "storage_events_insert_auth"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'events');

-- Modification réservée aux authentifiés
CREATE POLICY "storage_events_update_auth"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'events') WITH CHECK (bucket_id = 'events');

-- Suppression réservée aux authentifiés
CREATE POLICY "storage_events_delete_auth"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'events');
