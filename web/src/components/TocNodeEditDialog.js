'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogPanel, DialogTitle, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import { selectAllEdges } from '../store/selectors';
import { updateNode } from '../store/boardSlice';
import { useAuth } from '../context/AuthContext';
import TocNodeTagEditor from './TocNodeTagEditor';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import { boardsApi } from '../utils/boardsApi';
import { styles } from '../styles/TocNodeEditDialog.styles';

export default function TocNodeEditDialog({
  isOpen,
  onClose,
  onSave,
  node,
  allNodes,
  board,
  onAddEdge,
  onDeleteEdge
}) {
  // Get edges from Redux instead of props
  const edges = useSelector(selectAllEdges);
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [upstreamNodes, setUpstreamNodes] = useState([]);
  const [downstreamNodes, setDownstreamNodes] = useState([]);
  const [upstreamSearch, setUpstreamSearch] = useState('');
  const [downstreamSearch, setDownstreamSearch] = useState('');
  const [showUpstreamDropdown, setShowUpstreamDropdown] = useState(false);
  const [showDownstreamDropdown, setShowDownstreamDropdown] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const upstreamRef = useRef(null);
  const downstreamRef = useRef(null);

  // Get all existing tags from all nodes
  const allTags = useMemo(() => {
    if (!allNodes) return [];
    const tagsSet = new Set();
    allNodes.forEach(node => {
      if (node.tags && Array.isArray(node.tags)) {
        node.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [allNodes]);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen && node) {
      setFormData({
        title: node.title || '',
        description: node.description || '',
        tags: [...(node.tags || [])]
      });
      
      // Find upstream and downstream connections
      const upstream = edges
        .filter(edge => edge.targetId === node.id)
        .map(edge => allNodes.find(n => n.id === edge.sourceId))
        .filter(Boolean);
      
      const downstream = edges
        .filter(edge => edge.sourceId === node.id)
        .map(edge => allNodes.find(n => n.id === edge.targetId))
        .filter(Boolean);
      
      setUpstreamNodes(upstream);
      setDownstreamNodes(downstream);
      setUpstreamSearch('');
      setDownstreamSearch('');
      
      // Fetch comments for this node
      fetchComments();
    }
  }, [isOpen, node, allNodes, edges]);

  // Fetch comments
  const fetchComments = async () => {
    if (!node || !board) return;
    
    setLoadingComments(true);
    try {
      const data = await boardsApi.getNodeComments(board.id, node.id);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching node comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !node || !board) return;
    
    setSubmittingComment(true);
    try {
      const data = await boardsApi.createNodeComment(board.id, node.id, newComment);
      const updatedComments = [...comments, data.comment];
      setComments(updatedComments);
      setNewComment('');
      
      // Update Redux state to reflect new comment count
      const openCommentsCount = updatedComments.filter(c => c.status !== 'solved').length;
      dispatch(updateNode({
        nodeId: node.id,
        updates: {
          comments: updatedComments,
          commentCount: openCommentsCount
        }
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Get available nodes for selection (excluding current node and already selected ones)
  const getAvailableUpstreamNodes = () => {
    if (!allNodes || !node) return [];
    const selectedIds = upstreamNodes.map(n => n.id);
    return allNodes.filter(n => 
      n.id !== node.id && 
      !selectedIds.includes(n.id) &&
      n.title.toLowerCase().includes(upstreamSearch.toLowerCase())
    );
  };

  const getAvailableDownstreamNodes = () => {
    if (!allNodes || !node) return [];
    const selectedIds = downstreamNodes.map(n => n.id);
    return allNodes.filter(n => 
      n.id !== node.id && 
      !selectedIds.includes(n.id) &&
      n.title.toLowerCase().includes(downstreamSearch.toLowerCase())
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleAddUpstreamNode = (nodeToAdd) => {
    setUpstreamNodes(prev => [...prev, nodeToAdd]);
    setUpstreamSearch('');
    setShowUpstreamDropdown(false);
  };

  const handleRemoveUpstreamNode = (nodeToRemove) => {
    setUpstreamNodes(prev => prev.filter(n => n.id !== nodeToRemove.id));
  };

  const handleAddDownstreamNode = (nodeToAdd) => {
    setDownstreamNodes(prev => [...prev, nodeToAdd]);
    setDownstreamSearch('');
    setShowDownstreamDropdown(false);
  };

  const handleRemoveDownstreamNode = (nodeToRemove) => {
    setDownstreamNodes(prev => prev.filter(n => n.id !== nodeToRemove.id));
  };

  const handleSave = () => {
    if (!node) return;

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Node name is required');
      return;
    }

    // Update node data
    onSave(node.id, formData);

    // Handle edge changes if edge operations are available
    if (onAddEdge && onDeleteEdge) {
      const currentEdges = edges;
      const currentUpstreamIds = currentEdges
        .filter(edge => edge.targetId === node.id)
        .map(edge => edge.sourceId);
      const currentDownstreamIds = currentEdges
        .filter(edge => edge.sourceId === node.id)
        .map(edge => edge.targetId);

      const newUpstreamIds = upstreamNodes.map(n => n.id);
      const newDownstreamIds = downstreamNodes.map(n => n.id);

      // Remove edges that are no longer selected
      currentUpstreamIds.forEach(sourceId => {
        if (!newUpstreamIds.includes(sourceId)) {
          const edgeToRemove = currentEdges.find(e => e.sourceId === sourceId && e.targetId === node.id);
          if (edgeToRemove) {
            onDeleteEdge(edgeToRemove.id);
          }
        }
      });

      currentDownstreamIds.forEach(targetId => {
        if (!newDownstreamIds.includes(targetId)) {
          const edgeToRemove = currentEdges.find(e => e.sourceId === node.id && e.targetId === targetId);
          if (edgeToRemove) {
            onDeleteEdge(edgeToRemove.id);
          }
        }
      });

      // Add new edges
      newUpstreamIds.forEach(sourceId => {
        if (!currentUpstreamIds.includes(sourceId)) {
          onAddEdge(sourceId, node.id);
        }
      });

      newDownstreamIds.forEach(targetId => {
        if (!currentDownstreamIds.includes(targetId)) {
          onAddEdge(node.id, targetId);
        }
      });
    }

    onClose();
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (upstreamRef.current && !upstreamRef.current.contains(event.target)) {
        setShowUpstreamDropdown(false);
      }
      if (downstreamRef.current && !downstreamRef.current.contains(event.target)) {
        setShowDownstreamDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!node) return null;


  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
        <DialogPanel className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col relative z-[1001]">
          <DialogTitle className="text-xl font-semibold mb-4 text-gray-800">
            Edit Node
          </DialogTitle>
          
          <TabGroup>
            <TabList className="flex gap-2 border-b border-gray-200 mb-4">
              <Tab className={({ selected }) => `px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                selected 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}>
                Details
              </Tab>
              <Tab className={({ selected }) => `px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                selected 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}>
                Comments {comments.filter(c => c.status !== 'solved').length > 0 && `(${comments.filter(c => c.status !== 'solved').length})`}
              </Tab>
            </TabList>

            <TabPanels className="flex-1 overflow-y-auto">
              {/* Details Tab */}
              <TabPanel className="focus:outline-none">
                {/* Node Name */}
                <div style={styles.section}>
                  <label style={styles.label}>Name</label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter node name"
                  />
                </div>

                {/* Description */}
                <div style={styles.section}>
                  <label style={styles.label}>Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter node description"
                  />
                </div>

                {/* Upstream Nodes */}
                <div style={styles.section}>
                  <label style={styles.label}>Upstream Nodes</label>
                  <div style={styles.multiSelectContainer} ref={upstreamRef}>
                    <div style={styles.selectedItems}>
                      {upstreamNodes.map(node => (
                        <div key={node.id} style={styles.selectedItem}>
                          {node.title}
                          <button
                            style={styles.removeButton}
                            onClick={() => handleRemoveUpstreamNode(node)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <Input
                      type="text"
                      value={upstreamSearch}
                      onChange={(e) => {
                        setUpstreamSearch(e.target.value);
                        setShowUpstreamDropdown(true);
                      }}
                      onFocus={() => setShowUpstreamDropdown(true)}
                      placeholder="Search and select upstream nodes..."
                    />
                    {showUpstreamDropdown && (
                      <div style={styles.dropdown}>
                        {getAvailableUpstreamNodes().length === 0 ? (
                          <div style={styles.dropdownItem}>
                            {upstreamSearch ? 'No matching nodes found' : 'No available nodes'}
                          </div>
                        ) : (
                          getAvailableUpstreamNodes().map(availableNode => (
                            <div
                              key={availableNode.id}
                              style={styles.dropdownItem}
                              onClick={() => handleAddUpstreamNode(availableNode)}
                              onMouseEnter={(e) => e.target.style.backgroundColor = styles.dropdownItemHover.backgroundColor}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              {availableNode.title}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Downstream Nodes */}
                <div style={styles.section}>
                  <label style={styles.label}>Downstream Nodes</label>
                  <div style={styles.multiSelectContainer} ref={downstreamRef}>
                    <div style={styles.selectedItems}>
                      {downstreamNodes.map(node => (
                        <div key={node.id} style={styles.selectedItem}>
                          {node.title}
                          <button
                            style={styles.removeButton}
                            onClick={() => handleRemoveDownstreamNode(node)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <Input
                      type="text"
                      value={downstreamSearch}
                      onChange={(e) => {
                        setDownstreamSearch(e.target.value);
                        setShowDownstreamDropdown(true);
                      }}
                      onFocus={() => setShowDownstreamDropdown(true)}
                      placeholder="Search and select downstream nodes..."
                    />
                    {showDownstreamDropdown && (
                      <div style={styles.dropdown}>
                        {getAvailableDownstreamNodes().length === 0 ? (
                          <div style={styles.dropdownItem}>
                            {downstreamSearch ? 'No matching nodes found' : 'No available nodes'}
                          </div>
                        ) : (
                          getAvailableDownstreamNodes().map(availableNode => (
                            <div
                              key={availableNode.id}
                              style={styles.dropdownItem}
                              onClick={() => handleAddDownstreamNode(availableNode)}
                              onMouseEnter={(e) => e.target.style.backgroundColor = styles.dropdownItemHover.backgroundColor}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              {availableNode.title}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div style={styles.section}>
                  <label style={styles.label}>Tags</label>
                  <TocNodeTagEditor
                    tags={formData.tags}
                    allTags={allTags}
                    onTagsChange={handleTagsChange}
                  />
                </div>
              </TabPanel>

              {/* Comments Tab */}
              <TabPanel className="focus:outline-none">
                <div className="space-y-4">
                  {/* Comments List */}
                  <div className="space-y-3">
                    {loadingComments ? (
                      <div className="text-center text-gray-500 py-4">Loading comments...</div>
                    ) : comments.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">No comments yet</div>
                    ) : (
                      comments.map((comment) => {
                        const canToggleStatus = comment.user_id === currentUser?.id || board?.owner_id === currentUser?.id;
                        const commentStatus = comment.status || 'open';
                        
                        return (
                          <div 
                            key={comment.id} 
                            className={`rounded-lg p-3 ${commentStatus === 'solved' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-700">
                                  {comment.user?.email || 'Unknown User'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  commentStatus === 'solved' 
                                    ? 'bg-green-200 text-green-800' 
                                    : 'bg-blue-200 text-blue-800'
                                }`}>
                                  {commentStatus === 'solved' ? '✓ Solved' : 'Open'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{comment.content}</p>
                            {canToggleStatus && (
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    const newStatus = commentStatus === 'solved' ? 'open' : 'solved';
                                    const result = await boardsApi.updateNodeComment(
                                      board.id, 
                                      node.id, 
                                      comment.id, 
                                      { status: newStatus }
                                    );
                                    const updatedComment = result.comment;
                                    const updatedComments = comments.map(c => 
                                      c.id === comment.id ? { ...c, ...updatedComment } : c
                                    );
                                    setComments(updatedComments);
                                    
                                    // Update Redux state to reflect new comment count
                                    const openCommentsCount = updatedComments.filter(c => c.status !== 'solved').length;
                                    dispatch(updateNode({
                                      nodeId: node.id,
                                      updates: {
                                        comments: updatedComments,
                                        commentCount: openCommentsCount
                                      }
                                    }));
                                  } catch (error) {
                                    console.error('Error updating comment status:', error);
                                    alert('Failed to update comment status');
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

                  {/* Add Comment */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Comment
                    </label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="mb-2"
                    />
                    <Button
                      variant={newComment.trim() ? 'primary' : 'disabled'}
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                    >
                      {submittingComment ? 'Adding...' : 'Add Comment'}
                    </Button>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>

          {/* Actions */}
          <div style={styles.actions} className="mt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={formData.title.trim() ? 'primary' : 'disabled'}
              onClick={handleSave}
              disabled={!formData.title.trim()}
            >
              Save Changes
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}