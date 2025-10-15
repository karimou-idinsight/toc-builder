-- Step 1: Update existing role values from contributor to editor
UPDATE board_permissions SET role = 'editor' WHERE role = 'contributor';

-- Step 2: Add unique constraint for owner role (only one owner per board)
-- First, migrate existing owner_id to board_permissions
INSERT INTO board_permissions (board_id, user_id, role, granted_by, created_at)
SELECT 
  id as board_id, 
  owner_id as user_id, 
  'owner' as role,
  owner_id as granted_by,
  created_at
FROM boards
WHERE NOT EXISTS (
  SELECT 1 FROM board_permissions bp 
  WHERE bp.board_id = boards.id AND bp.user_id = boards.owner_id
);

-- Step 3: Update the role constraint to include new roles
ALTER TABLE board_permissions 
DROP CONSTRAINT IF EXISTS board_permissions_role_check;

ALTER TABLE board_permissions 
ADD CONSTRAINT board_permissions_role_check 
CHECK (role IN ('owner', 'editor', 'reviewer', 'viewer'));

-- Step 4: Create unique partial index to ensure only one owner per board
CREATE UNIQUE INDEX idx_board_permissions_one_owner_per_board 
ON board_permissions (board_id) 
WHERE role = 'owner';

-- Step 5: Update board_invitations to use new role names
UPDATE board_invitations SET role = 'editor' WHERE role = 'contributor';

ALTER TABLE board_invitations 
DROP CONSTRAINT IF EXISTS board_invitations_role_check;

ALTER TABLE board_invitations 
ADD CONSTRAINT board_invitations_role_check 
CHECK (role IN ('editor', 'reviewer', 'viewer'));

-- Step 6: Remove owner_id column from boards table
ALTER TABLE boards DROP COLUMN IF EXISTS owner_id;

-- Step 7: Drop the old index if it exists
DROP INDEX IF EXISTS idx_boards_owner_id;

