import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCausalPathMode,
  setCausalPathNodes,
  addCausalPathFocalNode,
  removeCausalPathFocalNode,
  setCausalPathFocalNodes,
  clearCausalPath
} from '../store/boardSlice';
import {
  selectCausalPathMode,
  selectCausalPathNodesSet,
  selectCausalPathFocalNodes,
  selectAllEdges
} from '../store/selectors';

/**
 * Custom hook for causal path operations and node connectivity
 */
export function useCausalPath(boardInnerRef = null) {
  const dispatch = useDispatch();
  const causalPathMode = useSelector(selectCausalPathMode);
  const causalPathNodes = useSelector(selectCausalPathNodesSet);
  const causalPathFocalNodes = useSelector(selectCausalPathFocalNodes);
  const allEdges = useSelector(selectAllEdges);

  // Get all upstream nodes recursively (nodes that lead to this node)
  const getUpstreamNodes = useCallback((startNodeId, visited = new Set()) => {
    if (visited.has(startNodeId)) return new Set();
    
    visited.add(startNodeId);
    const upstreamNodes = new Set();
    
    // Find all edges where this node is the target
    const incomingEdges = allEdges.filter(edge => edge.targetId === startNodeId);
    
    incomingEdges.forEach(edge => {
      const sourceNodeId = edge.sourceId;
      upstreamNodes.add(sourceNodeId);
      
      // Recursively find upstream nodes of the source
      const recursiveUpstream = getUpstreamNodes(sourceNodeId, visited);
      recursiveUpstream.forEach(nodeId => upstreamNodes.add(nodeId));
    });
    
    return upstreamNodes;
  }, [allEdges]);

  // Get all downstream nodes recursively (nodes that this node leads to)
  const getDownstreamNodes = useCallback((startNodeId, visited = new Set()) => {
    if (visited.has(startNodeId)) return new Set();
    
    visited.add(startNodeId);
    const downstreamNodes = new Set();
    
    // Find all edges where this node is the source
    const outgoingEdges = allEdges.filter(edge => edge.sourceId === startNodeId);
    
    outgoingEdges.forEach(edge => {
      const targetNodeId = edge.targetId;
      downstreamNodes.add(targetNodeId);
      
      // Recursively find downstream nodes of the target
      const recursiveDownstream = getDownstreamNodes(targetNodeId, visited);
      recursiveDownstream.forEach(nodeId => downstreamNodes.add(nodeId));
    });
    
    return downstreamNodes;
  }, [allEdges]);

  // Get all connected nodes: upstream + node + downstream
  const getAllConnectedNodes = useCallback((startNodeId) => {
    const upstreamNodes = getUpstreamNodes(startNodeId);
    const downstreamNodes = getDownstreamNodes(startNodeId);
    
    // Return union: [upstream, node, downstream]
    const allConnected = new Set();
    
    // Add all upstream nodes
    upstreamNodes.forEach(nodeId => allConnected.add(nodeId));
    
    // Add the starting node itself
    allConnected.add(startNodeId);
    
    // Add all downstream nodes
    downstreamNodes.forEach(nodeId => allConnected.add(nodeId));
    
    return allConnected;
  }, [getUpstreamNodes, getDownstreamNodes]);

  // Enter causal path mode for a specific node
  const enterCausalPathMode = useCallback((nodeId) => {
    const connectedNodes = getAllConnectedNodes(nodeId);
    let result;
    if (causalPathMode && causalPathNodes && causalPathNodes.size > 0) {
      // Intersection of existing set and the new connected set
      result = new Set([...connectedNodes].filter(id => causalPathNodes.has(id)));
    } else {
      result = new Set(connectedNodes);
    }
    // Always include focal nodes themselves for visibility
    result.add(nodeId);
    dispatch(setCausalPathNodes(Array.from(result)));
    dispatch(addCausalPathFocalNode(nodeId));
    const wasActive = causalPathMode;
    dispatch(setCausalPathMode(true));

    if (!wasActive) {
      setTimeout(() => {
        if (boardInnerRef && boardInnerRef.current) {
          boardInnerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      }, 0);
    }
  }, [getAllConnectedNodes, dispatch, causalPathMode, causalPathNodes, boardInnerRef]);

  // Remove a focal node; recompute intersection; exit mode only when none remain
  const removeCausalFocal = useCallback((nodeId) => {
    const current = Array.isArray(causalPathFocalNodes) ? causalPathFocalNodes : [];
    const nextFocals = current.filter(id => id !== nodeId);
    if (nextFocals.length === 0) {
      dispatch(clearCausalPath());
      return;
    }
    // Intersect connected sets of all remaining focal nodes
    let intersection = null;
    nextFocals.forEach(fid => {
      const setForFocal = getAllConnectedNodes(fid);
      if (intersection === null) {
        intersection = new Set(setForFocal);
      } else {
        intersection = new Set([...intersection].filter(x => setForFocal.has(x)));
      }
    });
    // Always include the focal nodes themselves
    nextFocals.forEach(fid => intersection.add(fid));
    dispatch(setCausalPathFocalNodes(nextFocals));
    dispatch(setCausalPathNodes(Array.from(intersection)));
    dispatch(setCausalPathMode(true));
  }, [causalPathFocalNodes, getAllConnectedNodes, dispatch]);

  // Exit causal path mode
  const exitCausalPathMode = useCallback((nodeId) => {
    // If a nodeId is provided, remove only that focal and recompute
    if (typeof nodeId !== 'undefined' && nodeId !== null) {
      // Delegate to single-focal removal helper
      removeCausalFocal(nodeId);
      return;
    }
    // No node provided -> clear all
    dispatch(clearCausalPath());
  }, [dispatch, removeCausalFocal]);

  return {
    causalPathMode,
    causalPathNodes,
    causalPathFocalNodes,
    getUpstreamNodes,
    getDownstreamNodes,
    getAllConnectedNodes,
    enterCausalPathMode,
    exitCausalPathMode
  };
}
