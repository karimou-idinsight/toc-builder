-- Create board_edge_assumptions table
CREATE TABLE board_edge_assumptions (
  id SERIAL PRIMARY KEY,
  edge_id INTEGER NOT NULL REFERENCES board_edges(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  strength VARCHAR(20) NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for board_edge_assumptions
CREATE INDEX idx_board_edge_assumptions_edge_id ON board_edge_assumptions(edge_id);
CREATE INDEX idx_board_edge_assumptions_user_id ON board_edge_assumptions(user_id);
CREATE INDEX idx_board_edge_assumptions_created_at ON board_edge_assumptions(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_board_edge_assumptions_updated_at BEFORE UPDATE ON board_edge_assumptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


