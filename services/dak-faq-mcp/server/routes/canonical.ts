/**
 * Canonical Schema Routes
 * 
 * Endpoints for WHO SMART Guidelines canonical ValueSets and Logical Models
 */

import { Router, Request, Response } from 'express';
import { CanonicalSchemaService } from '../util/CanonicalSchemaService.js';
import { FAQSchemaService } from '../util/FAQSchemaService.js';

const router = Router();
const canonicalService = CanonicalSchemaService.getInstance();
const schemaService = FAQSchemaService.getInstance();

/**
 * GET /faq/canonical/known
 * Get known canonical ValueSets and Logical Models
 */
router.get('/known', async (req: Request, res: Response) => {
  try {
    const knownCanonicals = canonicalService.getKnownCanonicalUrls();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: knownCanonicals
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: 'Failed to get known canonical references',
        code: 'CANONICAL_LOAD_ERROR',
        timestamp: new Date().toISOString(),
        details: [error.message]
      }
    });
  }
});

/**
 * POST /faq/canonical/validate
 * Validate data against a canonical schema
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { canonicalUrl, data } = req.body;
    
    if (!canonicalUrl || !data) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: canonicalUrl and data',
          code: 'VALIDATION_REQUEST_INVALID',
          timestamp: new Date().toISOString()
        }
      });
    }

    const validationResult = await canonicalService.validateAgainstCanonical(canonicalUrl, data);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      validation: validationResult,
      canonicalUrl
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: 'Canonical validation failed',
        code: 'CANONICAL_VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        details: [error.message]
      }
    });
  }
});

/**
 * GET /faq/canonical/valuesets/:url/expand
 * Expand a ValueSet to get all codes
 */
router.get('/valuesets/*/expand', async (req: Request, res: Response) => {
  try {
    // Extract URL from path (everything after /valuesets/)
    const url = req.path.replace('/valuesets/', '').replace('/expand', '');
    const decodedUrl = decodeURIComponent(url);
    
    const expansion = await canonicalService.expandValueSet(decodedUrl);
    
    if (!expansion) {
      return res.status(404).json({
        error: {
          message: `ValueSet not found or could not be expanded: ${decodedUrl}`,
          code: 'VALUESET_NOT_FOUND',
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      expansion,
      url: decodedUrl
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: 'ValueSet expansion failed',
        code: 'VALUESET_EXPANSION_ERROR',
        timestamp: new Date().toISOString(),
        details: [error.message]
      }
    });
  }
});

/**
 * POST /faq/canonical/valuesets/validate-code
 * Validate a code against a ValueSet
 */
router.post('/valuesets/validate-code', async (req: Request, res: Response) => {
  try {
    const { valueSetUrl, code } = req.body;
    
    if (!valueSetUrl || !code) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: valueSetUrl and code',
          code: 'CODE_VALIDATION_REQUEST_INVALID',
          timestamp: new Date().toISOString()
        }
      });
    }

    const isValid = await canonicalService.validateValueSetCode(valueSetUrl, code);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      validation: {
        isValid,
        code,
        valueSetUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: 'Code validation failed',
        code: 'CODE_VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        details: [error.message]
      }
    });
  }
});

/**
 * GET /faq/canonical/schemas/:url
 * Load a specific canonical schema
 */
router.get('/schemas/*', async (req: Request, res: Response) => {
  try {
    // Extract URL from path (everything after /schemas/)
    const url = req.path.replace('/schemas/', '');
    const decodedUrl = decodeURIComponent(url);
    const version = req.query.version as string;
    
    const schema = await canonicalService.loadCanonicalSchema(decodedUrl, version);
    
    if (!schema) {
      return res.status(404).json({
        error: {
          message: `Canonical schema not found: ${decodedUrl}`,
          code: 'CANONICAL_SCHEMA_NOT_FOUND',
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      schema,
      url: decodedUrl
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: 'Failed to load canonical schema',
        code: 'CANONICAL_SCHEMA_LOAD_ERROR',
        timestamp: new Date().toISOString(),
        details: [error.message]
      }
    });
  }
});

/**
 * GET /faq/canonical/questions/:questionId/valuesets
 * Get ValueSet information for a specific question's parameters
 */
router.get('/questions/:questionId/valuesets', async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    
    const question = await schemaService.getQuestion(questionId);
    if (!question) {
      return res.status(404).json({
        error: {
          message: `Question not found: ${questionId}`,
          code: 'QUESTION_NOT_FOUND',
          timestamp: new Date().toISOString()
        }
      });
    }

    const parameterValueSets: Record<string, any> = {};
    
    for (const parameter of question.parameters) {
      if (parameter.valueSetBinding) {
        try {
          const codes = await schemaService.getParameterValueSetCodes(questionId, parameter.name);
          parameterValueSets[parameter.name] = {
            binding: parameter.valueSetBinding,
            codes
          };
        } catch (error: any) {
          parameterValueSets[parameter.name] = {
            binding: parameter.valueSetBinding,
            error: error.message
          };
        }
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      questionId,
      parameterValueSets
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: 'Failed to get question ValueSets',
        code: 'QUESTION_VALUESETS_ERROR',
        timestamp: new Date().toISOString(),
        details: [error.message]
      }
    });
  }
});

/**
 * GET /faq/canonical/cache/stats
 * Get canonical schema cache statistics
 */
router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const stats = canonicalService.getCacheStats();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      cache: stats
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: 'Failed to get cache statistics',
        code: 'CACHE_STATS_ERROR',
        timestamp: new Date().toISOString(),
        details: [error.message]
      }
    });
  }
});

/**
 * DELETE /faq/canonical/cache
 * Clear canonical schema cache
 */
router.delete('/cache', async (req: Request, res: Response) => {
  try {
    await canonicalService.clearCache();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Cache cleared successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: 'Failed to clear cache',
        code: 'CACHE_CLEAR_ERROR',
        timestamp: new Date().toISOString(),
        details: [error.message]
      }
    });
  }
});

export default router;