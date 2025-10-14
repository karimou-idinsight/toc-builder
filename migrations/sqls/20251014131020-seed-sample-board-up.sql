-- Create a sample public board accessible to all users
DO $$
DECLARE
  v_board_id INTEGER;
  v_super_admin_id INTEGER;
  
  v_activities_list_id INTEGER;
  v_outputs_list_id INTEGER;
  v_intermediate_list_id INTEGER;
  v_final_outcomes_list_id INTEGER;
  v_impact_list_id INTEGER;
  
BEGIN
  -- Get super admin ID
  SELECT id INTO v_super_admin_id FROM users WHERE role = 'super_admin' LIMIT 1;
  
  -- Create the board
  INSERT INTO boards (
    title, 
    description, 
    owner_id, 
    is_public, 
    settings,
    created_at,
    updated_at
  ) VALUES (
    'Sample Theory of Change - Education Program',
    'A comprehensive Theory of Change for an education improvement program',
    v_super_admin_id,
    true,
    '{"showLabels": true, "snapToGrid": false, "autoLayout": true, "theme": "light"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ) RETURNING id INTO v_board_id;
  
  -- Create Lists
  INSERT INTO board_lists (board_id, name, color, type, "order", created_at, updated_at)
  VALUES (v_board_id, 'Activities', '#3b82f6', 'fixed', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_activities_list_id;
  
  INSERT INTO board_lists (board_id, name, color, type, "order", created_at, updated_at)
  VALUES (v_board_id, 'Outputs', '#10b981', 'fixed', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_outputs_list_id;
  
  INSERT INTO board_lists (board_id, name, color, type, "order", created_at, updated_at)
  VALUES (v_board_id, 'Intermediate Outcomes', '#f59e0b', 'intermediate', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_intermediate_list_id;
  
  INSERT INTO board_lists (board_id, name, color, type, "order", created_at, updated_at)
  VALUES (v_board_id, 'Final Outcomes', '#ef4444', 'fixed', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_final_outcomes_list_id;
  
  INSERT INTO board_lists (board_id, name, color, type, "order", created_at, updated_at)
  VALUES (v_board_id, 'Impact', '#8b5cf6', 'fixed', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_impact_list_id;
  
END $$;

-- Insert nodes and update lists in separate transaction
DO $$
DECLARE
  v_activities_list_id INTEGER;
  v_outputs_list_id INTEGER;
  v_intermediate_list_id INTEGER;
  v_final_outcomes_list_id INTEGER;
  v_impact_list_id INTEGER;
  v_activity_node_ids INTEGER[];
  v_output_node_ids INTEGER[];
  v_intermediate_node_ids INTEGER[];
  v_final_outcome_node_ids INTEGER[];
  v_impact_node_ids INTEGER[];
BEGIN
  -- Get list IDs
  SELECT id INTO v_activities_list_id FROM board_lists WHERE name = 'Activities' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO v_outputs_list_id FROM board_lists WHERE name = 'Outputs' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO v_intermediate_list_id FROM board_lists WHERE name = 'Intermediate Outcomes' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO v_final_outcomes_list_id FROM board_lists WHERE name = 'Final Outcomes' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO v_impact_list_id FROM board_lists WHERE name = 'Impact' ORDER BY created_at DESC LIMIT 1;
  
  -- Create Activity Nodes and collect IDs
  WITH inserted AS (
    INSERT INTO board_nodes (title, description, type, tags, created_at, updated_at)
    VALUES 
      ('Community Training Workshops', 'Key activity to implement the program', 'activity', '["Pillar #1 - Teacher Training"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Teacher Professional Development', 'Key activity to implement the program', 'activity', '["Pillar #1 - Teacher Training"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Digital Learning Platform', 'Key activity to implement the program', 'activity', '["Pillar #2 - Digital Learning"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Curriculum Design', 'Key activity to implement the program', 'activity', '["Pillar #1 - Teacher Training"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Parent Engagement', 'Key activity to implement the program', 'activity', '["Pillar #3 - Community Engagement"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('School Infrastructure', 'Key activity to implement the program', 'activity', '["Pillar #4 - Infrastructure"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Technology Integration', 'Key activity to implement the program', 'activity', '["Pillar #2 - Digital Learning"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Student Mentorship', 'Key activity to implement the program', 'activity', '["Pillar #3 - Community Engagement"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('After-School Support', 'Key activity to implement the program', 'activity', '["Pillar #5 - Student Support"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Reading Enhancement', 'Key activity to implement the program', 'activity', '["Pillar #6 - Literacy & Reading"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('STEM Education', 'Key activity to implement the program', 'activity', '["Pillar #7 - STEM Education"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Arts and Culture', 'Key activity to implement the program', 'activity', '["Pillar #8 - Arts & Culture"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Sports and PE', 'Key activity to implement the program', 'activity', '["Pillar #9 - Health & Wellbeing"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Nutrition Education', 'Key activity to implement the program', 'activity', '["Pillar #9 - Health & Wellbeing"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Library Development', 'Key activity to implement the program', 'activity', '["Pillar #6 - Literacy & Reading"]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  )
  SELECT array_agg(id ORDER BY id) INTO v_activity_node_ids FROM inserted;
  
  -- Create Output Nodes
  WITH inserted AS (
    INSERT INTO board_nodes (title, description, type, tags, created_at, updated_at)
    VALUES 
      ('500 Teachers Trained', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Online Platform Launched', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Updated Curriculum', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('10 Schools Renovated', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('5000 Students Enrolled', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('200 Computers Deployed', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('50 Science Kits Distributed', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('1000 Parents Engaged', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('100 Mentors Recruited', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('New Library Established', 'Direct result of program activities', 'output', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  )
  SELECT array_agg(id ORDER BY id) INTO v_output_node_ids FROM inserted;
  
  -- Create Intermediate Outcome Nodes
  WITH inserted AS (
    INSERT INTO board_nodes (title, description, type, tags, created_at, updated_at)
    VALUES 
      ('Improved Teaching Quality', 'Medium-term change', 'intermediate_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Increased Student Engagement', 'Medium-term change', 'intermediate_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Enhanced Digital Literacy', 'Medium-term change', 'intermediate_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Better Learning Environment', 'Medium-term change', 'intermediate_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Stronger Parent Involvement', 'Medium-term change', 'intermediate_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Improved Reading Skills', 'Medium-term change', 'intermediate_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Enhanced Math Competency', 'Medium-term change', 'intermediate_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Better Science Understanding', 'Medium-term change', 'intermediate_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  )
  SELECT array_agg(id ORDER BY id) INTO v_intermediate_node_ids FROM inserted;
  
  -- Create Final Outcome Nodes
  WITH inserted AS (
    INSERT INTO board_nodes (title, description, type, tags, created_at, updated_at)
    VALUES 
      ('Improved Learning Outcomes', 'Long-term change', 'final_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Reduced Educational Inequality', 'Long-term change', 'final_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Increased Completion Rates', 'Long-term change', 'final_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Better Employment Opportunities', 'Long-term change', 'final_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Increased Literacy Rates', 'Long-term change', 'final_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Improved Health Outcomes', 'Long-term change', 'final_outcome', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  )
  SELECT array_agg(id ORDER BY id) INTO v_final_outcome_node_ids FROM inserted;
  
  -- Create Impact Nodes
  WITH inserted AS (
    INSERT INTO board_nodes (title, description, type, tags, created_at, updated_at)
    VALUES 
      ('Sustainable Community Development', 'Ultimate societal change', 'impact', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Reduced Poverty', 'Ultimate societal change', 'impact', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Economic Growth', 'Ultimate societal change', 'impact', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('Improved Public Health', 'Ultimate societal change', 'impact', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  )
  SELECT array_agg(id ORDER BY id) INTO v_impact_node_ids FROM inserted;
  
  -- Update lists with node_ids
  UPDATE board_lists SET node_ids = to_jsonb(v_activity_node_ids) WHERE id = v_activities_list_id;
  UPDATE board_lists SET node_ids = to_jsonb(v_output_node_ids) WHERE id = v_outputs_list_id;
  UPDATE board_lists SET node_ids = to_jsonb(v_intermediate_node_ids) WHERE id = v_intermediate_list_id;
  UPDATE board_lists SET node_ids = to_jsonb(v_final_outcome_node_ids) WHERE id = v_final_outcomes_list_id;
  UPDATE board_lists SET node_ids = to_jsonb(v_impact_node_ids) WHERE id = v_impact_list_id;
  
  -- Create Edges
  INSERT INTO board_edges (source_node_id, target_node_id, type, label, created_at) VALUES 
    -- Activities -> Outputs
    (v_activity_node_ids[1], v_output_node_ids[1], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_activity_node_ids[2], v_output_node_ids[1], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_activity_node_ids[3], v_output_node_ids[2], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_activity_node_ids[4], v_output_node_ids[3], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_activity_node_ids[5], v_output_node_ids[8], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_activity_node_ids[6], v_output_node_ids[4], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    
    -- Outputs -> Intermediate Outcomes
    (v_output_node_ids[1], v_intermediate_node_ids[1], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_output_node_ids[2], v_intermediate_node_ids[3], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_output_node_ids[7], v_intermediate_node_ids[8], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_output_node_ids[8], v_intermediate_node_ids[5], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_output_node_ids[10], v_intermediate_node_ids[6], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    
    -- Intermediate Outcomes -> Final Outcomes
    (v_intermediate_node_ids[1], v_final_outcome_node_ids[1], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_intermediate_node_ids[2], v_final_outcome_node_ids[1], 'contributes_to', 'contributes to', CURRENT_TIMESTAMP),
    (v_intermediate_node_ids[3], v_final_outcome_node_ids[1], 'contributes_to', 'contributes to', CURRENT_TIMESTAMP),
    (v_intermediate_node_ids[6], v_final_outcome_node_ids[5], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_intermediate_node_ids[7], v_final_outcome_node_ids[1], 'contributes_to', 'contributes to', CURRENT_TIMESTAMP),
    
    -- Final Outcomes -> Impact
    (v_final_outcome_node_ids[1], v_impact_node_ids[1], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_final_outcome_node_ids[2], v_impact_node_ids[2], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_final_outcome_node_ids[3], v_impact_node_ids[1], 'contributes_to', 'contributes to', CURRENT_TIMESTAMP),
    (v_final_outcome_node_ids[4], v_impact_node_ids[3], 'leads_to', 'leads to', CURRENT_TIMESTAMP),
    (v_final_outcome_node_ids[5], v_impact_node_ids[2], 'contributes_to', 'contributes to', CURRENT_TIMESTAMP),
    (v_final_outcome_node_ids[6], v_impact_node_ids[4], 'leads_to', 'leads to', CURRENT_TIMESTAMP);
    
END $$;
