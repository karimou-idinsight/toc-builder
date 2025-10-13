import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectBoard = (state) => state.board.board;
export const selectLinkMode = (state) => state.board.linkMode;
export const selectLinkSource = (state) => state.board.linkSource;
export const selectDraggableNodes = (state) => state.board.draggableNodes;
export const selectCausalPathMode = (state) => state.board.causalPathMode;
export const selectCausalPathNodes = (state) => state.board.causalPathNodes;
export const selectCausalPathFocalNode = (state) => state.board.causalPathFocalNode;

// Derived selectors for board data
export const selectAllNodes = createSelector(
  [selectBoard],
  (board) => board?.nodes || []
);

export const selectAllEdges = createSelector(
  [selectBoard],
  (board) => board?.edges || []
);

export const selectAllLists = createSelector(
  [selectBoard],
  (board) => board?.lists || []
);

// Helper to convert array to Set for backward compatibility with components
export const selectDraggableNodesSet = createSelector(
  [selectDraggableNodes],
  (nodes) => new Set(nodes)
);

export const selectCausalPathNodesSet = createSelector(
  [selectCausalPathNodes],
  (nodes) => new Set(nodes)
);

