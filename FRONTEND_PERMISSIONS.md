# Frontend Permissions Implementation

## Overview
Updated the frontend to respect board permissions based on user roles (owner, editor, reviewer, viewer).

## Changes Completed

### 1. Backend Updates ✅
- **File:** `backend/routes/boards.js`
  - Added `userRole` to board data response in `GET /:boardId/data`
  - Removed duplicate route
  - User role is fetched from `BoardPermission.getUserRole()`

### 2. Data Transformation ✅
- **File:** `web/src/utils/boardTransformer.js`
  - Extract `userRole` from backend data
  - Include `userRole` in transformed board object

### 3. Permission Utilities ✅
- **File:** `web/src/utils/permissions.js` (NEW)
  - `canEdit(userRole)` - Returns true for owner/editor
  - `canComment(userRole)` - Returns true for owner/editor/reviewer
  - `canView(userRole)` - Returns true for all roles
  - `isOwner(userRole)` - Returns true for owner only
  - `canManagePermissions(userRole)` - Returns true for owner only
  - `canDeleteBoard(userRole)` - Returns true for owner only
  - Helper functions for role descriptions and badge colors

### 4. Component Updates

#### TocNode.js ✅
- Import `canEdit` and `canComment` from permissions utils
- Check `userCanEdit` and `userCanComment` from `board.userRole`
- Disable editing on double-click for non-editors
- Hide `TocNodeFooter` for non-editors
- Pass `canEdit` and `canComment` props to:
  - `TocNodeContent`
  - `TocNodeEditDialog`
- Prevent edit/duplicate actions for non-editors in context menu handlers

#### TocList.js ✅
- Import `canEdit` from permissions utils
- Check `userCanEdit` from `board.userRole`
- Pass `canEdit` prop to:
  - `TocListHeader`
  - `TocListContent`

### 5. Child Components to Update (TODO)

The following components need to be updated to use the `canEdit` and `canComment` props:

#### TocListHeader.js
- Hide or disable edit/settings/delete buttons if `!canEdit`
- Prevent title editing if `!canEdit`

#### TocListContent.js
- Hide "Add Node" button if `!canEdit`
- Disable add node functionality if `!canEdit`

#### TocNodeContent.js
- Use `canEdit` prop to hide/disable edit buttons
- Use `canComment` prop to hide comment indicators for viewers

#### TocNodeEditDialog.js
- Use `canEdit` prop to make fields read-only for non-editors
- Use `canComment` prop to hide/disable comment tab for viewers
- Show read-only message if user doesn't have edit permissions

#### TocEdges.js / CustomEdge.js
- Disable edge editing for non-editors
- Hide edge edit dialog trigger for non-editors

#### TocEdgesEditDialog.js
- Use `canEdit` prop to make fields read-only
- Use `canComment` prop to hide comment tab for viewers

#### TocToolbar.js
- Disable add list button for non-editors
- Disable other board modification actions for non-editors
- Only show actions appropriate for user's role

## Permission Matrix

| Action | Owner | Editor | Reviewer | Viewer |
|--------|-------|--------|----------|--------|
| View board | ✅ | ✅ | ✅ | ✅ |
| Edit nodes/edges | ✅ | ✅ | ❌ | ❌ |
| Add/delete lists | ✅ | ✅ | ❌ | ❌ |
| Edit list settings | ✅ | ✅ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ✅ | ❌ |
| View comments | ✅ | ✅ | ✅ | ❌ |
| Edit own comments | ✅ | ✅ | ✅ | ❌ |
| Manage permissions | ✅ | ❌ | ❌ | ❌ |
| Delete board | ✅ | ❌ | ❌ | ❌ |

## Testing Instructions

1. **Login as Editor** (`editor1@tocbuilder.com` / `password123`):
   - Should be able to edit nodes, edges, lists
   - Should be able to add comments
   - Should NOT see board settings/permissions options
   - Should NOT see delete board option

2. **Login as Reviewer** (`reviewer@tocbuilder.com` / `password123`):
   - Should be able to view the board
   - Should be able to add and edit comments
   - Should NOT be able to edit nodes/edges
   - Should NOT see node/edge edit buttons or footers

3. **Login as Viewer** (`viewer@tocbuilder.com` / `password123`):
   - Should be able to view the board
   - Should NOT see any comment UI
   - Should NOT see any edit buttons
   - Should NOT see node footers
   - Board should be completely read-only

## Files Modified

### Backend
- `backend/routes/boards.js`

### Frontend
- `web/src/utils/boardTransformer.js`
- `web/src/utils/permissions.js` (NEW)
- `web/src/components/TocNode.js`
- `web/src/components/TocList.js`

### Files Still Need Updates
- `web/src/components/TocListHeader.js`
- `web/src/components/TocListContent.js`
- `web/src/components/TocNodeContent.js`
- `web/src/components/TocNodeEditDialog.js`
- `web/src/components/TocEdges.js`
- `web/src/components/CustomEdge.js`
- `web/src/components/TocEdgesEditDialog.js`
- `web/src/components/TocToolbar.js`

## Next Steps

Continue updating the child components listed above to properly handle the `canEdit` and `canComment` props. Each component should:

1. Accept the permission props
2. Conditionally render edit/delete/comment UI based on permissions
3. Prevent actions when user doesn't have permissions
4. Show appropriate read-only indicators when needed

## Notes

- All test users use password: `password123`
- The super admin (owner) uses password: `admin123`
- Board data now includes `userRole` field
- Permission checks should be done in parent components and passed down as props
- UI elements should be hidden (not just disabled) when user lacks permissions

