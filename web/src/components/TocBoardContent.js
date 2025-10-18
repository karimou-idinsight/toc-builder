import React, { useMemo, memo } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import TocList from './TocList';
import TocNode from './TocNode';
import TocEdges from './TocEdges';
import { getNodesByListId, getFilteredEdges } from '../utils/nodeUtils';

/**
 * Main board content component with drag and drop functionality
 */
const TocBoardContent = memo(function TocBoardContent({
  board,
  boardInnerRef,
  boardOperations,
  causalPath,
  tagFiltering,
  dragAndDrop,
  allNodes,
  allEdges
}) {
  // Memoize filtered edges to avoid recalculation on every render
  const filteredEdges = useMemo(() => {
    return getFilteredEdges(
      allEdges,
      allNodes,
      board,
      causalPath.causalPathMode,
      causalPath.causalPathNodes,
      tagFiltering.tagFilterMode,
      tagFiltering.tagFilterNodes
    );
  }, [allEdges, allNodes, board, causalPath.causalPathMode, causalPath.causalPathNodes, tagFiltering.tagFilterMode, tagFiltering.tagFilterNodes]);

  // Memoize sorted lists to avoid recalculation
  const sortedLists = useMemo(() => {
    return [...(board?.lists || [])].sort((a, b) => a.order - b.order);
  }, [board?.lists]);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={dragAndDrop.handleDragStart}
      onDragEnd={dragAndDrop.handleDragEnd}
    >
      <div ref={boardInnerRef} style={{ 
        position: 'relative',
        display: 'flex',
        gap: '120px',
        margin: '16px',
        minHeight: '100%',
        alignItems: 'flex-start',
        overflow: 'auto'
      }}>
        <SortableContext 
          items={board?.lists?.map(list => list.id) || []} 
          strategy={horizontalListSortingStrategy}
        >
          {sortedLists.map((list) => (
            <TocList
              key={list.id}
              list={list}
              nodes={getNodesByListId(
                allNodes,
                list.id,
                causalPath.causalPathMode,
                causalPath.causalPathNodes,
                tagFiltering.tagFilterMode,
                tagFiltering.tagFilterNodes
              )}
              onUpdateList={boardOperations.updateList}
              onDeleteList={boardOperations.deleteList}
              onAddNode={(title, type) => boardOperations.addNode(title, list.id, type)}
              onUpdateNode={boardOperations.updateNode}
              onDeleteNode={boardOperations.deleteNode}
              onDuplicateNode={boardOperations.duplicateNode}
              onNodeClick={boardOperations.handleNodeClick}
              onExitCausalPathMode={causalPath.exitCausalPathMode}
              getConnectedNodes={boardOperations.getConnectedNodes}
              onToggleNodeDraggable={boardOperations.toggleNodeDraggable}
              onStartLinking={boardOperations.handleNodeStartLinking}
              onShowCausalPath={causalPath.enterCausalPathMode}
              onAddEdge={boardOperations.addEdge}
              onDeleteEdge={boardOperations.deleteEdge}
            />
          ))}
        </SortableContext>
        
        <TocEdges
          boardId={board?.id}
          edges={filteredEdges}
          onUpdateEdge={boardOperations.updateEdge}
          onDeleteEdge={boardOperations.deleteEdge}
        />
      </div>

      <DragOverlay>
        {dragAndDrop.activeId && dragAndDrop.dragType === 'node' ? (
          <TocNode
            node={allNodes.find(n => n.id === dragAndDrop.activeId)}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});

export default TocBoardContent;
