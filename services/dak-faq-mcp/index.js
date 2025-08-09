/**
 * DAK FAQ MCP Server
 * Local-only server providing FAQ functionality for DAK repositories
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeRoute } from './server/routes/execute.js';
import { catalogRoute } from './server/routes/catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '127.0.0.1'; // Local only for security

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    description: 'DAK FAQ MCP Server - Local Only'
  });
});

// FAQ routes
app.use('/faq/questions', executeRoute);
app.use('/faq/questions', catalogRoute);

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    name: 'DAK FAQ MCP Server',
    version: '1.0.0',
    description: 'Local MCP server for WHO SMART Guidelines Digital Adaptation Kit FAQ functionality',
    endpoints: {
      'GET /health': 'Health check',
      'GET /faq/questions/catalog': 'List available FAQ questions',
      'POST /faq/questions/execute': 'Execute FAQ questions in batch'
    },
    security: {
      binding: 'localhost only (127.0.0.1)',
      cors: 'localhost:3000 only',
      note: 'This server is designed for local use only and should not be exposed to remote networks'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  res.status(error.status || 500).json({
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`DAK FAQ MCP Server running on http://${HOST}:${PORT}`);
  console.log('Security: Local binding only (127.0.0.1)');
  console.log('Available endpoints:');
  console.log(`  - GET  http://${HOST}:${PORT}/health`);
  console.log(`  - GET  http://${HOST}:${PORT}/faq/questions/catalog`);
  console.log(`  - POST http://${HOST}:${PORT}/faq/questions/execute`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;