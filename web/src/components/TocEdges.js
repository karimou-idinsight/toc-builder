'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ReactFlow, ReactFlowProvider, useReactFlow, useNodesState, useEdgesState, Handle, Position } from 'reactflow';
import TocEdgesEditDialog from './TocEdgesEditDialog';
import CustomEdge from './CustomEdge';
import { selectAllNodes, selectBoard } from '../store/selectors';
import 'reactflow/dist/style.css';

import { edgeInteractionStyles } from '../styles/TocEdges.styles';


// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = edgeInteractionStyles;
  document.head.appendChild(styleSheet);
}

// Custom invisible node component with handles
const InvisibleNodeWithHandles = ({ data }) => {
  return (
    <div style={{ width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ 
          background: 'transparent',
          border: 'none',
          width: 1,
          height: 1,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ 
          background: 'transparent',
          border: 'none',
          width: 1,
          height: 1,
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />
    </div>
  );
};

// Node types for React Flow
const nodeTypes = {
  invisibleWithHandles: InvisibleNodeWithHandles,
};

// Edge types for React Flow
const edgeTypes = {
  custom: CustomEdge,
};


// Internal component that has access to React Flow instance
function TocEdgesInternal({ boardId, edges, onUpdateEdge, onDeleteEdge }) {
  // Get nodes and board from Redux
  const nodes = useSelector(selectAllNodes);
  const board = useSelector(selectBoard);

  const [flowNodes, setFlowNodes] = useNodesState([]);
  const [flowEdges, setFlowEdges] = useEdgesState([]);
  const containerRef = useRef(null);
  const [editingEdge, setEditingEdgeState] = useState(null);

  // Wrapped setEditingEdge with logging
  const setEditingEdge = useCallback((edge) => {
    console.log('setEditingEdge called with:', edge);
    setEditingEdgeState(edge);
  }, []);

  // Dialog handlers
  const handleSaveEdge = useCallback((edgeData) => {
    console.log('handleSaveEdge called with:', edgeData);
    if (onUpdateEdge && editingEdge) {
      onUpdateEdge(editingEdge.id, {
        label: edgeData.label,
        type: edgeData.type
      });
    }
    setEditingEdge(null);
  }, [onUpdateEdge, editingEdge, setEditingEdge]);

  const handleCancelEdit = useCallback(() => {
    console.log('handleCancelEdit called');
    setEditingEdge(null);
  }, [setEditingEdge]);

  const handleDeleteEdge = useCallback(() => {
    console.log('handleDeleteEdge called for edge:', editingEdge?.id);
    if (onDeleteEdge && editingEdge) {
      onDeleteEdge(editingEdge.id);
    }
    setEditingEdge(null);
  }, [onDeleteEdge, editingEdge, setEditingEdge]);

  // Function to get actual DOM positions of nodes relative to the board container
  const getNodePosition = useCallback((nodeId) => {
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement || !containerRef.current) {
      // If node element not found, it might be scrolled out of view
      // Return null and the edge will be filtered out
      return null;
    }

    // Get the boardInner container (our parent) 
    const boardInner = containerRef.current.parentElement;
    if (!boardInner) {
      return null;
    }

    // Get the node's offset position relative to its offset parent
    let x = nodeElement.offsetLeft;
    let y = nodeElement.offsetTop;
    
    // Traverse up the DOM tree to calculate absolute position within the board
    let parent = nodeElement.offsetParent;
    while (parent && parent !== boardInner && boardInner.contains(parent)) {
      x += parent.offsetLeft;
      y += parent.offsetTop;
      parent = parent.offsetParent;
    }
    
    return {
      x,
      y,
      width: nodeElement.offsetWidth || 200, // Fallback width
      height: nodeElement.offsetHeight || 100 // Fallback height
    };
  }, []);

  // Get connection points with optimized positioning to avoid intersections
  const getConnectionPoints = useCallback((sourceId, targetId) => {
    const sourcePos = getNodePosition(sourceId);
    const targetPos = getNodePosition(targetId);
    
    if (!sourcePos || !targetPos) {
      return null;
    }

    // Calculate relative positions
    const sourceRight = sourcePos.x + sourcePos.width;
    const sourceCenterY = sourcePos.y + sourcePos.height / 2;
    const targetLeft = targetPos.x;
    const targetCenterY = targetPos.y + targetPos.height / 2;
    
    // Optimize connection points based on vertical alignment
    let sourceY = sourceCenterY;
    let targetY = targetCenterY;
    
    // If nodes are at similar heights, try to align connection points
    const verticalDistance = Math.abs(sourceCenterY - targetCenterY);
    const horizontalDistance = Math.abs(sourceRight - targetLeft);
    
    // For close vertical alignment, use center points
    if (verticalDistance < 20 && horizontalDistance > 50) {
      sourceY = sourceCenterY;
      targetY = targetCenterY;
    }
    // For significant vertical offset, optimize connection points
    else if (verticalDistance > 50) {
      // Connect closer to the target's vertical position for cleaner routing
      const verticalBias = 0.3;
      sourceY = sourceCenterY + (targetCenterY - sourceCenterY) * verticalBias;
      targetY = targetCenterY;
    }

    return { 
      sourceX: sourceRight, 
      sourceY, 
      targetX: targetLeft, 
      targetY 
    };
  }, [getNodePosition]);

  // Transform our nodes to React Flow format (invisible nodes for positioning)
  const transformNodes = useCallback(() => {
    return nodes.map(node => {
      const pos = getNodePosition(node.id);
      
      // Skip nodes where we can't get position (not in DOM yet)
      if (!pos) {
        return {
          id: node.id,
          type: 'invisibleWithHandles',
          position: { x: 0, y: 0 },
          data: { label: '' },
          style: {
            width: 200,
            height: 100,
            opacity: 0,
          },
          draggable: false,
          connectable: false,
          selectable: false,
        };
      }
      
      return {
        id: node.id,
        type: 'invisibleWithHandles',
        position: { x: pos.x, y: pos.y },
        data: { label: '' },
        style: {
          width: pos.width,
          height: pos.height,
        },
        draggable: false,
        connectable: false,
        selectable: false,
      };
    });
  }, [nodes, getNodePosition]);

  // Transform our edges to React Flow format
  const transformEdges = useCallback(() => {
    return edges.map((edge, i) => {
      const connectionPoints = getConnectionPoints(edge.sourceId, edge.targetId);
      
      // Skip edges where we can't calculate positions (nodes not found)
      if (!connectionPoints) {
        console.warn(`Skipping edge ${edge.id} - nodes not found`);
        return null;
      }
      
      const { sourceX, sourceY, targetX, targetY } = connectionPoints;
      
      return {
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: 'custom',
        sourceHandle: 'right',
        targetHandle: 'left',
        label: edge.label || '',
        labelStyle: {
          fill: '#374151',
          fontSize: 12,
          fontWeight: 500,
          maxWidth: '200px',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 1,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [10, 8],
        labelBgBorderRadius: 4,
        labelShowBg: true,
        data: {
          type: edge.type,
          label: edge.label,
          color: getEdgeColor(edge.type),
          commentCount: edge.commentCount || 0,
          comments: edge.comments || [],
          onUpdate: onUpdateEdge,
          onDelete: onDeleteEdge,
          onEdit: setEditingEdge,
          sourceX,
          sourceY,
          targetX,
          targetY,
        },
        style: {
          stroke: getEdgeColor(edge.type),
          strokeWidth: 1,
          opacity: 0.6,
          strokeDasharray: edge.type === 'ENABLES' ? '3,3' : 'none',
          cursor: 'pointer',
          pointerEvents: 'stroke',
        },
        pathOptions: {
          offset: 20,
          borderRadius: 10,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: getEdgeColor(edge.type),
        },
      };
    }).filter(edge => edge !== null); // Filter out null edges
  }, [edges, onUpdateEdge, onDeleteEdge, setEditingEdge, getConnectionPoints]);

  // Get edge color based on type
  const getEdgeColor = (type) => {
    switch (type) {
      case 'LEADS_TO': return '#374151';
      case 'ENABLES': return '#10b981';
      case 'REQUIRES': return '#ef4444';
      case 'CONTRIBUTES_TO': return '#f59e0b';
      default: return '#374151';
    }
  };

  // Update React Flow nodes and edges when our data changes (not on scroll)
  useEffect(() => {
    const updatePositions = () => {
      setFlowNodes(transformNodes());
      setFlowEdges(transformEdges());
    };

    // Only update when nodes/edges data actually changes, not on scroll
    const timer = setTimeout(updatePositions, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [nodes, edges, transformNodes, transformEdges]);

  // Handle resize events separately (less frequent)
  useEffect(() => {
    const handleResize = () => {
      const timer = setTimeout(() => {
        setFlowNodes(transformNodes());
        setFlowEdges(transformEdges());
      }, 100);
      return () => clearTimeout(timer);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [transformNodes, transformEdges]);

  // Handle scroll events to update edge positions when scrolling
  useEffect(() => {
    if (!containerRef.current) return;

    const boardInner = containerRef.current.parentElement;
    if (!boardInner) return;

    let scrollTimer;
    const handleScroll = () => {
      // Clear existing timer
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      // Update edges on scroll (debounced)
      scrollTimer = setTimeout(() => {
        setFlowNodes(transformNodes());
        setFlowEdges(transformEdges());
      }, 50);
    };

    boardInner.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      boardInner.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, [transformNodes, transformEdges]);

  // Calculate the full board dimensions
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const boardInner = containerRef.current.parentElement;
    if (!boardInner) return;

    const updateDimensions = () => {
      // Get the full scrollable dimensions
      const width = boardInner.scrollWidth;
      const height = boardInner.scrollHeight;
      setBoardDimensions({ width, height });
    };

    // Initial calculation
    updateDimensions();

    // Update on resize and when nodes change
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(boardInner);

    return () => {
      resizeObserver.disconnect();
    };
  }, [nodes]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: boardDimensions.width || '100%',
        height: boardDimensions.height || '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        className="reactflow-wrapper"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnScroll={false}
        panOnDrag={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        edgesFocusable={true}
        edgesUpdatable={false}
        connectionMode="loose"
        snapToGrid={false}
        onEdgeClick={(event, edge) => {
          event.stopPropagation();
          console.log('Edge clicked:', edge);
          setEditingEdge(edge);
        }}
        style={{ 
          pointerEvents: 'auto',
          width: boardDimensions.width || '100%',
          height: boardDimensions.height || '100%',
        }}
        fitView={false}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
      </ReactFlow>
      
      {editingEdge && (() => {
        const sourceNode = nodes.find(n => n.id === editingEdge.source);
        const targetNode = nodes.find(n => n.id === editingEdge.target);
        const sourceList = board?.lists?.find(l => l.id === sourceNode?.listId);
        const targetList = board?.lists?.find(l => l.id === targetNode?.listId);
        
        return (
          <TocEdgesEditDialog
            isOpen={!!editingEdge}
            onClose={handleCancelEdit}
            onSave={handleSaveEdge}
            onDelete={handleDeleteEdge}
            initialLabel={editingEdge.data?.label || editingEdge.label || ''}
            initialType={editingEdge.data?.type || editingEdge.type || 'LEADS_TO'}
            sourceNode={sourceNode}
            targetNode={targetNode}
            sourceList={sourceList}
            targetList={targetList}
            boardId={board?.id || boardId}
            edgeId={editingEdge.id}
          />
        );
      })()}
    </div>
  );
}

// Main component with ReactFlowProvider
export default function TocEdges({ boardId, edges, onUpdateEdge, onDeleteEdge }) {
  if (!edges || edges.length === 0) {
    return null;
  }

  return (
    <ReactFlowProvider>
      <TocEdgesInternal 
        boardId={boardId}
        edges={edges} 
        onUpdateEdge={onUpdateEdge} 
        onDeleteEdge={onDeleteEdge} 
      />
    </ReactFlowProvider>
  );
}