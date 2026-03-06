-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('athlete','coach','admin')) NOT NULL DEFAULT 'coach',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_role" ON user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins_manage_roles" ON user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Helper function to get current user's role (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;

-- Insert your own role as admin (replace with your actual auth user id)
-- Run: SELECT id FROM auth.users; to get your user id first
-- INSERT INTO user_roles (user_id, role) VALUES ('YOUR-USER-ID-HERE', 'admin');
