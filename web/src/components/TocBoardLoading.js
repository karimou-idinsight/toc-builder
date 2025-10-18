import React from 'react';
import { tocBoardStyles } from '../styles/TocBoard.styles';

/**
 * Loading component for TocBoard
 */
export function TocBoardLoading() {
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

/**
 * Error component for TocBoard
 */
export function TocBoardError({ error, onRetry }) {
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
        onClick={onRetry}
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

/**
 * Initializing component for TocBoard
 */
export function TocBoardInitializing() {
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
