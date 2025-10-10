import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Parse JSON bodies
app.use(express.json());

// Serve static files from the web/dist folder
const staticPath = path.join(__dirname, '../web/dist');
app.use(express.static(staticPath));

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hello from Express.js backend!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Express.js with Static Web App',
    uptime: process.uptime(),
    port: PORT
  });
});

// Serve the web app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`🚀 Express server ready on http://localhost:${PORT}`);
  console.log(`� Serving static files from: ${staticPath}`);
  console.log(`🌐 Web app available at: http://localhost:${PORT}`);
});