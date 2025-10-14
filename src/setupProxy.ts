/**
 * Create React App Development Proxy Configuration
 * 
 * This file sets up a proxy for the WHO Digital Library API to bypass CORS restrictions
 * during development. The proxy forwards API requests from the local development server
 * to the WHO IRIS API (iris.who.int).
 * 
 * This file is automatically loaded by Create React App's development server.
 * 
 * @module setupProxy
 * @see https://create-react-app.dev/docs/proxying-api-requests-in-development/
 */

import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import type { Application, Request, Response } from 'express';

/**
 * Configure development proxy middleware
 * Sets up proxy for WHO Digital Library API requests
 * 
 * @param app - Express application instance from webpack-dev-server
 * 
 * @example
 * // Automatically called by Create React App dev server
 * // Proxies /api/who/* requests to https://iris.who.int
 */
module.exports = function(app: Application): void {
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
      onProxyReq: function (proxyReq, req: Request, res: Response) {
        console.log('[WHO Proxy] Proxying request:', req.method, req.url, '-> https://iris.who.int' + req.url.replace('/api/who', ''));
        // Set additional headers that might be required
        proxyReq.setHeader('User-Agent', 'SGEX-Workbench/1.0 (WHO Digital Library Integration)');
        proxyReq.setHeader('Accept', 'application/json');
        proxyReq.setHeader('Cache-Control', 'no-cache');
      },
      onProxyRes: function (proxyRes, req: Request, res: Response) {
        console.log('[WHO Proxy] Response:', proxyRes.statusCode, req.url);
        if (proxyRes.statusCode === 403) {
          console.warn('[WHO Proxy] 403 Forbidden - WHO API may be restricting access');
        }
      },
      onError: function (err: Error, req: Request, res: Response) {
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
    } as Options)
  );
};
