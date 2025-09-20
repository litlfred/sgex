/**
 * DAK FAQ MCP Server
 * Local-only server providing FAQ functionality for DAK repositories
 * Enhanced with request tracking and logging capabilities
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { createHash, randomUUID } from 'crypto';
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

// Request tracking configuration
const REQUEST_BUFFER_SIZE = parseInt(process.env.MCP_REQUEST_BUFFER_SIZE || '2000', 10);
const requestBuffer: any[] = [];
const logBuffer: any[] = [];

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

// Request tracking middleware
const requestTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();
  const startTime = Date.now();
  
  // Capture request data
  const requestData = {
    uuid: requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    serviceId: 'dak-faq',
    serviceName: 'DAK FAQ MCP Service',
    request: {
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params
    },
    metadata: {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer'),
      requestSize: JSON.stringify(req.body || {}).length
    }
  };

  // Store request ID for response tracking
  (req as any).requestId = requestId;
  
  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(body: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Complete request data with response
    const completeRequest = {
      ...requestData,
      status: res.statusCode,
      responseTime,
      response: {
        headers: res.getHeaders(),
        body: body
      },
      metadata: {
        ...requestData.metadata,
        responseSize: JSON.stringify(body || {}).length
      },
      timing: {
        startTime,
        endTime,
        duration: responseTime
      }
    };
    
    // Add to buffer (circular buffer)
    requestBuffer.push(completeRequest);
    if (requestBuffer.length > REQUEST_BUFFER_SIZE) {
      requestBuffer.shift();
    }
    
    // Log the request
    logger.info('API_QUERY', `${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime
    });
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Apply request tracking middleware to all routes
app.use(requestTrackingMiddleware);

// Enhanced logging middleware for service lifecycle
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? 'error' : 'info',
      category: 'API_REQUEST',
      message: `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
      serviceCategory: 'mcp-dak-faq',
      metadata: {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    };
    
    // Add to log buffer
    logBuffer.push(logEntry);
    if (logBuffer.length > REQUEST_BUFFER_SIZE) {
      logBuffer.shift();
    }
  });
  
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
      'POST /daks/repositories',
      'GET /requests',
      'GET /requests/:uuid',
      'GET /logs'
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

// Request tracking API endpoints
app.get('/mcp/requests', (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0, method, status, service } = req.query;
    
    let filtered = [...requestBuffer];
    
    // Apply filters
    if (method) {
      filtered = filtered.filter(r => r.method === method);
    }
    if (status) {
      const statusCode = parseInt(status as string);
      filtered = filtered.filter(r => Math.floor(r.status / 100) === Math.floor(statusCode / 100));
    }
    if (service) {
      filtered = filtered.filter(r => r.serviceId === service);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const startIndex = parseInt(offset as string) || 0;
    const limitNum = parseInt(limit as string) || 100;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);
    
    res.json({
      success: true,
      total: filtered.length,
      requests: paginated,
      pagination: {
        offset: startIndex,
        limit: limitNum,
        hasMore: startIndex + limitNum < filtered.length
      }
    });
  } catch (error) {
    logger.error('REQUEST_LIST', 'Failed to get request list', error instanceof Error ? error : undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve requests'
    });
  }
});

app.get('/mcp/requests/:uuid', (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const request = requestBuffer.find(r => r.uuid === uuid);
    
    if (!request) {
      res.status(404).json({
        success: false,
        error: 'Request not found'
      });
      return;
    }
    
    res.json({
      success: true,
      request
    });
  } catch (error) {
    logger.error('REQUEST_DETAIL', 'Failed to get request details', error instanceof Error ? error : undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve request details'
    });
  }
});

// Log retrieval API endpoints
app.get('/mcp/logs', (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0, level, category, search } = req.query;
    
    let filtered = [...logBuffer];
    
    // Apply filters
    if (level) {
      filtered = filtered.filter(l => l.level === level);
    }
    if (category) {
      filtered = filtered.filter(l => l.category === category);
    }
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filtered = filtered.filter(l => 
        l.message.toLowerCase().includes(searchTerm) ||
        l.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const startIndex = parseInt(offset as string) || 0;
    const limitNum = parseInt(limit as string) || 100;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);
    
    res.json({
      success: true,
      total: filtered.length,
      logs: paginated,
      pagination: {
        offset: startIndex,
        limit: limitNum,
        hasMore: startIndex + limitNum < filtered.length
      }
    });
  } catch (error) {
    logger.error('LOG_LIST', 'Failed to get log list', error instanceof Error ? error : undefined);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logs'
    });
  }
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