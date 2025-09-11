import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';
import { join } from 'path';

import { templateRoutes } from './routes/templates';
import { variableRoutes } from './routes/variables';
import { contentRoutes } from './routes/content';
import { publicationRoutes } from './routes/publication';
import { integrationRoutes } from './routes/integration';
import { healthRoutes } from './routes/health';

import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';

export class DAKPublicationServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3002) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use('/api', limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    // Authentication middleware (for protected routes)
    this.app.use('/api', authMiddleware);

    // Request validation middleware
    this.app.use('/api', validationMiddleware);
  }

  private setupRoutes(): void {
    // Health check routes (public)
    this.app.use('/', healthRoutes);

    // API documentation
    const swaggerDocument = YAML.load(join(__dirname, '../../openapi.yaml'));
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
      swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    }));

    // API routes
    this.app.use('/api/templates', templateRoutes);
    this.app.use('/api/variables', variableRoutes);
    this.app.use('/api/content', contentRoutes);
    this.app.use('/api/publication', publicationRoutes);
    this.app.use('/api/integrations', integrationRoutes);

    // Catch-all route for undefined endpoints
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
        documentation: '/docs',
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const server = this.app.listen(this.port, () => {
          console.log(`🚀 DAK Publication API Server running on port ${this.port}`);
          console.log(`📚 API Documentation: http://localhost:${this.port}/docs`);
          console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
          resolve();
        });

        server.on('error', (error) => {
          console.error('Failed to start server:', error);
          reject(error);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
          console.log('SIGTERM signal received: closing HTTP server');
          server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
          });
        });

        process.on('SIGINT', () => {
          console.log('SIGINT signal received: closing HTTP server');
          server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
          });
        });

      } catch (error) {
        console.error('Failed to start server:', error);
        reject(error);
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
  const server = new DAKPublicationServer(port);
  
  server.start().catch((error) => {
    console.error('Failed to start DAK Publication API server:', error);
    process.exit(1);
  });
}