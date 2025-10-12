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
    message: '🔥 Hot Reload Test: Hello from Express.js backend!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Theory of Change Builder API',
    uptime: process.uptime(),
    port: PORT
  });
});

// Theory of Change API endpoints
let tocData = {
  nodes: [],
  edges: []
};

// Get Theory of Change data
app.get('/api/toc', (req, res) => {
  res.json(tocData);
});

// Save Theory of Change data
app.post('/api/toc', (req, res) => {
  const { nodes, edges } = req.body;
  
  if (!nodes || !edges) {
    return res.status(400).json({ 
      error: 'Missing nodes or edges data' 
    });
  }
  
  tocData = { nodes, edges };
  
  res.json({ 
    message: 'Theory of Change saved successfully',
    nodeCount: nodes.length,
    edgeCount: edges.length
  });
});

// Get filtered ToC data by node type
app.get('/api/toc/filter/:nodeType', (req, res) => {
  const { nodeType } = req.params;
  
  const filteredNodes = tocData.nodes.filter(node => 
    node.data.nodeType === nodeType
  );
  
  const nodeIds = filteredNodes.map(node => node.id);
  const filteredEdges = tocData.edges.filter(edge =>
    nodeIds.includes(edge.source) || nodeIds.includes(edge.target)
  );
  
  res.json({
    nodes: filteredNodes,
    edges: filteredEdges,
    filter: nodeType
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