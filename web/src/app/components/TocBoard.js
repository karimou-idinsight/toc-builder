'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import TocList from './TocList';
import TocNode from './TocNode';
import TocToolbar from './TocToolbar';
import TocEdges from './TocEdges';
import TocEdgesLegend from './TocEdgesLegend';
import { createBoard, createNode, createList, createEdge, NODE_TYPES, EDGE_TYPES } from '../utils/tocModels';
import { tocBoardStyles } from '../styles/TocBoard.styles';
import {
  initializeBoard,
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
  setLinkMode,
  setLinkSource,
  setActiveId,
  setDragType,
  toggleNodeDraggable,
  setCausalPathMode,
  setCausalPathNodes,
  setCausalPathFocalNode,
  clearCausalPath
} from '../store/boardSlice';
import {
  selectBoard,
  selectLinkMode,
  selectLinkSource,
  selectDraggableNodesSet,
  selectCausalPathMode,
  selectCausalPathNodesSet,
  selectCausalPathFocalNode,
  selectAllNodes,
  selectAllEdges
} from '../store/selectors';

export default function TocBoard({ boardId = 'default' }) {
  const dispatch = useDispatch();
  const boardInnerRef = useRef(null);
  
  // Get state from Redux
  const board = useSelector(selectBoard);
  const linkMode = useSelector(selectLinkMode);
  const linkSource = useSelector(selectLinkSource);
  const draggableNodes = useSelector(selectDraggableNodesSet);
  const causalPathMode = useSelector(selectCausalPathMode);
  const causalPathNodes = useSelector(selectCausalPathNodesSet);
  const causalPathFocalNode = useSelector(selectCausalPathFocalNode);
  const activeId = useSelector(state => state.board.activeId);
  const dragType = useSelector(state => state.board.dragType);
  const allNodes = useSelector(selectAllNodes);
  const allEdges = useSelector(selectAllEdges);

  useEffect(() => {
    // Initialize board with default data if not already initialized
    if (!board) {
      const initialBoard = createBoard();
      console.log('Initial board created:', initialBoard);
      dispatch(initializeBoard(initialBoard));
    }
  }, [board, dispatch]);

  // Wrapper functions for Redux actions
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

  const addNodeWrapper = useCallback((title, listId, type = NODE_TYPES.ACTIVITY) => {
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

  const addEdgeWrapper = useCallback((sourceId, targetId, type = EDGE_TYPES.LEADS_TO) => {
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

  // Link mode operations
  const startLinkMode = useCallback(() => {
    dispatch(setLinkMode(true));
    dispatch(setLinkSource(null));
  }, [dispatch]);

  const exitLinkMode = useCallback(() => {
    dispatch(setLinkMode(false));
    dispatch(setLinkSource(null));
  }, [dispatch]);

  const handleNodeClick = useCallback((nodeId) => {
    if (linkMode) {
      if (!linkSource) {
        dispatch(setLinkSource(nodeId));
      } else if (linkSource !== nodeId) {
        addEdgeWrapper(linkSource, nodeId);
        dispatch(setLinkSource(null));
        dispatch(setLinkMode(false));
      }
    }
  }, [linkMode, linkSource, addEdgeWrapper, dispatch]);

  const handleToggleNodeDraggable = useCallback((nodeId, isDraggable) => {
    dispatch(toggleNodeDraggable({ nodeId, isDraggable }));
  }, [dispatch]);

  const handleNodeStartLinking = useCallback((nodeId) => {
    dispatch(setLinkMode(true));
    dispatch(setLinkSource(nodeId));
  }, [dispatch]);

  // Utility functions
  const getNodesByListId = useCallback((listId) => {
    let nodes = allNodes
      .filter(node => node.listId === listId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Filter nodes in causal path mode
    if (causalPathMode) {
      nodes = nodes.filter(node => causalPathNodes.has(node.id));
    }
    
    return nodes;
  }, [allNodes, causalPathMode, causalPathNodes]);

  const getConnectedNodes = useCallback((nodeId) => {
    const connectedEdges = allEdges.filter(edge => 
      edge.sourceId === nodeId || edge.targetId === nodeId
    );
    const connectedNodeIds = connectedEdges.flatMap(edge => [edge.sourceId, edge.targetId]);
    return allNodes.filter(node => connectedNodeIds.includes(node.id));
  }, [allEdges, allNodes]);

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

  // Causal path mode functions
  const enterCausalPathMode = useCallback((nodeId) => {
    const connectedNodes = getAllConnectedNodes(nodeId);
    dispatch(setCausalPathNodes(Array.from(connectedNodes)));
    dispatch(setCausalPathFocalNode(nodeId));
    dispatch(setCausalPathMode(true));
    
    // Scroll to top when entering causal path mode
    setTimeout(() => {
      if (boardInnerRef.current) {
        boardInnerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }, 0);
  }, [getAllConnectedNodes, dispatch]);

  const exitCausalPathMode = useCallback(() => {
    dispatch(clearCausalPath());
  }, [dispatch]);

  // Filter edges for causal path mode - only show edges between nodes in the causal path
  // Also filter out backwards edges (edges that go from right to left across lists)
  const getFilteredEdges = useCallback(() => {
    let filteredEdges = allEdges;
    
    // Filter for causal path mode
    if (causalPathMode && causalPathNodes.size > 0) {
      filteredEdges = filteredEdges.filter(edge => 
        causalPathNodes.has(edge.sourceId) && causalPathNodes.has(edge.targetId)
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
  }, [allEdges, allNodes, board, causalPathMode, causalPathNodes]);

  const handleDragStart = (event) => {
    dispatch(setActiveId(event.active.id));
    dispatch(setDragType(event.active.data.current?.type || 'node'));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      dispatch(setActiveId(null));
      dispatch(setDragType(null));
      return;
    }

    if (dragType === 'list') {
      if (active.id !== over.id) {
        reorderLists(active.id, over.id);
      }
    } else if (dragType === 'node') {
      const activeListId = active.data.current?.listId;
      const overListId = over.data.current?.listId || over.id;
      
      if (activeListId && overListId) {
        if (activeListId === overListId) {
          // Reordering within the same list
          if (active.id !== over.id) {
            reorderNodes(active.id, over.id, activeListId);
          }
        } else {
          // Moving between different lists
          moveNode(active.id, overListId);
        }
      }
      
      // Exit draggable mode for the moved node
      dispatch(toggleNodeDraggable({ nodeId: active.id, isDraggable: false }));
    }

    dispatch(setActiveId(null));
    dispatch(setDragType(null));
  };

  const handleAddIntermediateOutcome = () => {
    const name = prompt('Enter intermediate outcome name:');
    if (name) {
      addIntermediateOutcome(name);
    } else if (name === '') {
      // User entered empty string, use default name
      addIntermediateOutcome();
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      clearSelection();
      if (linkMode) {
        exitLinkMode();
      }
    }
  };

  // Show loading state if board is not ready
  if (!board) {
    return (
      <div style={{
        ...tocBoardStyles.container,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        Loading Theory of Change Board...
      </div>
    );
  }

  return (
    <div style={tocBoardStyles.container} onClick={handleBackgroundClick}>
      <TocToolbar
        linkMode={linkMode}
        onStartLinkMode={startLinkMode}
        onExitLinkMode={exitLinkMode}
        onAddIntermediateOutcome={handleAddIntermediateOutcome}
      />

      <div style={tocBoardStyles.content}>
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div ref={boardInnerRef} style={tocBoardStyles.boardInner}>
            <SortableContext 
              items={board?.lists?.map(list => list.id) || []} 
              strategy={horizontalListSortingStrategy}
            >
              {[...(board?.lists || [])]
                .sort((a, b) => a.order - b.order)
                .map((list) => (
                  <TocList
                    key={list.id}
                    list={list}
                    nodes={getNodesByListId(list.id) || []}
                    onUpdateList={updateList}
                    onDeleteList={deleteList}
                    onAddNode={(title, type) => addNodeWrapper(title, list.id, type)}
                    onUpdateNode={updateNode}
                    onDeleteNode={deleteNode}
                    onDuplicateNode={duplicateNode}
                    onNodeClick={handleNodeClick}
                    onExitCausalPathMode={exitCausalPathMode}
                    getConnectedNodes={getConnectedNodes}
                    onToggleNodeDraggable={handleToggleNodeDraggable}
                    onStartLinking={handleNodeStartLinking}
                    onShowCausalPath={enterCausalPathMode}
                    onAddEdge={addEdgeWrapper}
                    onDeleteEdge={deleteEdge}
                  />
                ))}
            </SortableContext>
            
            <TocEdges
              edges={getFilteredEdges()}
              onUpdateEdge={updateEdge}
              onDeleteEdge={deleteEdge}
            />
          </div>

          <DragOverlay>
            {activeId && dragType === 'node' ? (
              <TocNode
                node={allNodes.find(n => n.id === activeId)}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      {/* Fixed legend that doesn't scroll with content */}
      <TocEdgesLegend visible={allEdges.length > 0} />
    </div>
  );
}