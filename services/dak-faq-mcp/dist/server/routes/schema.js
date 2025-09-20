/**
 * FAQ Schema Route
 * Provides access to question schemas and definitions
 */
import express from 'express';
import { FAQSchemaService } from '../util/FAQSchemaService.js';
const router = express.Router();
const schemaService = FAQSchemaService.getInstance();
/**
 * GET /faq/schemas
 * Get all question schemas
 */
router.get('/schemas', async (req, res) => {
    try {
        const schemas = await schemaService.getAllSchemas();
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            schemas
        });
    }
    catch (error) {
        const errorResponse = {
            error: {
                message: error.message,
                code: 'SCHEMA_ERROR',
                timestamp: new Date().toISOString()
            }
        };
        res.status(500).json(errorResponse);
    }
});
/**
 * GET /faq/schemas/:questionId
 * Get schema for a specific question
 */
router.get('/schemas/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;
        const schema = await schemaService.getQuestionSchema(questionId);
        if (!schema) {
            const errorResponse = {
                error: {
                    message: `Schema not found for question: ${questionId}`,
                    code: 'SCHEMA_NOT_FOUND',
                    timestamp: new Date().toISOString()
                }
            };
            res.status(404).json(errorResponse);
            return;
        }
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            questionId,
            schema
        });
    }
    catch (error) {
        const errorResponse = {
            error: {
                message: error.message,
                code: 'SCHEMA_ERROR',
                timestamp: new Date().toISOString()
            }
        };
        res.status(500).json(errorResponse);
    }
});
/**
 * GET /faq/openapi
 * Get OpenAPI schema for all questions
 */
router.get('/openapi', async (req, res) => {
    try {
        const openApiSchema = await schemaService.getOpenAPISchema();
        res.json(openApiSchema);
    }
    catch (error) {
        const errorResponse = {
            error: {
                message: error.message,
                code: 'SCHEMA_ERROR',
                timestamp: new Date().toISOString()
            }
        };
        res.status(500).json(errorResponse);
    }
});
/**
 * POST /faq/validate
 * Validate question parameters against schema
 */
router.post('/validate', async (req, res) => {
    try {
        const { questionId, parameters } = req.body;
        if (!questionId) {
            const errorResponse = {
                error: {
                    message: 'Missing questionId in request body',
                    code: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString()
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        const validation = await schemaService.validateQuestionParameters(questionId, parameters || {});
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            questionId,
            validation
        });
    }
    catch (error) {
        const errorResponse = {
            error: {
                message: error.message,
                code: 'VALIDATION_ERROR',
                timestamp: new Date().toISOString()
            }
        };
        res.status(500).json(errorResponse);
    }
});
export { router as schemaRoute };
//# sourceMappingURL=schema.js.map