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
    
    // Add the new setupMiddlewares function
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
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
      // Redirect to `PUBLIC_URL` or `homepage` from `package.json` if url not match
      devServer.app.use(redirectServedPath(paths.publicUrlOrPath));

      // This service worker file is effectively a 'no-op' that will reset any
      // previous service worker registered for the same host:port combination.
      // We do this in development to avoid hitting the production cache if
      // it used the same host and port.
      // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
      devServer.app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));

      return middlewares;
    };

    return devServerConfig;
  },
};