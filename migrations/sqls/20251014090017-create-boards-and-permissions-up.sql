-- Create boards table
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create board_permissions table for role-based access
CREATE TABLE board_permissions (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'contributor', 'reviewer', 'viewer')),
  granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(board_id, user_id)
);

-- Create board_invitations table for pending invitations
CREATE TABLE board_invitations (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('contributor', 'reviewer', 'viewer')),
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(board_id, email)
);

-- Create indexes
CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_boards_is_public ON boards(is_public);
CREATE INDEX idx_board_permissions_board_id ON board_permissions(board_id);
CREATE INDEX idx_board_permissions_user_id ON board_permissions(user_id);
CREATE INDEX idx_board_permissions_role ON board_permissions(role);
CREATE INDEX idx_board_invitations_board_id ON board_invitations(board_id);
CREATE INDEX idx_board_invitations_email ON board_invitations(email);
CREATE INDEX idx_board_invitations_token ON board_invitations(token);
CREATE INDEX idx_board_invitations_expires_at ON board_invitations(expires_at);