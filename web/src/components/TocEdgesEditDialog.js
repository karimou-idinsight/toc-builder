'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Radio, RadioGroup, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
// Removed styles import - now using Tailwind CSS classes

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
                          Comments
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
                      <input
                        id="edge-label"
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                            comments.map((c) => (
                              <div key={c.id} className="p-2 bg-white rounded-md border border-gray-200 mb-2">
                                <div className="flex justify-between mb-1">
                                  <div className="text-xs text-gray-700 font-semibold">
                                    {(c.user?.first_name || 'User') + (c.user?.last_name ? ` ${c.user.last_name}` : '')}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(c.created_at || c.createdAt).toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      <div className="mt-2.5 flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className={`px-3 py-2 text-white border-none rounded-md text-sm ${
                            newComment.trim() 
                              ? 'bg-blue-500 cursor-pointer hover:bg-blue-600' 
                              : 'bg-blue-300 cursor-not-allowed'
                          }`}
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
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-3">
            {/* Delete button on the left */}
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 border-none rounded-md cursor-pointer hover:bg-red-600 transition-colors"
            >
              Delete Connection
            </button>
            
            {/* Cancel and Save buttons on the right */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border-none rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
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