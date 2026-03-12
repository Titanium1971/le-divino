CREATE TABLE activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  user_email text,
  user_role text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  entity_name text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read" ON activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth write" ON activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
