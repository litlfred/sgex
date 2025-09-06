"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variableRoutes = void 0;
const express_1 = require("express");
const variableService_1 = require("../services/variableService");
const router = (0, express_1.Router)();
exports.variableRoutes = router;
const variableService = new variableService_1.VariableService();
// POST /api/variables/resolve - Resolve template variables
router.post('/resolve', async (req, res) => {
    try {
        const { templateId, dakRepository, serviceIntegration, userContent } = req.body;
        const resolvedVariables = await variableService.resolveVariables({
            templateId,
            dakRepository,
            serviceIntegration,
            userContent,
        });
        res.json({
            success: true,
            data: resolvedVariables,
            metadata: {
                resolvedAt: new Date().toISOString(),
                templateId,
                dakRepository,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: 'Failed to resolve variables',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// GET /api/variables/template/:templateId - Get template variables
router.get('/template/:templateId', async (req, res) => {
    try {
        const variables = await variableService.getTemplateVariables(req.params.templateId);
        res.json({
            success: true,
            data: variables,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: 'Template variables not found',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// POST /api/variables/validate - Validate variable values
router.post('/validate', async (req, res) => {
    try {
        const { variables, schema } = req.body;
        const validation = await variableService.validateVariables(variables, schema);
        res.json({
            success: true,
            data: validation,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: 'Variable validation failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
//# sourceMappingURL=variables.js.map