/**
 * DAK FAQ MCP Server
 * Local-only server providing FAQ functionality for DAK repositories
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { executeRoute } from './server/routes/execute.js';
import { catalogRoute } from './server/routes/catalog.js';
import { schemaRoute } from './server/routes/schema.js';
import { dakComponentsRoute } from './server/routes/dak-components.js';
import { HealthResponse, ErrorResponse } from './types.js';
import { createMCPLogger } from './logger.js';
import { DAKRepositoryScanner } from './dakRepositoryScanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logger with service category
const logger = createMCPLogger('DAK-FAQ-MCP', {
  logLevel: (process.env.MCP_LOG_LEVEL as any) || 'info',
  logFile: process.env.MCP_LOG_FILE,
  serviceCategory: 'mcp-dak-faq'
});

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '127.0.0.1'; // Local only for security

// Initialize DAK Repository Scanner
const dakScanner = new DAKRepositoryScanner(logger, process.env.GITHUB_TOKEN);

// Start background scanning on startup
setImmediate(async () => {
  try {
    logger.info('STARTUP_SCAN', 'Starting background DAK repository scan...');
    await dakScanner.scanAllProfiles(false); // Use cache if available
  } catch (error) {
    logger.error('STARTUP_SCAN', 'Failed to perform startup scan', error instanceof Error ? error : undefined);
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log incoming request
  logger.logQuery(req.method, req.path, Object.keys(req.query).length > 0 ? req.query : null);
  
  // Capture response details
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - start;
    logger.logQuery(req.method, req.path, null, responseTime, res.statusCode);
    return originalSend.call(this, data);
  };
  
  next();
});

// Health check endpoint - with /mcp prefix
app.get('/mcp/health', (req: Request, res: Response<HealthResponse>) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    description: 'DAK FAQ MCP Server - Local Only'
  };
  res.json(response);
});

// FAQ routes - with /mcp prefix
app.use('/mcp/faq/questions', executeRoute);
app.use('/mcp/faq/questions', catalogRoute);
app.use('/mcp/faq/execute', executeRoute);  // Add single execution routes
app.use('/mcp/faq', schemaRoute);
app.use('/mcp/faq', dakComponentsRoute);

// DAK Repository Scanner endpoints
app.get('/mcp/daks', async (req: Request, res: Response) => {
  try {
    const daks = dakScanner.getKnownDAKs();
    res.json({
      success: true,
      count: daks.length,
      repositories: daks
    });
  } catch (error) {
    logger.error('DAK_LIST', 'Failed to get DAK list', error instanceof Error ? error : undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve DAK repositories'
    });
  }
});

app.get('/mcp/daks/status', async (req: Request, res: Response) => {
  try {
    const status = dakScanner.getScanStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    logger.error('DAK_STATUS', 'Failed to get scan status', error instanceof Error ? error : undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve scan status'
    });
  }
});

app.post('/mcp/daks/scan', async (req: Request, res: Response) => {
  try {
    const { force } = req.body;
    logger.info('DAK_SCAN_REQUEST', `Manual scan requested (force: ${!!force})`);
    
    // Start scan asynchronously
    setImmediate(async () => {
      try {
        await dakScanner.scanAllProfiles(!!force);
      } catch (error) {
        logger.error('DAK_SCAN_ASYNC', 'Async scan failed', error instanceof Error ? error : undefined);
      }
    });
    
    res.json({
      success: true,
      message: 'DAK repository scan started'
    });
  } catch (error) {
    logger.error('DAK_SCAN', 'Failed to start scan', error instanceof Error ? error : undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to start scan'
    });
  }
});

app.post('/mcp/daks/profiles', async (req: Request, res: Response): Promise<void> => {
  try {
    const { profile } = req.body;
    if (!profile || typeof profile !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Profile name is required'
      });
      return;
    }
    
    dakScanner.addProfile(profile);
    logger.info('PROFILE_ADD_REQUEST', `Added profile: ${profile}`);
    
    res.json({
      success: true,
      message: `Profile ${profile} added for scanning`
    });
  } catch (error) {
    logger.error('PROFILE_ADD', 'Failed to add profile', error instanceof Error ? error : undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to add profile'
    });
  }
});

app.post('/mcp/daks/repositories', async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner, repo } = req.body;
    if (!owner || !repo || typeof owner !== 'string' || typeof repo !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Owner and repo names are required'
      });
      return;
    }
    
    dakScanner.addRepository(owner, repo);
    logger.info('REPO_ADD_REQUEST', `Added repository: ${owner}/${repo}`);
    
    res.json({
      success: true,
      message: `Repository ${owner}/${repo} added to DAK list`
    });
  } catch (error) {
    logger.error('REPO_ADD', 'Failed to add repository', error instanceof Error ? error : undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to add repository'
    });
  }
});

// MCP Service Registry endpoint - discovers all running local MCP services
app.get('/mcp/services', async (req: Request, res: Response) => {
  const services = [];
  
  // Add this service (DAK FAQ)
  services.push({
    id: 'dak-faq',
    name: 'DAK FAQ MCP Service',
    description: 'WHO SMART Guidelines DAK FAQ functionality and repository scanning',
    functionality: 'dak-faq',
    baseUrl: `http://${HOST}:${PORT}/mcp`,
    version: '1.0.0',
    status: 'healthy',
    endpoints: [
      'GET /health',
      'GET /faq/questions/catalog',
      'POST /faq/questions/execute',
      'POST /faq/execute/:questionId',
      'POST /faq/execute',
      'GET /faq/schemas',
      'GET /faq/schemas/:questionId',
      'GET /faq/openapi',
      'POST /faq/validate',
      'GET /faq/valuesets',
      'GET /faq/decision-tables',
      'GET /faq/business-processes',
      'GET /faq/personas',
      'GET /faq/questionnaires',
      'GET /daks',
      'GET /daks/status',
      'POST /daks/scan',
      'POST /daks/profiles',
      'POST /daks/repositories'
    ],
    transport: ['http'],
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
      dakScanning: true
    }
  });
  
  // Try to discover DAK Publication API service on port 3002
  try {
    const publicationResponse = await fetch('http://127.0.0.1:3002/');
    if (publicationResponse.ok) {
      services.push({
        id: 'dak-publication-api',
        name: 'DAK Publication API Service',
        description: 'WHO SMART Guidelines DAK publication generation and rendering',
        functionality: 'publishing',
        baseUrl: 'http://127.0.0.1:3002',
        version: '1.0.0',
        status: 'healthy',
        endpoints: [
          'GET /',
          'GET /status',
          'GET /api/templates',
          'POST /api/templates',
          'GET /api/templates/:id',
          'PUT /api/templates/:id',
          'DELETE /api/templates/:id',
          'GET /api/variables',
          'POST /api/variables',
          'GET /api/content',
          'POST /api/content',
          'POST /api/publications',
          'GET /api/publications/:id',
          'GET /api/integrations',
          'POST /api/integrations',
          'GET /docs'
        ],
        transport: ['http'],
        capabilities: {
          tools: true,
          resources: true,
          prompts: false
        }
      });
    }
  } catch (err) {
    logger.debug('SERVICE_DISCOVERY', 'DAK Publication API service not available on port 3002');
  }
  
  const serviceRegistry = {
    services,
    timestamp: new Date().toISOString(),
    totalServices: services.length
  };
  
  res.json(serviceRegistry);
});

// Root endpoint with API information
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'DAK FAQ MCP Server',
    version: '1.0.0',
    description: 'Local MCP server for WHO SMART Guidelines Digital Adaptation Kit FAQ functionality',
    endpoints: {
      'GET /mcp/health': 'Health check',
      'GET /mcp/faq/questions/catalog': 'List available FAQ questions',
      'POST /mcp/faq/questions/execute': 'Execute FAQ questions in batch',
      'POST /mcp/faq/execute/:questionId': 'Execute a specific FAQ question by ID',
      'POST /mcp/faq/execute': 'Execute a single FAQ question (alternative endpoint)',
      'GET /mcp/faq/schemas': 'Get all question schemas',
      'GET /mcp/faq/schemas/:questionId': 'Get schema for specific question',
      'GET /mcp/faq/openapi': 'Get OpenAPI schema for all questions',
      'POST /mcp/faq/validate': 'Validate question parameters',
      'GET /mcp/faq/valuesets': 'List value sets available in this DAK',
      'GET /mcp/faq/decision-tables': 'List decision tables available in this DAK',
      'GET /mcp/faq/business-processes': 'List business processes in this DAK',
      'GET /mcp/faq/personas': 'List personas/actors in this DAK',
      'GET /mcp/faq/questionnaires': 'List questionnaires available in this DAK'
    },
    security: {
      binding: 'localhost only (127.0.0.1)',
      cors: 'localhost:3000 only',
      note: 'This server is designed for local use only and should not be exposed to remote networks'
    }
  });
});

// Error handling middleware
app.use((error: any, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
  logger.logError('SERVER_ERROR', 'Unhandled server error', error);
  
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
  logger.logRunning(PORT, HOST);
  logger.info('SERVICE_INFO', 'Security: Local binding only (127.0.0.1)');
  logger.info('SERVICE_INFO', 'Available endpoints:');
  logger.info('SERVICE_INFO', `  - GET  http://${HOST}:${PORT}/mcp/health`);
  logger.info('SERVICE_INFO', `  - GET  http://${HOST}:${PORT}/mcp/faq/questions/catalog`);
  logger.info('SERVICE_INFO', `  - POST http://${HOST}:${PORT}/mcp/faq/questions/execute`);
  logger.info('SERVICE_INFO', `  - GET  http://${HOST}:${PORT}/mcp/faq/valuesets`);
  logger.info('SERVICE_INFO', `  - GET  http://${HOST}:${PORT}/mcp/faq/decision-tables`);
  logger.info('SERVICE_INFO', `  - GET  http://${HOST}:${PORT}/mcp/faq/business-processes`);
  logger.info('SERVICE_INFO', `  - GET  http://${HOST}:${PORT}/mcp/faq/personas`);
  logger.info('SERVICE_INFO', `  - GET  http://${HOST}:${PORT}/mcp/faq/questionnaires`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SHUTDOWN', 'Received SIGTERM signal');
  logger.logShutdown('SIGTERM signal');
  server.close(() => {
    logger.info('SHUTDOWN', 'Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SHUTDOWN', 'Received SIGINT signal');
  logger.logShutdown('SIGINT signal');
  server.close(() => {
    logger.info('SHUTDOWN', 'Server closed gracefully');
    process.exit(0);
  });
});

export default app;