import { useCallback } from 'react';
import { createEdge, EDGE_TYPES } from '../utils/tocModels';

export function useEdgeOperations(board, setBoard) {
  const addEdge = useCallback((sourceId, targetId, type = EDGE_TYPES.LEADS_TO) => {
    // Check if edge already exists
    const existingEdge = board?.edges?.find(edge => 
      edge.sourceId === sourceId && edge.targetId === targetId
    );
    if (existingEdge) return existingEdge.id;

    const newEdge = createEdge(sourceId, targetId, type);
    setBoard(prev => {
      if (!prev?.edges) return prev;
      return {
        ...prev,
        edges: [...prev.edges, newEdge],
        updatedAt: new Date().toISOString()
      };
    });
    return newEdge.id;
  }, [board?.edges, setBoard]);

  const updateEdge = useCallback((edgeId, updates) => {
    setBoard(prev => {
      if (!prev?.edges) return prev;
      return {
        ...prev,
        edges: prev.edges.map(edge => 
          edge.id === edgeId ? { ...edge, ...updates } : edge
        ),
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  const deleteEdge = useCallback((edgeId) => {
    setBoard(prev => {
      if (!prev?.edges) return prev;
      return {
        ...prev,
        edges: prev.edges.filter(edge => edge.id !== edgeId),
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  return {
    addEdge,
    updateEdge,
    deleteEdge
  };
}