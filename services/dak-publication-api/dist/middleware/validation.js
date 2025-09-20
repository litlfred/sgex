"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const joi_1 = __importDefault(require("joi"));
const validationMiddleware = (req, res, next) => {
    // Skip validation for non-API routes
    if (!req.path.startsWith('/api/')) {
        return next();
    }
    // Define validation schemas for different endpoints
    const schemas = {
        // Template creation/update validation
        'POST:/api/templates': joi_1.default.object({
            name: joi_1.default.string().min(1).max(255).required(),
            description: joi_1.default.string().max(1000),
            sections: joi_1.default.array().items(joi_1.default.object()).required(),
            variables: joi_1.default.object(),
            metadata: joi_1.default.object(),
        }),
        // Variable resolution validation
        'POST:/api/variables/resolve': joi_1.default.object({
            templateId: joi_1.default.string().min(1).required(),
            dakRepository: joi_1.default.string().min(1).required(),
            serviceIntegration: joi_1.default.object({
                useFAQ: joi_1.default.boolean(),
                useMCP: joi_1.default.boolean(),
            }),
            userContent: joi_1.default.object(),
        }),
        // Content update validation
        'PUT:/api/content/user/:userId': joi_1.default.object({
            templateId: joi_1.default.string().min(1).required(),
            content: joi_1.default.object().required(),
        }),
        // Publication generation validation
        'POST:/api/publication/generate': joi_1.default.object({
            templateId: joi_1.default.string().min(1).required(),
            dakRepository: joi_1.default.string().min(1).required(),
            userContent: joi_1.default.object(),
            options: joi_1.default.object({
                format: joi_1.default.string().valid('html', 'pdf', 'markdown'),
                includeAssets: joi_1.default.boolean(),
            }),
        }),
        // FAQ batch execution validation
        'POST:/api/integrations/faq/batch': joi_1.default.object({
            dakRepository: joi_1.default.string().min(1).required(),
            questions: joi_1.default.array().items(joi_1.default.object({
                questionId: joi_1.default.string().min(1).required(),
                parameters: joi_1.default.object(),
            })).min(1).required(),
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
exports.validationMiddleware = validationMiddleware;
//# sourceMappingURL=validation.js.map