-- Add list_ids to boards table
ALTER TABLE boards ADD COLUMN list_ids JSONB DEFAULT '[]'::jsonb;

-- Create board_lists table
CREATE TABLE board_lists (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('fixed', 'intermediate')),
  node_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create board_nodes table
CREATE TABLE board_nodes (
  id TEXT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('activity', 'output', 'intermediate_outcome', 'final_outcome', 'impact')),
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create board_edges table
CREATE TABLE board_edges (
  id TEXT PRIMARY KEY,
  source_node_id TEXT NOT NULL REFERENCES board_nodes(id) ON DELETE CASCADE,
  target_node_id TEXT NOT NULL REFERENCES board_nodes(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('leads_to', 'enables', 'requires', 'contributes_to')),
  label VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_self_reference CHECK (source_node_id != target_node_id)
);

-- Create indexes for board_nodes tags (for filtering)
CREATE INDEX idx_board_nodes_tags ON board_nodes USING GIN (tags);

-- Create indexes for board_edges (for relationship queries)
CREATE INDEX idx_board_edges_source ON board_edges(source_node_id);
CREATE INDEX idx_board_edges_target ON board_edges(target_node_id);
CREATE INDEX idx_board_edges_source_target ON board_edges(source_node_id, target_node_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_board_lists_updated_at BEFORE UPDATE ON board_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_nodes_updated_at BEFORE UPDATE ON board_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

