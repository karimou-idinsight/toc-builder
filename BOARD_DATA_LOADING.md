# Board Data Loading - Frontend Implementation

## Overview
The frontend has been updated to load Theory of Change board data from the backend API instead of using dummy data. This enables dynamic board loading and management.

## Changes Made

### 1. API Functions (`web/src/utils/boardsApi.js`)
Added new API functions for board data and list management:

```javascript
// Get full board data (board + lists + nodes + edges)
async getBoardData(boardId)

// Board Lists Management
async createList(boardId, listData)
async updateList(boardId, listId, listData)
async deleteList(boardId, listId)
async reorderLists(boardId, listIds)
```

### 2. Data Transformer (`web/src/utils/boardTransformer.js`) - NEW FILE
Created utility functions to transform data between backend and frontend formats:

**Backend Format:**
```json
{
  "board": { "id": 1, "title": "...", "list_ids": [1, 2, 3], "settings": {} },
  "lists": [{ "id": 1, "name": "...", "node_ids": [1, 2] }],
  "nodes": [{ "id": 1, "title": "...", "type": "activity" }],
  "edges": [{ "id": 1, "source_node_id": 1, "target_node_id": 2 }]
}
```

**Frontend Format:**
```json
{
  "id": "1",
  "name": "...",
  "lists": [{ "id": "1", "nodeIds": ["1", "2"], "order": 0 }],
  "nodes": [{ "id": "1", "listId": "1", "position": {}, "size": {} }],
  "edges": [{ "id": "1", "sourceId": "1", "targetId": "2", "style": {} }]
}
```

**Key Transformations:**
- IDs: Number (backend) → String (frontend)
- Field names: `title` → `name`, `node_ids` → `nodeIds`, `source_node_id` → `sourceId`
- List ordering: Derived from `board.list_ids` array position
- Node ordering: Derived from `list.node_ids` array position
- Adds frontend-only fields: `position`, `size`, `collapsed`, `color` (for nodes)
- Adds edge styles from `EDGE_STYLES` lookup

Functions:
- `transformBoardData(backendData)` - Full board transformation
- `transformListToBackend(list)` - List frontend → backend
- `transformNodeToBackend(node)` - Node frontend → backend
- `transformEdgeToBackend(edge)` - Edge frontend → backend

### 3. TocBoard Component (`web/src/components/TocBoard.js`)
Updated to fetch and load board data dynamically:

**New Imports:**
```javascript
import { boardsApi } from '../utils/boardsApi';
import { transformBoardData } from '../utils/boardTransformer';
```

**State Management:**
- Added `loading` state for async data fetching
- Added `error` state for error handling
- Modified `useEffect` to:
  - Fetch board data from API when `boardId` is provided
  - Transform backend data to frontend format
  - Initialize Redux store with transformed data
  - Reload when `boardId` changes

**Loading States:**
1. **Loading** - Shows spinner with "Loading Theory of Change Board..."
2. **Error** - Shows error message with retry button
3. **Ready** - Renders the full board interface

**Behavior:**
- If `boardId` is not provided or equals `'default'`, uses dummy data (createBoard())
- If `boardId` is a real ID, fetches from `/api/boards/:boardId/data`
- Automatically reinitializes when switching between boards

### 4. Migration Schema Adjustments
Removed `order` column from `board_lists` table:
- List order is now determined by position in `boards.list_ids` array
- Simplified schema and reduced data redundancy
- Updated migrations:
  - `20251014124852-add-board-content-tables-up.sql`
  - `20251014131020-seed-sample-board-up.sql`

## Data Flow

```
User clicks "Open Board" 
  ↓
Navigate to /board/[id]
  ↓
TocBoard component mounts
  ↓
useEffect triggers (with boardId dependency)
  ↓
Call boardsApi.getBoardData(boardId)
  ↓
Backend returns: { board, lists, nodes, edges }
  ↓
transformBoardData() converts to frontend format
  ↓
dispatch(initializeBoard(transformedBoard))
  ↓
Redux store updated
  ↓
Component re-renders with board data
```

## Backend API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/boards/:id/data` | GET | Get full board with lists, nodes, and edges |
| `/api/boards/:id/lists` | POST | Create new list |
| `/api/boards/:id/lists/:listId` | PUT | Update list |
| `/api/boards/:id/lists/:listId` | DELETE | Delete list |
| `/api/boards/:id/lists-order` | PUT | Reorder lists |

## Testing Checklist

- [ ] Navigate to `/boards` and view list of boards
- [ ] Click "Open Board" on any board
- [ ] Board loads with correct data from database
- [ ] Lists appear in correct order (from `list_ids`)
- [ ] Nodes appear in correct order within lists (from `node_ids`)
- [ ] Edges connect correct nodes
- [ ] Tags display correctly on activity nodes
- [ ] Edge styles match edge types
- [ ] Error handling works (e.g., invalid board ID)
- [ ] Loading state displays correctly
- [ ] Switching between boards reinitializes correctly

## Next Steps

To fully integrate CRUD operations, you'll need to:

1. **Save Changes to Backend**
   - Hook up node create/update/delete to API calls
   - Hook up edge create/delete to API calls
   - Hook up list reordering to `reorderLists` API
   - Add auto-save or manual save button

2. **Real-time Sync**
   - Consider adding WebSocket or polling for multi-user scenarios
   - Handle optimistic updates with rollback on error

3. **Offline Support**
   - Cache board data in localStorage
   - Queue changes when offline
   - Sync when connection restored

4. **Performance**
   - Add pagination for boards with 100+ nodes
   - Lazy load nodes outside viewport
   - Memoize expensive calculations

## File Structure
```
web/
├── src/
│   ├── components/
│   │   └── TocBoard.js (Updated)
│   ├── utils/
│   │   ├── boardsApi.js (Updated)
│   │   └── boardTransformer.js (NEW)
│   └── pages/
│       ├── boards/index.js (Already configured)
│       └── board/[id].js (Already configured)
```

## Notes

- IDs are converted to strings in frontend to maintain consistency with the existing codebase
- The `order` field is calculated dynamically from array positions, not stored in database
- Frontend-only fields (position, size, collapsed) are set to defaults when loading from backend
- Edge styles are looked up from `EDGE_STYLES` constant based on edge type
- The Redux store is reinitialized on every board load to ensure clean state

