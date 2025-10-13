// TocEdges component styles

// CSS for edge interaction and hover effects
export const edgeInteractionStyles = `
  .reactflow-wrapper .react-flow__edge-path {
    pointer-events: stroke !important;
    cursor: pointer;
    transition: stroke-width 0.2s ease, opacity 0.2s ease;
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
  .reactflow-wrapper .react-flow__edge:hover .react-flow__edge-path {
    stroke-width: 2.5 !important;
    opacity: 1 !important;
  }
  .reactflow-wrapper .react-flow__edge-text {
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .reactflow-wrapper .react-flow__edge:hover .react-flow__edge-text {
    opacity: 1;
  }
  .reactflow-wrapper .react-flow__edge-textbg {
    transition: opacity 0.2s ease;
    opacity: 0;
  }
  .reactflow-wrapper .react-flow__edge:hover .react-flow__edge-textbg {
    opacity: 1;
  }
`;

// Invisible node container styles
export const invisibleNodeStyles = {
  width: '100%',
  height: '100%',
  opacity: 0,
  pointerEvents: 'none',
};

// Handle styles for source (right) and target (left)
export const handleStyles = {
  source: {
    background: 'transparent',
    border: 'none',
    width: 1,
    height: 1,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  target: {
    background: 'transparent',
    border: 'none',
    width: 1,
    height: 1,
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },
};

// Edge container styles
export const edgeContainerStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,
  overflow: 'visible',
};

// ReactFlow component styles
export const reactFlowStyles = {
  pointerEvents: 'auto',
  width: '100%',
  height: '100%',
};

// Edge label styles
export const edgeLabelStyle = {
  fill: '#374151',
  fontSize: 12,
  fontWeight: 500,
};

// Edge label background styles
export const edgeLabelBgStyle = {
  fill: 'white',
  fillOpacity: 1,
};

// Edge label padding
export const edgeLabelBgPadding = [8, 4];

// Edge label border radius
export const edgeLabelBgBorderRadius = 4;

// Edge colors by type
export const edgeColors = {
  LEADS_TO: '#374151',
  ENABLES: '#10b981',
  REQUIRES: '#ef4444',
  CONTRIBUTES_TO: '#f59e0b',
  default: '#374151',
};

// Get edge style configuration
export const getEdgeStyle = (edgeType) => ({
  stroke: edgeColors[edgeType] || edgeColors.default,
  strokeWidth: 1,
  opacity: 0.6,
  strokeDasharray: edgeType === 'ENABLES' ? '3,3' : 'none',
  cursor: 'pointer',
  pointerEvents: 'stroke',
});

// Edge path options
export const edgePathOptions = {
  offset: 20,
  borderRadius: 10,
};

// Get marker end configuration
export const getMarkerEnd = (edgeType) => ({
  type: 'arrowclosed',
  color: edgeColors[edgeType] || edgeColors.default,
});

