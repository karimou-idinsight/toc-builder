'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Radio, RadioGroup, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';

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
  targetList,
  boardId,
  edgeId
}) {
  const [label, setLabel] = useState(initialLabel);
  const [type, setType] = useState(initialType);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  useEffect(() => {
    setLabel(initialLabel);
    setType(initialType);
  }, [initialLabel, initialType, isOpen]);

  // Load edge comments when dialog opens
  useEffect(() => {
    async function loadComments() {
      if (!isOpen || !boardId || !edgeId) return;
      try {
        setCommentsLoading(true);
        setCommentError(null);
        const { comments } = await (await import('../utils/boardsApi')).boardsApi.getEdgeComments(boardId, edgeId);
        setComments(comments || []);
      } catch (err) {
        setCommentError(err.message || 'Failed to load comments');
      } finally {
        setCommentsLoading(false);
      }
    }
    loadComments();
  }, [isOpen, boardId, edgeId]);

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

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content) return;
    try {
      setCommentError(null);
      const { comment } = await (await import('../utils/boardsApi')).boardsApi.createEdgeComment(boardId, edgeId, content);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      setCommentError(err.message || 'Failed to add comment');
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
            minWidth: '480px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <DialogTitle style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Edit Connection
          </DialogTitle>
          
                  {/* Tabs + Scrollable content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
                    <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
                      <TabList style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                        <Tab>
                          {({ selected }) => (
                            <button
                              style={{
                                padding: '8px 12px',
                                border: 'none',
                                borderBottom: selected ? '2px solid #3b82f6' : '2px solid transparent',
                                backgroundColor: 'transparent',
                                color: selected ? '#111827' : '#6b7280',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Details
                            </button>
                          )}
                        </Tab>
                        <Tab>
                          {({ selected }) => (
                            <button
                              style={{
                                padding: '8px 12px',
                                border: 'none',
                                borderBottom: selected ? '2px solid #3b82f6' : '2px solid transparent',
                                backgroundColor: 'transparent',
                                color: selected ? '#111827' : '#6b7280',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Comments
                            </button>
                          )}
                        </Tab>
                      </TabList>

                      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
                        <TabPanels>
                          <TabPanel>
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
                          <div style={{ flex: '1' }}>
                            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
                              {sourceNode.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              {sourceList?.name || 'Unknown List'}
                            </div>
                          </div>
                          <div style={{ color: '#9ca3af' }}>
                            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                              <path d="M1 8H23M23 8L16 1M23 8L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
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
                    <div style={{ marginBottom: '8px' }}>
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

                                <div>
                                  <svg width="60" height="20">
                                    <line
                                      x1="5"
                                      y1="10"
                                      x2="45"
                                      y2="10"
                                      stroke={edgeType.color}
                                      strokeWidth="2"
                                      strokeDasharray={edgeType.style === 'dashed' ? '5,5' : edgeType.style === 'dotted' ? '2,3' : 'none'}
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
                        ))
                      }
                      </RadioGroup>
                    </div>
                          </TabPanel>

                          <TabPanel>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                        Comments
                      </div>
                      {commentError && (
                        <div style={{ marginBottom: '8px', color: '#ef4444', fontSize: '12px' }}>{commentError}</div>
                      )}
                      {commentsLoading ? (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Loading comments...</div>
                      ) : (
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px', backgroundColor: '#f9fafb' }}>
                          {(!comments || comments.length === 0) ? (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>No comments yet.</div>
                          ) : (
                            comments.map((c) => (
                              <div key={c.id} style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <div style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                                    {(c.user?.first_name || 'User') + (c.user?.last_name ? ` ${c.user.last_name}` : '')}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                    {new Date(c.created_at || c.createdAt).toLocaleString()}
                                  </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#374151', whiteSpace: 'pre-wrap' }}>{c.content}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          style={{ padding: '8px 12px', backgroundColor: newComment.trim() ? '#3b82f6' : '#93c5fd', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: newComment.trim() ? 'pointer' : 'not-allowed' }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </TabPanel>
                        </TabPanels>
                      </div>
                    </TabGroup>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginTop: '12px' }}>
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