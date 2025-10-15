-- Create Feed Salone Theory of Change Board
-- Pure SQL implementation with all 70 nodes and 78 connections

DO $$
DECLARE
  v_board_id INTEGER;
  v_super_admin_id INTEGER;
  
  -- List IDs
  v_activities_list_id INTEGER;
  v_outputs_list_id INTEGER;
  v_intermediate1_list_id INTEGER;
  v_intermediate2_list_id INTEGER;
  v_final_outcome_list_id INTEGER;
  v_impact_list_id INTEGER;
  
  -- Node IDs (will be populated as we insert)
  v_node_ids INTEGER[] := ARRAY[]::INTEGER[];
  v_node_id INTEGER;
BEGIN
  -- Get super admin user ID
  SELECT id INTO v_super_admin_id FROM users WHERE role = 'super_admin' LIMIT 1;
  
  IF v_super_admin_id IS NULL THEN
    RAISE EXCEPTION 'Super admin user not found';
  END IF;

  RAISE NOTICE 'Creating Feed Salone Theory of Change board...';

  -- Create the board
  INSERT INTO boards (title, description, is_public, settings, created_at, updated_at)
  VALUES (
    'Feed Salone Theory of Change',
    'Comprehensive Theory of Change for the Feed Salone program, focusing on Mechanization & Irrigation and Seed & Inputs System pillars.',
    true,
    '{"showLabels": true, "snapToGrid": false, "autoLayout": true, "theme": "light"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  RETURNING id INTO v_board_id;

  -- Add owner permission
  INSERT INTO board_permissions (board_id, user_id, role, granted_by, created_at, updated_at)
  VALUES (v_board_id, v_super_admin_id, 'owner', v_super_admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

  RAISE NOTICE 'Board created with ID: %', v_board_id;

  -- Create lists
  INSERT INTO board_lists (board_id, name, type, color, created_at, updated_at)
  VALUES (v_board_id, 'Activities', 'fixed', '#ef4444', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_activities_list_id;

  INSERT INTO board_lists (board_id, name, type, color, created_at, updated_at)
  VALUES (v_board_id, 'Outputs', 'fixed', '#f59e0b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_outputs_list_id;

  INSERT INTO board_lists (board_id, name, type, color, created_at, updated_at)
  VALUES (v_board_id, 'Intermediate Outcome 1', 'intermediate', '#3b82f6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_intermediate1_list_id;

  INSERT INTO board_lists (board_id, name, type, color, created_at, updated_at)
  VALUES (v_board_id, 'Intermediate Outcome 2', 'intermediate', '#8b5cf6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_intermediate2_list_id;

  INSERT INTO board_lists (board_id, name, type, color, created_at, updated_at)
  VALUES (v_board_id, 'Final Outcomes', 'fixed', '#10b981', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_final_outcome_list_id;

  INSERT INTO board_lists (board_id, name, type, color, created_at, updated_at)
  VALUES (v_board_id, 'Impact', 'fixed', '#06b6d4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_impact_list_id;

  -- Update board with list IDs
  UPDATE boards 
  SET list_ids = jsonb_build_array(
    v_activities_list_id,
    v_outputs_list_id,
    v_intermediate1_list_id,
    v_intermediate2_list_id,
    v_final_outcome_list_id,
    v_impact_list_id
  )
  WHERE id = v_board_id;

  RAISE NOTICE 'Created 6 lists';

  -- Create temporary table for node mapping
  CREATE TEMP TABLE node_mapping (
    csv_id TEXT PRIMARY KEY,
    db_id INTEGER
  );

  -- Insert nodes one by one and track their IDs
  -- This approach works around the limitations of bulk INSERT RETURNING
  
  -- N1-N11: Activities - Mechanization and Irrigation
  INSERT INTO board_nodes (title, type, tags) VALUES ('Training of the Water Users Associations (RAIC)', 'activity', '["Mechanization and Irrigation", "Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N1', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Construct large-scale irrigation systems in 6 ILM districts (FSRP)', 'activity', '["Mechanization and Irrigation", "Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N2', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Construct solar-powered boreholes with irrigation schemes (AVDP, FSRP, RRVCP)', 'activity', '["Mechanization and Irrigation", "Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N3', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Construct earth dams (AVDP)', 'activity', '["Mechanization and Irrigation", "Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N4', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Construct irrigation infrastructure in Tormabum and Gbondapi (RRVCP, RAIC)', 'activity', '["Mechanization and Irrigation", "Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N5', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Construct irrigation schemes and water control works (RAIC)', 'activity', '["Mechanization and Irrigation", "Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N6', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Develop and rehabilitate Inland Valley Swamps for rice production (AVDP, FSRP, WFP, MAFS)', 'activity', '["Mechanization and Irrigation", "Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N7', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Training of youths contractors on IVS Development/Rehabilitation. (AVDP, WFP, MAFS)', 'activity', '["Mechanization and Irrigation", "Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N8', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Hire tractors to plough, harrow, seed (RRVCP, RAIC, FSRP, MAFS)', 'activity', '["Mechanization and Irrigation", "Mechanization"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N9', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Training of youths on tractor operator. (SLARiS)', 'activity', '["Mechanization and Irrigation", "Mechanization"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N10', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Procure harvesters and labour-saving equipment to farmers (FSRP)', 'activity', '["Mechanization and Irrigation", "Mechanization"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N11', v_node_id);
  
  -- N12-N18: Outputs - Mechanization and Irrigation
  INSERT INTO board_nodes (title, type, tags) VALUES ('The Water Users Associations are trained in water management', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N12', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers have access to reliable and functional irrigation infrastructure (large-scale schemes, solar-powered boreholes, water control works, canals, drains)', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N13', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers have access to rehabilitated Inland Valley Swamps for rice cultivation', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N14', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Youths contractors are trained on IVS Development/Rehabilitation', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N15', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers have access to prepared farmland ready for cultivation.', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N16', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Youths are trained on tractor operation', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N17', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers have access to harvesters and labour-saving equipment.', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N18', v_node_id);
  
  -- N19-N21: Intermediate Outcomes 1 - Mechanization and Irrigation
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers are expanding their cultivated area, including Inland Valley Swamps (IVS) with better irrigation system under rice and other crops.', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N19', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers increase use of mechanization for land preparation.', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N20', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers increase use of mechanization for harvesting', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N21', v_node_id);
  
  -- N22-N28: Intermediate Outcomes 2 - Mechanization and Irrigation
  INSERT INTO board_nodes (title, type, tags) VALUES ('Better control of water supply and drainage.', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N22', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Crops are less vulnerable to floods ans droughts.', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N23', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers can plant more than once a year (double/triple cropping).', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N24', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers prepare and plant on time', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N25', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers spend less time and effort on heavy tasks', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N26', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers harvest land on time.', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N27', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers experience fewer post-harvest losses.', 'activity', '["Mechanization and Irrigation"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N28', v_node_id);
  
  -- N29-N43: Activities - Seed and Inputs System
  INSERT INTO board_nodes (title, type, tags) VALUES ('Construct and Equip fertilizer lab (FSRP)', 'activity', '["Seed and Inputs System", "Input Production"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N29', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Financial and Technical support to Private Seed Entities (SLARiS, RRVCP)', 'activity', '["Seed and Inputs System", "Input Production"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N30', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Establishment of cocoa clonal gardens at SLARI (AVDP)', 'activity', '["Seed and Inputs System", "Input Production"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N31', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Rehabilitation of SMP Production centre-Kobia (SLARiS)', 'activity', '["Seed and Inputs System", "Input Production"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N32', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Procurement of Mobile Rice Seed, Cleaning Machines, Mobile maize threshers, and tractors for Seed Entities (SLARiS)', 'activity', '["Seed and Inputs System", "Input Production"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N33', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Financial and Technical support for the production of breeder and foundation seed rice & maize by SLARI (SLARiS, FSRP)', 'activity', '["Seed and Inputs System", "Input Production"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N34', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Capacity building for seed entities in seed production, processing, and business management (SLARiS, FSRP, RRVCP)', 'activity', '["Seed and Inputs System", "Input Production"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N35', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Construction of 500 Mt of stores and drying floors, wash facilities and hand dug well for out-grower seed producers (SLARiS)', 'activity', '["Seed and Inputs System", "Input Production"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N36', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Supply rice seeds to farmers through vouchers (FSRP)', 'activity', '["Seed and Inputs System", "Distribution Development"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N37', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Supply smallholder farmers with improved/certified seeds and input packages (agrochemicals, fertilizers) through agrodealers for key value chains: vegetables (onion, hot pepper, Irish potato, black pepper), rice, cocoa, oil palm, and tubers. (RAIC, AVDP, RRVCP)', 'activity', '["Seed and Inputs System", "Distribution Development"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N38', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Training for agro-dealers to strengthen last-mile input delivery. (RAIC, AVDP)', 'activity', '["Seed and Inputs System", "Distribution Development"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N39', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Rehabilitation of SLeSCA HQ - Freetown (SLARiS)', 'activity', '["Seed and Inputs System", "Input Quality Control and Certification"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N40', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Construction of National Seed Testing Laboratory - Mile 91 and Supply of lab equipment (SLARiS)', 'activity', '["Seed and Inputs System", "Input Quality Control and Certification"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N41', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Provide financial support to SLeSCA. (RRVCP)', 'activity', '["Seed and Inputs System", "Input Quality Control and Certification"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N42', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Training of SLeSCA Field and Laboratory Technicians (SLARiS)', 'activity', '["Seed and Inputs System", "Input Quality Control and Certification"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N43', v_node_id);
  
  -- N44-N54: Outputs - Seed and Inputs System
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers have access to quality fertilizers and input packages', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N44', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers have access to improved/certified seeds for staple and cash crops (vegetables, rice, cocoa, oil palm, tubers)', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N45', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Seed entities have access to mobile rice seed cleaners, maize threshers, and tractors to support seed production', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N46', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Seed entities have access to breeder and foundation seeds for rice and maize', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N47', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Seed entities are able to produce certified seeds', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N48', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Out-grower seed producers have access to proper infrastructure for seed drying, cleaning, and storage.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N49', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Last-mile farmers have access to input.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N50', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('SLeSCA HQ operational for seed certification oversight.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N51', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Capacity for seed testing is increased.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N52', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('SLeSCA receives financial support.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N53', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('SLeSCA field and laboratory technicians are trained.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N54', v_node_id);
  
  -- N55-N57: Intermediate Outcomes 1 - Seed and Inputs System
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers increase adoption of certified and improved seeds/planting material (rice, maize, cocoa, oil palm, vegetables, tubers) and inputs.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N55', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Seed entities and out-grower producers expand seed multiplication and processing capacity using improved infrastructure and mechanized equipment.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N56', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('National institutions (labs, SLeSCA) conduct regular testing and certification, assuring seed quality and compliance with standards.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N57', v_node_id);
  
  -- N58-N63: Intermediate Outcomes 2 - Seed and Inputs System
  INSERT INTO board_nodes (title, type, tags) VALUES ('Improved crop growth.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N58', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Higher germination rates and more uniform crop establishment.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N59', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Crops (rice, maize, cocoa, vegetables, tubers, oil palm) are more resilient to pests, diseases, and climate stresses.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N60', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Increased availability of quality/certified seed.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N61', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Counterfeit and poor-quality inputs reduced through stronger certification and oversight.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N62', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Farmers trust input markets and adopt improved inputs with greater confidence.', 'activity', '["Seed and Inputs System"]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N63', v_node_id);
  
  -- N64-N65: Final Outcomes
  INSERT INTO board_nodes (title, type, tags) VALUES ('Increased agricultural production', 'activity', '[]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N64', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Improved agricultural productivity and efficiency', 'activity', '[]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N65', v_node_id);
  
  -- N66-N70: Impact
  INSERT INTO board_nodes (title, type, tags) VALUES ('Reduced Import Bills for Staples', 'activity', '[]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N66', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Higher earnings from exports', 'activity', '[]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N67', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Improved climate resilience', 'activity', '[]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N68', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Improved food security', 'activity', '[]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N69', v_node_id);
  INSERT INTO board_nodes (title, type, tags) VALUES ('Job Creation', 'activity', '[]') RETURNING id INTO v_node_id; INSERT INTO node_mapping VALUES ('N70', v_node_id);

  RAISE NOTICE 'Created 70 nodes';

  -- Update list node_ids
  UPDATE board_lists SET node_ids = (
    SELECT jsonb_agg(nm.db_id ORDER BY nm.csv_id::text)
    FROM node_mapping nm
    WHERE nm.csv_id IN ('N1','N2','N3','N4','N5','N6','N7','N8','N9','N10','N11','N29','N30','N31','N32','N33','N34','N35','N36','N37','N38','N39','N40','N41','N42','N43')
  )
  WHERE id = v_activities_list_id;

  UPDATE board_lists SET node_ids = (
    SELECT jsonb_agg(nm.db_id ORDER BY nm.csv_id::text)
    FROM node_mapping nm
    WHERE nm.csv_id IN ('N12','N13','N14','N15','N16','N17','N18','N44','N45','N46','N47','N48','N49','N50','N51','N52','N53','N54')
  )
  WHERE id = v_outputs_list_id;

  UPDATE board_lists SET node_ids = (
    SELECT jsonb_agg(nm.db_id ORDER BY nm.csv_id::text)
    FROM node_mapping nm
    WHERE nm.csv_id IN ('N19','N20','N21','N55','N56','N57')
  )
  WHERE id = v_intermediate1_list_id;

  UPDATE board_lists SET node_ids = (
    SELECT jsonb_agg(nm.db_id ORDER BY nm.csv_id::text)
    FROM node_mapping nm
    WHERE nm.csv_id IN ('N22','N23','N24','N25','N26','N27','N28','N58','N59','N60','N61','N62','N63')
  )
  WHERE id = v_intermediate2_list_id;

  UPDATE board_lists SET node_ids = (
    SELECT jsonb_agg(nm.db_id ORDER BY nm.csv_id::text)
    FROM node_mapping nm
    WHERE nm.csv_id IN ('N64','N65')
  )
  WHERE id = v_final_outcome_list_id;

  UPDATE board_lists SET node_ids = (
    SELECT jsonb_agg(nm.db_id ORDER BY nm.csv_id::text)
    FROM node_mapping nm
    WHERE nm.csv_id IN ('N66','N67','N68','N69','N70')
  )
  WHERE id = v_impact_list_id;

  -- Create all edges
  INSERT INTO board_edges (source_node_id, target_node_id, type, label)
  SELECT 
    src.db_id,
    tgt.db_id,
    'leads_to',
    ''
  FROM (VALUES
    ('N1','N12'),('N2','N13'),('N3','N13'),('N4','N13'),('N5','N13'),('N6','N13'),
    ('N7','N14'),('N8','N15'),('N9','N16'),('N10','N17'),('N11','N18'),('N12','N19'),
    ('N13','N19'),('N14','N19'),('N15','N19'),('N16','N19'),('N17','N20'),('N18','N21'),
    ('N19','N22'),('N19','N23'),('N19','N24'),('N20','N25'),('N20','N26'),('N21','N27'),
    ('N21','N28'),('N22','N64'),('N23','N64'),('N24','N64'),('N25','N65'),('N26','N65'),
    ('N27','N65'),('N28','N65'),('N29','N44'),('N30','N45'),('N31','N45'),('N32','N45'),
    ('N33','N47'),('N34','N48'),('N35','N46'),('N36','N50'),('N37','N45'),('N38','N45'),
    ('N39','N50'),('N40','N51'),('N41','N52'),('N42','N53'),('N43','N54'),('N44','N55'),
    ('N45','N55'),('N46','N56'),('N47','N56'),('N48','N56'),('N48','N55'),('N49','N56'),
    ('N50','N55'),('N51','N57'),('N52','N57'),('N53','N57'),('N54','N57'),('N55','N58'),
    ('N55','N59'),('N55','N60'),('N56','N61'),('N57','N62'),('N57','N63'),('N58','N65'),
    ('N59','N64'),('N60','N64'),('N61','N64'),('N62','N64'),('N63','N64'),('N64','N66'),
    ('N64','N68'),('N64','N69'),('N64','N67'),('N65','N66'),('N65','N69'),('N65','N70')
  ) AS connections(source_id, target_id)
  JOIN node_mapping src ON src.csv_id = connections.source_id
  JOIN node_mapping tgt ON tgt.csv_id = connections.target_id;

  RAISE NOTICE 'Created 78 connections';

  -- Clean up temp table
  DROP TABLE node_mapping;

  RAISE NOTICE '✅ Feed Salone Theory of Change board created successfully!';
  RAISE NOTICE '   Board ID: %', v_board_id;
  RAISE NOTICE '   Nodes: 70';
  RAISE NOTICE '   Connections: 78';
  RAISE NOTICE '   Owner: Super Admin (ID: %)', v_super_admin_id;
  RAISE NOTICE '   Public: Yes';

END $$;
