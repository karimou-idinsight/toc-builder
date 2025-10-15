# Test Users for Board Permissions

All test users have been created with the same password for easy testing.

## Login Credentials

**Password for all users:** `password123`

## User Accounts

### 1. Board Owner (Super Admin)
- **Email:** `admin@tocbuilder.com`
- **Password:** `admin123` *(different from test users)*
- **Name:** Super Admin
- **Role on Sample Board:** Owner
- **Permissions:** 
  - Full control over the board
  - Can delete the board
  - Can manage permissions
  - Can invite users
  - Can edit all content
  - Can view and comment

---

### 2. Editor #1
- **Email:** `editor1@tocbuilder.com`
- **Password:** `password123`
- **Name:** Alice Editor
- **Role on Sample Board:** Editor
- **Permissions:**
  - ✅ Can add, delete, and modify nodes and edges
  - ✅ Can add and edit comments
  - ✅ Can view the board
  - ❌ Cannot manage permissions
  - ❌ Cannot delete the board
  - ❌ Cannot invite users

---

### 3. Editor #2
- **Email:** `editor2@tocbuilder.com`
- **Password:** `password123`
- **Name:** Bob Collaborator
- **Role on Sample Board:** Editor
- **Permissions:**
  - ✅ Can add, delete, and modify nodes and edges
  - ✅ Can add and edit comments
  - ✅ Can view the board
  - ❌ Cannot manage permissions
  - ❌ Cannot delete the board
  - ❌ Cannot invite users

---

### 4. Reviewer
- **Email:** `reviewer@tocbuilder.com`
- **Password:** `password123`
- **Name:** Charlie Reviewer
- **Role on Sample Board:** Reviewer
- **Permissions:**
  - ✅ Can view the board
  - ✅ Can add and edit their own comments
  - ✅ Can view all comments
  - ❌ Cannot modify nodes or edges
  - ❌ Cannot manage permissions
  - ❌ Cannot delete the board

---

### 5. Viewer
- **Email:** `viewer@tocbuilder.com`
- **Password:** `password123`
- **Name:** Diana Observer
- **Role on Sample Board:** Viewer
- **Permissions:**
  - ✅ Can view the board (nodes and edges)
  - ❌ Cannot add or view comments
  - ❌ Cannot modify anything
  - ❌ Cannot manage permissions

---

## Testing the Permissions

### What to Test

1. **As Editor (editor1@tocbuilder.com or editor2@tocbuilder.com):**
   - Try adding a new node ✅ Should work
   - Try editing an existing node ✅ Should work
   - Try deleting a node ✅ Should work
   - Try adding a comment ✅ Should work
   - Try accessing board settings/permissions ❌ Should fail
   - Try deleting the board ❌ Should fail

2. **As Reviewer (reviewer@tocbuilder.com):**
   - Try viewing the board ✅ Should work
   - Try adding a comment ✅ Should work
   - Try editing your own comment ✅ Should work
   - Try editing someone else's comment ❌ Should fail (unless you're the owner)
   - Try adding a node ❌ Should fail
   - Try editing an edge ❌ Should fail

3. **As Viewer (viewer@tocbuilder.com):**
   - Try viewing the board ✅ Should work
   - Try adding a comment ❌ Should fail
   - Try viewing comments ❌ Should not see comment UI
   - Try adding a node ❌ Should fail
   - Try editing anything ❌ Should fail

4. **As Owner (admin@tocbuilder.com):**
   - Try everything ✅ Everything should work
   - Try managing permissions ✅ Should work
   - Try deleting the board ✅ Should work

---

## Sample Board

All test users have been given permissions on the **"Sample Theory of Change - Education Program"** board.

The board is also marked as **public**, so anyone can view it even without an account.

---

## Database Information

The test users and their permissions were created using migration:
- **Migration:** `20251015160121-add-test-users-with-permissions`
- **Board:** Sample Theory of Change - Education Program (ID: 1)
- **Permissions Table:** `board_permissions`

To view all permissions for the sample board in the database:
```sql
SELECT 
  u.email, 
  u.first_name, 
  u.last_name, 
  bp.role,
  bp.created_at
FROM board_permissions bp
JOIN users u ON bp.user_id = u.id
JOIN boards b ON bp.board_id = b.id
WHERE b.title = 'Sample Theory of Change - Education Program'
ORDER BY 
  CASE bp.role 
    WHEN 'owner' THEN 1 
    WHEN 'editor' THEN 2 
    WHEN 'reviewer' THEN 3 
    WHEN 'viewer' THEN 4 
  END;
```

