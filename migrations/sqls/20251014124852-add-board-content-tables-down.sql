-- Drop triggers
DROP TRIGGER IF EXISTS update_board_nodes_updated_at ON board_nodes;
DROP TRIGGER IF EXISTS update_board_lists_updated_at ON board_lists;

-- Drop tables (CASCADE will drop foreign key constraints)
DROP TABLE IF EXISTS board_edges CASCADE;
DROP TABLE IF EXISTS board_nodes CASCADE;
DROP TABLE IF EXISTS board_lists CASCADE;

-- Remove list_ids from boards table
ALTER TABLE boards DROP COLUMN IF EXISTS list_ids;

