/**
 * Theory of Change data models and types
 */

// Default list types for Theory of Change
export const DEFAULT_LISTS = [
  { id: 'activities', name: 'Activities', color: '#3b82f6', order: 0, type: 'fixed' },
  { id: 'outputs', name: 'Outputs', color: '#10b981', order: 1, type: 'fixed' },
  { id: 'intermediate-1', name: 'Intermediate Outcomes 1', color: '#f59e0b', order: 2, type: 'intermediate' },
  { id: 'final-outcomes', name: 'Final Outcomes', color: '#ef4444', order: 3, type: 'fixed' },
  { id: 'impact', name: 'Impact', color: '#8b5cf6', order: 4, type: 'fixed' }
];

// List types
export const LIST_TYPES = {
  FIXED: 'fixed',
  INTERMEDIATE: 'intermediate'
};

// Node types
export const NODE_TYPES = {
  ACTIVITY: 'activity',
  OUTPUT: 'output',
  INTERMEDIATE_OUTCOME: 'intermediate_outcome',
  FINAL_OUTCOME: 'final_outcome',
  IMPACT: 'impact'
};

// Edge types
export const EDGE_TYPES = {
  LEADS_TO: 'leads_to',
  ENABLES: 'enables',
  REQUIRES: 'requires',
  CONTRIBUTES_TO: 'contributes_to'
};

// Default edge styles
export const EDGE_STYLES = {
  [EDGE_TYPES.LEADS_TO]: {
    stroke: '#1355bfff',
    strokeWidth: 2,
    style: 'solid',
    label: 'leads to'
  },
  [EDGE_TYPES.ENABLES]: {
    stroke: '#10b981',
    strokeWidth: 2,
    style: 'dashed',
    label: 'enables'
  },
  [EDGE_TYPES.REQUIRES]: {
    stroke: '#ef4444',
    strokeWidth: 2,
    style: 'dotted',
    label: 'requires'
  },
  [EDGE_TYPES.CONTRIBUTES_TO]: {
    stroke: '#f59e0b',
    strokeWidth: 2,
    style: 'solid',
    label: 'contributes to'
  }
};

/**
 * Create a new board
 */
export function createBoard(name = 'Theory of Change Board') {
  const boardId = generateId();
  
  // Create lists with proper IDs
  const lists = DEFAULT_LISTS.map(list => ({ 
    ...list, 
    id: list.id, // Keep the predefined IDs for consistency
    nodeIds: []
  }));

  // Create sample nodes - 100+ nodes with variety
  const sampleNodes = [
    // Activities (30 nodes)
    createNode('Community Training Workshops', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Teacher Professional Development Program', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Digital Learning Platform Development', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Curriculum Design and Review', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Parent Engagement Sessions', 'activities', NODE_TYPES.ACTIVITY),
    createNode('School Infrastructure Improvement', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Educational Technology Integration', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Student Mentorship Program', 'activities', NODE_TYPES.ACTIVITY),
    createNode('After-School Support Programs', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Reading Enhancement Workshops', 'activities', NODE_TYPES.ACTIVITY),
    createNode('STEM Education Initiatives', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Arts and Culture Programs', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Sports and Physical Education', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Nutrition and Health Education', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Library Resource Development', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Computer Lab Setup', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Science Equipment Procurement', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Teacher Coaching and Feedback', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Classroom Management Training', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Assessment Development', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Learning Materials Creation', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Community Outreach Programs', 'activities', NODE_TYPES.ACTIVITY),
    createNode('School Leadership Training', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Data Collection Systems', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Quality Assurance Processes', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Peer Learning Networks', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Special Needs Support', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Career Guidance Sessions', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Environmental Education', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Financial Literacy Programs', 'activities', NODE_TYPES.ACTIVITY),
    
    // Outputs (25 nodes)
    createNode('500 Teachers Trained', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Online Learning Platform Launched', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Updated Curriculum Materials', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Community Learning Centers Established', 'outputs', NODE_TYPES.OUTPUT),
    createNode('10 Schools Renovated', 'outputs', NODE_TYPES.OUTPUT),
    createNode('5000 Students Enrolled', 'outputs', NODE_TYPES.OUTPUT),
    createNode('200 Computers Deployed', 'outputs', NODE_TYPES.OUTPUT),
    createNode('50 Science Kits Distributed', 'outputs', NODE_TYPES.OUTPUT),
    createNode('1000 Parents Engaged', 'outputs', NODE_TYPES.OUTPUT),
    createNode('100 Mentors Recruited', 'outputs', NODE_TYPES.OUTPUT),
    createNode('New Library with 5000 Books', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Digital Content Created', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Assessment System Implemented', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Teacher Resource Portal', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Student Progress Tracking System', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Parent Communication App', 'outputs', NODE_TYPES.OUTPUT),
    createNode('School Safety Protocols', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Nutrition Programs Running', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Sports Facilities Built', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Art Studios Equipped', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Special Education Resources', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Career Center Established', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Environmental Projects Launched', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Student Clubs Formed', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Community Partnerships Formed', 'outputs', NODE_TYPES.OUTPUT),
    
    // Intermediate Outcomes (30 nodes)
    createNode('Improved Teaching Quality', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Increased Student Engagement', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Enhanced Digital Literacy', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Better Learning Environment', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Stronger Parent Involvement', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Higher Student Attendance', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Improved Reading Skills', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Enhanced Math Competency', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Better Science Understanding', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Increased Critical Thinking', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Better Collaboration Skills', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Enhanced Creativity', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Improved Physical Health', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Better Mental Wellbeing', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Stronger Community Ties', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Increased Confidence', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Better Problem-Solving', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Enhanced Communication Skills', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Improved Time Management', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Greater Motivation', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Better Career Awareness', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Enhanced Social Skills', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Improved Behavior', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Greater Inclusivity', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Better Resource Access', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Increased Technology Use', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Enhanced Leadership Skills', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Better Environmental Awareness', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Improved Financial Literacy', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Greater Cultural Appreciation', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    
    // Final Outcomes (20 nodes)
    createNode('Improved Student Learning Outcomes', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Reduced Educational Inequality', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Increased School Completion Rates', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Higher University Enrollment', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Better Employment Opportunities', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Increased Literacy Rates', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Enhanced Numeracy Skills', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Reduced Dropout Rates', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Improved Test Scores', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Greater Gender Equality', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Better Health Outcomes', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Increased Innovation', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Stronger Civic Engagement', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Enhanced Social Mobility', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Better Life Skills', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Increased Entrepreneurship', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Greater Community Leadership', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Improved Quality of Life', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Better Decision Making', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Increased Resilience', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    
    // Impact (10 nodes)
    createNode('Sustainable Community Development', 'impact', NODE_TYPES.IMPACT),
    createNode('Reduced Poverty in Target Communities', 'impact', NODE_TYPES.IMPACT),
    createNode('Economic Growth', 'impact', NODE_TYPES.IMPACT),
    createNode('Social Cohesion', 'impact', NODE_TYPES.IMPACT),
    createNode('Environmental Sustainability', 'impact', NODE_TYPES.IMPACT),
    createNode('Improved Public Health', 'impact', NODE_TYPES.IMPACT),
    createNode('Democratic Participation', 'impact', NODE_TYPES.IMPACT),
    createNode('Cultural Preservation', 'impact', NODE_TYPES.IMPACT),
    createNode('Innovation Economy', 'impact', NODE_TYPES.IMPACT),
    createNode('Intergenerational Equity', 'impact', NODE_TYPES.IMPACT)
  ];

  // Set proper order for nodes within each list
  sampleNodes.forEach((node, index) => {
    const listNodes = sampleNodes.filter(n => n.listId === node.listId);
    const nodeIndexInList = listNodes.findIndex(n => n.id === node.id);
    node.order = nodeIndexInList;
    node.description = getNodeDescription(node.title, node.type);
  });

  // Create edges following Theory of Change flow:
  // Activities -> Outputs or Outcomes
  // Outputs -> Outcomes
  // Outcomes -> Impact
  const sampleEdges = [
    // === Activities (0-29) -> Outputs (30-54) ===
    createEdge(sampleNodes[0].id, sampleNodes[30].id, EDGE_TYPES.LEADS_TO), // Training -> Teachers Trained
    createEdge(sampleNodes[1].id, sampleNodes[30].id, EDGE_TYPES.LEADS_TO), // Prof Dev -> Teachers Trained
    createEdge(sampleNodes[2].id, sampleNodes[31].id, EDGE_TYPES.LEADS_TO), // Platform Dev -> Platform Launched
    createEdge(sampleNodes[3].id, sampleNodes[32].id, EDGE_TYPES.LEADS_TO), // Curriculum -> Materials
    createEdge(sampleNodes[4].id, sampleNodes[38].id, EDGE_TYPES.LEADS_TO), // Parent Engagement -> Parents Engaged
    createEdge(sampleNodes[5].id, sampleNodes[34].id, EDGE_TYPES.LEADS_TO), // Infrastructure -> Schools Renovated
    createEdge(sampleNodes[6].id, sampleNodes[36].id, EDGE_TYPES.LEADS_TO), // Ed Tech -> Computers Deployed
    createEdge(sampleNodes[7].id, sampleNodes[39].id, EDGE_TYPES.LEADS_TO), // Mentorship -> Mentors Recruited
    createEdge(sampleNodes[8].id, sampleNodes[35].id, EDGE_TYPES.LEADS_TO), // After School -> Students Enrolled
    createEdge(sampleNodes[9].id, sampleNodes[40].id, EDGE_TYPES.LEADS_TO), // Reading -> Library
    createEdge(sampleNodes[10].id, sampleNodes[37].id, EDGE_TYPES.LEADS_TO), // STEM -> Science Kits
    createEdge(sampleNodes[11].id, sampleNodes[49].id, EDGE_TYPES.LEADS_TO), // Arts -> Art Studios
    createEdge(sampleNodes[12].id, sampleNodes[48].id, EDGE_TYPES.LEADS_TO), // Sports -> Sports Facilities
    createEdge(sampleNodes[13].id, sampleNodes[47].id, EDGE_TYPES.LEADS_TO), // Nutrition -> Nutrition Programs
    createEdge(sampleNodes[14].id, sampleNodes[40].id, EDGE_TYPES.LEADS_TO), // Library Dev -> Library
    createEdge(sampleNodes[15].id, sampleNodes[36].id, EDGE_TYPES.LEADS_TO), // Computer Lab -> Computers
    createEdge(sampleNodes[16].id, sampleNodes[37].id, EDGE_TYPES.LEADS_TO), // Science Equipment -> Kits
    createEdge(sampleNodes[17].id, sampleNodes[30].id, EDGE_TYPES.ENABLES), // Coaching -> Teachers Trained
    createEdge(sampleNodes[18].id, sampleNodes[30].id, EDGE_TYPES.ENABLES), // Classroom Mgmt -> Teachers Trained
    createEdge(sampleNodes[19].id, sampleNodes[42].id, EDGE_TYPES.LEADS_TO), // Assessment -> Assessment System
    createEdge(sampleNodes[20].id, sampleNodes[41].id, EDGE_TYPES.LEADS_TO), // Video Production -> Digital Content
    createEdge(sampleNodes[21].id, sampleNodes[44].id, EDGE_TYPES.LEADS_TO), // Student Dashboard -> Progress Tracking
    createEdge(sampleNodes[22].id, sampleNodes[43].id, EDGE_TYPES.LEADS_TO), // Online Resources -> Resource Portal
    createEdge(sampleNodes[23].id, sampleNodes[50].id, EDGE_TYPES.LEADS_TO), // Mobile App -> Mobile Apps
    createEdge(sampleNodes[24].id, sampleNodes[51].id, EDGE_TYPES.LEADS_TO), // Gamification -> Gamified Lessons
    createEdge(sampleNodes[25].id, sampleNodes[52].id, EDGE_TYPES.LEADS_TO), // AI Tutoring -> AI Tutors
    createEdge(sampleNodes[26].id, sampleNodes[53].id, EDGE_TYPES.LEADS_TO), // VR Learning -> VR Experiences
    createEdge(sampleNodes[27].id, sampleNodes[54].id, EDGE_TYPES.LEADS_TO), // Peer Learning -> Peer Learning Groups
    createEdge(sampleNodes[28].id, sampleNodes[45].id, EDGE_TYPES.ENABLES), // Community Service -> Parent App
    createEdge(sampleNodes[29].id, sampleNodes[46].id, EDGE_TYPES.LEADS_TO), // Environmental Ed -> Safety Protocols
    
    // === Activities (0-29) -> Intermediate Outcomes (55-84) (direct impact) ===
    createEdge(sampleNodes[0].id, sampleNodes[55].id, EDGE_TYPES.CONTRIBUTES_TO), // Training -> Teaching Quality
    createEdge(sampleNodes[4].id, sampleNodes[59].id, EDGE_TYPES.CONTRIBUTES_TO), // Parent Engagement -> Parent Involvement
    createEdge(sampleNodes[8].id, sampleNodes[56].id, EDGE_TYPES.CONTRIBUTES_TO), // After School -> Student Engagement
    
    // === Outputs (30-54) -> Intermediate Outcomes (55-84) ===
    createEdge(sampleNodes[30].id, sampleNodes[55].id, EDGE_TYPES.LEADS_TO), // Teachers Trained -> Teaching Quality
    createEdge(sampleNodes[31].id, sampleNodes[57].id, EDGE_TYPES.LEADS_TO), // Platform -> Digital Literacy
    createEdge(sampleNodes[32].id, sampleNodes[55].id, EDGE_TYPES.ENABLES), // Materials -> Teaching Quality
    createEdge(sampleNodes[33].id, sampleNodes[58].id, EDGE_TYPES.LEADS_TO), // Learning Centers -> Learning Environment
    createEdge(sampleNodes[34].id, sampleNodes[58].id, EDGE_TYPES.LEADS_TO), // Schools Renovated -> Environment
    createEdge(sampleNodes[35].id, sampleNodes[56].id, EDGE_TYPES.LEADS_TO), // Students Enrolled -> Engagement
    createEdge(sampleNodes[36].id, sampleNodes[57].id, EDGE_TYPES.ENABLES), // Computers -> Digital Literacy
    createEdge(sampleNodes[37].id, sampleNodes[63].id, EDGE_TYPES.LEADS_TO), // Science Kits -> Science Understanding
    createEdge(sampleNodes[38].id, sampleNodes[59].id, EDGE_TYPES.LEADS_TO), // Parents Engaged -> Parent Involvement
    createEdge(sampleNodes[39].id, sampleNodes[56].id, EDGE_TYPES.ENABLES), // Mentors -> Student Engagement
    createEdge(sampleNodes[40].id, sampleNodes[61].id, EDGE_TYPES.LEADS_TO), // Library -> Reading Skills
    createEdge(sampleNodes[41].id, sampleNodes[57].id, EDGE_TYPES.ENABLES), // Digital Content -> Digital Literacy
    createEdge(sampleNodes[42].id, sampleNodes[55].id, EDGE_TYPES.ENABLES), // Assessment System -> Teaching Quality
    createEdge(sampleNodes[43].id, sampleNodes[55].id, EDGE_TYPES.ENABLES), // Resource Portal -> Teaching Quality
    createEdge(sampleNodes[44].id, sampleNodes[60].id, EDGE_TYPES.LEADS_TO), // Progress Tracking -> Attendance
    createEdge(sampleNodes[45].id, sampleNodes[59].id, EDGE_TYPES.ENABLES), // Parent App -> Parent Involvement
    createEdge(sampleNodes[46].id, sampleNodes[58].id, EDGE_TYPES.ENABLES), // Safety Protocols -> Environment
    createEdge(sampleNodes[47].id, sampleNodes[67].id, EDGE_TYPES.LEADS_TO), // Nutrition -> Physical Health
    createEdge(sampleNodes[48].id, sampleNodes[67].id, EDGE_TYPES.LEADS_TO), // Sports -> Physical Health
    createEdge(sampleNodes[49].id, sampleNodes[66].id, EDGE_TYPES.LEADS_TO), // Art Studios -> Creativity
    createEdge(sampleNodes[50].id, sampleNodes[72].id, EDGE_TYPES.ENABLES), // Mobile Apps -> Communication Skills
    createEdge(sampleNodes[51].id, sampleNodes[56].id, EDGE_TYPES.ENABLES), // Gamified Lessons -> Engagement
    createEdge(sampleNodes[52].id, sampleNodes[62].id, EDGE_TYPES.ENABLES), // AI Tutors -> Math Proficiency
    createEdge(sampleNodes[53].id, sampleNodes[63].id, EDGE_TYPES.ENABLES), // VR Experiences -> Science Understanding
    createEdge(sampleNodes[54].id, sampleNodes[65].id, EDGE_TYPES.LEADS_TO), // Peer Learning Groups -> Collaboration
    
    // === Intermediate Outcomes (55-84) -> Final Outcomes (85-104) ===
    createEdge(sampleNodes[55].id, sampleNodes[85].id, EDGE_TYPES.LEADS_TO), // Teaching Quality -> Learning Outcomes
    createEdge(sampleNodes[56].id, sampleNodes[85].id, EDGE_TYPES.CONTRIBUTES_TO), // Engagement -> Learning Outcomes
    createEdge(sampleNodes[57].id, sampleNodes[85].id, EDGE_TYPES.CONTRIBUTES_TO), // Digital Literacy -> Learning Outcomes
    createEdge(sampleNodes[58].id, sampleNodes[85].id, EDGE_TYPES.ENABLES), // Environment -> Learning Outcomes
    createEdge(sampleNodes[59].id, sampleNodes[87].id, EDGE_TYPES.CONTRIBUTES_TO), // Parent Involvement -> Completion Rates
    createEdge(sampleNodes[60].id, sampleNodes[87].id, EDGE_TYPES.LEADS_TO), // Attendance -> Completion Rates
    createEdge(sampleNodes[61].id, sampleNodes[91].id, EDGE_TYPES.LEADS_TO), // Reading -> Literacy Rates
    createEdge(sampleNodes[62].id, sampleNodes[92].id, EDGE_TYPES.LEADS_TO), // Math -> Numeracy Skills
    createEdge(sampleNodes[63].id, sampleNodes[85].id, EDGE_TYPES.CONTRIBUTES_TO), // Science -> Learning Outcomes
    createEdge(sampleNodes[64].id, sampleNodes[103].id, EDGE_TYPES.LEADS_TO), // Critical Thinking -> Decision Making
    createEdge(sampleNodes[65].id, sampleNodes[98].id, EDGE_TYPES.CONTRIBUTES_TO), // Collaboration -> Social Mobility
    createEdge(sampleNodes[66].id, sampleNodes[96].id, EDGE_TYPES.CONTRIBUTES_TO), // Creativity -> Innovation Mindset
    createEdge(sampleNodes[67].id, sampleNodes[95].id, EDGE_TYPES.LEADS_TO), // Physical Health -> Health Outcomes
    createEdge(sampleNodes[68].id, sampleNodes[95].id, EDGE_TYPES.CONTRIBUTES_TO), // Mental Wellbeing -> Health Outcomes
    createEdge(sampleNodes[69].id, sampleNodes[98].id, EDGE_TYPES.CONTRIBUTES_TO), // Community Ties -> Social Mobility
    createEdge(sampleNodes[70].id, sampleNodes[99].id, EDGE_TYPES.CONTRIBUTES_TO), // Confidence -> Life Skills
    createEdge(sampleNodes[71].id, sampleNodes[103].id, EDGE_TYPES.CONTRIBUTES_TO), // Problem Solving -> Decision Making
    createEdge(sampleNodes[72].id, sampleNodes[99].id, EDGE_TYPES.CONTRIBUTES_TO), // Communication -> Life Skills
    createEdge(sampleNodes[73].id, sampleNodes[102].id, EDGE_TYPES.CONTRIBUTES_TO), // Self-Directed -> Quality of Life
    createEdge(sampleNodes[74].id, sampleNodes[93].id, EDGE_TYPES.CONTRIBUTES_TO), // Motivation -> Dropout Reduction
    createEdge(sampleNodes[75].id, sampleNodes[89].id, EDGE_TYPES.LEADS_TO), // Career Awareness -> Employment
    createEdge(sampleNodes[76].id, sampleNodes[100].id, EDGE_TYPES.LEADS_TO), // Financial Literacy -> Entrepreneurship
    createEdge(sampleNodes[77].id, sampleNodes[98].id, EDGE_TYPES.CONTRIBUTES_TO), // Social Skills -> Social Mobility
    createEdge(sampleNodes[78].id, sampleNodes[96].id, EDGE_TYPES.CONTRIBUTES_TO), // Cultural Awareness -> Innovation
    createEdge(sampleNodes[79].id, sampleNodes[109].id, EDGE_TYPES.LEADS_TO), // Environmental Awareness -> Sustainability
    createEdge(sampleNodes[80].id, sampleNodes[96].id, EDGE_TYPES.ENABLES), // Technology Use -> Innovation
    createEdge(sampleNodes[81].id, sampleNodes[101].id, EDGE_TYPES.LEADS_TO), // Leadership Skills -> Community Leadership
    createEdge(sampleNodes[82].id, sampleNodes[97].id, EDGE_TYPES.LEADS_TO), // Global Awareness -> Civic Engagement
    createEdge(sampleNodes[83].id, sampleNodes[104].id, EDGE_TYPES.CONTRIBUTES_TO), // Emotional Intelligence -> Resilience
    createEdge(sampleNodes[84].id, sampleNodes[99].id, EDGE_TYPES.CONTRIBUTES_TO), // Adaptability -> Life Skills
    
    // === Final Outcomes (85-104) -> Impact (105-114) ===
    createEdge(sampleNodes[85].id, sampleNodes[105].id, EDGE_TYPES.LEADS_TO), // Learning Outcomes -> Community Dev
    createEdge(sampleNodes[86].id, sampleNodes[106].id, EDGE_TYPES.LEADS_TO), // Reduced Inequality -> Poverty Reduction
    createEdge(sampleNodes[87].id, sampleNodes[105].id, EDGE_TYPES.CONTRIBUTES_TO), // Completion -> Community Dev
    createEdge(sampleNodes[88].id, sampleNodes[113].id, EDGE_TYPES.LEADS_TO), // University Access -> Innovation Economy
    createEdge(sampleNodes[89].id, sampleNodes[107].id, EDGE_TYPES.LEADS_TO), // Employment -> Economic Growth
    createEdge(sampleNodes[90].id, sampleNodes[108].id, EDGE_TYPES.CONTRIBUTES_TO), // Gender Equality -> Social Cohesion
    createEdge(sampleNodes[91].id, sampleNodes[106].id, EDGE_TYPES.CONTRIBUTES_TO), // Literacy -> Poverty Reduction
    createEdge(sampleNodes[92].id, sampleNodes[106].id, EDGE_TYPES.CONTRIBUTES_TO), // Numeracy -> Poverty Reduction
    createEdge(sampleNodes[93].id, sampleNodes[105].id, EDGE_TYPES.CONTRIBUTES_TO), // Dropout Reduction -> Community Dev
    createEdge(sampleNodes[94].id, sampleNodes[108].id, EDGE_TYPES.CONTRIBUTES_TO), // Inclusive Education -> Social Cohesion
    createEdge(sampleNodes[95].id, sampleNodes[110].id, EDGE_TYPES.LEADS_TO), // Health Outcomes -> Public Health
    createEdge(sampleNodes[96].id, sampleNodes[113].id, EDGE_TYPES.CONTRIBUTES_TO), // Innovation -> Innovation Economy
    createEdge(sampleNodes[97].id, sampleNodes[111].id, EDGE_TYPES.LEADS_TO), // Civic Engagement -> Democratic Participation
    createEdge(sampleNodes[98].id, sampleNodes[108].id, EDGE_TYPES.CONTRIBUTES_TO), // Social Mobility -> Social Cohesion
    createEdge(sampleNodes[99].id, sampleNodes[105].id, EDGE_TYPES.CONTRIBUTES_TO), // Life Skills -> Community Dev
    createEdge(sampleNodes[100].id, sampleNodes[107].id, EDGE_TYPES.CONTRIBUTES_TO), // Entrepreneurship -> Economic Growth
    createEdge(sampleNodes[101].id, sampleNodes[108].id, EDGE_TYPES.LEADS_TO), // Community Leadership -> Social Cohesion
    createEdge(sampleNodes[102].id, sampleNodes[105].id, EDGE_TYPES.CONTRIBUTES_TO), // Quality of Life -> Community Dev
    createEdge(sampleNodes[103].id, sampleNodes[111].id, EDGE_TYPES.CONTRIBUTES_TO), // Decision Making -> Democratic Part.
    createEdge(sampleNodes[104].id, sampleNodes[114].id, EDGE_TYPES.CONTRIBUTES_TO), // Resilience -> Intergenerational Equity
  ];

  return {
    id: boardId,
    name,
    description: 'A sample Theory of Change for education improvement',
    lists,
    nodes: sampleNodes,
    edges: sampleEdges,
    settings: {
      showLabels: true,
      snapToGrid: false,
      autoLayout: true,
      theme: 'light'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get sample description for a node based on its type
 */
function getNodeDescription(title, type) {
  const descriptions = {
    [NODE_TYPES.ACTIVITY]: 'Key activity to implement the program',
    [NODE_TYPES.OUTPUT]: 'Direct result of program activities',
    [NODE_TYPES.INTERMEDIATE_OUTCOME]: 'Medium-term change resulting from outputs',
    [NODE_TYPES.FINAL_OUTCOME]: 'Long-term change we aim to achieve',
    [NODE_TYPES.IMPACT]: 'Ultimate societal change we contribute to'
  };
  return descriptions[type] || 'Description for this node';
}

/**
 * Create a new list
 */
export function createList(name, color = '#6b7280', order = 0, type = 'intermediate') {
  return {
    id: generateId(),
    name,
    color,
    order,
    type,
    collapsed: false,
    nodeIds: []
  };
}

/**
 * Create a new node
 */
export function createNode(title, listId, type = NODE_TYPES.ACTIVITY) {
  return {
    id: generateId(),
    title,
    description: '',
    listId,
    type,
    tags: [],
    color: '',
    priority: 'medium',
    order: 0, // For sorting within list
    position: { x: 0, y: 0 }, // For visual positioning
    size: { width: 200, height: 100 },
    collapsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Create a new edge
 */
export function createEdge(sourceId, targetId, type = EDGE_TYPES.LEADS_TO) {
  return {
    id: generateId(),
    sourceId,
    targetId,
    type,
    label: EDGE_STYLES[type].label,
    style: EDGE_STYLES[type],
    animated: false,
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate a unique ID
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}