const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const recommendRouteRouter = require('./routes/recommendRoute');

const app = express();
const PORT = process.env.PORT || 5000;

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
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Mount Routes
app.use('/api', recommendRouteRouter);

// Serve frontend build if available
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
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

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Ambulance Router Backend Active         `);
  console.log(` URL: http://localhost:${PORT}             `);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
