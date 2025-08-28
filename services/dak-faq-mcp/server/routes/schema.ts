/**
 * FAQ Schema Route
 * Provides access to question schemas and definitions
 */

import express, { Request, Response } from 'express';
import { FAQSchemaService } from '../util/FAQSchemaService.js';
import { ErrorResponse } from '../../types.js';

const router = express.Router();
const schemaService = FAQSchemaService.getInstance();

/**
 * GET /faq/schemas
 * Get all question schemas
 */
router.get('/schemas', async (req: Request, res: Response) => {
  try {
    const schemas = await schemaService.getAllSchemas();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      schemas
    });
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
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
router.get('/schemas/:questionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    const schema = await schemaService.getQuestionSchema(questionId);
    
    if (!schema) {
      const errorResponse: ErrorResponse = {
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
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
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
router.get('/openapi', async (req: Request, res: Response) => {
  try {
    const openApiSchema = await schemaService.getOpenAPISchema();
    res.json(openApiSchema);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
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
router.post('/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId, parameters } = req.body;
    
    if (!questionId) {
      const errorResponse: ErrorResponse = {
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
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
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