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

  // Create sample nodes
  const sampleNodes = [
    // Activities
    createNode('Community Training Workshops', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Teacher Professional Development', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Digital Learning Platform Development', 'activities', NODE_TYPES.ACTIVITY),
    createNode('Curriculum Design and Review', 'activities', NODE_TYPES.ACTIVITY),
    
    // Outputs
    createNode('500 Teachers Trained', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Online Learning Platform Launched', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Updated Curriculum Materials', 'outputs', NODE_TYPES.OUTPUT),
    createNode('Community Learning Centers Established', 'outputs', NODE_TYPES.OUTPUT),
    
    // Intermediate Outcomes
    createNode('Improved Teaching Quality', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Increased Student Engagement', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    createNode('Enhanced Digital Literacy', 'intermediate-1', NODE_TYPES.INTERMEDIATE_OUTCOME),
    
    // Final Outcomes
    createNode('Improved Student Learning Outcomes', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Reduced Educational Inequality', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    createNode('Increased School Completion Rates', 'final-outcomes', NODE_TYPES.FINAL_OUTCOME),
    
    // Impact
    createNode('Sustainable Community Development', 'impact', NODE_TYPES.IMPACT),
    createNode('Reduced Poverty in Target Communities', 'impact', NODE_TYPES.IMPACT)
  ];

  // Set proper order for nodes within each list
  sampleNodes.forEach((node, index) => {
    const listNodes = sampleNodes.filter(n => n.listId === node.listId);
    const nodeIndexInList = listNodes.findIndex(n => n.id === node.id);
    node.order = nodeIndexInList;
    node.description = getNodeDescription(node.title, node.type);
  });

  // Create some sample edges to show relationships
  const sampleEdges = [
    createEdge(sampleNodes[0].id, sampleNodes[4].id, EDGE_TYPES.LEADS_TO), // Training -> Teachers Trained
    createEdge(sampleNodes[1].id, sampleNodes[4].id, EDGE_TYPES.LEADS_TO), // Prof Dev -> Teachers Trained
    createEdge(sampleNodes[2].id, sampleNodes[5].id, EDGE_TYPES.LEADS_TO), // Platform Dev -> Platform Launched
    createEdge(sampleNodes[4].id, sampleNodes[8].id, EDGE_TYPES.LEADS_TO), // Teachers Trained -> Teaching Quality
    createEdge(sampleNodes[5].id, sampleNodes[10].id, EDGE_TYPES.LEADS_TO), // Platform -> Digital Literacy
    createEdge(sampleNodes[8].id, sampleNodes[11].id, EDGE_TYPES.LEADS_TO), // Teaching Quality -> Learning Outcomes
    createEdge(sampleNodes[11].id, sampleNodes[15].id, EDGE_TYPES.CONTRIBUTES_TO), // Learning -> Development
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