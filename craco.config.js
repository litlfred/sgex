/**
 * CRACO configuration for SGEX Workbench
 * 
 * This configuration provides compatibility between react-scripts and webpack-dev-server v5.x
 * 
 * Key fixes:
 * 1. Replaces deprecated onBeforeSetupMiddleware/onAfterSetupMiddleware with setupMiddlewares
 * 2. Handles HTTPS configuration migration from 'https' to 'server' property  
 * 3. Adds devServer.close() compatibility method for graceful shutdown (fixes TypeError)
 */

const fs = require('fs');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const paths = require('react-scripts/config/paths');
const getHttpsConfig = require('react-scripts/config/getHttpsConfig');

module.exports = {
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
    
    // Disable static file serving to avoid conflicts with React Router
    // This prevents the serve-static middleware from being added
    devServerConfig.static = false;
    
    // Add the new setupMiddlewares function
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Add close method as alias to stop for compatibility with react-scripts
      if (!devServer.close && devServer.stop) {
        devServer.close = function() {
          return devServer.stop();
        };
      }

      // Before middlewares (replaces onBeforeSetupMiddleware)
      // Keep `evalSourceMapMiddleware`
      // middlewares before `redirectServedPath` otherwise will not have any effect
      // This lets us fetch source contents from webpack for the error overlay
      devServer.app.use(evalSourceMapMiddleware(devServer));

      if (fs.existsSync(paths.proxySetup)) {
        // This registers user provided middleware for proxy reasons
        require(paths.proxySetup)(devServer.app);
      }

      // After middlewares (replaces onAfterSetupMiddleware)
      // This service worker file is effectively a 'no-op' that will reset any
      // previous service worker registered for the same host:port combination.
      // We do this in development to avoid hitting the production cache if
      // it used the same host and port.
      // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
      devServer.app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));

      return middlewares;
    };

    // Remove the onListening approach as we're handling it in setupMiddlewares
    delete devServerConfig.onListening;

    return devServerConfig;
  },
};