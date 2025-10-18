import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNode, createList, createEdge, NODE_TYPES, EDGE_TYPES } from '../utils/tocModels';
import {
  addList,
  updateList as updateListAction,
  deleteList as deleteListAction,
  reorderLists as reorderListsAction,
  addNode as addNodeAction,
  updateNode as updateNodeAction,
  deleteNode as deleteNodeAction,
  reorderNodes as reorderNodesAction,
  moveNode as moveNodeAction,
  addEdge as addEdgeAction,
  updateEdge as updateEdgeAction,
  deleteEdge as deleteEdgeAction,
  toggleNodeDraggable as toggleNodeDraggableAction
} from '../store/boardSlice';
import { selectAllNodes, selectAllEdges, selectBoard } from '../store/selectors';

/**
 * Custom hook for board operations (CRUD operations on lists, nodes, edges)
 */
export function useBoardOperations() {
  const dispatch = useDispatch();
  const allNodes = useSelector(selectAllNodes);
  const allEdges = useSelector(selectAllEdges);
  const board = useSelector(selectBoard);

  // List operations
  const addIntermediateOutcome = useCallback((name) => {
    if (!board?.lists) return;
    const intermediateOutcomeName = name || `Intermediate Outcomes ${board.lists.filter(l => l.type === 'intermediate').length + 1}`;
    const newList = createList(intermediateOutcomeName, '#f59e0b', 0, 'intermediate');
    
    const finalOutcomesIndex = board.lists.findIndex(l => l.name === 'Final Outcomes' || l.type === 'fixed' && l.order >= 3);
    const insertIndex = finalOutcomesIndex !== -1 ? finalOutcomesIndex : board.lists.length - 2;
    newList.order = insertIndex;
    
    dispatch(addList(newList));
    return newList.id;
  }, [board, dispatch]);

  const updateList = useCallback((listId, updates) => {
    dispatch(updateListAction({ listId, updates }));
  }, [dispatch]);

  const deleteList = useCallback((listId) => {
    dispatch(deleteListAction(listId));
  }, [dispatch]);

  const reorderLists = useCallback((draggedId, targetId) => {
    dispatch(reorderListsAction({ draggedId, targetId }));
  }, [dispatch]);

  // Node operations
  const addNode = useCallback((title, listId, type = NODE_TYPES.ACTIVITY) => {
    const existingNodesInList = allNodes.filter(node => node.listId === listId);
    const maxOrder = existingNodesInList.length > 0 
      ? Math.max(...existingNodesInList.map(node => node.order || 0))
      : -1;
    
    const newNode = {
      ...createNode(title, listId, type),
      order: maxOrder + 1
    };
    
    dispatch(addNodeAction(newNode));
  }, [allNodes, dispatch]);

  const updateNode = useCallback((nodeId, updates) => {
    dispatch(updateNodeAction({ nodeId, updates }));
  }, [dispatch]);

  const deleteNode = useCallback((nodeId) => {
    dispatch(deleteNodeAction(nodeId));
  }, [dispatch]);

  const reorderNodes = useCallback((draggedId, targetId, listId) => {
    dispatch(reorderNodesAction({ listId, draggedId, targetId }));
  }, [dispatch]);

  const moveNode = useCallback((nodeId, targetListId) => {
    dispatch(moveNodeAction({ nodeId, targetListId }));
  }, [dispatch]);

  const duplicateNode = useCallback((nodeId) => {
    const originalNode = allNodes.find(node => node.id === nodeId);
    if (!originalNode) return null;

    const newNode = {
      ...createNode(originalNode.title + ' (Copy)', originalNode.listId, originalNode.type),
      description: originalNode.description,
      tags: [...originalNode.tags],
      color: originalNode.color,
      priority: originalNode.priority
    };

    dispatch(addNodeAction(newNode));
    return newNode.id;
  }, [allNodes, dispatch]);

  const toggleNodeDraggable = useCallback((nodeId, isDraggable) => {
    dispatch(toggleNodeDraggableAction({ nodeId, isDraggable }));
  }, [dispatch]);

  // Edge operations
  const addEdge = useCallback((sourceId, targetId, type = EDGE_TYPES.LEADS_TO) => {
    const existingEdge = allEdges.find(edge => 
      edge.sourceId === sourceId && edge.targetId === targetId
    );
    if (existingEdge) return existingEdge.id;

    const newEdge = createEdge(sourceId, targetId, type);
    dispatch(addEdgeAction(newEdge));
    return newEdge.id;
  }, [allEdges, dispatch]);

  const updateEdge = useCallback((edgeId, updates) => {
    dispatch(updateEdgeAction({ edgeId, updates }));
  }, [dispatch]);

  const deleteEdge = useCallback((edgeId) => {
    dispatch(deleteEdgeAction(edgeId));
  }, [dispatch]);

  return {
    // List operations
    addIntermediateOutcome,
    updateList,
    deleteList,
    reorderLists,
    
    // Node operations
    addNode,
    updateNode,
    deleteNode,
    reorderNodes,
    moveNode,
    duplicateNode,
    toggleNodeDraggable,
    
    // Edge operations
    addEdge,
    updateEdge,
    deleteEdge
  };
}
