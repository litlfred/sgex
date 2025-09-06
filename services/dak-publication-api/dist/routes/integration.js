"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationRoutes = void 0;
const express_1 = require("express");
const integrationService_1 = require("../services/integrationService");
const router = (0, express_1.Router)();
exports.integrationRoutes = router;
const integrationService = new integrationService_1.IntegrationService();
// POST /api/integrations/mcp/execute - Execute MCP service calls
router.post('/mcp/execute', async (req, res) => {
    try {
        const result = await integrationService.executeMCPService(req.body);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'MCP service execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// POST /api/integrations/faq/batch - Execute FAQ service batch
router.post('/faq/batch', async (req, res) => {
    try {
        const { dakRepository, questions } = req.body;
        const results = await integrationService.executeFAQBatch(dakRepository, questions);
        res.json({
            success: true,
            data: results,
            metadata: {
                dakRepository,
                questionsProcessed: questions.length,
                processedAt: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'FAQ batch execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// GET /api/integrations/status - Get integration service status
router.get('/status', async (req, res) => {
    try {
        const status = await integrationService.getServiceStatus();
        res.json({
            success: true,
            data: status,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get service status',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
//# sourceMappingURL=integration.js.map