import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectBoard = (state) => state.board.board;
export const selectLinkMode = (state) => state.board.linkMode;
export const selectLinkSource = (state) => state.board.linkSource;
export const selectDraggableNodes = (state) => state.board.draggableNodes;
export const selectCausalPathMode = (state) => state.board.causalPathMode;
export const selectCausalPathNodes = (state) => state.board.causalPathNodes;
export const selectCausalPathFocalNodes = (state) => state.board.causalPathFocalNodes || [];

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

export const selectCausalPathFocalNodesSet = createSelector(
  [selectCausalPathFocalNodes],
  (nodes) => new Set(nodes)
);

// Tag filter selectors
export const selectSelectedTags = (state) => state.board.selectedTags;
export const selectTagFilterMode = (state) => state.board.tagFilterMode;
export const selectTagFilterNodes = (state) => state.board.tagFilterNodes;
export const selectTagFilterNodesSet = createSelector(
  [selectTagFilterNodes],
  (nodes) => new Set(nodes)
);

// Permission selectors
export const selectUserRole = createSelector(
  [selectBoard],
  (board) => {
    console.log('selectUserRole - board:', board);
    console.log('selectUserRole - board.userRole:', board?.userRole);
    return board?.userRole || 'viewer';
  }
);

export const selectCanEdit = createSelector(
  [selectUserRole],
  (userRole) => {
    const roleHierarchy = { owner: 4, editor: 3, reviewer: 2, viewer: 1 };
    return (roleHierarchy[userRole] || 0) >= roleHierarchy.editor;
  }
);

export const selectCanComment = createSelector(
  [selectUserRole],
  (userRole) => {
    const roleHierarchy = { owner: 4, editor: 3, reviewer: 2, viewer: 1 };
    console.log('userRole', userRole);
    return (roleHierarchy[userRole] || 0) >= roleHierarchy.reviewer;
  }
);

export const selectIsOwner = createSelector(
  [selectUserRole],
  (userRole) => userRole === 'owner'
);
