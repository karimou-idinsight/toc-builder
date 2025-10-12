import { useCallback } from 'react';
import { createNode, NODE_TYPES } from '../utils/tocModels';

export function useNodeOperations(board, setBoard) {
  const addNode = useCallback((title, listId, type = NODE_TYPES.ACTIVITY) => {
    setBoard(prev => {
      if (!prev) return prev;
      const existingNodesInList = prev.nodes.filter(node => node.listId === listId);
      const maxOrder = existingNodesInList.length > 0 
        ? Math.max(...existingNodesInList.map(node => node.order || 0))
        : -1;
      
      const newNode = {
        ...createNode(title, listId, type),
        order: maxOrder + 1
      };
      
      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  const updateNode = useCallback((nodeId, updates) => {
    setBoard(prev => {
      if (!prev?.nodes) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === nodeId ? { ...node, ...updates, updatedAt: new Date().toISOString() } : node
        ),
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  const deleteNode = useCallback((nodeId) => {
    setBoard(prev => {
      if (!prev?.nodes || !prev?.edges) return prev;
      return {
        ...prev,
        nodes: prev.nodes.filter(node => node.id !== nodeId),
        edges: prev.edges.filter(edge => edge.sourceId !== nodeId && edge.targetId !== nodeId),
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  const reorderNodes = useCallback((draggedNodeId, targetNodeId, listId) => {
    setBoard(prev => {
      if (!prev?.nodes) return prev;
      const nodes = [...prev.nodes];
      const listNodes = nodes.filter(node => node.listId === listId);
      const otherNodes = nodes.filter(node => node.listId !== listId);
      
      const draggedIndex = listNodes.findIndex(n => n.id === draggedNodeId);
      const targetIndex = listNodes.findIndex(n => n.id === targetNodeId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      // Remove dragged node and insert at target position
      const [draggedNode] = listNodes.splice(draggedIndex, 1);
      listNodes.splice(targetIndex, 0, draggedNode);

      // Update order values for nodes in this list
      listNodes.forEach((node, index) => {
        node.order = index;
        node.updatedAt = new Date().toISOString();
      });

      return {
        ...prev,
        nodes: [...otherNodes, ...listNodes],
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  const moveNode = useCallback((nodeId, targetListId, position = null) => {
    setBoard(prev => {
      if (!prev?.nodes) return prev;
      const targetListNodes = prev.nodes.filter(node => node.listId === targetListId);
      const maxOrder = targetListNodes.length > 0 
        ? Math.max(...targetListNodes.map(node => node.order || 0))
        : -1;
      
      return {
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === nodeId 
            ? { 
                ...node, 
                listId: targetListId,
                order: position !== null ? position : maxOrder + 1,
                updatedAt: new Date().toISOString() 
              } 
            : node
        ),
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  const duplicateNode = useCallback((nodeId) => {
    const originalNode = board?.nodes.find(node => node.id === nodeId);
    if (!originalNode) return null;

    const newNode = {
      ...createNode(originalNode.title + ' (Copy)', originalNode.listId, originalNode.type),
      description: originalNode.description,
      tags: [...originalNode.tags],
      color: originalNode.color,
      priority: originalNode.priority
    };

    setBoard(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toISOString()
    }));

    return newNode.id;
  }, [board?.nodes, setBoard]);

  return {
    addNode,
    updateNode,
    deleteNode,
    reorderNodes,
    moveNode,
    duplicateNode
  };
}