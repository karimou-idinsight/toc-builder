# Redux Permissions Refactor - Complete

## Overview
Refactored the frontend permission system to use Redux selectors instead of prop drilling. This provides a cleaner, more maintainable architecture where components can directly access permissions from the global state.

## ✅ Changes Completed

### 1. Redux Selectors (`web/src/store/selectors.js`)

Added four new permission selectors:

```javascript
// Get user's role from board state
export const selectUserRole = createSelector(
  [selectBoard],
  (board) => board?.userRole || 'viewer'
);

// Check if user can edit (owner or editor)
export const selectCanEdit = createSelector(
  [selectUserRole],
  (userRole) => {
    const roleHierarchy = { owner: 4, editor: 3, reviewer: 2, viewer: 1 };
    return (roleHierarchy[userRole] || 0) >= roleHierarchy.editor;
  }
);

// Check if user can comment (owner, editor, or reviewer)
export const selectCanComment = createSelector(
  [selectUserRole],
  (userRole) => {
    const roleHierarchy = { owner: 4, editor: 3, reviewer: 2, viewer: 1 };
    return (roleHierarchy[userRole] || 0) >= roleHierarchy.reviewer;
  }
);

// Check if user is owner
export const selectIsOwner = createSelector(
  [selectUserRole],
  (userRole) => userRole === 'owner'
);
```

### 2. Components Updated to Use Redux

#### `TocNodeFooter.js`
- **Before**: Accepted `canEdit` as prop
- **After**: Uses `useSelector(selectCanEdit)` directly
- **Benefit**: No prop drilling needed

#### `TocNode.js`
- **Before**: Calculated permissions from `board.userRole` using utility functions, passed as props to children
- **After**: Uses `useSelector(selectCanEdit)` and `useSelector(selectCanComment)` directly
- **Removed**: Import of `canEdit` and `canComment` from utils/permissions
- **Benefit**: Cleaner component, no prop drilling

#### `TocList.js`
- **Before**: Calculated permissions using `canEdit()` utility, passed to children
- **After**: Removed local permission calculations, children use Redux directly
- **Removed**: Import of `canEdit` from utils/permissions

#### `TocListHeader.js`
- **Before**: Accepted `canEdit` as prop
- **After**: Uses `useSelector(selectCanEdit)` directly

#### `TocListContent.js`
- **Before**: Accepted `canEdit` as prop
- **After**: Uses `useSelector(selectCanEdit)` directly

### 3. Removed Prop Drilling

**Before:**
```
TocBoard → TocList → TocListHeader (canEdit prop)
                  → TocListContent (canEdit prop)
          → TocNode → TocNodeFooter (canEdit prop)
                  → TocNodeContent (canEdit, canComment props)
                  → TocNodeEditDialog (canEdit, canComment props)
```

**After:**
```
Redux Store (board.userRole)
    ↓
All components use useSelector(selectCanEdit/selectCanComment) directly
```

## Benefits

### 1. **No Prop Drilling**
- Components get permissions directly from Redux
- No need to pass props through multiple layers
- Easier to add new components that need permissions

### 2. **Single Source of Truth**
- All permission logic in one place (Redux selectors)
- Consistent permission checks across the app
- Easy to modify permission rules

### 3. **Memoization**
- `createSelector` memoizes results
- Components only re-render when permissions actually change
- Better performance

### 4. **Type Safety & Maintainability**
- Clear API: `useSelector(selectCanEdit)`
- No confusion about where permissions come from
- Easier to refactor

### 5. **Testability**
- Can mock Redux store for testing
- Test permission logic in selectors independently
- Components easier to test without prop setup

## Permission Matrix (Unchanged)

| Action | Owner | Editor | Reviewer | Viewer |
|--------|-------|--------|----------|--------|
| View board | ✅ | ✅ | ✅ | ✅ |
| Show causal path | ✅ | ✅ | ✅ | ✅ |
| Edit nodes/edges | ✅ | ✅ | ❌ | ❌ |
| Add/delete lists | ✅ | ✅ | ❌ | ❌ |
| Edit list settings | ✅ | ✅ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ✅ | ❌ |
| View comments | ✅ | ✅ | ✅ | ❌ |
| Edit own comments | ✅ | ✅ | ✅ | ❌ |
| Manage permissions | ✅ | ❌ | ❌ | ❌ |
| Delete board | ✅ | ❌ | ❌ | ❌ |

## Files Modified

### Redux
- `web/src/store/selectors.js` - Added permission selectors

### Components
- `web/src/components/TocNode.js`
- `web/src/components/TocNodeFooter.js`
- `web/src/components/TocList.js`
- `web/src/components/TocListHeader.js`
- `web/src/components/TocListContent.js`

## Usage Example

```javascript
// In any component that needs permissions
import { useSelector } from 'react-redux';
import { selectCanEdit, selectCanComment, selectIsOwner } from '../store/selectors';

function MyComponent() {
  const canEdit = useSelector(selectCanEdit);
  const canComment = useSelector(selectCanComment);
  const isOwner = useSelector(selectIsOwner);
  
  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canComment && <button>Comment</button>}
      {isOwner && <button>Manage Permissions</button>}
    </div>
  );
}
```

## Next Steps

The following components still need to be updated to use Redux selectors:

1. ❌ **TocNodeContent.js** - Still receives `canEdit`, `canComment` as props
2. ❌ **TocNodeEditDialog.js** - Still receives `canEdit`, `canComment` as props
3. ❌ **TocEdges.js** / **CustomEdge.js** - Need to add permission checks
4. ❌ **TocEdgesEditDialog.js** - Need to add permission checks
5. ❌ **TocToolbar.js** - Need to add permission checks

These can be updated in the same way:
1. Import `useSelector` from 'react-redux'
2. Import needed selectors from '../store/selectors'
3. Call `useSelector(selectCanEdit)` in the component
4. Remove `canEdit` / `canComment` from props

## Notes

- The `utils/permissions.js` file still exists and can be used for utility functions if needed, but components should prefer Redux selectors
- All selectors use memoization via `createSelector` for optimal performance
- Role hierarchy is defined in selectors (can be extracted to constants if needed)
- Permission checks are read-only - actual permission enforcement happens on the backend

