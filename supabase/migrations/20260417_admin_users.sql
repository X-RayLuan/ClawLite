-- Admin Users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- 'super_admin' | 'admin'
  password_hash TEXT, -- reserved for future password login
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX admin_users_email_unique ON admin_users(email) WHERE is_active = true;

-- Admin Login Codes table (verification codes)
CREATE TABLE admin_login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX admin_login_codes_email_idx ON admin_login_codes(email, created_at DESC);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all admin users
CREATE POLICY "Super admin can manage all" ON admin_users
  FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- Admin can view admin list
CREATE POLICY "Admin can view admins" ON admin_users
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- Insert super admin: robin@bjhwbr.com
INSERT INTO admin_users (email, name, role) VALUES
('robin@bjhwbr.com', 'Robin', 'super_admin');
