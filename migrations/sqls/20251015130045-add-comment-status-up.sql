-- Add status column to board_node_comments
ALTER TABLE board_node_comments 
ADD COLUMN status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'solved'));

-- Add status column to board_edge_comments
ALTER TABLE board_edge_comments 
ADD COLUMN status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'solved'));

