# Backend Data Model Documentation

## Overview

This document describes the backend data model for the Theory of Change (ToC) Builder application. The data model is now relational, storing board content (lists, nodes, edges) in separate database tables instead of a single JSON blob.

## Database Schema

### 1. `boards` Table

**Purpose**: Stores board metadata

**Fields**:
- `id` (UUID, PK) - Board identifier
- `title` (VARCHAR) - Board title
- `description` (TEXT) - Board description
- `owner_id` (UUID, FK → users.id) - Board owner
- `is_public` (BOOLEAN) - Public visibility
- `settings` (JSONB) - Board settings
- **`list_ids` (JSONB)** - Ordered array of list IDs
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. `board_lists` Table

**Purpose**: Stores lists/columns within boards (Activities, Outputs, Outcomes, Impact, etc.)

**Fields**:
- `id` (TEXT, PK) - List identifier
- `name` (VARCHAR) - List name
- `color` (VARCHAR) - Hex color code
- `type` (VARCHAR) - 'fixed' or 'intermediate'
- `node_ids` (JSONB) - Ordered array of node IDs
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints**:
- `CHECK (type IN ('fixed', 'intermediate'))`

### 3. `board_nodes` Table

**Purpose**: Stores individual nodes/cards

**Fields**:
- `id` (TEXT, PK) - Node identifier
- `title` (VARCHAR) - Node title
- `description` (TEXT) - Node description
- `type` (VARCHAR) - Node type
- `tags` (JSONB) - Array of tags
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints**:
- `CHECK (type IN ('activity', 'output', 'intermediate_outcome', 'final_outcome', 'impact'))`

**Indexes**:
- GIN index on `tags` for efficient tag filtering

### 4. `board_edges` Table

**Purpose**: Stores connections/relationships between nodes

**Fields**:
- `id` (TEXT, PK) - Edge identifier
- `source_node_id` (TEXT, FK → board_nodes.id) - Source node
- `target_node_id` (TEXT, FK → board_nodes.id) - Target node
- `type` (VARCHAR) - Edge type
- `label` (VARCHAR) - Edge label
- `created_at` (TIMESTAMP)

**Constraints**:
- `CHECK (source_node_id != target_node_id)` - Prevent self-referencing
- `CHECK (type IN ('leads_to', 'enables', 'requires', 'contributes_to'))`
- ON DELETE CASCADE for foreign keys

**Indexes**:
- `idx_board_edges_source` on `source_node_id`
- `idx_board_edges_target` on `target_node_id`
- `idx_board_edges_source_target` on `(source_node_id, target_node_id)`

## Data Relationships

```
boards (1) ──> (M) board_lists (via list_ids array)
board_lists (1) ──> (M) board_nodes (via node_ids array)
board_nodes (1) ──> (M) board_edges (as source or target)
```

**Key Design Decisions**:
- **No direct foreign keys** from lists to boards or nodes to lists
- **Ordering maintained** via JSONB arrays (`list_ids`, `node_ids`)
- **Visual properties excluded** from backend (position, size, collapsed, etc.)
- **Only essential business data stored** in the database

## Backend Models

### BoardList Model (`backend/models/BoardList.js`)

**Key Methods**:
- `create(listData)` - Create new list
- `findById(id)` - Find list by ID
- `findByIds(ids)` - Find multiple lists
- `update(id, updates)` - Update list
- `delete(id)` - Delete list
- `addNode(nodeId)` - Add node to list
- `removeNode(nodeId)` - Remove node from list
- `reorderNodes(nodeIds)` - Reorder nodes

### BoardNode Model (`backend/models/BoardNode.js`)

**Key Methods**:
- `create(nodeData)` - Create new node
- `findById(id)` - Find node by ID
- `findByIds(ids)` - Find multiple nodes
- `findByTag(tag)` - Find nodes with specific tag
- `findByTags(tags)` - Find nodes with any of the tags
- `getAllTags()` - Get all unique tags
- `update(id, updates)` - Update node
- `delete(id)` - Delete node

### BoardEdge Model (`backend/models/BoardEdge.js`)

**Key Methods**:
- `create(edgeData)` - Create new edge
- `findById(id)` - Find edge by ID
- `findBySourceNode(sourceNodeId)` - Find outgoing edges
- `findByTargetNode(targetNodeId)` - Find incoming edges
- `findByNode(nodeId)` - Find all connected edges
- `findByNodes(nodeIds)` - Find edges for multiple nodes
- `exists(sourceNodeId, targetNodeId)` - Check if edge exists
- `update(id, updates)` - Update edge
- `delete(id)` - Delete edge
- `deleteByNode(nodeId)` - Delete all edges connected to node

### Board Model Extensions

**New Methods**:
- `getFullBoardData()` - Get board with lists, nodes, and edges
- `addList(listId)` - Add list to board
- `removeList(listId)` - Remove list from board
- `reorderLists(list_ids)` - Reorder lists

## API Routes

All routes require authentication and appropriate permissions.

### Board Data

```
GET    /api/boards/:boardId/data              Get full board data
```

### Lists

```
POST   /api/boards/:boardId/lists             Create list
PUT    /api/boards/:boardId/lists/:listId     Update list
DELETE /api/boards/:boardId/lists/:listId     Delete list
PUT    /api/boards/:boardId/lists-order       Reorder lists
```

### Nodes

```
POST   /api/boards/:boardId/nodes             Create node
PUT    /api/boards/:boardId/nodes/:nodeId     Update node
DELETE /api/boards/:boardId/nodes/:nodeId     Delete node
GET    /api/boards/:boardId/tags              Get all tags
GET    /api/boards/:boardId/nodes/tags/:tag   Get nodes by tag
```

### Edges

```
POST   /api/boards/:boardId/edges             Create edge
PUT    /api/boards/:boardId/edges/:edgeId     Update edge
DELETE /api/boards/:boardId/edges/:edgeId     Delete edge
```

## Request/Response Examples

### Create List

**Request**:
```json
POST /api/boards/123/lists
{
  "id": "activities",
  "name": "Activities",
  "color": "#3b82f6",
  "type": "fixed",
  "nodeIds": []
}
```

**Response**:
```json
{
  "message": "List created successfully",
  "list": {
    "id": "activities",
    "name": "Activities",
    "color": "#3b82f6",
    "type": "fixed",
    "nodeIds": [],
    "createdAt": "2025-10-14T12:00:00.000Z",
    "updatedAt": "2025-10-14T12:00:00.000Z"
  }
}
```

### Create Node

**Request**:
```json
POST /api/boards/123/nodes
{
  "id": "node-abc",
  "title": "Community Training Workshops",
  "description": "Key activity to implement the program",
  "type": "activity",
  "tags": ["Pillar #1 - Teacher Training"]
}
```

**Response**:
```json
{
  "message": "Node created successfully",
  "node": {
    "id": "node-abc",
    "title": "Community Training Workshops",
    "description": "Key activity to implement the program",
    "type": "activity",
    "tags": ["Pillar #1 - Teacher Training"],
    "createdAt": "2025-10-14T12:00:00.000Z",
    "updatedAt": "2025-10-14T12:00:00.000Z"
  }
}
```

### Create Edge

**Request**:
```json
POST /api/boards/123/edges
{
  "id": "edge-xyz",
  "sourceNodeId": "node-abc",
  "targetNodeId": "node-def",
  "type": "leads_to",
  "label": "leads to"
}
```

**Response**:
```json
{
  "message": "Edge created successfully",
  "edge": {
    "id": "edge-xyz",
    "sourceId": "node-abc",
    "targetId": "node-def",
    "type": "leads_to",
    "label": "leads to",
    "createdAt": "2025-10-14T12:00:00.000Z"
  }
}
```

### Get Full Board Data

**Request**:
```
GET /api/boards/123/data
```

**Response**:
```json
{
  "board": {
    "id": "123",
    "title": "My Theory of Change",
    "description": "Education improvement program",
    "owner_id": "user-123",
    "is_public": false,
    "settings": {},
    "list_ids": ["activities", "outputs", "outcomes"],
    "lists": [...],
    "nodes": [...],
    "edges": [...],
    "created_at": "2025-10-14T12:00:00.000Z",
    "updated_at": "2025-10-14T12:00:00.000Z"
  }
}
```

## Migration

The database schema was created via migration:
- **Migration**: `20251014124852-add-board-content-tables`
- **Up**: Creates `board_lists`, `board_nodes`, `board_edges` tables
- **Down**: Drops all tables and removes `list_ids` from boards

Run migrations:
```bash
npm run migrate        # Apply migrations
npm run migrate:down   # Rollback migrations
```

## Frontend Integration

The frontend `tocModels.js` defines the same structure. When fetching board data:

1. Backend returns structured data matching frontend models
2. Frontend can work with data directly without transformation
3. All visual properties (position, size, etc.) are calculated at render time

## Benefits of This Approach

✅ **Performance**: Efficient queries for tags, edges, and relationships  
✅ **Scalability**: Can handle large boards with 1000+ nodes  
✅ **Flexibility**: Easy to add new fields or relationships  
✅ **Data Integrity**: Foreign keys and constraints prevent orphaned data  
✅ **Queryability**: Can filter/search nodes by tags, lists by type, etc.  
✅ **Separation of Concerns**: Business data in DB, presentation logic in frontend

