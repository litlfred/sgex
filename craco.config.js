/**
 * CRACO configuration for SGEX Workbench
 * 
 * This configuration provides compatibility between react-scripts and webpack-dev-server v5.x
 * and loads repository configuration for fork-friendly builds.
 * 
 * Key fixes:
 * 1. Replaces deprecated onBeforeSetupMiddleware/onAfterSetupMiddleware with setupMiddlewares
 * 2. Handles HTTPS configuration migration from 'https' to 'server' property  
 * 3. Adds devServer.close() compatibility method for graceful shutdown (fixes TypeError)
 * 4. Loads build-time repository configuration from .env
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const paths = require('react-scripts/config/paths');
const getHttpsConfig = require('react-scripts/config/getHttpsConfig');

// Load repository configuration from .env if it exists
function loadRepositoryConfig() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    // Set environment variables for the build process
    Object.assign(process.env, envVars);
  }
}

// Load repository configuration before module export
loadRepositoryConfig();

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Add progress plugin for better startup visibility
      if (env === 'development') {
        const webpack = require('webpack');
        
        // Add progress plugin to show compilation progress
        webpackConfig.plugins.push(
          new webpack.ProgressPlugin((percentage, message, ...args) => {
            // Only show progress at key milestones to avoid spam
            if (percentage === 0) {
              console.log('🚀 Starting webpack compilation...');
            } else if (percentage === 1) {
              console.log('✅ Webpack compilation complete!');
            } else if (percentage > 0 && percentage < 1 && Math.floor(percentage * 100) % 20 === 0) {
              console.log(`⏳ Webpack: ${Math.floor(percentage * 100)}% - ${message}`);
            }
          })
        );
      }
      
      return webpackConfig;
    },
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    // Override the deprecated onBeforeSetupMiddleware and onAfterSetupMiddleware
    // with the new setupMiddlewares API for webpack-dev-server 5.x compatibility
    
    // Remove the old middleware handlers
    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.onAfterSetupMiddleware;
    
    // Handle HTTPS configuration - move from 'https' to 'server' property
    const httpsConfig = devServerConfig.https;
    delete devServerConfig.https;
    
    if (httpsConfig) {
      devServerConfig.server = {
        type: 'https',
        options: httpsConfig === true ? {} : httpsConfig
      };
    }
    
    // Configure static file serving to avoid conflicts with React Router
    // Keep static serving enabled but prevent redirects that cause middleware conflicts
    if (devServerConfig.static && typeof devServerConfig.static === 'object') {
      // Disable the redirect option that causes middleware conflicts
      devServerConfig.static.serveIndex = false;
    }
    
    // Add the new setupMiddlewares function
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Add close method as alias to stop for compatibility with react-scripts
      if (!devServer.close && devServer.stop) {
        devServer.close = function() {
          return devServer.stop();
        };
      }
      
      console.log('🔧 Setting up development server middlewares...');

      // Before middlewares (replaces onBeforeSetupMiddleware)
      // Keep `evalSourceMapMiddleware`
      // middlewares before `redirectServedPath` otherwise will not have any effect
      // This lets us fetch source contents from webpack for the error overlay
      devServer.app.use(evalSourceMapMiddleware(devServer));

      if (fs.existsSync(paths.proxySetup)) {
        // This registers user provided middleware for proxy reasons
        require(paths.proxySetup)(devServer.app);
      }

      // Add middleware to serve QA report HTML files directly before React Router
      devServer.app.use('/sgex/docs', express.static(path.join(__dirname, 'public/docs'), {
        setHeaders: (res, path) => {
          if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
          }
        }
      }));

      // After middlewares (replaces onAfterSetupMiddleware)
      // This service worker file is effectively a 'no-op' that will reset any
      // previous service worker registered for the same host:port combination.
      // We do this in development to avoid hitting the production cache if
      // it used the same host and port.
      // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
      devServer.app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));

      // Redirect to `PUBLIC_URL` or `homepage` from `package.json` if url not match
      devServer.app.use(redirectServedPath(paths.publicUrlOrPath));

      return middlewares;
    };

    // Add onListening to show when server is ready
    devServerConfig.onListening = (devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const port = devServer.server.address().port;
      console.log('🌐 Development server started successfully!');
      console.log(`📍 Server running at: http://localhost:${port}${process.env.PUBLIC_URL || '/sgex/'}`);
      console.log('🎯 Ready for development - you can now access the application');
    };

    return devServerConfig;
  },
};