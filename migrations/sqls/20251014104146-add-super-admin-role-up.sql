-- Add super_admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'super_admin'));

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert super admin user (password: admin123)
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  is_active, 
  email_verified, 
  role,
  created_at,
  updated_at
) VALUES (
  'admin@tocbuilder.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.8KzKz2K', -- admin123
  'Super',
  'Admin',
  true,
  true,
  'super_admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;