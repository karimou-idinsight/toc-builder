-- Create board_node_comments table
CREATE TABLE board_node_comments (
  id SERIAL PRIMARY KEY,
  node_id INTEGER NOT NULL REFERENCES board_nodes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create board_edge_comments table
CREATE TABLE board_edge_comments (
  id SERIAL PRIMARY KEY,
  edge_id INTEGER NOT NULL REFERENCES board_edges(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for board_node_comments
CREATE INDEX idx_board_node_comments_node_id ON board_node_comments(node_id);
CREATE INDEX idx_board_node_comments_user_id ON board_node_comments(user_id);
CREATE INDEX idx_board_node_comments_created_at ON board_node_comments(created_at DESC);

-- Create indexes for board_edge_comments
CREATE INDEX idx_board_edge_comments_edge_id ON board_edge_comments(edge_id);
CREATE INDEX idx_board_edge_comments_user_id ON board_edge_comments(user_id);
CREATE INDEX idx_board_edge_comments_created_at ON board_edge_comments(created_at DESC);

-- Add triggers for updated_at
CREATE TRIGGER update_board_node_comments_updated_at BEFORE UPDATE ON board_node_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_edge_comments_updated_at BEFORE UPDATE ON board_edge_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
