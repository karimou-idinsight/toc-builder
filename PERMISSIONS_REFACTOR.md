# Board Permissions Refactor

## Overview
Successfully refactored the board permissions system to use role-based access control (RBAC) instead of a simple `owner_id` column.

## Changes Made

### 1. Database Schema Changes

**Migration**: `20251015154735-refactor-board-permissions`

- **Removed**: `owner_id` column from `boards` table
- **Updated**: Role values from `contributor` → `editor`
- **Added**: Unique constraint ensuring only one owner per board
- **Updated**: `board_permissions.role` constraint to include new roles: `owner`, `editor`, `reviewer`, `viewer`
- **Updated**: `board_invitations.role` constraint to use `editor` instead of `contributor`

### 2. Role Definitions

| Role | Permissions |
|------|-------------|
| **Owner** | Full control over the board, including deletion. Can manage permissions, invite users, and do everything editors/reviewers/viewers can do. Only one owner per board. |
| **Editor** | Can add, delete, and modify nodes and edges. Can comment. Can view the board. Cannot manage permissions or delete the board. |
| **Reviewer** | Can view the board and all comments. Can add, edit, and delete their own comments. Cannot modify nodes or edges. |
| **Viewer** | Can only display the board (nodes and edges). Cannot comment or modify anything. |

### 3. Model Updates

#### Board.js
- Removed `owner_id` property from constructor and `toJSON()`
- Updated `create()` to not insert `owner_id` and to create owner permission
- Updated `findByOwner()` to join with `board_permissions`
- Updated `findPublic()` to join with `board_permissions` to get owner info
- Updated `findByUserAccess()` to only use `board_permissions` table
- Updated `hasPermission()` to use new role hierarchy (owner > editor > reviewer > viewer)
- Updated `withOwner()` to join with `board_permissions` to get owner info

#### BoardPermission.js
- Removed `owner_id` check from `getUserRole()` - now only checks `board_permissions` table

### 4. Middleware Updates

#### auth.js
- Added `requireBoardEditor` middleware (replaces `requireBoardContributor`)
- Kept `requireBoardContributor` as backward compatibility alias (maps to `editor`)
- Updated role hierarchy to use `editor` instead of `contributor`

### 5. Route Updates

#### boards.js

**Permission Changes**:
- Board update: `requireBoardEditor` (was `requireBoardContributor`)
- List create/update/delete/reorder: `requireBoardEditor`
- Comments create/update/delete: `requireBoardReviewer` (was `requireBoardContributor`)
  - Reviewers can now comment, fulfilling their role
- Assumptions create/update/delete: `requireBoardEditor`
- Invitations: `requireBoardOwner` (was `requireBoardContributor`)

**Authorization Checks**:
- Replaced all `req.board.owner_id !== req.user.id` checks with:
  ```javascript
  const userRole = await BoardPermission.getUserRole(req.board.id, req.user.id);
  if (comment.user_id !== req.user.id && userRole !== 'owner') {
    // Not authorized
  }
  ```

**Role Validation**:
- Updated all role validation from `['contributor', 'reviewer', 'viewer']` to `['editor', 'reviewer', 'viewer']`
- Updated error messages accordingly

## Migration Notes

### Data Migration
The migration automatically:
1. Updates existing `contributor` roles to `editor`
2. Creates owner permissions from existing `owner_id` values
3. Ensures no duplicate permissions are created
4. Removes the `owner_id` column after migration

### Rollback
The down migration:
1. Adds back the `owner_id` column
2. Populates it from owner permissions
3. Removes owner permissions from `board_permissions`
4. Restores old role names

## Testing Checklist

- [ ] Board creation creates owner permission
- [ ] Only one owner per board constraint works
- [ ] Owners can do everything
- [ ] Editors can modify board content but not delete board
- [ ] Reviewers can comment but not modify nodes/edges
- [ ] Viewers can only view
- [ ] Permission updates work correctly
- [ ] Board deletion removes all permissions (CASCADE)
- [ ] Invitations use new role names

## API Changes

### Breaking Changes
None for API consumers - all endpoints remain the same. However:
- Role values have changed from `contributor` to `editor`
- Clients should update to use `editor` instead of `contributor`

### New Behavior
- `GET /boards/:boardId` now returns owner info from permissions join
- Comments can be created by users with `reviewer` role or higher
- Only `owner` can invite users to boards (more restrictive than before)

## Benefits

1. **Single Source of Truth**: All permissions in one table
2. **Flexibility**: Easier to add new roles or permission levels
3. **Consistency**: Owner is treated the same as other roles
4. **Better Access Control**: Clear separation between view/comment/edit permissions
5. **Database Integrity**: Unique constraint ensures only one owner per board

