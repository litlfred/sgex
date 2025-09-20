/**
 * DAK FAQ MCP Server
 * Configurable server providing FAQ functionality for DAK repositories
 * Supports both local development and public deployment with GitHub OAuth
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeRoute } from './server/routes/execute.js';
import { catalogRoute } from './server/routes/catalog.js';
import { schemaRoute } from './server/routes/schema.js';
import { dakComponentsRoute } from './server/routes/dak-components.js';
import { HealthResponse, ErrorResponse } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Host configuration: localhost for development, 0.0.0.0 for production
const HOST = NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || '/auth/github/callback';

// Repository to check for collaborator access
const AUTHORIZED_REPO_OWNER = 'litlfred';
const AUTHORIZED_REPO_NAME = 'sgex';

// Session storage for OAuth state (in production, use a proper session store)
const sessions = new Map();

// Helper function to generate random state
function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// GitHub API helper function to check collaborator status
async function checkCollaboratorStatus(username: string): Promise<boolean> {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn('GitHub OAuth not configured, allowing access in development mode');
    return NODE_ENV === 'development';
  }

  try {
    // Use GitHub API to check if user is a collaborator
    const response = await fetch(
      `https://api.github.com/repos/${AUTHORIZED_REPO_OWNER}/${AUTHORIZED_REPO_NAME}/collaborators/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SGEX-MCP-Server/1.0.0'
        }
      }
    );
    
    // GitHub returns 204 for collaborators, 404 for non-collaborators
    return response.status === 204;
  } catch (error) {
    console.error('Error checking collaborator status:', error);
    return false;
  }
}

// Authentication middleware
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const sessionId = req.headers['x-session-id'] as string;
  
  if (NODE_ENV === 'development' && !GITHUB_CLIENT_ID) {
    // Skip auth in development mode if OAuth not configured
    return next();
  }

  // Check for session-based auth (after OAuth flow)
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    if (session.authenticated && session.username) {
      req.user = { username: session.username };
      return next();
    }
  }

  // Check for token-based auth (direct GitHub token)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // Verify token and get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SGEX-MCP-Server/1.0.0'
        }
      });

      if (userResponse.ok) {
        const user = await userResponse.json();
        const isCollaborator = await checkCollaboratorStatus(user.login);
        
        if (isCollaborator) {
          req.user = { username: user.login };
          return next();
        }
      }
    } catch (error) {
      console.error('Token authentication error:', error);
    }
  }

  return res.status(401).json({
    error: {
      message: 'Authentication required. Please authenticate via GitHub OAuth or provide a valid GitHub token.',
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    }
  });
}

// CORS configuration
const corsOrigins = NODE_ENV === 'production' 
  ? [process.env.CORS_ORIGIN || 'https://litlfred.github.io']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Public health check endpoint - no auth required
app.get('/health', (req: Request, res: Response<HealthResponse>) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    description: 'DAK FAQ MCP Server',
    environment: NODE_ENV,
    auth_configured: !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET)
  };
  res.json(response);
});

// GitHub OAuth routes
app.get('/auth/github', (req: Request, res: Response) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({
      error: {
        message: 'GitHub OAuth not configured',
        code: 'OAUTH_NOT_CONFIGURED',
        timestamp: new Date().toISOString()
      }
    });
  }

  const state = generateState();
  const sessionId = generateState();
  
  sessions.set(sessionId, { state, authenticated: false });
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user&state=${state}`;
  
  return res.json({
    auth_url: authUrl,
    session_id: sessionId,
    instructions: 'Redirect user to auth_url, then call the callback endpoint with the authorization code'
  });
});

app.post('/auth/github/callback', async (req: Request, res: Response) => {
  const { code, state, session_id } = req.body;
  
  if (!sessions.has(session_id)) {
    return res.status(400).json({
      error: {
        message: 'Invalid session',
        code: 'INVALID_SESSION',
        timestamp: new Date().toISOString()
      }
    });
  }

  const session = sessions.get(session_id);
  if (session.state !== state) {
    return res.status(400).json({
      error: {
        message: 'Invalid state parameter',
        code: 'INVALID_STATE',
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SGEX-MCP-Server/1.0.0'
      }
    });

    const user = await userResponse.json();
    
    // Check collaborator status
    const isCollaborator = await checkCollaboratorStatus(user.login);
    
    if (!isCollaborator) {
      return res.status(403).json({
        error: {
          message: `User ${user.login} is not a collaborator on ${AUTHORIZED_REPO_OWNER}/${AUTHORIZED_REPO_NAME}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Update session
    sessions.set(session_id, {
      state,
      authenticated: true,
      username: user.login,
      access_token: tokenData.access_token
    });

    return res.json({
      success: true,
      username: user.login,
      session_id: session_id,
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).json({
      error: {
        message: 'Authentication failed',
        code: 'AUTH_FAILED',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Session status endpoint
app.get('/auth/status', (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.json({ authenticated: false });
  }

  const session = sessions.get(sessionId);
  return res.json({
    authenticated: session.authenticated,
    username: session.username || null
  });
});

// Logout endpoint
app.post('/auth/logout', (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string;
  
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }

  return res.json({ success: true, message: 'Logged out successfully' });
});

// Legacy health check endpoint with /mcp prefix for backwards compatibility
app.get('/mcp/health', (req: Request, res: Response<HealthResponse>) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    description: 'DAK FAQ MCP Server - Protected by GitHub OAuth'
  };
  res.json(response);
});

// Protected FAQ routes - require authentication
app.use('/mcp/faq/questions', requireAuth, executeRoute);
app.use('/mcp/faq/questions', requireAuth, catalogRoute);
app.use('/mcp/faq/execute', requireAuth, executeRoute);  
app.use('/mcp/faq', requireAuth, schemaRoute);
app.use('/mcp/faq', requireAuth, dakComponentsRoute);

// Protected FAQ routes without /mcp prefix - require authentication  
app.use('/faq/questions', requireAuth, executeRoute);
app.use('/faq/questions', requireAuth, catalogRoute);
app.use('/faq/execute', requireAuth, executeRoute);
app.use('/faq', requireAuth, schemaRoute);
app.use('/faq', requireAuth, dakComponentsRoute);

// Root endpoint with API information
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'DAK FAQ MCP Server',
    version: '1.0.0',
    description: 'MCP server for WHO SMART Guidelines Digital Adaptation Kit FAQ functionality',
    environment: NODE_ENV,
    authentication: {
      enabled: !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET),
      type: 'GitHub OAuth',
      required_permission: `Collaborator access to ${AUTHORIZED_REPO_OWNER}/${AUTHORIZED_REPO_NAME}`
    },
    endpoints: {
      // Public endpoints
      'GET /health': 'Health check (no auth required)',
      'GET /auth/github': 'Initiate GitHub OAuth flow',
      'POST /auth/github/callback': 'Complete GitHub OAuth flow',
      'GET /auth/status': 'Check authentication status',
      'POST /auth/logout': 'Logout and clear session',
      
      // Protected endpoints (require authentication)
      'GET /faq/questions/catalog': 'List available FAQ questions (protected)',
      'POST /faq/questions/execute': 'Execute FAQ questions in batch (protected)',
      'POST /faq/execute/:questionId': 'Execute a specific FAQ question by ID (protected)',
      'POST /faq/execute': 'Execute a single FAQ question (protected)',
      'GET /faq/schemas': 'Get all question schemas (protected)',
      'GET /faq/schemas/:questionId': 'Get schema for specific question (protected)',
      'GET /faq/openapi': 'Get OpenAPI schema for all questions (protected)',
      'POST /faq/validate': 'Validate question parameters (protected)',
      'GET /faq/valuesets': 'List value sets available in this DAK (protected)',
      'GET /faq/decision-tables': 'List decision tables available in this DAK (protected)',
      'GET /faq/business-processes': 'List business processes in this DAK (protected)',
      'GET /faq/personas': 'List personas/actors in this DAK (protected)',
      'GET /faq/questionnaires': 'List questionnaires available in this DAK (protected)',
      
      // Legacy endpoints with /mcp prefix
      'GET /mcp/health': 'Health check (legacy)',
      'GET /mcp/faq/*': 'Legacy protected endpoints with /mcp prefix'
    },
    security: {
      binding: NODE_ENV === 'production' ? 'public (0.0.0.0)' : 'localhost only (127.0.0.1)',
      cors: corsOrigins,
      oauth_configured: !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET),
      repository_protection: `${AUTHORIZED_REPO_OWNER}/${AUTHORIZED_REPO_NAME}`,
      note: NODE_ENV === 'production' 
        ? 'This server requires GitHub OAuth authentication and collaborator access'
        : 'Running in development mode - OAuth may be bypassed if not configured'
    }
  });
});

// Error handling middleware
app.use((error: any, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
  console.error('Server error:', error);
  
  const errorResponse: ErrorResponse = {
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  };

  res.status(error.status || 500).json(errorResponse);
});

// 404 handler
app.use((req: Request, res: Response<ErrorResponse>) => {
  const errorResponse: ErrorResponse = {
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  };

  res.status(404).json(errorResponse);
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`DAK FAQ MCP Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Security: ${NODE_ENV === 'production' ? 'Public binding (0.0.0.0)' : 'Local binding only (127.0.0.1)'}`);
  console.log(`OAuth configured: ${!!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET)}`);
  console.log(`Repository protection: ${AUTHORIZED_REPO_OWNER}/${AUTHORIZED_REPO_NAME}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  Public endpoints:`);
  console.log(`    - GET  http://${HOST}:${PORT}/health`);
  console.log(`    - GET  http://${HOST}:${PORT}/auth/github`);
  console.log(`    - POST http://${HOST}:${PORT}/auth/github/callback`);
  console.log(`    - GET  http://${HOST}:${PORT}/auth/status`);
  console.log(`    - POST http://${HOST}:${PORT}/auth/logout`);
  console.log(`  Protected endpoints (require GitHub OAuth):`);
  console.log(`    - GET  http://${HOST}:${PORT}/faq/questions/catalog`);
  console.log(`    - POST http://${HOST}:${PORT}/faq/questions/execute`);
  console.log(`    - GET  http://${HOST}:${PORT}/faq/valuesets`);
  console.log(`    - GET  http://${HOST}:${PORT}/faq/decision-tables`);
  console.log(`    - GET  http://${HOST}:${PORT}/faq/business-processes`);
  console.log(`    - GET  http://${HOST}:${PORT}/faq/personas`);
  console.log(`    - GET  http://${HOST}:${PORT}/faq/questionnaires`);
  console.log(`  Legacy endpoints (require GitHub OAuth):`);
  console.log(`    - GET  http://${HOST}:${PORT}/mcp/health`);
  console.log(`    - GET  http://${HOST}:${PORT}/mcp/faq/questions/catalog`);
  console.log(`    - POST http://${HOST}:${PORT}/mcp/faq/questions/execute`);
  console.log('');
  if (NODE_ENV === 'production' && (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET)) {
    console.warn('WARNING: GitHub OAuth not configured in production mode!');
    console.warn('Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.');
  }
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