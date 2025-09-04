const express = require('express');
const path = require('path');
const fs = require('fs');

class SGEXServer {
  constructor() {
    this.port = process.env.PORT || 40000;
    this.staticPath = process.env.STATIC_PATH || path.join(__dirname, '../../build');
    this.app = express();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Serve static files from the React build
    this.app.use('/sgex', express.static(this.staticPath));
    
    // CORS headers for local development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    // Security headers
    this.app.use((req, res, next) => {
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('X-Frame-Options', 'DENY');
      res.header('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        port: this.port,
        staticPath: this.staticPath
      });
    });

    // Redirect root to /sgex
    this.app.get('/', (req, res) => {
      res.redirect('/sgex');
    });

    // Handle React Router - serve index.html for all /sgex/* routes
    this.app.get('/sgex/*', (req, res) => {
      const indexPath = path.join(this.staticPath, 'index.html');
      
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('SGEX build not found. Please run npm run build first.');
      }
    });

    // Fallback 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not found',
        path: req.path,
        timestamp: new Date().toISOString()
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error('Server error:', error);
      res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(this.port, 'localhost', (error) => {
        if (error) {
          console.error('Failed to start server:', error);
          reject(error);
          return;
        }

        console.log(`SGEX Server started successfully`);
        console.log(`Port: ${this.port}`);
        console.log(`Static Path: ${this.staticPath}`);
        console.log(`URL: http://localhost:${this.port}/sgex`);
        console.log(`Health Check: http://localhost:${this.port}/health`);
        
        resolve(server);
      });

      server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });
    });
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new SGEXServer();
  
  server.start().catch((error) => {
    console.error('Failed to start SGEX server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    process.exit(0);
  });
}

module.exports = SGEXServer;