'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Radio, RadioGroup } from '@headlessui/react';

export default function TocEdgesEditDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  initialLabel = '', 
  initialType = 'LEADS_TO',
  sourceNode,
  targetNode,
  sourceList,
  targetList
}) {
  const [label, setLabel] = useState(initialLabel);
  const [type, setType] = useState(initialType);

  useEffect(() => {
    setLabel(initialLabel);
    setType(initialType);
  }, [initialLabel, initialType, isOpen]);

  const handleSave = () => {
    onSave({
      label: label.trim() || null,
      type: type
    });
    onClose();
  };

  const handleCancel = () => {
    setLabel(initialLabel);
    setType(initialType);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this connection?')) {
      if (onDelete) {
        onDelete();
      }
      onClose();
    }
  };

  const edgeTypes = [
    { value: 'LEADS_TO', label: 'Leads to', color: '#374151', style: 'solid' },
    { value: 'ENABLES', label: 'Enables', color: '#10b981', style: 'dashed' },
    { value: 'REQUIRES', label: 'Requires', color: '#ef4444', style: 'dotted' },
    { value: 'CONTRIBUTES_TO', label: 'Contributes to', color: '#f59e0b', style: 'solid' }
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} style={{ position: 'relative', zIndex: 1000 }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        aria-hidden="true" 
      />
      
      {/* Full-screen container to center the dialog */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        <DialogPanel 
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minWidth: '400px',
            maxWidth: '500px'
          }}
        >
          <DialogTitle style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Edit Connection
          </DialogTitle>
          
          {/* Connection Info */}
          {sourceNode && targetNode && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                Connection Path
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                {/* Source */}
                <div style={{ flex: '1' }}>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
                    {sourceNode.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {sourceList?.name || 'Unknown List'}
                  </div>
                </div>
                
                {/* Arrow */}
                <div style={{ color: '#9ca3af' }}>
                  <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                    <path d="M1 8H23M23 8L16 1M23 8L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {/* Target */}
                <div style={{ flex: '1' }}>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
                    {targetNode.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {targetList?.name || 'Unknown List'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Label Input */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="edge-label" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Label (optional)
            </label>
            <input
              id="edge-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Enter connection label..."
            />
          </div>

          {/* Edge Type Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
              Connection Type
            </label>
            <RadioGroup value={type} onChange={setType} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {edgeTypes.map((edgeType) => (
                <Radio
                  key={edgeType.value}
                  value={edgeType.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: `2px solid ${type === edgeType.value ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: type === edgeType.value ? '#eff6ff' : 'white'
                  }}
                >
                  {({ checked }) => (
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ marginRight: '12px' }}>
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              border: `2px solid ${checked ? '#3b82f6' : '#d1d5db'}`,
                              backgroundColor: checked ? '#3b82f6' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {checked && (
                              <div style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%' }} />
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {edgeType.label}
                        </div>
                      </div>
                      
                      {/* Visual Preview */}
                      <div>
                        <svg width="60" height="20">
                          <line
                            x1="5"
                            y1="10"
                            x2="45"
                            y2="10"
                            stroke={edgeType.color}
                            strokeWidth="2"
                            strokeDasharray={
                              edgeType.style === 'dashed' ? '5,5' :
                              edgeType.style === 'dotted' ? '2,3' : 'none'
                            }
                          />
                          <polygon
                            points="45,7 55,10 45,13"
                            fill={edgeType.color}
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            {/* Delete button on the left */}
            <button
              onClick={handleDelete}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ef4444';
              }}
            >
              Delete Connection
            </button>
            
            {/* Cancel and Save buttons on the right */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}