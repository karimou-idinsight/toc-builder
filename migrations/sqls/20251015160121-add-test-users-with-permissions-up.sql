-- Add test users with different roles for testing board permissions
-- All passwords are: password123

-- Insert test users
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  is_active, 
  email_verified, 
  role,
  created_at,
  updated_at
) VALUES 
  -- Editor users (2 collaborators who can edit board content)
  (
    'editor1@tocbuilder.com',
    '$2b$12$AE73Gsm5Q17RH3kJESuhQuyFa0w7S562QZK52lM1ZcI3m3p6V8IAa', -- password123
    'Alice',
    'Editor',
    true,
    true,
    'user',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'editor2@tocbuilder.com',
    '$2b$12$AE73Gsm5Q17RH3kJESuhQuyFa0w7S562QZK52lM1ZcI3m3p6V8IAa', -- password123
    'Bob',
    'Collaborator',
    true,
    true,
    'user',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  -- Reviewer (can view and comment)
  (
    'reviewer@tocbuilder.com',
    '$2b$12$AE73Gsm5Q17RH3kJESuhQuyFa0w7S562QZK52lM1ZcI3m3p6V8IAa', -- password123
    'Charlie',
    'Reviewer',
    true,
    true,
    'user',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  -- Viewer (can only view)
  (
    'viewer@tocbuilder.com',
    '$2b$12$AE73Gsm5Q17RH3kJESuhQuyFa0w7S562QZK52lM1ZcI3m3p6V8IAa', -- password123
    'Diana',
    'Observer',
    true,
    true,
    'user',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (email) DO NOTHING;

-- Add board permissions for these users on the sample board
DO $$
DECLARE
  v_board_id INTEGER;
  v_super_admin_id INTEGER;
  v_editor1_id INTEGER;
  v_editor2_id INTEGER;
  v_reviewer_id INTEGER;
  v_viewer_id INTEGER;
BEGIN
  -- Get the sample board ID (the public education board)
  SELECT id INTO v_board_id 
  FROM boards 
  WHERE title = 'Sample Theory of Change - Education Program' 
  LIMIT 1;
  
  -- Get super admin ID (board owner)
  SELECT id INTO v_super_admin_id 
  FROM users 
  WHERE role = 'super_admin' 
  LIMIT 1;
  
  -- Get test user IDs
  SELECT id INTO v_editor1_id FROM users WHERE email = 'editor1@tocbuilder.com';
  SELECT id INTO v_editor2_id FROM users WHERE email = 'editor2@tocbuilder.com';
  SELECT id INTO v_reviewer_id FROM users WHERE email = 'reviewer@tocbuilder.com';
  SELECT id INTO v_viewer_id FROM users WHERE email = 'viewer@tocbuilder.com';
  
  -- Only proceed if board exists
  IF v_board_id IS NOT NULL THEN
    -- Add editor permissions (2 collaborators)
    INSERT INTO board_permissions (board_id, user_id, role, granted_by, created_at, updated_at)
    VALUES 
      (v_board_id, v_editor1_id, 'editor', v_super_admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (v_board_id, v_editor2_id, 'editor', v_super_admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (board_id, user_id) DO NOTHING;
    
    -- Add reviewer permission
    INSERT INTO board_permissions (board_id, user_id, role, granted_by, created_at, updated_at)
    VALUES 
      (v_board_id, v_reviewer_id, 'reviewer', v_super_admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (board_id, user_id) DO NOTHING;
    
    -- Add viewer permission
    INSERT INTO board_permissions (board_id, user_id, role, granted_by, created_at, updated_at)
    VALUES 
      (v_board_id, v_viewer_id, 'viewer', v_super_admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (board_id, user_id) DO NOTHING;
    
    RAISE NOTICE 'Added permissions for 4 test users to board ID %', v_board_id;
  ELSE
    RAISE NOTICE 'Sample board not found - skipping permission assignments';
  END IF;
END $$;

