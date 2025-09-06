import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'DAK Publication API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'operational',
    services: {
      database: 'connected',
      mcpIntegration: 'available',
      faqService: 'available',
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

export { router as healthRoutes };