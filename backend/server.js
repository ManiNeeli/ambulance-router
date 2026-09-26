const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
require('dotenv').config();

const recommendRouteRouter = require('./routes/recommendRoute');
const { initWebSocketServer } = require('./services/websocketManager');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize native WebSocket server on /ws
initWebSocketServer(server);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AI-Assisted Ambulance Router Backend',
    version: '2.0.0',
    websocketEndpoint: '/ws',
    realRoutingProvider: process.env.MAPBOX_ACCESS_TOKEN ? 'Mapbox Traffic' : 'OSRM Road Network',
    uptime: process.uptime()
  });
});

// Mount Routes
app.use('/api', recommendRouteRouter);

// Serve frontend build if available
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/ws')) return next();
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) next();
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Ambulance Router Enterprise CAD Active  `);
  console.log(` HTTP API:  http://localhost:${PORT}      `);
  console.log(` WebSockets: ws://localhost:${PORT}/ws   `);
  console.log(` Health:     http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
