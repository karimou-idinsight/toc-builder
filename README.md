# Theory of Change Board

A full-stack web application for creating and managing Theory of Change diagrams with drag-and-drop functionality, causal path visualization, and edge relationships. Built with Next.js, Redux, and Express.js.

## 🏗️ Architecture

- **Backend**: Express.js server serving static files + API endpoints on **port 8080**
- **Frontend**: Next.js app built to static files in `web/dist/`
- **Development**: Run Next.js dev server (port 3000) and Express server (port 8080) separately
- **Production**: Express server serves built static files from `web/dist/` folder

## 🚀 Simplified Workflow

### Development Mode
- **Frontend**: Next.js dev server on `http://localhost:3000` (live reload)
- **Backend**: Express.js API server on `http://localhost:8080` (API only)

### Production Mode
- **Single Server**: Express.js serves both static files and API on `http://localhost:8080`

## 📋 Project Structure

```
toc-builder/
├── backend/                    # Express.js server
│   ├── server.js              # Main server (API + static file serving)
│   ├── package.json           # Backend dependencies
│   └── node_modules/          # Backend dependencies
├── web/                       # Next.js web application
│   ├── src/
│   │   └── app/              # Next.js App Router
│   │       ├── components/   # React components
│   │       │   ├── TocBoard.js
│   │       │   ├── TocList.js
│   │       │   ├── TocNode.js
│   │       │   ├── TocEdges.js
│   │       │   └── ... (17 components total)
│   │       ├── store/        # Redux store
│   │       │   ├── index.js
│   │       │   ├── boardSlice.js
│   │       │   └── selectors.js
│   │       ├── hooks/        # Custom React hooks
│   │       │   ├── useListOperations.js
│   │       │   ├── useNodeOperations.js
│   │       │   ├── useEdgeOperations.js
│   │       │   └── useLongPress.js
│   │       ├── utils/        # Utility functions
│   │       │   ├── tocModels.js
│   │       │   ├── helpers.js
│   │       │   └── api.js
│   │       ├── styles/       # Style definitions
│   │       │   ├── globals.css
│   │       │   ├── tokens.js
│   │       │   └── *.styles.js
│   │       ├── layout.js     # Root layout with Redux Provider
│   │       ├── page.js       # Home page
│   │       └── providers.js  # Redux Provider wrapper
│   ├── dist/                  # Built static files (served by Express)
│   ├── next.config.js         # Next.js configuration
│   ├── package.json           # Web dependencies
│   └── node_modules/          # Web dependencies
├── package.json               # Root monorepo scripts
└── README.md                  # This file
```

## ✨ Features

### Application Features
- ✅ **Theory of Change Board** - Visual board for creating and managing ToC diagrams
- ✅ **Drag-and-Drop** - Reorder lists and nodes with @dnd-kit
- ✅ **Node Types** - Multiple node types (Intermediate Outcome, Final Outcome, Assumption, Intervention)
- ✅ **Edge Relationships** - Create and manage relationships between nodes with different types
- ✅ **Causal Path Visualization** - Visualize upstream and downstream connections
- ✅ **Link Mode** - Connect nodes with edges visually
- ✅ **Customizable Lists** - Color-coded lists with custom titles
- ✅ **Redux State Management** - Centralized state management with Redux Toolkit
- ✅ **Responsive UI** - Modern, clean interface with inline editing

### Technical Features
- ✅ **Simplified architecture** - Express serves built static files
- ✅ **Redux Toolkit** - Modern Redux with slices and selectors
- ✅ **No prop drilling** - Components access shared state directly from Redux
- ✅ **Static export** - Next.js builds to static HTML/CSS/JS
- ✅ **Single production server** - Express handles everything
- ✅ **Development flexibility** - Separate dev servers for hot reload
- ✅ **API endpoints** - Express.js backend API
- ✅ **ES modules** support throughout the project
- ✅ **Easy deployment** - Just run Express server

## 📦 State Management with Redux

This application uses **Redux Toolkit** for centralized state management, eliminating prop drilling and providing a clean architecture.

### Redux Store Structure
```javascript
{
  board: {
    board: {              // Main board data
      id: string,
      name: string,
      lists: [],          // Board lists/columns
      nodes: [],          // All nodes across lists
      edges: []           // Connections between nodes
    },
    linkMode: boolean,    // UI state for linking mode
    linkSource: string,   // Selected source node for linking
    activeId: string,     // Active draggable item
    dragType: string,     // Type of dragged item
    draggableNodes: [],   // Array of draggable node IDs
    causalPathMode: boolean,      // Causal path visualization mode
    causalPathNodes: [],          // Nodes in current causal path
    causalPathFocalNode: string,  // Focal node for causal path
    isLoading: boolean,
    error: string
  }
}
```

### Key Redux Files
- **`web/src/app/store/index.js`** - Store configuration
- **`web/src/app/store/boardSlice.js`** - Board state slice with reducers
- **`web/src/app/store/selectors.js`** - Memoized selectors for derived state
- **`web/src/app/providers.js`** - Redux Provider wrapper

### Redux Integration
Components access state using `useSelector` and dispatch actions using `useDispatch`:
- `TocBoard` - Main container, dispatches all state updates
- `TocNode` - Accesses link mode, causal path state directly from Redux
- `TocList` - Accesses UI state for nodes and causal paths
- `TocEdges` - Accesses nodes directly from Redux

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup
1. **Install root dependencies**:
   ```bash
   npm install
   ```

2. **Install all service dependencies**:
   ```bash
   npm run install:all
   ```

## 🚀 Development

### Option 1: Run Both Services (Recommended for development)
```bash
npm run dev
```

This starts:
- **Backend**: Express.js API server on `http://localhost:8080` (API endpoints only)
- **Frontend**: Next.js development server on `http://localhost:3000` (with hot reload)

### Option 2: Start Services Individually
```bash
# Backend only (API server)
npm run dev:backend

# Frontend only (Next.js dev server)
npm run dev:web
```

## 🏗️ Production

### Build and Deploy
```bash
# 1. Build the web app to static files
npm run build

# 2. Start the production server
npm start
```

The production server runs on `http://localhost:8080` and serves:
- Static web app files from `web/dist/`
- API endpoints at `/api/*`

## 🌐 Available Endpoints

### Development Mode
- **Frontend**: `http://localhost:3000` - Next.js dev server with hot reload
- **Backend API**: `http://localhost:8080/api/hello` - Express.js API
- **Health Check**: `http://localhost:8080/api/health` - Server status

### Production Mode (Single Server)
- **Web App**: `http://localhost:8080` - Full application
- **API**: `http://localhost:8080/api/hello` - Backend API
- **Health Check**: `http://localhost:8080/api/health` - Server status

## 📜 Scripts

### Root Level Scripts
- `npm run dev` - Start both backend and frontend in development
- `npm run build` - Build the web application for production
- `npm run start` - Start both services in production mode
- `npm run install:all` - Install dependencies for all services
- `npm run clean` - Clean all node_modules and build artifacts

### Backend Scripts (in /backend)
- `npm run dev` - Start backend with nodemon
- `npm start` - Start backend in production

### Web Scripts (in /web)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js for production
- `npm start` - Start Next.js in production mode
- `npm run lint` - Run ESLint

## 🚀 Deployment

Each service can be deployed independently:

### Backend Deployment
```bash
cd backend
npm install --production
npm start
```

### Frontend Deployment
```bash
cd web
npm install
npm run build
npm start
```
```

## 📡 API Endpoints

- `GET /api/hello` - Returns a greeting message from the backend
- `GET /api/health` - Health check endpoint with server status

## 🧩 Component Architecture

### Core Components

#### **TocBoard** (Redux Connected)
Main container component that orchestrates the entire board. Manages drag-and-drop context, renders lists, edges, and handles all board-level operations.

#### **TocList** (Redux Connected)
Represents a vertical column/list on the board. Accesses link mode, causal path state from Redux. Handles list-specific operations like adding nodes.

#### **TocNode** (Redux Connected)
Individual node component with inline editing, context menus, and connection capabilities. Directly accesses Redux state for link mode, causal paths, and node relationships.

#### **TocEdges** (Redux Connected)
Visualizes relationships between nodes using ReactFlow. Fetches nodes directly from Redux and manages edge editing/deletion.

#### **TocToolbar**
Provides board-level actions and controls (add list, export, etc.).

### Supporting Components
- `TocListHeader` - List title and settings
- `TocListContent` - Node container with sortable context
- `TocNodeContent` - Node display with tags
- `TocNodeFooter` - Node connection controls
- `TocEdgesEditDialog` - Edge property editing
- `TocEdgesLegend` - Edge type legend
- And more...

### Custom Hooks
- `useListOperations` - List CRUD operations
- `useNodeOperations` - Node CRUD operations
- `useEdgeOperations` - Edge CRUD operations
- `useLongPress` - Long press gesture detection

## 🎨 Styling

The application uses CSS-in-JS with inline styles for component-level styling and includes:
- Responsive design
- Color-coded lists and nodes
- Drag-and-drop visual feedback
- Smooth animations and transitions
- Context menus and modal dialogs

## 🔌 Key Dependencies

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Redux Toolkit 2.9** - State management with slices and reducers
- **React Redux 9.2** - Redux bindings for React
- **@dnd-kit** - Modern drag-and-drop toolkit (core, sortable, utilities)
- **ReactFlow 11** - Graph/edge visualization library
- **@headlessui/react** - Unstyled, accessible UI components
- **@fortawesome** - Icon library
- **uuid** - Unique ID generation

### Backend
- **Express.js** - Web server and API
- **Concurrently** (dev) - Run multiple scripts simultaneously

## 🏛️ Detailed File Structure

### All Components (17 total)
```
web/src/app/components/
├── TocBoard.js              # Main board container (Redux: useSelector, useDispatch)
├── TocList.js               # List component (Redux: useSelector for UI state)
├── TocListHeader.js         # List header with title editing
├── TocListContent.js        # Sortable node container
├── TocListSettingsModal.js  # List color/settings modal
├── TocNode.js               # Node component (Redux: useSelector for link/causal state)
├── TocNodeContent.js        # Node content display
├── TocNodeFooter.js         # Node footer with connection controls
├── TocNodeEditForm.js       # Inline node editing form
├── TocNodeEditDialog.js     # Full node edit dialog
├── TocNodeContextMenu.js    # Right-click context menu
├── TocNodeTags.js           # Node tags display
├── TocEdges.js              # Edge visualization (Redux: useSelector for nodes)
├── TocEdgesEditDialog.js    # Edge property editing dialog
├── TocEdgesLegend.js        # Edge types legend
├── TocToolbar.js            # Board toolbar with actions
└── ClientOnly.js            # Client-side only wrapper
```

### Redux Store
```
web/src/app/store/
├── index.js                 # Store configuration with configureStore
├── boardSlice.js            # Board slice with all reducers (277 lines)
│                            # Actions: initializeBoard, add/update/delete (lists/nodes/edges)
│                            # State: board, linkMode, causalPathMode, draggableNodes, etc.
└── selectors.js             # Memoized selectors using createSelector
                             # Selectors: selectBoard, selectAllNodes, selectDraggableNodesSet, etc.
```

### Custom Hooks
```
web/src/app/hooks/
├── useListOperations.js     # List CRUD: add, update, delete, reorder
├── useNodeOperations.js     # Node CRUD: add, update, delete, duplicate, move
├── useEdgeOperations.js     # Edge CRUD: add, update, delete, get connections
└── useLongPress.js          # Long press gesture detection
```

### Utilities
```
web/src/app/utils/
├── tocModels.js             # Data models, constants (NODE_TYPES, EDGE_TYPES)
│                            # Factory functions: createBoard, createList, createNode, createEdge
├── helpers.js               # Helper functions for board operations
├── api.js                   # API client functions
└── index.js                 # Utility exports
```

### Styles
```
web/src/app/styles/
├── globals.css              # Global CSS styles
├── tokens.js                # Design tokens (colors, spacing, etc.)
├── TocBoard.styles.js       # Board-specific styles
├── TocList.styles.js        # List component styles
├── TocListContent.styles.js # List content styles
├── TocListHeader.styles.js  # List header styles
├── TocNode.styles.js        # Node component styles
├── TocToolbar.styles.js     # Toolbar styles
└── TocListSettingsModal.styles.js  # Modal styles
```

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd toc-builder
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   This installs dependencies for both backend and web applications.

### Development

**Start both servers (recommended)**
```bash
npm run dev
```
- Frontend: http://localhost:3000 (with hot reload)
- Backend API: http://localhost:8080

**Or start individually**
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:web
```

### Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```
   - Full app: http://localhost:8080

## 📖 How to Use the Theory of Change Board

### Creating Your Board

1. **Add Lists** - Click "Add List" to create vertical columns (e.g., "Inputs", "Activities", "Outcomes")
2. **Add Nodes** - Click the "+" button in a list to add nodes
3. **Edit Nodes** - Click on a node to edit its title, description, and properties
4. **Customize Lists** - Click the settings icon on a list to change its color and title

### Working with Nodes

- **Node Types**: Choose from Intermediate Outcome, Final Outcome, Assumption, or Intervention
- **Drag & Drop**: Reorder nodes within lists or move them between lists
- **Duplicate**: Right-click a node and select "Duplicate"
- **Delete**: Right-click a node and select "Delete"

### Creating Connections

1. **Enter Link Mode** - Click the link icon on a node's footer
2. **Select Target** - Click another node to create a connection
3. **Edit Edges** - Click on an edge to edit its type and properties
4. **Edge Types**: Choose from Contributes, Leads to, Required for, Assumption for, Informs

### Visualizing Causal Paths

1. **View Causal Path** - Click the path icon on any node
2. **See Connections** - View all upstream and downstream connections
3. **Navigate** - Click on connected nodes to explore relationships
4. **Exit** - Click the exit icon to return to normal view

### Advanced Features

- **Multi-drag**: Select multiple nodes to move them together (click drag icon on nodes)
- **Context Menu**: Right-click nodes for quick actions
- **Keyboard Shortcuts**: ESC to cancel operations, Enter to save edits
- **Auto-save**: All changes are saved to Redux state immediately

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only the Express.js backend
- `npm run dev:web` - Start only the Next.js frontend
- `npm run build` - Build the web application for production
- `npm start` - Start production server
- `npm run install:all` - Install dependencies for all services
- `npm run clean` - Clean all node_modules and build artifacts

### Backend (in /backend)
- `npm run dev` - Start backend with nodemon (auto-restart on changes)
- `npm start` - Start backend in production mode

### Web (in /web)
- `npm run dev` - Start Next.js development server (port 3000)
- `npm run build` - Build Next.js for production
- `npm start` - Start Next.js in production mode
- `npm run lint` - Run ESLint

## 💡 Redux State Flow

### How Data Flows

1. **User Action** → Component event handler
2. **Dispatch Action** → Redux action dispatched via `useDispatch`
3. **Reducer Updates** → `boardSlice` reducer updates state immutably
4. **Selector Recomputes** → Memoized selectors recalculate derived data
5. **Components Re-render** → Components using `useSelector` re-render with new data

### Example: Adding a Node

```javascript
// 1. User clicks "Add Node" button
// 2. TocList component dispatches action
dispatch(addNode({
  id: generateId(),
  title: "New Node",
  listId: "list-1",
  type: NODE_TYPES.INTERMEDIATE_OUTCOME
}));

// 3. boardSlice reducer adds node to state.board.nodes
// 4. selectAllNodes selector returns updated nodes array
// 5. TocList re-renders with new node
```

## 🎯 Best Practices

### When Working with This Codebase

1. **Use Redux for Shared State** - Any state used by multiple components should be in Redux
2. **Use Local State for UI** - Temporary UI state (modals open, hover states) can stay local
3. **Memoize Selectors** - Use `createSelector` for derived data to prevent unnecessary recalculations
4. **Immutable Updates** - Redux Toolkit handles this with Immer, but be aware of the pattern
5. **Component Composition** - Break down large components into smaller, focused ones
6. **Custom Hooks** - Extract reusable logic into custom hooks

### Development Tips

- **Check Redux DevTools** - Install Redux DevTools extension to inspect state and actions
- **Hot Reload** - Frontend changes reload automatically in dev mode
- **Console Logs** - Some components have debug logs; check browser console for insights
- **Type Safety** - Consider adding TypeScript for better developer experience

## 🚢 Deployment

### Deploying to Production

1. **Build the frontend**
   ```bash
   cd web
   npm run build
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will serve the built frontend files from `web/dist/`

### Environment Variables

Currently the app uses default ports. You can configure:
- `PORT` - Backend server port (default: 8080)
- `NODE_ENV` - Environment (development/production)

## 🤝 Contributing

When contributing to this project:

1. Follow the existing code style
2. Use Redux for state that needs to be shared
3. Keep components focused and single-purpose
4. Add comments for complex logic
5. Test your changes in both development and production builds

## 📝 License

[Add your license information here]

---

Enjoy building Theory of Change diagrams! 🎉

Built with ❤️ using Next.js, Redux, and Express.js