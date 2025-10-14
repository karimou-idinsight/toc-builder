/**
 * Transform backend board data to frontend TOC model format
 */

import { EDGE_STYLES } from './tocModels';

/**
 * Transform full board data from backend to frontend format
 * Backend structure (actual format from API):
 * {
 *   id, title, description, list_ids, settings, ..., 
 *   lists: [{ id, name, color, type, node_ids, ... }],
 *   nodes: [{ id, title, description, type, tags, ... }],
 *   edges: [{ id, source_node_id, target_node_id, type, label, ... }]
 * }
 * 
 * Frontend structure:
 * {
 *   id, name, description, lists, nodes, edges, settings, ...
 * }
 */
export function transformBoardData(backendData) {
    console
  // Validate input
  if (!backendData) {
    console.error('transformBoardData: backendData is null or undefined');
    throw new Error('Invalid board data');
  }

  // Backend returns board data with lists/nodes/edges merged in, not separated
  const { lists, nodes, edges, ...boardFields } = backendData;
  const board = boardFields;

  // Validate required fields
  if (!board) {
    console.error('transformBoardData: board is missing', backendData);
    throw new Error('Board data is missing');
  }

  if (!Array.isArray(lists)) {
    console.error('transformBoardData: lists is not an array', lists);
    throw new Error('Lists data is invalid');
  }

  if (!Array.isArray(nodes)) {
    console.error('transformBoardData: nodes is not an array', nodes);
    throw new Error('Nodes data is invalid');
  }

  if (!Array.isArray(edges)) {
    console.error('transformBoardData: edges is not an array', edges);
    throw new Error('Edges data is invalid');
  }

  // Transform lists to frontend format with proper ordering
  const transformedLists = (board.list_ids || []).map((listId, index) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return null;

    return {
      id: String(list.id),
      name: list.name,
      color: list.color,
      order: index,
      type: list.type,
      collapsed: false,
      nodeIds: (list.node_ids || []).map(String)
    };
  }).filter(Boolean);

  // Create a map of nodes by ID for quick lookup
  const nodesMap = new Map();
  nodes.forEach(node => {
    nodesMap.set(node.id, node);
  });

  // Transform nodes to frontend format
  const transformedNodes = [];
  
  // Process nodes in the order they appear in lists
  transformedLists.forEach(list => {
    list.nodeIds.forEach((nodeId, nodeIndex) => {
      const backendNode = nodesMap.get(Number(nodeId));
      if (!backendNode) return;

      transformedNodes.push({
        id: String(backendNode.id),
        title: backendNode.title,
        description: backendNode.description || '',
        listId: String(list.id),
        type: backendNode.type,
        tags: backendNode.tags || [],
        color: '', // Generated at render time
        priority: 'medium', // Not stored in backend
        order: nodeIndex,
        position: { x: 0, y: 0 }, // Calculated at render time
        size: { width: 200, height: 100 }, // Default size
        collapsed: false,
        createdAt: backendNode.created_at,
        updatedAt: backendNode.updated_at
      });
    });
  });

  // Transform edges to frontend format
  const transformedEdges = edges.map(edge => ({
    id: String(edge.id),
    sourceId: String(edge.source_node_id),
    targetId: String(edge.target_node_id),
    type: edge.type,
    label: edge.label || EDGE_STYLES[edge.type]?.label || '',
    style: EDGE_STYLES[edge.type] || {},
    animated: false,
    createdAt: edge.created_at
  }));

  // Return transformed board
  return {
    id: String(board.id),
    name: board.title,
    description: board.description || '',
    lists: transformedLists,
    nodes: transformedNodes,
    edges: transformedEdges,
    settings: board.settings || {
      showLabels: true,
      snapToGrid: false,
      autoLayout: true,
      theme: 'light'
    },
    createdAt: board.created_at,
    updatedAt: board.updated_at
  };
}

/**
 * Transform frontend list data to backend format
 */
export function transformListToBackend(list) {
  return {
    name: list.name,
    color: list.color,
    type: list.type,
    node_ids: list.nodeIds?.map(Number) || []
  };
}

/**
 * Transform frontend node data to backend format
 */
export function transformNodeToBackend(node) {
  return {
    title: node.title,
    description: node.description,
    type: node.type,
    tags: node.tags || []
  };
}

/**
 * Transform frontend edge data to backend format
 */
export function transformEdgeToBackend(edge) {
  return {
    source_node_id: Number(edge.sourceId),
    target_node_id: Number(edge.targetId),
    type: edge.type,
    label: edge.label
  };
}

