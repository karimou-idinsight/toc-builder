'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ReactFlow, ReactFlowProvider, useReactFlow, useNodesState, useEdgesState, Handle, Position } from 'reactflow';
import TocEdgesEditDialog from './TocEdgesEditDialog';
import { selectAllNodes } from '../store/selectors';
import 'reactflow/dist/style.css';

// Add custom CSS for edge interaction
const edgeInteractionStyles = `
  .reactflow-wrapper .react-flow__edge-path {
    pointer-events: stroke !important;
    cursor: pointer;
  }
  .reactflow-wrapper .react-flow__edge {
    pointer-events: stroke !important;
  }
  .reactflow-wrapper {
    pointer-events: none !important;
  }
  .reactflow-wrapper .react-flow__edge-interaction {
    pointer-events: stroke !important;
  }
`;

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


// Internal component that has access to React Flow instance
function TocEdgesInternal({ edges, onUpdateEdge, onDeleteEdge }) {
  // Get nodes from Redux
  const nodes = useSelector(selectAllNodes);

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
      console.warn(`Node element not found for ${nodeId}`);
      return null;
    }

    // Get the boardInner container (our parent) 
    const boardInner = containerRef.current.parentElement;
    if (!boardInner) {
      return null;
    }

    // Get positions relative to the document
    const nodeRect = nodeElement.getBoundingClientRect();
    const boardRect = boardInner.getBoundingClientRect();
    
    // Calculate position relative to the board container + account for scroll
    // This works even when nodes are scrolled out of the visible viewport
    const x = nodeRect.left - boardRect.left + boardInner.scrollLeft;
    const y = nodeRect.top - boardRect.top + boardInner.scrollTop;
    
    return {
      x,
      y,
      width: nodeRect.width || 200, // Fallback width
      height: nodeRect.height || 100 // Fallback height
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
        type: 'straight',
        sourceHandle: 'right',
        targetHandle: 'left',
        label: edge.label || '',
        labelStyle: {
          fill: '#374151',
          fontSize: 12,
          fontWeight: 500,
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 1,
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        data: {
          type: edge.type,
          label: edge.label,
          color: getEdgeColor(edge.type),
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

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
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
          width: '100%',
          height: '100%',
        }}
        fitView={false}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
      </ReactFlow>
      
      {editingEdge && (
        <TocEdgesEditDialog
          isOpen={!!editingEdge}
          onClose={handleCancelEdit}
          onSave={handleSaveEdge}
          onDelete={handleDeleteEdge}
          initialLabel={editingEdge.data?.label || editingEdge.label || ''}
          initialType={editingEdge.data?.type || editingEdge.type || 'LEADS_TO'}
        />
      )}
    </div>
  );
}

// Main component with ReactFlowProvider
export default function TocEdges({ edges, onUpdateEdge, onDeleteEdge }) {
  console.log('TocEdges rendered with:', { edges: edges?.length });
  if (!edges || edges.length === 0) {
    console.log('No edges to render');
    return null;
  }

  return (
    <ReactFlowProvider>
      <TocEdgesInternal 
        edges={edges} 
        onUpdateEdge={onUpdateEdge} 
        onDeleteEdge={onDeleteEdge} 
      />
    </ReactFlowProvider>
  );
}