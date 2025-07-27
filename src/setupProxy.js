/**
 * Development proxy setup for SGEX Workbench
 * 
 * This file configures a proxy for GitHub OAuth endpoints to solve CORS issues
 * during local development. The proxy forwards OAuth requests to GitHub's API
 * and adds appropriate CORS headers for localhost development.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy GitHub OAuth device flow endpoints
  app.use(
    '/api/github/oauth',
    createProxyMiddleware({
      target: 'https://github.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/github/oauth/device/code': '/login/device/code',
        '^/api/github/oauth/access_token': '/login/oauth/access_token',
      },
      onProxyRes: function (proxyRes, req, res) {
        // Add CORS headers for local development
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept';
      },
      onError: function (err, req, res) {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        });
        res.end('Proxy error: ' + err.message);
      },
      logLevel: 'debug',
    })
  );

  // Handle preflight OPTIONS requests
  app.options('/api/github/oauth/*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    res.sendStatus(200);
  });
};