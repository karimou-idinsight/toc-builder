'use client';

import React from 'react';

// Custom edge component for our Theory of Change edges
export default function TocEdgesEdge({ id, source, target, data }) {
  const edgeColor = data?.color || '#374151';
  const edgeType = data?.type || 'LEADS_TO';
  const strokeWidth = 2;
  
  // Use the pre-calculated connection points
  const sourceX = data?.sourceX || 0;
  const sourceY = data?.sourceY || 0;
  const targetX = data?.targetX || 0;
  const targetY = data?.targetY || 0;
  
  if (sourceX === 0 || targetX === 0) return null;
  
  // Create smoothstep path that always flows forward
  const horizontalDistance = targetX - sourceX;
  const stepDistance = Math.max(20, Math.abs(horizontalDistance) * 0.3);
  
  let path;
  
  if (horizontalDistance > 0) {
    // Target is to the right of source - normal forward flow
    const midX = sourceX + stepDistance;
    path = `M ${sourceX} ${sourceY} 
            L ${midX} ${sourceY} 
            L ${midX} ${targetY} 
            L ${targetX} ${targetY}`;
  } else {
    // Target is to the left of source - create a loop that goes around
    const loopHeight = 30;
    const topY = Math.min(sourceY, targetY) - loopHeight;
    const rightX = sourceX + stepDistance;
    const leftX = targetX - stepDistance;
    
    path = `M ${sourceX} ${sourceY} 
            L ${rightX} ${sourceY} 
            L ${rightX} ${topY} 
            L ${leftX} ${topY}
            L ${leftX} ${targetY}
            L ${targetX} ${targetY}`;
  }
  
  // Different stroke patterns for different edge types
  const getStrokePattern = (type) => {
    switch (type) {
      case 'ENABLES': return '8,4';
      case 'REQUIRES': return '4,4';
      default: return 'none';
    }
  };

  return (
    <g style={{ pointerEvents: 'auto' }}>
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill={edgeColor}
            stroke={edgeColor}
            opacity="0.8"
          />
        </marker>
      </defs>
      
      <path
        d={path}
        stroke={edgeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={getStrokePattern(edgeType)}
        fill="none"
        markerEnd={`url(#arrowhead-${id})`}
        style={{
          opacity: 0.8,
          transition: 'all 0.2s ease',
          pointerEvents: 'stroke',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Edge clicked!', { id, data });
          if (data?.onEdit) {
            console.log('Calling onEdit with:', {
              id: id,
              label: data?.label || '',
              type: data?.type || 'LEADS_TO'
            });
            data.onEdit({
              id: id,
              label: data?.label || '',
              type: data?.type || 'LEADS_TO'
            });
          } else {
            console.log('No onEdit function found in data:', data);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm('Delete this connection?') && data?.onDelete) {
            data.onDelete(id);
          }
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.strokeWidth = '3';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.8';
          e.target.style.strokeWidth = '2';
        }}
      />
      
      {/* Invisible wider path for easier interaction */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="16"
        fill="none"
        style={{ 
          cursor: 'pointer',
          pointerEvents: 'stroke'
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Invisible edge area clicked!', { id, data });
          if (data?.onEdit) {
            console.log('Calling onEdit from invisible area with:', {
              id: id,
              label: data?.label || '',
              type: data?.type || 'LEADS_TO'
            });
            data.onEdit({
              id: id,
              label: data?.label || '',
              type: data?.type || 'LEADS_TO'
            });
          } else {
            console.log('No onEdit function found in invisible area data:', data);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm('Delete this connection?') && data?.onDelete) {
            data.onDelete(id);
          }
        }}
      />
    </g>
  );
}