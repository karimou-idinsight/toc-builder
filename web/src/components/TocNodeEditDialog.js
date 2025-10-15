'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { selectAllEdges } from '../store/selectors';
import TocNodeTagEditor from './TocNodeTagEditor';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
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


  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="dialog-overlay">
        <DialogPanel className="dialog-panel">
          <DialogTitle className="dialog-title">Edit Node</DialogTitle>
          
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

          {/* Actions */}
          <div style={styles.actions}>
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