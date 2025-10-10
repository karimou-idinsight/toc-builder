## Next.js + Express.js Monorepo

✅ **Project Successfully Restructured!**

### 🏗️ Architecture
- **Backend**: Express.js server serving static files + API - `http://localhost:8080`
- **Frontend**: Next.js app with static export to `web/dist/`
- **Module Type**: ES modules enabled throughout
- **Build Process**: Next.js builds to static files, Express serves them

### 🚀 Development Workflow
```bash
# Development (both servers)
npm run dev

# Build static files
npm run build

# Production (single server)
npm start
```

### 📁 Key Changes Made
- ✅ **Simplified server.js** - Removed Next.js dependency, serves static files
- ✅ **Separated concerns** - Backend in `/backend`, Frontend in `/web`
- ✅ **Static export** - Next.js builds to `/web/dist` folder
- ✅ **Single production server** - Express serves both static files and API
- ✅ **Development flexibility** - Separate dev servers with API proxy support

### 🌐 Available URLs
- **Development Frontend**: http://localhost:3000 (Next.js dev server)
- **Development Backend**: http://localhost:8080 (Express API)
- **Production**: http://localhost:8080 (Express serving everything)

The application demonstrates a clean separation between backend and frontend with a simplified production deployment model.