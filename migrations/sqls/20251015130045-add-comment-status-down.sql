-- Remove status column from board_node_comments
ALTER TABLE board_node_comments DROP COLUMN IF EXISTS status;

-- Remove status column from board_edge_comments
ALTER TABLE board_edge_comments DROP COLUMN IF EXISTS status;

