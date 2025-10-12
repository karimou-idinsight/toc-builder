'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ReactFlow, ReactFlowProvider, useReactFlow, useNodesState, useEdgesState } from 'reactflow';
import TocEdgesEditDialog from './TocEdgesEditDialog';
import TocEdgesEdge from './TocEdgesEdge';
import 'reactflow/dist/style.css';

// Edge types for React Flow
const edgeTypes = {
  tocEdge: TocEdgesEdge,
};

// Internal component that has access to React Flow instance
function TocEdgesInternal({ edges, nodes, onUpdateEdge, onDeleteEdge }) {
  const { project, getViewport } = useReactFlow();
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
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    // Get the boardInner container (our parent) 
    const boardInner = containerRef.current.parentElement;
    if (!boardInner) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    // Get positions relative to the document
    const nodeRect = nodeElement.getBoundingClientRect();
    const boardRect = boardInner.getBoundingClientRect();
    
    // Calculate position relative to the board container + account for scroll
    return {
      x: nodeRect.left - boardRect.left + boardInner.scrollLeft,
      y: nodeRect.top - boardRect.top + boardInner.scrollTop,
      width: nodeRect.width,
      height: nodeRect.height
    };
  }, []);

  // Get connection points (right edge of source, left edge of target)
  const getConnectionPoints = useCallback((sourceId, targetId) => {
    const sourcePos = getNodePosition(sourceId);
    const targetPos = getNodePosition(targetId);
    
    if (!sourcePos || !targetPos || sourcePos.width === 0 || targetPos.width === 0) {
      return { sourceX: 0, sourceY: 0, targetX: 0, targetY: 0 };
    }

    // Source point: right edge, vertically centered
    const sourceX = sourcePos.x + sourcePos.width;
    const sourceY = sourcePos.y + sourcePos.height / 2;
    
    // Target point: left edge, vertically centered
    const targetX = targetPos.x;
    const targetY = targetPos.y + targetPos.height / 2;

    return { sourceX, sourceY, targetX, targetY };
  }, [getNodePosition]);

  // Transform our nodes to React Flow format (invisible nodes for positioning)
  const transformNodes = useCallback(() => {
    return nodes.map(node => {
      const pos = getNodePosition(node.id);
      return {
        id: node.id,
        position: { x: pos.x, y: pos.y },
        data: { label: '' },
        style: {
          width: pos.width,
          height: pos.height,
          opacity: 0,
          pointerEvents: 'none',
        },
        draggable: false,
        connectable: false,
        selectable: false,
      };
    });
  }, [nodes, getNodePosition]);

  // Transform our edges to React Flow format
  const transformEdges = useCallback(() => {
    return edges.map(edge => {
      const { sourceX, sourceY, targetX, targetY } = getConnectionPoints(edge.sourceId, edge.targetId);
      
      return {
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: 'tocEdge',
        sourceHandle: 'right',
        targetHandle: 'left',
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
        },
      };
    });
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
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnScroll={false}
        panOnDrag={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        style={{ 
          pointerEvents: 'none',
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
          initialLabel={editingEdge.label || ''}
          initialType={editingEdge.type || 'LEADS_TO'}
        />
      )}
    </div>
  );
}

// Main component with ReactFlowProvider
export default function TocEdges({ edges, nodes, onUpdateEdge, onDeleteEdge }) {
  console.log('TocEdges rendered with:', { edges: edges?.length, nodes: nodes?.length });
  if (!edges || edges.length === 0) {
    console.log('No edges to render');
    return null;
  }

  return (
    <ReactFlowProvider>
      <TocEdgesInternal 
        edges={edges} 
        nodes={nodes} 
        onUpdateEdge={onUpdateEdge} 
        onDeleteEdge={onDeleteEdge} 
      />
    </ReactFlowProvider>
  );
}