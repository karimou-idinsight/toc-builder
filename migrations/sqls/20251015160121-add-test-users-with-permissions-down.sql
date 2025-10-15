-- Remove test users and their permissions

-- Remove board permissions for test users
DELETE FROM board_permissions 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'editor1@tocbuilder.com',
    'editor2@tocbuilder.com',
    'reviewer@tocbuilder.com',
    'viewer@tocbuilder.com'
  )
);

-- Remove test users
DELETE FROM users WHERE email IN (
  'editor1@tocbuilder.com',
  'editor2@tocbuilder.com',
  'reviewer@tocbuilder.com',
  'viewer@tocbuilder.com'
);

