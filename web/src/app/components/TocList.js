'use client';

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TocListHeader from './TocListHeader';
import TocListContent from './TocListContent';
import TocListSettingsModal from './TocListSettingsModal';
import { NODE_TYPES } from '../utils/tocModels';
import { tocListStyles } from '../styles/TocList.styles';

export default function TocList({
  list,
  nodes,
  onUpdateList,
  onDeleteList,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onNodeClick,
  linkMode,
  linkSource,
  getConnectedNodes,
  draggableNodes,
  onToggleNodeDraggable,
  onStartLinking,
  onShowCausalPath,
  causalPathMode,
  causalPathNodes,
  causalPathFocalNode,
  allNodes,
  board,
  onAddEdge,
  onDeleteEdge
}) {
  // local UI state
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.name);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null);

  // close modal on ESC
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && setIsModalOpen(false);
    if (isModalOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isModalOpen]);

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', isModalOpen);
  }, [isModalOpen]);

  // drag-and-drop
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id, data: { type: 'list', listId: list.id } });

  const wrapperStyle = {
    ...tocListStyles.container,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // handlers
  const handleAddNode = (e) => {
    e.preventDefault();
    if (!newNodeTitle.trim()) return;
    let type = NODE_TYPES.ACTIVITY;
    const lc = list.name.toLowerCase();
    if      (lc.includes('output'))              type = NODE_TYPES.OUTPUT;
    else if (lc.includes('outcome'))             type = NODE_TYPES.INTERMEDIATE_OUTCOME;
    else if (lc.includes('final'))               type = NODE_TYPES.FINAL_OUTCOME;
    else if (lc.includes('impact'))              type = NODE_TYPES.IMPACT;
    onAddNode(newNodeTitle, type);
    setNewNodeTitle('');
    setIsAddingNode(false);
  };
  
  const handleTitleEdit = (e) => { 
    e.preventDefault(); 
    if (editTitle.trim() && editTitle !== list.name) onUpdateList(list.id, { name: editTitle }); 
    setIsEditingTitle(false); 
  };
  
  const handleColorChange = (color) => onUpdateList(list.id, { color });
  const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#6b7280'];

  return (
    <div ref={setNodeRef} style={wrapperStyle} data-type={list.type} {...attributes}>
      <TocListHeader
        list={list}
        nodesCount={nodes.length}
        isEditingTitle={isEditingTitle}
        editTitle={editTitle}
        setIsEditingTitle={setIsEditingTitle}
        setEditTitle={setEditTitle}
        handleTitleEdit={handleTitleEdit}
        hoveredButton={hoveredButton}
        setHoveredButton={setHoveredButton}
        listeners={listeners}
        attributes={attributes}
        onSettingsClick={e => { 
          console.log('Settings button clicked!'); 
          e.stopPropagation(); 
          setIsModalOpen(true); 
        }}
        onDeleteList={onDeleteList}
        isDragging={isDragging}
      />

        <TocListContent
          nodes={nodes}
          listColor={list.color}
          isAddingNode={isAddingNode}
          setIsAddingNode={setIsAddingNode}
          newNodeTitle={newNodeTitle}
          setNewNodeTitle={setNewNodeTitle}
          handleAddNode={handleAddNode}
          hoveredButton={hoveredButton}
          setHoveredButton={setHoveredButton}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          onDuplicateNode={onDuplicateNode}
          onNodeClick={onNodeClick}
          linkMode={linkMode}
          linkSource={linkSource}
          getConnectedNodes={getConnectedNodes}
          draggableNodes={draggableNodes}
          onToggleNodeDraggable={onToggleNodeDraggable}
          onStartLinking={onStartLinking}
          onShowCausalPath={onShowCausalPath}
          causalPathMode={causalPathMode}
          causalPathNodes={causalPathNodes}
          causalPathFocalNode={causalPathFocalNode}
          allNodes={allNodes}
          board={board}
          onAddEdge={onAddEdge}
          onDeleteEdge={onDeleteEdge}
        />
        <TocListSettingsModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          list={list}
          colors={colors}
          handleColorChange={handleColorChange}
          onUpdateList={onUpdateList}
          onDeleteList={onDeleteList}
          hoveredButton={hoveredButton}
          setHoveredButton={setHoveredButton}
          hoveredColor={hoveredColor}
          setHoveredColor={setHoveredColor}
        />
    </div>
  );
}