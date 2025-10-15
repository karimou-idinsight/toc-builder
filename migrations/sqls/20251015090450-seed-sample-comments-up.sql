-- Add sample comments to nodes
INSERT INTO board_node_comments (node_id, user_id, content, created_at) VALUES
  (1, 1, 'These workshops have been very effective. We should consider expanding to more communities.', NOW() - INTERVAL '2 days'),
  (1, 1, 'Feedback from participants has been overwhelmingly positive.', NOW() - INTERVAL '1 day'),
  (2, 1, 'Need to ensure professional development is aligned with the new curriculum standards.', NOW() - INTERVAL '3 days'),
  (3, 1, 'The platform is performing well. We should add more interactive features.', NOW() - INTERVAL '5 days'),
  (3, 1, 'Consider adding gamification elements to increase student engagement.', NOW() - INTERVAL '4 days'),
  (4, 1, 'The new curriculum design is receiving excellent feedback from teachers.', NOW() - INTERVAL '6 days'),
  (5, 1, 'Parent engagement metrics are up 40% this quarter!', NOW() - INTERVAL '2 days'),
  (16, 1, 'Students are showing improved technical literacy after attending workshops.', NOW() - INTERVAL '1 day'),
  (17, 1, 'Platform usage has increased significantly among target age groups.', NOW() - INTERVAL '3 days'),
  (23, 1, 'Parents are more involved in their children''s education now.', NOW() - INTERVAL '2 days');

-- Add sample comments to edges
INSERT INTO board_edge_comments (edge_id, user_id, content, created_at) VALUES
  (1, 1, 'This connection is critical - workshops directly build technical skills.', NOW() - INTERVAL '2 days'),
  (2, 1, 'Professional development is key to this outcome. We need to monitor this closely.', NOW() - INTERVAL '3 days'),
  (3, 1, 'The platform is the primary driver for this literacy improvement.', NOW() - INTERVAL '1 day'),
  (4, 1, 'Strong correlation between curriculum design and learning outcomes.', NOW() - INTERVAL '4 days'),
  (5, 1, 'Parent engagement has a measurable positive impact on student success.', NOW() - INTERVAL '2 days');
