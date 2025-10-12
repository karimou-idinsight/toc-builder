'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TocNode from './TocNode';
import { tocListContentStyles } from '../styles/TocListContent.styles';

export default function TocListContent({
  nodes,
  isAddingNode,
  setIsAddingNode,
  newNodeTitle,
  setNewNodeTitle,
  handleAddNode,
  hoveredButton,
  setHoveredButton,
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
  return (
    <div style={tocListContentStyles.container}>
      <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
        <div style={tocListContentStyles.nodesContainer}>
          {nodes.map(node => (
            <TocNode
              key={node.id}
              node={node}
              onUpdate={onUpdateNode}
              onDelete={onDeleteNode}
              onDuplicate={onDuplicateNode}
              onClick={onNodeClick}
              linkMode={linkMode}
              isLinkSource={linkSource === node.id}
              connectedNodes={getConnectedNodes(node.id)}
              isDraggable={draggableNodes?.has(node.id) || false}
              onToggleDraggable={onToggleNodeDraggable}
              onStartLinking={onStartLinking}
              onShowCausalPath={onShowCausalPath}
              causalPathMode={causalPathMode}
              isInCausalPath={causalPathNodes?.has(node.id) || false}
              isCausalPathFocalNode={causalPathFocalNode === node.id}
              allNodes={allNodes}
              board={board}
              onAddEdge={onAddEdge}
              onDeleteEdge={onDeleteEdge}
            />
          ))}
        </div>
      </SortableContext>

      <div style={tocListContentStyles.footer}>
        {isAddingNode ? (
          <form onSubmit={handleAddNode} style={tocListContentStyles.addNodeForm}>
            <input
              type="text"
              value={newNodeTitle}
              onChange={e => setNewNodeTitle(e.target.value)}
              placeholder="Enter node title..."
              autoFocus
              style={tocListContentStyles.addNodeInput}
            />
            <div style={tocListContentStyles.addNodeActions}>
              <button
                type="submit"
                style={{
                  ...tocListContentStyles.addButton,
                  ...(hoveredButton === 'add' ? tocListContentStyles.addButtonHover : {}),
                }}
                onMouseEnter={() => setHoveredButton('add')}
                onMouseLeave={() => setHoveredButton(null)}
              >Add</button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNode(false);
                  setNewNodeTitle('');
                }}
                style={{
                  ...tocListContentStyles.cancelButton,
                  ...(hoveredButton === 'cancel' ? tocListContentStyles.cancelButtonHover : {}),
                }}
                onMouseEnter={() => setHoveredButton('cancel')}
                onMouseLeave={() => setHoveredButton(null)}
              >Cancel</button>
            </div>
          </form>
        ) : (
          <button
            style={{
              ...tocListContentStyles.addNodeButton,
              ...(hoveredButton === 'addNode' ? tocListContentStyles.addNodeButtonHover : {}),
            }}
            onClick={() => setIsAddingNode(true)}
            onMouseEnter={() => setHoveredButton('addNode')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            + Add Node
          </button>
        )}
      </div>
    </div>
  );
}