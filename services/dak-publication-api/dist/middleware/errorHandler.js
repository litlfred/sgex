"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        errorCode = 'VALIDATION_ERROR';
    }
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized access';
        errorCode = 'UNAUTHORIZED';
    }
    else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden access';
        errorCode = 'FORBIDDEN';
    }
    else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Resource not found';
        errorCode = 'NOT_FOUND';
    }
    else if (err.name === 'ConflictError') {
        statusCode = 409;
        message = 'Resource conflict';
        errorCode = 'CONFLICT';
    }
    // Include error details in development mode
    const errorResponse = {
        success: false,
        error: errorCode,
        message: message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = {
            name: err.name,
            message: err.message,
            stack: err.stack,
        };
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map