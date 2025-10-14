-- Drop indexes
DROP INDEX IF EXISTS idx_board_invitations_expires_at;
DROP INDEX IF EXISTS idx_board_invitations_token;
DROP INDEX IF EXISTS idx_board_invitations_email;
DROP INDEX IF EXISTS idx_board_invitations_board_id;
DROP INDEX IF EXISTS idx_board_permissions_role;
DROP INDEX IF EXISTS idx_board_permissions_user_id;
DROP INDEX IF EXISTS idx_board_permissions_board_id;
DROP INDEX IF EXISTS idx_boards_is_public;
DROP INDEX IF EXISTS idx_boards_owner_id;

-- Drop tables
DROP TABLE IF EXISTS board_invitations;
DROP TABLE IF EXISTS board_permissions;
DROP TABLE IF EXISTS boards;