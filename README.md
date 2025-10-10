# Next.js + Express.js Monorepo

A full-stack web application where Express.js serves the built Next.js static files, with API endpoints for backend functionality.

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
│   ├── src/                   # Source files
│   │   └── app/              # Next.js App Router pages
│   │       ├── about/
│   │       ├── globals.css
│   │       ├── layout.js
│   │       └── page.js
│   ├── dist/                  # Built static files (served by Express)
│   ├── next.config.js         # Next.js configuration (static export)
│   ├── package.json           # Web dependencies
│   └── node_modules/          # Web dependencies
├── package.json               # Root monorepo scripts
└── README.md                  # This file
```

## 📋 Features

- ✅ **Simplified architecture** - Express serves built static files
- ✅ **No Next.js dependency in backend** - Clean separation
- ✅ **Static export** - Next.js builds to static HTML/CSS/JS
- ✅ **Single production server** - Express handles everything
- ✅ **Development flexibility** - Separate dev servers for hot reload
- ✅ **API endpoints** - Express.js backend API
- ✅ **ES modules** support throughout the project
- ✅ **Easy deployment** - Just run Express server

## 📋 Project Structure

```
toc-builder/
├── app/                    # Next.js App Router pages
│   ├── about/
│   │   └── page.js        # About page
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── server.js              # Express.js server
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

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

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build the Next.js application for production
- `npm start` - Start the production server
- `npm run server` - Start only the Express.js server
- `npm run next-dev` - Start only Next.js in development mode

## 🌐 Architecture

The application uses Express.js as the main server that:
1. Handles custom API routes (`/api/*`)
2. Serves the Next.js application for all other routes
3. Provides backend functionality while maintaining Next.js features

This setup gives you the flexibility of a custom Express.js server while keeping all the benefits of Next.js like server-side rendering, static generation, and file-based routing.

## 🎨 Styling

The application uses CSS-in-JS with styled-jsx for component-level styling and includes:
- Responsive design
- Gradient backgrounds
- Glass morphism effects
- Smooth animations and transitions

Enjoy building with Next.js and Express.js! 🎉