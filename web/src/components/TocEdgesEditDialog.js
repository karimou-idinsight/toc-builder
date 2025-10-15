'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Radio, RadioGroup, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { styles, getTabButtonStyle, getRadioButtonStyle, getRadioCircleStyle, getAddCommentButtonStyle } from '../styles/TocEdgesEditDialog.styles';

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
    <Dialog open={isOpen} onClose={onClose} style={styles.dialog}>
      {/* Backdrop */}
      <div 
        style={styles.backdrop}
        aria-hidden="true" 
      />
      
      {/* Full-screen container to center the dialog */}
      <div style={styles.container}>
        <DialogPanel style={styles.dialogPanel}>
          <DialogTitle style={styles.title}>
            Edit Connection
          </DialogTitle>
          
                  {/* Tabs + Scrollable content */}
                  <div style={styles.tabsContainer}>
                    <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
                      <TabList style={styles.tabList}>
                        <Tab>
                          {({ selected }) => (
                            <button style={getTabButtonStyle(selected)}>
                              Details
                            </button>
                          )}
                        </Tab>
                        <Tab>
                          {({ selected }) => (
                            <button style={getTabButtonStyle(selected)}>
                              Comments
                            </button>
                          )}
                        </Tab>
                      </TabList>

                      <div style={styles.tabPanelsContainer}>
                        <TabPanels>
                          <TabPanel>
                    {/* Connection Info */}
                    {sourceNode && targetNode && (
                      <div style={styles.connectionInfo}>
                        <div style={styles.connectionInfoLabel}>
                          Connection Path
                        </div>
                        <div style={styles.connectionInfoContent}>
                          <div style={styles.connectionNode}>
                            <div style={styles.connectionNodeTitle}>
                              {sourceNode.title}
                            </div>
                            <div style={styles.connectionNodeList}>
                              {sourceList?.name || 'Unknown List'}
                            </div>
                          </div>
                          <div style={styles.connectionArrow}>
                            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                              <path d="M1 8H23M23 8L16 1M23 8L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div style={styles.connectionNode}>
                            <div style={styles.connectionNodeTitle}>
                              {targetNode.title}
                            </div>
                            <div style={styles.connectionNodeList}>
                              {targetList?.name || 'Unknown List'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Label Input */}
                    <div style={styles.labelContainer}>
                      <label htmlFor="edge-label" style={styles.labelLabel}>
                        Label (optional)
                      </label>
                      <input
                        id="edge-label"
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        style={styles.labelInput}
                        placeholder="Enter connection label..."
                      />
                    </div>

                    {/* Edge Type Selection */}
                    <div style={styles.edgeTypeContainer}>
                      <label style={styles.edgeTypeLabel}>
                        Connection Type
                      </label>
                      <RadioGroup value={type} onChange={setType} style={styles.edgeTypeRadioGroup}>
                        {edgeTypes.map((edgeType) => (
                          <Radio
                            key={edgeType.value}
                            value={edgeType.value}
                            style={getRadioButtonStyle(type === edgeType.value)}
                          >
                            {({ checked }) => (
                              <div style={styles.radioContent}>
                                <div style={styles.radioLeft}>
                                  <div style={styles.radioIndicator}>
                                    <div style={getRadioCircleStyle(checked)}>
                                      {checked && (
                                        <div style={styles.radioDot} />
                                      )}
                                    </div>
                                  </div>
                                  <div style={styles.radioLabel}>
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
                    <div style={styles.commentsContainer}>
                      <div style={styles.commentsTitle}>
                        Comments
                      </div>
                      {commentError && (
                        <div style={styles.commentError}>{commentError}</div>
                      )}
                      {commentsLoading ? (
                        <div style={styles.commentsLoading}>Loading comments...</div>
                      ) : (
                        <div style={styles.commentsList}>
                          {(!comments || comments.length === 0) ? (
                            <div style={styles.noComments}>No comments yet.</div>
                          ) : (
                            comments.map((c) => (
                              <div key={c.id} style={styles.commentItem}>
                                <div style={styles.commentHeader}>
                                  <div style={styles.commentAuthor}>
                                    {(c.user?.first_name || 'User') + (c.user?.last_name ? ` ${c.user.last_name}` : '')}
                                  </div>
                                  <div style={styles.commentDate}>
                                    {new Date(c.created_at || c.createdAt).toLocaleString()}
                                  </div>
                                </div>
                                <div style={styles.commentContent}>{c.content}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      <div style={styles.addCommentForm}>
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          style={styles.addCommentInput}
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          style={getAddCommentButtonStyle(!!newComment.trim())}
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
          <div style={styles.actionButtonsContainer}>
            {/* Delete button on the left */}
            <button
              onClick={handleDelete}
              style={styles.deleteButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = styles.deleteButtonHover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = styles.deleteButton.backgroundColor;
              }}
            >
              Delete Connection
            </button>
            
            {/* Cancel and Save buttons on the right */}
            <div style={styles.actionButtonsGroup}>
              <button
                onClick={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={styles.saveButton}
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