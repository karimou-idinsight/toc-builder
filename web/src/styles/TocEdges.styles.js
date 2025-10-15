// Add custom CSS for edge interaction and hover effects
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
  
  /* Hide edge labels by default */
  .reactflow-wrapper .react-flow__edge-text {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  
  /* Hide edge label background by default */
  .reactflow-wrapper .react-flow__edge-textbg {
    opacity: 0;
    transition: opacity 0.2s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  /* Highlight edge on hover */
  .reactflow-wrapper .react-flow__edge:hover .react-flow__edge-path {
    stroke-width: 2.5 !important;
    opacity: 1 !important;
  }
  
  /* Show label and background on hover */
  .reactflow-wrapper .react-flow__edge:hover .react-flow__edge-text {
    opacity: 1;
  }
  
  .reactflow-wrapper .react-flow__edge:hover .react-flow__edge-textbg {
    opacity: 1;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
  }
  
  /* Ensure label text wraps properly */
  .reactflow-wrapper .react-flow__edge-text {
    max-width: 200px;
  }
  
  .reactflow-wrapper .react-flow__edge-text > div {
    max-width: 200px;
    word-wrap: break-word;
    white-space: normal;
    text-align: center;
  }
  
  /* Comment indicator styles */
  .reactflow-wrapper .comment-indicator {
    transition: all 0.2s ease;
  }
  
  .reactflow-wrapper .comment-indicator:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
  }
  
  .reactflow-wrapper .comment-indicator:active {
    transform: scale(0.95);
  }

  /* assumption indicator styles */
  .reactflow-wrapper .assumption-indicator {
    transition: all 0.2s ease;
  }
  
  .reactflow-wrapper .assumption-indicator:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
  }
  
  .reactflow-wrapper .assumption-indicator:active {
    transform: scale(0.95);
  }
`;
