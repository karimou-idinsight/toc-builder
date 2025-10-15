# Comments Feature Documentation

## Overview
Added the ability to comment on both nodes and edges in the TOC Builder application.

## Database Schema

### Tables Created

#### `board_node_comments`
- `id` (SERIAL PRIMARY KEY)
- `node_id` (INTEGER) - References `board_nodes(id)` with CASCADE delete
- `user_id` (INTEGER) - References `users(id)` with CASCADE delete
- `content` (TEXT) - The comment content
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes:**
- `idx_board_node_comments_node_id` - Fast lookup by node
- `idx_board_node_comments_user_id` - Fast lookup by user
- `idx_board_node_comments_created_at` - Sorted by creation date

#### `board_edge_comments`
- `id` (SERIAL PRIMARY KEY)
- `edge_id` (INTEGER) - References `board_edges(id)` with CASCADE delete
- `user_id` (INTEGER) - References `users(id)` with CASCADE delete
- `content` (TEXT) - The comment content
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes:**
- `idx_board_edge_comments_edge_id` - Fast lookup by edge
- `idx_board_edge_comments_user_id` - Fast lookup by user
- `idx_board_edge_comments_created_at` - Sorted by creation date

## Backend Implementation

### Models

#### `BoardNodeComment` (`backend/models/BoardNodeComment.js`)
Methods:
- `create(commentData)` - Create a new node comment
- `findById(id)` - Find comment by ID (includes user info)
- `findByNodeId(node_id)` - Get all comments for a node
- `findByNodeIds(node_ids)` - Get comments for multiple nodes
- `findByUserId(user_id)` - Get all comments by a user
- `update(id, updates)` - Update a comment
- `delete(id)` - Delete a comment
- `deleteByNodeId(node_id)` - Delete all comments for a node
- `isOwnedBy(userId)` - Check if user owns the comment

#### `BoardEdgeComment` (`backend/models/BoardEdgeComment.js`)
Methods:
- `create(commentData)` - Create a new edge comment
- `findById(id)` - Find comment by ID (includes user info)
- `findByEdgeId(edge_id)` - Get all comments for an edge
- `findByEdgeIds(edge_ids)` - Get comments for multiple edges
- `findByUserId(user_id)` - Get all comments by a user
- `update(id, updates)` - Update a comment
- `delete(id)` - Delete a comment
- `deleteByEdgeId(edge_id)` - Delete all comments for an edge
- `isOwnedBy(userId)` - Check if user owns the comment

### API Endpoints

All endpoints require authentication. Comment creation, update, and deletion require board contributor permissions or higher.

#### Node Comments

**GET** `/api/boards/:boardId/nodes/:nodeId/comments`
- Get all comments for a specific node
- Requires: Board viewer permission
- Returns: Array of comments with user information

**POST** `/api/boards/:boardId/nodes/:nodeId/comments`
- Create a comment on a node
- Requires: Board contributor permission
- Body: `{ content: string }`
- Returns: Created comment with user information

**PUT** `/api/boards/:boardId/nodes/:nodeId/comments/:commentId`
- Update a comment
- Requires: Board contributor permission + (comment owner OR board owner)
- Body: `{ content: string }`
- Returns: Updated comment with user information

**DELETE** `/api/boards/:boardId/nodes/:nodeId/comments/:commentId`
- Delete a comment
- Requires: Board contributor permission + (comment owner OR board owner)
- Returns: Success message

#### Edge Comments

**GET** `/api/boards/:boardId/edges/:edgeId/comments`
- Get all comments for a specific edge
- Requires: Board viewer permission
- Returns: Array of comments with user information

**POST** `/api/boards/:boardId/edges/:edgeId/comments`
- Create a comment on an edge
- Requires: Board contributor permission
- Body: `{ content: string }`
- Returns: Created comment with user information

**PUT** `/api/boards/:boardId/edges/:edgeId/comments/:commentId`
- Update a comment
- Requires: Board contributor permission + (comment owner OR board owner)
- Body: `{ content: string }`
- Returns: Updated comment with user information

**DELETE** `/api/boards/:boardId/edges/:edgeId/comments/:commentId`
- Delete a comment
- Requires: Board contributor permission + (comment owner OR board owner)
- Returns: Success message

### Board Data Loading

The `Board.getFullBoardData()` method now includes comments:
```javascript
{
  ...boardData,
  lists: [...],
  nodes: [...],
  edges: [...],
  nodeComments: [...], // NEW: All comments for nodes in the board
  edgeComments: [...]  // NEW: All comments for edges in the board
}
```

## Sample Data

Sample comments have been added to the sample board (Board ID: 1):
- **10 node comments** across various nodes
- **5 edge comments** across various edges
- All comments are authored by the Super Admin user
- Comments include realistic feedback and observations

## Migrations

1. **20251015085841-add-comment-tables** - Creates comment tables and indexes
2. **20251015090450-seed-sample-comments** - Adds sample comments to the sample board

## Security & Permissions

- **View comments**: Requires board viewer permission (or higher)
- **Create comments**: Requires board contributor permission (or higher)
- **Update comments**: Requires board contributor permission + must be comment owner OR board owner
- **Delete comments**: Requires board contributor permission + must be comment owner OR board owner

## Frontend Integration (To Do)

To integrate comments in the frontend, you'll need to:

1. Fetch comments when loading board data (already included in the board data response)
2. Create UI components for displaying comments
3. Add comment input forms for nodes and edges
4. Implement real-time updates if needed
5. Add comment indicators to nodes/edges showing comment count

Example API usage:
```javascript
// Get comments for a node
const response = await fetch(`/api/boards/${boardId}/nodes/${nodeId}/comments`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { comments } = await response.json();

// Create a comment
const response = await fetch(`/api/boards/${boardId}/nodes/${nodeId}/comments`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ content: 'This is my comment' })
});
const { comment } = await response.json();
```

## Comment Object Structure

```javascript
{
  id: 1,
  node_id: 1,           // or edge_id for edge comments
  user_id: 1,
  content: "Comment text",
  user: {               // Populated user info
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    avatar_url: "https://..."
  },
  created_at: "2025-10-15T08:00:00Z",
  updated_at: "2025-10-15T08:00:00Z"
}
```

