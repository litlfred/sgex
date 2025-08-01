/**
 * Create React App Development Proxy Configuration
 * 
 * This file sets up a proxy for the WHO Digital Library API to bypass CORS restrictions
 * during development. The proxy forwards API requests from the local development server
 * to the WHO IRIS API (iris.who.int).
 * 
 * This file is automatically loaded by Create React App's development server.
 * 
 * @see https://create-react-app.dev/docs/proxying-api-requests-in-development/
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy WHO Digital Library API requests
  app.use(
    '/api/who',
    createProxyMiddleware({
      target: 'https://iris.who.int',
      changeOrigin: true,
      pathRewrite: {
        '^/api/who': '', // Remove /api/who prefix when forwarding to target
      },
      secure: true,
      logLevel: 'debug',
      headers: {
        'User-Agent': 'SGEX-Workbench/1.0 (WHO Digital Library Integration)',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('[WHO Proxy] Proxying request:', req.method, req.url, '-> https://iris.who.int' + req.url.replace('/api/who', ''));
        // Set additional headers that might be required
        proxyReq.setHeader('User-Agent', 'SGEX-Workbench/1.0 (WHO Digital Library Integration)');
        proxyReq.setHeader('Accept', 'application/json');
        proxyReq.setHeader('Cache-Control', 'no-cache');
      },
      onProxyRes: function (proxyRes, req, res) {
        console.log('[WHO Proxy] Response:', proxyRes.statusCode, req.url);
        if (proxyRes.statusCode === 403) {
          console.warn('[WHO Proxy] 403 Forbidden - WHO API may be restricting access');
        }
      },
      onError: function (err, req, res) {
        console.error('[WHO Proxy] Error:', err.message);
        res.status(500).json({
          error: 'Proxy error',
          message: err.message,
          url: req.url,
          hint: err.message.includes('ENOTFOUND') ? 
            'Unable to reach iris.who.int - check network connectivity' : 
            'Proxy configuration error'
        });
      }
    })
  );
};