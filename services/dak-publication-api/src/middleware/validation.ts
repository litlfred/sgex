import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip validation for non-API routes
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  // Define validation schemas for different endpoints
  const schemas: { [key: string]: Joi.ObjectSchema } = {
    // Template creation/update validation
    'POST:/api/templates': Joi.object({
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().max(1000),
      sections: Joi.array().items(Joi.object()).required(),
      variables: Joi.object(),
      metadata: Joi.object(),
    }),

    // Variable resolution validation
    'POST:/api/variables/resolve': Joi.object({
      templateId: Joi.string().min(1).required(),
      dakRepository: Joi.string().min(1).required(),
      serviceIntegration: Joi.object({
        useFAQ: Joi.boolean(),
        useMCP: Joi.boolean(),
      }),
      userContent: Joi.object(),
    }),

    // Content update validation
    'PUT:/api/content/user/:userId': Joi.object({
      templateId: Joi.string().min(1).required(),
      content: Joi.object().required(),
    }),

    // Publication generation validation
    'POST:/api/publication/generate': Joi.object({
      templateId: Joi.string().min(1).required(),
      dakRepository: Joi.string().min(1).required(),
      userContent: Joi.object(),
      options: Joi.object({
        format: Joi.string().valid('html', 'pdf', 'markdown'),
        includeAssets: Joi.boolean(),
      }),
    }),

    // FAQ batch execution validation
    'POST:/api/integrations/faq/batch': Joi.object({
      dakRepository: Joi.string().min(1).required(),
      questions: Joi.array().items(
        Joi.object({
          questionId: Joi.string().min(1).required(),
          parameters: Joi.object(),
        })
      ).min(1).required(),
    }),
  };

  // Get the validation schema for this endpoint
  const routeKey = `${req.method}:${req.route?.path || req.path}`;
  const schema = schemas[routeKey];

  // Skip validation if no schema defined
  if (!schema) {
    return next();
  }

  // Validate request body
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Request body validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      })),
    });
  }

  // Replace request body with validated/sanitized value
  req.body = value;
  next();
};