-- Step 1: Add back owner_id column to boards table
ALTER TABLE boards ADD COLUMN owner_id INTEGER;

-- Step 2: Populate owner_id from board_permissions
UPDATE boards b
SET owner_id = bp.user_id
FROM board_permissions bp
WHERE b.id = bp.board_id AND bp.role = 'owner';

-- Step 3: Make owner_id NOT NULL and add foreign key
ALTER TABLE boards ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE boards ADD CONSTRAINT boards_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 4: Create index on owner_id
CREATE INDEX idx_boards_owner_id ON boards(owner_id);

-- Step 5: Drop the unique owner constraint
DROP INDEX IF EXISTS idx_board_permissions_one_owner_per_board;

-- Step 6: Delete owner permissions from board_permissions (they're now in owner_id)
DELETE FROM board_permissions WHERE role = 'owner';

-- Step 7: Update role values from editor back to contributor
UPDATE board_permissions SET role = 'contributor' WHERE role = 'editor';

-- Step 8: Restore old role constraint
ALTER TABLE board_permissions 
DROP CONSTRAINT IF EXISTS board_permissions_role_check;

ALTER TABLE board_permissions 
ADD CONSTRAINT board_permissions_role_check 
CHECK (role IN ('owner', 'contributor', 'reviewer', 'viewer'));

-- Step 9: Restore board_invitations constraint
UPDATE board_invitations SET role = 'contributor' WHERE role = 'editor';

ALTER TABLE board_invitations 
DROP CONSTRAINT IF EXISTS board_invitations_role_check;

ALTER TABLE board_invitations 
ADD CONSTRAINT board_invitations_role_check 
CHECK (role IN ('contributor', 'reviewer', 'viewer'));

