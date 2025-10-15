-- Drop triggers
DROP TRIGGER IF EXISTS update_board_node_comments_updated_at ON board_node_comments;
DROP TRIGGER IF EXISTS update_board_edge_comments_updated_at ON board_edge_comments;

-- Drop indexes for board_node_comments
DROP INDEX IF EXISTS idx_board_node_comments_node_id;
DROP INDEX IF EXISTS idx_board_node_comments_user_id;
DROP INDEX IF EXISTS idx_board_node_comments_created_at;

-- Drop indexes for board_edge_comments
DROP INDEX IF EXISTS idx_board_edge_comments_edge_id;
DROP INDEX IF EXISTS idx_board_edge_comments_user_id;
DROP INDEX IF EXISTS idx_board_edge_comments_created_at;

-- Drop tables
DROP TABLE IF EXISTS board_edge_comments;
DROP TABLE IF EXISTS board_node_comments;
