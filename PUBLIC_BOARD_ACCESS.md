# Public Board Access Implementation

## Overview
Implemented automatic viewer access for **all users** (including unauthenticated users) to public boards. Anyone can view public boards without requiring login or explicit permission assignment.

## Changes Made

### 1. Board.hasPermission() Method
**File:** `backend/models/Board.js`

Updated the permission checking logic to grant automatic viewer access for public boards:

```javascript
async hasPermission(userId, requiredRole) {
  // Check user's role on this board
  const query = `
    SELECT role FROM board_permissions 
    WHERE board_id = $1 AND user_id = $2
  `;
  
  const result = await pool.query(query, [this.id, userId]);
  
  // Define role hierarchy
  const roleHierarchy = {
    'owner': 4,
    'editor': 3,
    'reviewer': 2,
    'viewer': 1
  };
  
  // If user has an explicit permission, check it
  if (result.rows.length > 0) {
    const userRole = result.rows[0].role;
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
  
  // If user has no explicit permission, check if board is public
  // Public boards automatically grant viewer access to any authenticated user
  if (this.is_public && roleHierarchy[requiredRole] <= roleHierarchy['viewer']) {
    return true;
  }
  
  return false;
}
```

**Behavior:**
- First checks if user has explicit permission (owner, editor, reviewer, viewer)
- If no explicit permission exists, checks if board is public
- If board is public and required role is 'viewer', grants access
- Public boards do NOT grant automatic editor, reviewer, or owner access

### 2. BoardPermission.getUserRole() Method
**File:** `backend/models/BoardPermission.js`

Updated to return 'viewer' role for public boards when user has no explicit permission:

```javascript
static async getUserRole(boardId, userId) {
  // Check permissions table
  const permissionQuery = `
    SELECT role FROM board_permissions 
    WHERE board_id = $1 AND user_id = $2
  `;
  
  const result = await pool.query(permissionQuery, [boardId, userId]);
  
  // If user has explicit permission, return it
  if (result.rows.length > 0) {
    return result.rows[0].role;
  }
  
  // If no explicit permission, check if board is public
  const { default: Board } = await import('./Board.js');
  const board = await Board.findById(boardId);
  
  if (board && board.is_public) {
    // Public boards grant viewer access to any authenticated user
    return 'viewer';
  }
  
  return null;
}
```

**Behavior:**
- Returns explicit role if one exists
- Returns 'viewer' for public boards when user has no explicit permission
- Returns null for private boards when user has no explicit permission

## Permission Matrix

### Public Boards
| User Type | Viewer Access | Reviewer Access | Editor Access | Owner Access |
|-----------|---------------|-----------------|---------------|--------------|
| Not Logged In | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Logged In (No Explicit Permission) | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Logged In (Explicit Viewer) | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Logged In (Explicit Reviewer) | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| Logged In (Explicit Editor) | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Logged In (Owner) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

### Private Boards
| User Type | Viewer Access | Reviewer Access | Editor Access | Owner Access |
|-----------|---------------|-----------------|---------------|--------------|
| Not Logged In | ❌ No | ❌ No | ❌ No | ❌ No |
| Logged In (No Explicit Permission) | ❌ No | ❌ No | ❌ No | ❌ No |
| Logged In (Explicit Viewer) | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Logged In (Explicit Reviewer) | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| Logged In (Explicit Editor) | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Logged In (Owner) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

## Frontend Impact

### User Role Display
When a user accesses a public board without explicit permissions:
- The frontend will receive `userRole: 'viewer'` in the board data response
- The UI will show view-only controls (no edit, no comment buttons)
- The user can:
  - ✅ View all nodes and edges
  - ✅ View the board structure
  - ✅ Use the "Show Causal Path" feature
  - ❌ Cannot edit nodes or edges
  - ❌ Cannot add comments
  - ❌ Cannot add assumptions
  - ❌ Cannot modify board settings

### Sample Board (ID: 1)
The "Sample Theory of Change - Education Program" board is public, so:
- Any logged-in user can access it as a viewer
- Test users (editor1, editor2, reviewer, viewer) have their explicit roles
- Any other logged-in user will have automatic viewer access

## API Endpoints Affected
All board endpoints now respect the new public board access rules:
- `GET /api/boards/:boardId/data` - Returns board data with userRole='viewer' for public boards
- `GET /api/boards/:boardId` - Accessible to any authenticated user for public boards
- `PUT /api/boards/:boardId` - Still requires editor permission (not auto-granted)
- `POST /api/boards/:boardId/nodes` - Still requires editor permission (not auto-granted)
- `POST /api/boards/:boardId/nodes/:nodeId/comments` - Still requires reviewer permission (not auto-granted)

### 3. Authentication Middleware Updates
**File:** `backend/middleware/auth.js`

Added new middleware to allow unauthenticated access to public boards:

```javascript
// Board permission middleware that allows public access for viewer role
const allowPublicBoardAccess = (requiredRole) => {
  return async (req, res, next) => {
    // ... gets board
    
    // If user is authenticated, check their permissions normally
    if (req.user) {
      const hasPermission = await board.hasPermission(req.user.id, requiredRole);
      // ... check permission
    } else {
      // User is not authenticated - check if board is public and role is viewer
      if (!board.is_public) {
        return res.status(401).json({ 
          error: 'Authentication required for private boards' 
        });
      }
      
      // Only allow viewer access for unauthenticated users
      if (roleHierarchy[requiredRole] > roleHierarchy['viewer']) {
        return res.status(401).json({ 
          error: 'Authentication required for this action' 
        });
      }
    }
    
    req.board = board;
    next();
  };
};
```

### 4. API Route Updates
**File:** `backend/routes/boards.js`

Updated the board data endpoint to use `optionalAuth` and `allowPublicBoardViewer`:

```javascript
// Before
router.get('/:boardId/data', authenticateToken, requireBoardViewer, async (req, res) => { ... });

// After
router.get('/:boardId/data', optionalAuth, allowPublicBoardViewer, async (req, res) => { ... });
```

This allows the endpoint to work without authentication for public boards.

### 5. Frontend Updates
**Files:** `web/src/utils/boardsApi.js`, `web/src/pages/board/[id].js`

- Updated `getAuthHeaders()` to make Authorization header optional (only added if token exists)
- Removed `ProtectedRoute` wrapper from board page to allow unauthenticated access
- Backend will handle permission checks and return appropriate errors

## Security Considerations
✅ **Public Access Controlled:** Only public boards are accessible without authentication
✅ **View-Only for Unauthenticated:** Unauthenticated users can only view, not edit/comment
✅ **Board Owner Control:** Board owners control visibility via the `is_public` flag
✅ **Explicit Permissions Respected:** Explicit permissions always take precedence
✅ **Private Boards Protected:** Private boards still require authentication
✅ **Higher Actions Require Auth:** Editing, commenting, etc. require authentication

## Testing
To test this feature:

### Test 1: Unauthenticated Access
1. Create a public board (set `is_public = true`)
2. Log out (or open in incognito/private window)
3. Navigate directly to the board's URL (e.g., `/board/1`)
4. Expected: Board loads and displays in view-only mode
5. The user's role should be "viewer"
6. Edit/comment buttons should not be visible

### Test 2: Authenticated User Without Explicit Permission
1. Create a public board (set `is_public = true`)
2. Log in as a user who is NOT in the board_permissions table for that board
3. Navigate to the board's URL
4. Expected: User can view the board but cannot edit or comment
5. The user's role should display as "viewer" in the UI

### Test 3: Private Board Access
1. Try to access a private board while not logged in
2. Expected: API should return 401 error
3. Frontend should show error message or redirect to login

## Future Enhancements
- Consider adding a public viewer count to boards
- Add UI to show "You're viewing this as a guest viewer" message
- Add a "Request Access" button for public boards to request higher permissions
- Add analytics to track public board views

