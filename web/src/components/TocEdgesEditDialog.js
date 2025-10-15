'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogPanel, DialogTitle, Radio, RadioGroup, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { updateEdge } from '../store/boardSlice';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';

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
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const [label, setLabel] = useState(initialLabel);
  const [type, setType] = useState(initialType);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [assumptions, setAssumptions] = useState([]);
  const [assumptionsLoading, setAssumptionsLoading] = useState(false);
  const [newAssumption, setNewAssumption] = useState('');
  const [newAssumptionStrength, setNewAssumptionStrength] = useState('medium');
  const [assumptionError, setAssumptionError] = useState(null);
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

  // Load edge assumptions when dialog opens
  useEffect(() => {
    async function loadAssumptions() {
      if (!isOpen || !boardId || !edgeId) return;
      try {
        setAssumptionsLoading(true);
        setAssumptionError(null);
        const { assumptions } = await (await import('../utils/boardsApi')).boardsApi.getEdgeAssumptions(boardId, edgeId);
        setAssumptions(assumptions || []);
      } catch (err) {
        setAssumptionError(err.message || 'Failed to load assumptions');
      } finally {
        setAssumptionsLoading(false);
      }
    }
    loadAssumptions();
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
      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      setNewComment('');
      
      // Update Redux state to reflect new comment count
      const openCommentsCount = updatedComments.filter(c => c.status !== 'solved').length;
      dispatch(updateEdge({
        edgeId: edgeId,
        updates: {
          comments: updatedComments,
          commentCount: openCommentsCount
        }
      }));
    } catch (err) {
      setCommentError(err.message || 'Failed to add comment');
    }
  };

  const handleAddAssumption = async () => {
    const content = newAssumption.trim();
    if (!content) return;
    try {
      setAssumptionError(null);
      const { assumption } = await (await import('../utils/boardsApi')).boardsApi.createEdgeAssumption(boardId, edgeId, content, newAssumptionStrength);
      const updatedAssumptions = [...assumptions, assumption];
      setAssumptions(updatedAssumptions);
      setNewAssumption('');
      setNewAssumptionStrength('medium');
      
      // Update Redux state
      dispatch(updateEdge({
        edgeId: edgeId,
        updates: {
          assumptions: updatedAssumptions
        }
      }));
    } catch (err) {
      setAssumptionError(err.message || 'Failed to add assumption');
    }
  };

  const edgeTypes = [
    { value: 'LEADS_TO', label: 'Leads to', color: '#374151', style: 'solid' },
    { value: 'ENABLES', label: 'Enables', color: '#10b981', style: 'dashed' },
    { value: 'REQUIRES', label: 'Requires', color: '#ef4444', style: 'dotted' },
    { value: 'CONTRIBUTES_TO', label: 'Contributes to', color: '#f59e0b', style: 'solid' }
  ];

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="dialog-overlay">
        <DialogPanel className="dialog-panel">
          <DialogTitle className="dialog-title">
            Edit Connection
          </DialogTitle>
          
                  {/* Tabs + Scrollable content */}
                  <div className="flex flex-col gap-3 flex-1 min-h-0">
                    <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
                      <TabList className="flex gap-2 border-b border-gray-200 mb-2">
                        <Tab
                          className={({ selected }) => `px-3 py-2 font-semibold cursor-pointer border-b-2 focus:outline-none ${
                            selected ? 'border-b-blue-500 text-gray-900' : 'border-b-transparent text-gray-500'
                          }`}
                        >
                          Details
                        </Tab>
                        <Tab
                          className={({ selected }) => `px-3 py-2 font-semibold cursor-pointer border-b-2 focus:outline-none ${
                            selected ? 'border-b-blue-500 text-gray-900' : 'border-b-transparent text-gray-500'
                          }`}
                        >
                          Comments {comments.filter(c => c.status !== 'solved').length > 0 && `(${comments.filter(c => c.status !== 'solved').length})`}
                        </Tab>
                        <Tab
                          className={({ selected }) => `px-3 py-2 font-semibold cursor-pointer border-b-2 focus:outline-none ${
                            selected ? 'border-b-blue-500 text-gray-900' : 'border-b-transparent text-gray-500'
                          }`}
                        >
                          Assumptions {assumptions.length > 0 && `(${assumptions.length})`}
                        </Tab>
                      </TabList>

                      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                        <TabPanels>
                          <TabPanel>
                    {/* Connection Info */}
                    {sourceNode && targetNode && (
                      <div className="mb-5 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-2">
                          Connection Path
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-700 mb-0.5">
                              {sourceNode.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {sourceList?.name || 'Unknown List'}
                            </div>
                          </div>
                          <div className="text-gray-400">
                            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                              <path d="M1 8H23M23 8L16 1M23 8L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-700 mb-0.5">
                              {targetNode.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {targetList?.name || 'Unknown List'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Label Input */}
                    <div className="mb-5">
                      <label htmlFor="edge-label" className="block text-sm font-medium mb-2">
                        Label (optional)
                      </label>
                      <Input
                        id="edge-label"
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Enter connection label..."
                      />
                    </div>

                    {/* Edge Type Selection */}
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-3">
                        Connection Type
                      </label>
                      <RadioGroup value={type} onChange={setType} className="flex flex-col gap-2">
                        {edgeTypes.map((edgeType) => (
                          <Radio
                            key={edgeType.value}
                            value={edgeType.value}
                            className={`flex items-center p-3 rounded-md cursor-pointer border-2 ${
                              type === edgeType.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            {({ checked }) => (
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center">
                                  <div className="mr-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                      checked 
                                        ? 'border-blue-500 bg-blue-500' 
                                        : 'border-gray-300 bg-transparent'
                                    }`}>
                                      {checked && (
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium">
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
                      <div className="text-sm font-semibold mb-2 text-gray-700">
                        Comments
                      </div>
                      {commentError && (
                        <div className="mb-2 text-red-500 text-xs">{commentError}</div>
                      )}
                      {commentsLoading ? (
                        <div className="text-xs text-gray-500">Loading comments...</div>
                      ) : (
                        <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
                          {(!comments || comments.length === 0) ? (
                            <div className="text-xs text-gray-500">No comments yet.</div>
                          ) : (
                            comments.map((c) => {
                              const canToggleStatus = c.user_id === currentUser?.id;
                              const commentStatus = c.status || 'open';
                              
                              return (
                                <div 
                                  key={c.id} 
                                  className={`p-2 rounded-md border mb-2 ${
                                    commentStatus === 'solved' 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-white border-gray-200'
                                  }`}
                                >
                                  <div className="flex justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <div className="text-xs text-gray-700 font-semibold">
                                        {c.user?.email || 'Unknown User'}
                                      </div>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        commentStatus === 'solved' 
                                          ? 'bg-green-200 text-green-800' 
                                          : 'bg-blue-200 text-blue-800'
                                      }`}>
                                        {commentStatus === 'solved' ? '✓ Solved' : 'Open'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {new Date(c.created_at || c.createdAt).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap mb-1">{c.content}</div>
                                  {canToggleStatus && (
                                    <button
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        try {
                                          const newStatus = commentStatus === 'solved' ? 'open' : 'solved';
                                          const { boardsApi } = await import('../utils/boardsApi');
                                          const result = await boardsApi.updateEdgeComment(
                                            boardId, 
                                            edgeId, 
                                            c.id, 
                                            { status: newStatus }
                                          );
                                          const updatedComment = result.comment;
                                          const updatedComments = comments.map(comment => 
                                            comment.id === c.id ? { ...comment, ...updatedComment } : comment
                                          );
                                          setComments(updatedComments);
                                          
                                          // Update Redux state to reflect new comment count
                                          const openCommentsCount = updatedComments.filter(c => c.status !== 'solved').length;
                                          dispatch(updateEdge({
                                            edgeId: edgeId,
                                            updates: {
                                              comments: updatedComments,
                                              commentCount: openCommentsCount
                                            }
                                          }));
                                        } catch (error) {
                                          console.error('Error updating comment status:', error);
                                          setCommentError('Failed to update comment status');
                                        }
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                                    >
                                      {commentStatus === 'solved' ? 'Reopen' : 'Mark as Solved'}
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      <div className="mt-2.5 flex gap-2">
                        <Input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1"
                        />
                        <Button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          variant={newComment.trim() ? 'primary' : 'disabled'}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </TabPanel>

                  {/* Assumptions Tab */}
                  <TabPanel>
                    <div className="space-y-3">
                      {/* Assumptions List */}
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          Assumptions ({assumptions.length})
                        </div>
                        
                        {assumptionError && (
                          <div className="text-xs text-red-600 mb-2">{assumptionError}</div>
                        )}
                        
                        {assumptionsLoading ? (
                          <div className="text-xs text-gray-500 p-2">Loading assumptions...</div>
                        ) : (
                          <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
                            {(!assumptions || assumptions.length === 0) ? (
                              <div className="text-xs text-gray-500">No assumptions yet.</div>
                            ) : (
                              assumptions.map((assumption) => {
                                const canEdit = assumption.user_id === currentUser?.id || boardId; // Can be refined with board owner check
                                
                                // Strength badge colors
                                const strengthColors = {
                                  'weak': 'bg-red-100 text-red-800',
                                  'medium': 'bg-yellow-100 text-yellow-800',
                                  'strong': 'bg-green-100 text-green-800',
                                  'evidence-backed': 'bg-blue-100 text-blue-800'
                                };
                                
                                const strengthLabels = {
                                  'weak': 'Weak',
                                  'medium': 'Medium',
                                  'strong': 'Strong',
                                  'evidence-backed': 'Evidence-backed'
                                };
                                
                                return (
                                  <div 
                                    key={assumption.id} 
                                    className="p-2 rounded-md border border-gray-300 mb-2 last:mb-0 bg-white"
                                  >
                                    <div className="flex items-start justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <div className="text-xs font-medium text-gray-700">
                                          {assumption.user?.email || 'Unknown User'}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${strengthColors[assumption.strength] || strengthColors.medium}`}>
                                          {strengthLabels[assumption.strength] || 'Medium'}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {new Date(assumption.created_at || assumption.createdAt).toLocaleString()}
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {assumption.content}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>

                      {/* Add New Assumption */}
                      <div className="border-t border-gray-200 pt-3 space-y-2">
                        <div className="text-xs font-semibold text-gray-700 mb-2">
                          Add New Assumption
                        </div>
                        
                        <div className="space-y-2">
                          <textarea
                            value={newAssumption}
                            onChange={(e) => setNewAssumption(e.target.value)}
                            placeholder="Enter assumption..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 resize-y min-h-[60px]"
                            rows={3}
                          />
                          
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-700">
                              Strength:
                            </label>
                            <select
                              value={newAssumptionStrength}
                              onChange={(e) => setNewAssumptionStrength(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:border-blue-500"
                            >
                              <option value="weak">Weak</option>
                              <option value="medium">Medium</option>
                              <option value="strong">Strong</option>
                              <option value="evidence-backed">Evidence-backed</option>
                            </select>
                          </div>
                          
                          <Button
                            onClick={handleAddAssumption}
                            disabled={!newAssumption.trim()}
                            variant={newAssumption.trim() ? 'primary' : 'disabled'}
                            className="w-full"
                          >
                            Add Assumption
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                        </TabPanels>
                      </div>
                    </TabGroup>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-3">
            {/* Delete button on the left */}
            <Button onClick={handleDelete} variant="danger">
              Delete Connection
            </Button>
            
            {/* Cancel and Save buttons on the right */}
            <div className="flex gap-3">
              <Button onClick={handleCancel} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleSave} variant="primary">
                Save Changes
              </Button>
            </div>
          </div>

        </DialogPanel>
      </div>
    </Dialog>
  );
}