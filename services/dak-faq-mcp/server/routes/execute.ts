/**
 * FAQ Questions Execute Route
 * Handles batch execution of FAQ questions
 */

import express, { Request, Response } from 'express';
import { validateExecuteRequest } from '../util/validation.js';
import { FAQExecutionEngineLocal } from '../util/FAQExecutionEngineLocal.js';
import { ExecuteRequestBody, BatchExecuteResponse, ErrorResponse, SingleExecuteRequest, ExecuteResponse, ExecuteRequest } from '../../types.js';

const router = express.Router();
const faqEngine = new FAQExecutionEngineLocal();

/**
 * POST /faq/questions/execute
 * Execute one or more FAQ questions
 */
router.post('/execute', async (req: Request<{}, BatchExecuteResponse | ErrorResponse, ExecuteRequestBody>, res: Response<BatchExecuteResponse | ErrorResponse>): Promise<Response<BatchExecuteResponse | ErrorResponse> | void> => {
  try {
    // Validate request
    const validation = validateExecuteRequest(req.body);
    if (!validation.isValid) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Invalid request format',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
          details: validation.errors
        }
      };
      return res.status(400).json(errorResponse);
    }

    const { requests, context } = validation.data!;

    // Initialize FAQ engine if needed
    await faqEngine.initialize();

    // Execute questions in batch
    const results = await faqEngine.executeBatch(requests, context);

    // Return results
    const response: BatchExecuteResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };

    res.json(response);

  } catch (error: any) {
    console.error('Execute route error:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to execute FAQ questions',
        code: 'EXECUTION_ERROR',
        timestamp: new Date().toISOString()
      }
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * POST /faq/execute/:questionId
 * Execute a specific FAQ question by ID
 */
router.post('/:questionId', async (req: Request<{ questionId: string }, ExecuteResponse | ErrorResponse, SingleExecuteRequest>, res: Response<ExecuteResponse | ErrorResponse>): Promise<Response<ExecuteResponse | ErrorResponse> | void> => {
  try {
    const { questionId } = req.params;
    const { parameters = {}, assetFiles, context = {} } = req.body;

    // Create execution request
    const executeRequest: ExecuteRequest = {
      questionId,
      parameters,
      assetFiles
    };

    // Initialize FAQ engine if needed
    await faqEngine.initialize();

    // Execute single question
    const result = await faqEngine.executeSingle(executeRequest, context);

    res.json(result);

  } catch (error: any) {
    console.error('Single execute route error:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to execute FAQ question',
        code: 'EXECUTION_ERROR',
        timestamp: new Date().toISOString()
      }
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * POST /faq/execute
 * Execute a single FAQ question (alternative endpoint)
 */
router.post('/', async (req: Request<{}, ExecuteResponse | ErrorResponse, ExecuteRequest & { context?: any }>, res: Response<ExecuteResponse | ErrorResponse>): Promise<Response<ExecuteResponse | ErrorResponse> | void> => {
  try {
    const { questionId, parameters = {}, assetFiles, context = {} } = req.body;

    if (!questionId) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Missing required field: questionId',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        }
      };
      return res.status(400).json(errorResponse);
    }

    // Create execution request
    const executeRequest: ExecuteRequest = {
      questionId,
      parameters,
      assetFiles
    };

    // Initialize FAQ engine if needed
    await faqEngine.initialize();

    // Execute single question
    const result = await faqEngine.executeSingle(executeRequest, context);

    res.json(result);

  } catch (error: any) {
    console.error('Single execute route error:', error);
    
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to execute FAQ question',
        code: 'EXECUTION_ERROR',
        timestamp: new Date().toISOString()
      }
    };

    res.status(500).json(errorResponse);
  }
});

export { router as executeRoute };