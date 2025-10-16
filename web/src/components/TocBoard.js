'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import TocList from './TocList';
import TocNode from './TocNode';
import TocToolbar from './TocToolbar';
import TocEdges from './TocEdges';
import TocEdgesLegend from './TocEdgesLegend';
import { createBoard, createNode, createList, createEdge, NODE_TYPES, EDGE_TYPES } from '../utils/tocModels';
import { boardsApi } from '../utils/boardsApi';
import { transformBoardData } from '../utils/boardTransformer';
import { tocBoardStyles } from '../styles/TocBoard.styles';
import { useLoading } from '../context/LoadingContext';
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
  addCausalPathFocalNode,
  removeCausalPathFocalNode,
  setCausalPathFocalNodes,
  clearCausalPath,
  setSelectedTags,
  setTagFilterMode,
  setTagFilterNodes,
  clearTagFilter
} from '../store/boardSlice';
import {
  selectBoard,
  selectLinkMode,
  selectLinkSource,
  selectDraggableNodesSet,
  selectCausalPathMode,
  selectCausalPathNodesSet,
  selectCausalPathFocalNodes,
  selectAllNodes,
  selectAllEdges,
  selectSelectedTags,
  selectTagFilterMode,
  selectTagFilterNodesSet
} from '../store/selectors';

export default function TocBoard({ boardId = 'default' }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const boardInnerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { startLoading, stopLoading } = useLoading();
  
  // Get state from Redux
  const board = useSelector(selectBoard);
  const linkMode = useSelector(selectLinkMode);
  const linkSource = useSelector(selectLinkSource);
  const draggableNodes = useSelector(selectDraggableNodesSet);
  const causalPathMode = useSelector(selectCausalPathMode);
  const causalPathNodes = useSelector(selectCausalPathNodesSet);
  const causalPathFocalNodes = useSelector(selectCausalPathFocalNodes);
  const activeId = useSelector(state => state.board.activeId);
  const dragType = useSelector(state => state.board.dragType);
  const allNodes = useSelector(selectAllNodes);
  const allEdges = useSelector(selectAllEdges);
  const selectedTags = useSelector(selectSelectedTags);
  const tagFilterMode = useSelector(selectTagFilterMode);
  const tagFilterNodes = useSelector(selectTagFilterNodesSet);


  useEffect(() => {
    // Load board data from server
    async function loadBoard() {
      try {
        setLoading(true);
        setError(null);
        startLoading();

        if (!boardId || boardId === 'default') {
          // If no boardId provided, use dummy data for now
          const initialBoard = createBoard();
          dispatch(initializeBoard(initialBoard));
        } else {
          // Fetch board data from server
          const backendData = await boardsApi.getBoardData(boardId);
          console.log('Backend data userRole:', backendData.userRole);
          console.log('Backend edgeAssumptions:', backendData.edgeAssumptions);
          
          // Transform backend data to frontend format
          const transformedBoard = transformBoardData(backendData);
          console.log('Transformed board userRole:', transformedBoard.userRole);
          console.log('Transformed board edges with assumptions:', transformedBoard.edges.filter(e => e.assumptions?.length > 0));
          
          // Initialize board in Redux store
          dispatch(initializeBoard(transformedBoard));
        }
      } catch (err) {
        setError(err.message || 'Failed to load board');
      } finally {
        setLoading(false);
        stopLoading();
      }
    }

    // Load the board (this will reinitialize if boardId changes)
    loadBoard();
  }, [boardId, dispatch]);

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
    
    // Filter nodes in tag filter mode
    if (tagFilterMode) {
      nodes = nodes.filter(node => tagFilterNodes.has(node.id));
    }
    
    return nodes;
  }, [allNodes, causalPathMode, causalPathNodes, tagFilterMode, tagFilterNodes]);

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
        if (boardInnerRef.current) {
          boardInnerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      }, 0);
    }
  }, [getAllConnectedNodes, dispatch, causalPathMode, causalPathNodes]);

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

  // Tag filtering functions
  const getAllTags = useCallback(() => {
    const tagsSet = new Set();
    allNodes.forEach(node => {
      if (node.tags && Array.isArray(node.tags)) {
        node.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [allNodes]);

  // Initialize tags from URL on mount (after helpers are defined)
  useEffect(() => {
    if (router.isReady && router.query.tags) {
      const tagsParam = router.query.tags;
      let tagsFromUrl = [];
      if (Array.isArray(tagsParam)) {
        tagsFromUrl = tagsParam;
      } else if (typeof tagsParam === 'string') {
        tagsFromUrl = tagsParam.split('|').filter(tag => tag.length > 0);
      }
      if (tagsFromUrl.length > 0) {
        dispatch(setSelectedTags(tagsFromUrl));
        // Apply filter immediately
        const nodesWithTags = new Set();
        allNodes.forEach(node => {
          if (node.tags && node.tags.some(tag => tagsFromUrl.includes(tag))) {
            nodesWithTags.add(node.id);
            const connectedNodes = getAllConnectedNodes(node.id);
            connectedNodes.forEach(nodeId => nodesWithTags.add(nodeId));
          }
        });
        dispatch(setTagFilterNodes(Array.from(nodesWithTags)));
        dispatch(setTagFilterMode(true));
      }
    }
  }, [router.isReady, router.query.tags, dispatch, allNodes, getAllConnectedNodes]);

  const handleTagsChange = useCallback((tags) => {
    dispatch(setSelectedTags(tags));
    
    // Update URL with selected tags (pipe-separated)
    if (router.isReady) {
      const currentQuery = { ...router.query };
      if (tags.length === 0) {
        delete currentQuery.tags;
      } else {
        // Join tags with pipe separator: "Education|Health|Agriculture"
        currentQuery.tags = tags.join('|');
      }
      router.push(
        {
          pathname: router.pathname,
          query: currentQuery,
        },
        undefined,
        { shallow: true } // Don't reload the page
      );
    }
    
    if (tags.length === 0) {
      dispatch(clearTagFilter());
      return;
    }

    // Find all nodes with selected tags
    const nodesWithTags = new Set();
    allNodes.forEach(node => {
      if (node.tags && node.tags.some(tag => tags.includes(tag))) {
        nodesWithTags.add(node.id);
        
        // Add all connected nodes (causal path)
        const connectedNodes = getAllConnectedNodes(node.id);
        connectedNodes.forEach(nodeId => nodesWithTags.add(nodeId));
      }
    });

    dispatch(setTagFilterNodes(Array.from(nodesWithTags)));
    dispatch(setTagFilterMode(true));
    
    // Scroll to top when entering tag filter mode
    setTimeout(() => {
      if (boardInnerRef.current) {
        boardInnerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }, 0);
  }, [allNodes, getAllConnectedNodes, dispatch, router]);

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
  }, [allEdges, allNodes, board, causalPathMode, causalPathNodes, tagFilterMode, tagFilterNodes]);

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
      if (window.getSelection) {
        try { window.getSelection().removeAllRanges(); } catch (_) {}
      }
      if (linkMode) {
        exitLinkMode();
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{
        ...tocBoardStyles.container,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p>Loading Theory of Change Board...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{
        ...tocBoardStyles.container,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontSize: '1.2rem',
        color: '#ef4444'
      }}>
        <p style={{ marginBottom: '1rem' }}>Error loading board: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

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
        Initializing board...
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
        selectedTags={selectedTags}
        onTagsChange={handleTagsChange}
        allTags={getAllTags()}
        boardId={boardId}
        onExitCausalMode={() => exitCausalPathMode()}
        showExitCausal={Boolean(causalPathMode && Array.isArray(causalPathFocalNodes) && causalPathFocalNodes.length > 0)}
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
              boardId={boardId}
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