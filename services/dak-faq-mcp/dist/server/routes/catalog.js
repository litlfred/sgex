/**
 * FAQ Questions Catalog Route
 * Provides metadata about available FAQ questions
 */
import express from 'express';
import { FAQExecutionEngineLocal } from '../util/FAQExecutionEngineLocal.js';
const router = express.Router();
const faqEngine = new FAQExecutionEngineLocal();
/**
 * GET /faq/questions/catalog
 * Get catalog of available FAQ questions
 */
router.get('/catalog', async (req, res) => {
    try {
        // Parse query parameters for filtering
        const { level, tags, componentType, assetType, format = 'json' } = req.query;
        // Parse tags if provided
        const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
        // Build filters object
        const filters = {};
        if (level)
            filters.level = level;
        if (parsedTags)
            filters.tags = parsedTags;
        if (componentType)
            filters.componentType = componentType;
        if (assetType)
            filters.assetType = assetType;
        // Initialize FAQ engine if needed
        await faqEngine.initialize();
        // Get catalog with filters
        const catalog = faqEngine.getCatalog(filters);
        // Add metadata
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            filters,
            count: catalog.length,
            questions: catalog
        };
        // Return based on format
        if (format === 'openapi') {
            // Return OpenAPI schema for the questions
            const schema = generateOpenAPISchema(catalog);
            res.json(schema);
        }
        else {
            res.json(response);
        }
    }
    catch (error) {
        console.error('Catalog route error:', error);
        const errorResponse = {
            error: {
                message: error.message || 'Failed to get FAQ catalog',
                code: 'CATALOG_ERROR',
                timestamp: new Date().toISOString()
            }
        };
        res.status(500).json(errorResponse);
    }
});
/**
 * Generate OpenAPI schema for FAQ questions
 */
function generateOpenAPISchema(questions) {
    const schema = {
        openapi: '3.0.0',
        info: {
            title: 'DAK FAQ Questions API',
            version: '1.0.0',
            description: 'API schema for WHO SMART Guidelines DAK FAQ questions'
        },
        paths: {
            '/faq/questions/execute': {
                post: {
                    summary: 'Execute FAQ questions',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        requests: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    questionId: {
                                                        type: 'string',
                                                        enum: questions.map(q => q.id)
                                                    },
                                                    parameters: {
                                                        type: 'object'
                                                    },
                                                    assetFiles: {
                                                        type: 'array',
                                                        items: { type: 'string' }
                                                    }
                                                },
                                                required: ['questionId']
                                            }
                                        },
                                        context: {
                                            type: 'object',
                                            properties: {
                                                repositoryPath: { type: 'string' }
                                            }
                                        }
                                    },
                                    required: ['requests']
                                }
                            }
                        }
                    }
                }
            }
        },
        components: {
            schemas: {
                Question: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        level: { type: 'string', enum: ['dak', 'component', 'asset'] },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        parameters: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    type: { type: 'string' },
                                    required: { type: 'boolean' },
                                    description: { type: 'string' }
                                }
                            }
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        }
    };
    return schema;
}
export { router as catalogRoute };
//# sourceMappingURL=catalog.js.map