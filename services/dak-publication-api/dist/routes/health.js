"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.healthRoutes = router;
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'DAK Publication API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});
router.get('/status', (req, res) => {
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
//# sourceMappingURL=health.js.map