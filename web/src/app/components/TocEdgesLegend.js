'use client';

import React from 'react';

export default function TocEdgesLegend({ visible = true }) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontSize: '12px',
      zIndex: 100,
      border: '1px solid #e5e7eb',
      minWidth: '140px'
    }}>
      <h4 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '14px', 
        fontWeight: '600',
        color: '#374151'
      }}>
        Connection Types
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '2px', 
            backgroundColor: '#374151',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '-2px',
              width: 0,
              height: 0,
              borderLeft: '4px solid #374151',
              borderTop: '3px solid transparent',
              borderBottom: '3px solid transparent',
              opacity: 0.7
            }}></div>
          </div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>Leads to</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '2px', 
            backgroundColor: '#10b981',
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, white 4px, white 8px)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '-2px',
              width: 0,
              height: 0,
              borderLeft: '4px solid #10b981',
              borderTop: '3px solid transparent',
              borderBottom: '3px solid transparent',
              opacity: 0.7
            }}></div>
          </div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>Enables</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '2px', 
            backgroundColor: '#ef4444',
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '-2px',
              width: 0,
              height: 0,
              borderLeft: '4px solid #ef4444',
              borderTop: '3px solid transparent',
              borderBottom: '3px solid transparent',
              opacity: 0.7
            }}></div>
          </div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>Requires</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '2px', 
            backgroundColor: '#f59e0b',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '-2px',
              width: 0,
              height: 0,
              borderLeft: '4px solid #f59e0b',
              borderTop: '3px solid transparent',
              borderBottom: '3px solid transparent',
              opacity: 0.7
            }}></div>
          </div>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>Contributes to</span>
        </div>
      </div>
    </div>
  );
}