'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Dialog } from '@headlessui/react';
import { selectAllEdges } from '../store/selectors';
import TocNodeTagEditor from './TocNodeTagEditor';

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
    }
  }, [isOpen, node, allNodes, edges]);

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

  const dialogStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    dialog: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#1f2937'
    },
    section: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      resize: 'vertical',
      minHeight: '80px',
      boxSizing: 'border-box'
    },
    multiSelectContainer: {
      position: 'relative',
      width: '100%'
    },
    selectedItems: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    selectedItem: {
      backgroundColor: '#eff6ff',
      color: '#1d4ed8',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: '#1d4ed8',
      cursor: 'pointer',
      fontSize: '0.875rem',
      padding: '0',
      lineHeight: '1'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      maxHeight: '200px',
      overflow: 'auto',
      zIndex: 10,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    dropdownItem: {
      padding: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      borderBottom: '1px solid #f3f4f6'
    },
    dropdownItemHover: {
      backgroundColor: '#f3f4f6'
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    tag: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    tagInput: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center'
    },
    addButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s'
    },
    addButtonDisabled: {
      backgroundColor: '#d1d5db',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    actions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
      marginTop: '2rem'
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s'
    },
    saveButtonDisabled: {
      backgroundColor: '#d1d5db',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    cancelButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    saveButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    saveButtonDisabled: {
      backgroundColor: '#d1d5db',
      color: '#9ca3af',
      cursor: 'not-allowed'
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div style={dialogStyles.overlay}>
        <Dialog.Panel style={dialogStyles.dialog}>
          <Dialog.Title style={dialogStyles.title}>Edit Node</Dialog.Title>
          
          {/* Node Name */}
          <div style={dialogStyles.section}>
            <label style={dialogStyles.label}>Name</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={dialogStyles.input}
              placeholder="Enter node name"
            />
          </div>

          {/* Description */}
          <div style={dialogStyles.section}>
            <label style={dialogStyles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              style={dialogStyles.textarea}
              placeholder="Enter node description"
            />
          </div>

          {/* Upstream Nodes */}
          <div style={dialogStyles.section}>
            <label style={dialogStyles.label}>Upstream Nodes</label>
            <div style={dialogStyles.multiSelectContainer} ref={upstreamRef}>
              <div style={dialogStyles.selectedItems}>
                {upstreamNodes.map(node => (
                  <div key={node.id} style={dialogStyles.selectedItem}>
                    {node.title}
                    <button
                      style={dialogStyles.removeButton}
                      onClick={() => handleRemoveUpstreamNode(node)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={upstreamSearch}
                onChange={(e) => {
                  setUpstreamSearch(e.target.value);
                  setShowUpstreamDropdown(true);
                }}
                onFocus={() => setShowUpstreamDropdown(true)}
                style={dialogStyles.input}
                placeholder="Search and select upstream nodes..."
              />
              {showUpstreamDropdown && (
                <div style={dialogStyles.dropdown}>
                  {getAvailableUpstreamNodes().length === 0 ? (
                    <div style={dialogStyles.dropdownItem}>
                      {upstreamSearch ? 'No matching nodes found' : 'No available nodes'}
                    </div>
                  ) : (
                    getAvailableUpstreamNodes().map(availableNode => (
                      <div
                        key={availableNode.id}
                        style={dialogStyles.dropdownItem}
                        onClick={() => handleAddUpstreamNode(availableNode)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = dialogStyles.dropdownItemHover.backgroundColor}
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
          <div style={dialogStyles.section}>
            <label style={dialogStyles.label}>Downstream Nodes</label>
            <div style={dialogStyles.multiSelectContainer} ref={downstreamRef}>
              <div style={dialogStyles.selectedItems}>
                {downstreamNodes.map(node => (
                  <div key={node.id} style={dialogStyles.selectedItem}>
                    {node.title}
                    <button
                      style={dialogStyles.removeButton}
                      onClick={() => handleRemoveDownstreamNode(node)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={downstreamSearch}
                onChange={(e) => {
                  setDownstreamSearch(e.target.value);
                  setShowDownstreamDropdown(true);
                }}
                onFocus={() => setShowDownstreamDropdown(true)}
                style={dialogStyles.input}
                placeholder="Search and select downstream nodes..."
              />
              {showDownstreamDropdown && (
                <div style={dialogStyles.dropdown}>
                  {getAvailableDownstreamNodes().length === 0 ? (
                    <div style={dialogStyles.dropdownItem}>
                      {downstreamSearch ? 'No matching nodes found' : 'No available nodes'}
                    </div>
                  ) : (
                    getAvailableDownstreamNodes().map(availableNode => (
                      <div
                        key={availableNode.id}
                        style={dialogStyles.dropdownItem}
                        onClick={() => handleAddDownstreamNode(availableNode)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = dialogStyles.dropdownItemHover.backgroundColor}
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
          <div style={dialogStyles.section}>
            <label style={dialogStyles.label}>Tags</label>
            <TocNodeTagEditor
              tags={formData.tags}
              allTags={allTags}
              onTagsChange={handleTagsChange}
            />
          </div>

          {/* Actions */}
          <div style={dialogStyles.actions}>
            <button
              style={{...dialogStyles.button, ...dialogStyles.cancelButton}}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              style={{
                ...dialogStyles.button, 
                ...(formData.title.trim() ? dialogStyles.saveButton : dialogStyles.saveButtonDisabled)
              }}
              onClick={handleSave}
              disabled={!formData.title.trim()}
            >
              Save Changes
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}