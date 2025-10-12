'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import TocList from './TocList';
import TocNode from './TocNode';
import TocToolbar from './TocToolbar';
import TocEdges from './TocEdges';
import TocEdgesLegend from './TocEdgesLegend';
import { createBoard } from '../utils/tocModels';
import { tocBoardStyles } from '../styles/TocBoard.styles';
import { useListOperations } from '../hooks/useListOperations';
import { useNodeOperations } from '../hooks/useNodeOperations';
import { useEdgeOperations } from '../hooks/useEdgeOperations';

export default function TocBoard({ boardId = 'default' }) {
  const [board, setBoard] = useState();
  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [dragType, setDragType] = useState(null); // 'list' or 'node'
  const [draggableNodes, setDraggableNodes] = useState(new Set()); // Track which nodes are draggable
  const [causalPathMode, setCausalPathMode] = useState(false);
  const [causalPathNodes, setCausalPathNodes] = useState(new Set());
  const [causalPathFocalNode, setCausalPathFocalNode] = useState(null); // The node that initiated the causal path

  // Use custom hooks
  const {
    addIntermediateOutcome,
    updateList,
    deleteList,
    reorderLists
  } = useListOperations(board, setBoard);

  const {
    addNode,
    updateNode,
    deleteNode,
    reorderNodes,
    moveNode,
    duplicateNode
  } = useNodeOperations(board, setBoard);

  const {
    addEdge,
    updateEdge,
    deleteEdge
  } = useEdgeOperations(board, setBoard);

    useEffect(() => {
    // Initialize board with default data or fetch from API if needed
    const initialBoard = createBoard();
    console.log('Initial board created:', initialBoard);
    setBoard(initialBoard);
  }, [boardId]);

  // Helper function to update board
  const updateBoard = useCallback((updates) => {
    setBoard(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Link mode operations
  const startLinkMode = useCallback(() => {
    setLinkMode(true);
    setLinkSource(null);
  }, []);

  const exitLinkMode = useCallback(() => {
    setLinkMode(false);
    setLinkSource(null);
  }, []);

  const handleNodeClick = useCallback((nodeId) => {
    if (linkMode) {
      if (!linkSource) {
        setLinkSource(nodeId);
      } else if (linkSource !== nodeId) {
        addEdge(linkSource, nodeId);
        setLinkSource(null);
        setLinkMode(false);
      }
    }
  }, [linkMode, linkSource, addEdge]);

  // Node draggable operations
  const toggleNodeDraggable = useCallback((nodeId, isDraggable) => {
    setDraggableNodes(prev => {
      const newSet = new Set(prev);
      if (isDraggable) {
        newSet.add(nodeId);
      } else {
        newSet.delete(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleNodeStartLinking = useCallback((nodeId) => {
    setLinkMode(true);
    setLinkSource(nodeId);
  }, []);

  // Utility functions
  const getNodesByListId = useCallback((listId) => {
    if (!board?.nodes) return [];
    let nodes = board.nodes
      .filter(node => node.listId === listId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Filter nodes in causal path mode
    if (causalPathMode) {
      nodes = nodes.filter(node => causalPathNodes.has(node.id));
    }
    
    return nodes;
  }, [board?.nodes, causalPathMode, causalPathNodes]);

  const getConnectedNodes = useCallback((nodeId) => {
    if (!board?.edges || !board?.nodes) return [];
    const connectedEdges = board.edges.filter(edge => 
      edge.sourceId === nodeId || edge.targetId === nodeId
    );
    const connectedNodeIds = connectedEdges.flatMap(edge => [edge.sourceId, edge.targetId]);
    return board.nodes.filter(node => connectedNodeIds.includes(node.id));
  }, [board?.edges, board?.nodes]);

  // Get all upstream nodes recursively (nodes that lead to this node)
  const getUpstreamNodes = useCallback((startNodeId, visited = new Set()) => {
    if (!board?.edges || visited.has(startNodeId)) return new Set();
    
    visited.add(startNodeId);
    const upstreamNodes = new Set();
    
    // Find all edges where this node is the target
    const incomingEdges = board.edges.filter(edge => edge.targetId === startNodeId);
    
    incomingEdges.forEach(edge => {
      const sourceNodeId = edge.sourceId;
      upstreamNodes.add(sourceNodeId);
      
      // Recursively find upstream nodes of the source
      const recursiveUpstream = getUpstreamNodes(sourceNodeId, visited);
      recursiveUpstream.forEach(nodeId => upstreamNodes.add(nodeId));
    });
    
    return upstreamNodes;
  }, [board?.edges]);

  // Get all downstream nodes recursively (nodes that this node leads to)
  const getDownstreamNodes = useCallback((startNodeId, visited = new Set()) => {
    if (!board?.edges || visited.has(startNodeId)) return new Set();
    
    visited.add(startNodeId);
    const downstreamNodes = new Set();
    
    // Find all edges where this node is the source
    const outgoingEdges = board.edges.filter(edge => edge.sourceId === startNodeId);
    
    outgoingEdges.forEach(edge => {
      const targetNodeId = edge.targetId;
      downstreamNodes.add(targetNodeId);
      
      // Recursively find downstream nodes of the target
      const recursiveDownstream = getDownstreamNodes(targetNodeId, visited);
      recursiveDownstream.forEach(nodeId => downstreamNodes.add(nodeId));
    });
    
    return downstreamNodes;
  }, [board?.edges]);

  // Get all connected nodes: upstream + node + downstream
  const getAllConnectedNodes = useCallback((startNodeId) => {
    if (!board?.edges || !board?.nodes) return new Set();
    
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
  }, [board?.edges, board?.nodes, getUpstreamNodes, getDownstreamNodes]);

  // Causal path mode functions
  const enterCausalPathMode = useCallback((nodeId) => {
    const connectedNodes = getAllConnectedNodes(nodeId);
    setCausalPathNodes(connectedNodes);
    setCausalPathFocalNode(nodeId);
    setCausalPathMode(true);
  }, [getAllConnectedNodes]);

  const exitCausalPathMode = useCallback(() => {
    setCausalPathMode(false);
    setCausalPathNodes(new Set());
    setCausalPathFocalNode(null);
  }, []);

  // Filter edges for causal path mode - only show edges between nodes in the causal path
  const getFilteredEdges = useCallback(() => {
    if (!causalPathMode || causalPathNodes.size === 0) {
      return board?.edges || [];
    }
    
    return (board?.edges || []).filter(edge => 
      causalPathNodes.has(edge.sourceId) && causalPathNodes.has(edge.targetId)
    );
  }, [board?.edges, causalPathMode, causalPathNodes]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setDragType(event.active.data.current?.type || 'node');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setDragType(null);
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
      setDraggableNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(active.id);
        return newSet;
      });
    }

    setActiveId(null);
    setDragType(null);
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
        board={board}
        linkMode={linkMode}
        causalPathMode={causalPathMode}
        onStartLinkMode={startLinkMode}
        onExitLinkMode={exitLinkMode}
        onExitCausalPathMode={exitCausalPathMode}
        onAddIntermediateOutcome={handleAddIntermediateOutcome}
      />

      <div style={tocBoardStyles.content}>
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={tocBoardStyles.boardInner}>
            <SortableContext 
              items={board?.lists?.map(list => list.id) || []} 
              strategy={horizontalListSortingStrategy}
            >
              {(board?.lists || [])
                .sort((a, b) => a.order - b.order)
                .map((list) => (
                  <TocList
                    key={list.id}
                    list={list}
                    nodes={getNodesByListId(list.id) || []}
                    onUpdateList={updateList}
                    onDeleteList={deleteList}
                    onAddNode={(title, type) => addNode(title, list.id, type)}
                    onUpdateNode={updateNode}
                    onDeleteNode={deleteNode}
                    onDuplicateNode={duplicateNode}
                    onNodeClick={handleNodeClick}
                    linkMode={linkMode}
                    linkSource={linkSource}
                    getConnectedNodes={getConnectedNodes}
                    draggableNodes={draggableNodes}
                    onToggleNodeDraggable={toggleNodeDraggable}
                    onStartLinking={handleNodeStartLinking}
                    onShowCausalPath={enterCausalPathMode}
                    causalPathMode={causalPathMode}
                    causalPathNodes={causalPathNodes}
                    causalPathFocalNode={causalPathFocalNode}
                    allNodes={board?.nodes || []}
                    board={board}
                    onAddEdge={addEdge}
                    onDeleteEdge={deleteEdge}
                  />
                ))}
            </SortableContext>
            
            <TocEdges
              edges={getFilteredEdges()}
              nodes={board?.nodes || []}
              onUpdateEdge={updateEdge}
              onDeleteEdge={deleteEdge}
            />
          </div>

          <DragOverlay>
            {activeId && dragType === 'node' ? (
              <TocNode
                node={board?.nodes.find(n => n.id === activeId)}
                isDragging={true}
                linkMode={false}
                isLinkSource={false}
                allNodes={board?.nodes || []}
                board={board}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      {/* Fixed legend that doesn't scroll with content */}
      <TocEdgesLegend visible={board?.edges?.length > 0} />
    </div>
  );
}