/**
 * FAQ Questions Execute Route
 * Handles batch execution of FAQ questions
 */

import express from 'express';
import { validateExecuteRequest } from '../util/validation.js';
import { FAQExecutionEngineLocal } from '../util/FAQExecutionEngineLocal.js';

const router = express.Router();
const faqEngine = new FAQExecutionEngineLocal();

/**
 * POST /faq/questions/execute
 * Execute one or more FAQ questions
 */
router.post('/execute', async (req, res) => {
  try {
    // Validate request
    const validation = validateExecuteRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          message: 'Invalid request format',
          code: 'VALIDATION_ERROR',
          details: validation.errors
        }
      });
    }

    const { requests, context } = validation.data;

    // Initialize FAQ engine if needed
    await faqEngine.initialize();

    // Execute questions in batch
    const results = await faqEngine.executeBatch(requests, context);

    // Return results
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Execute route error:', error);
    
    res.status(500).json({
      error: {
        message: error.message || 'Failed to execute FAQ questions',
        code: 'EXECUTION_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export { router as executeRoute };