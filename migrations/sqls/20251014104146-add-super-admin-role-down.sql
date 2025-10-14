-- Remove super admin user
DELETE FROM users WHERE email = 'admin@tocbuilder.com' AND role = 'super_admin';

-- Drop index
DROP INDEX IF EXISTS idx_users_role;

-- Remove role column
ALTER TABLE users DROP COLUMN IF EXISTS role;