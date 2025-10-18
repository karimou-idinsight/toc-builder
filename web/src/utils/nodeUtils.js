/**
 * Utility functions for node operations and filtering
 */

/**
 * Get nodes by list ID with optional filtering
 */
export function getNodesByListId(allNodes, listId, causalPathMode, causalPathNodes, tagFilterMode, tagFilterNodes) {
  let nodes = allNodes
    .filter(node => node.listId === listId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Filter nodes in causal path mode
  if (causalPathMode) {
    nodes = nodes.filter(node => causalPathNodes.has(node.id));
  }
  
  // Filter nodes in tag filter mode
  if (tagFilterMode) {
    nodes = nodes.filter(node => tagFilterNodes.has(node.id));
  }
  
  return nodes;
}

/**
 * Get connected nodes for a given node ID
 */
export function getConnectedNodes(nodeId, allEdges, allNodes) {
  const connectedEdges = allEdges.filter(edge => 
    edge.sourceId === nodeId || edge.targetId === nodeId
  );
  const connectedNodeIds = connectedEdges.flatMap(edge => [edge.sourceId, edge.targetId]);
  return allNodes.filter(node => connectedNodeIds.includes(node.id));
}

/**
 * Filter edges based on causal path and tag filter modes
 */
export function getFilteredEdges(allEdges, allNodes, board, causalPathMode, causalPathNodes, tagFilterMode, tagFilterNodes) {
  let filteredEdges = allEdges;
  
  // Filter for causal path mode
  if (causalPathMode && causalPathNodes.size > 0) {
    filteredEdges = filteredEdges.filter(edge => 
      causalPathNodes.has(edge.sourceId) && causalPathNodes.has(edge.targetId)
    );
  }
  
  // Filter for tag filter mode
  if (tagFilterMode && tagFilterNodes.size > 0) {
    filteredEdges = filteredEdges.filter(edge => 
      tagFilterNodes.has(edge.sourceId) && tagFilterNodes.has(edge.targetId)
    );
  }
  
  // Filter out backwards edges (edges going from a later list to an earlier list)
  filteredEdges = filteredEdges.filter(edge => {
    const sourceNode = allNodes.find(n => n.id === edge.sourceId);
    const targetNode = allNodes.find(n => n.id === edge.targetId);
    
    if (!sourceNode || !targetNode) return false;
    
    const sourceList = board?.lists?.find(l => l.id === sourceNode.listId);
    const targetList = board?.lists?.find(l => l.id === targetNode.listId);
    
    if (!sourceList || !targetList) return false;
    
    // Only show edges that go forward (left to right) or within the same list
    return sourceList.order <= targetList.order;
  });
  
  return filteredEdges;
}
