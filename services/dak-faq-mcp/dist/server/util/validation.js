/**
 * Request validation utilities for MCP server
 */
/**
 * Validate execute request format
 */
export function validateExecuteRequest(body) {
    const errors = [];
    if (!body || typeof body !== 'object') {
        errors.push('Request body must be an object');
        return { isValid: false, errors };
    }
    if (!Array.isArray(body.requests)) {
        errors.push('requests must be an array');
        return { isValid: false, errors };
    }
    if (body.requests.length === 0) {
        errors.push('At least one request is required');
        return { isValid: false, errors };
    }
    // Validate each request
    for (let i = 0; i < body.requests.length; i++) {
        const request = body.requests[i];
        const prefix = `requests[${i}]`;
        if (!request || typeof request !== 'object') {
            errors.push(`${prefix} must be an object`);
            continue;
        }
        if (!request.questionId || typeof request.questionId !== 'string') {
            errors.push(`${prefix}.questionId is required and must be a string`);
        }
        if (request.parameters && typeof request.parameters !== 'object') {
            errors.push(`${prefix}.parameters must be an object if provided`);
        }
        if (request.assetFiles && !Array.isArray(request.assetFiles)) {
            errors.push(`${prefix}.assetFiles must be an array if provided`);
        }
    }
    // Validate context if provided
    if (body.context && typeof body.context !== 'object') {
        errors.push('context must be an object if provided');
    }
    if (body.context && body.context.repositoryPath && typeof body.context.repositoryPath !== 'string') {
        errors.push('context.repositoryPath must be a string if provided');
    }
    return {
        isValid: errors.length === 0,
        errors,
        data: errors.length === 0 ? body : undefined
    };
}
/**
 * Validate question ID format
 */
export function isValidQuestionId(questionId) {
    if (!questionId || typeof questionId !== 'string') {
        return false;
    }
    // Question IDs should be kebab-case with optional namespace
    const pattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
    return pattern.test(questionId);
}
/**
 * Validate locale format
 */
export function isValidLocale(locale) {
    if (!locale || typeof locale !== 'string') {
        return false;
    }
    // Support common locale formats: en, en_US, en-US
    const pattern = /^[a-z]{2}([_-][A-Z]{2})?$/;
    return pattern.test(locale);
}
/**
 * Validate repository path
 */
export function isValidRepositoryPath(path) {
    if (!path || typeof path !== 'string') {
        return false;
    }
    // Security check: prevent path traversal
    if (path.includes('..') || path.includes('~') || path.startsWith('/')) {
        return false;
    }
    // Must be a relative path
    return path.length > 0 && !path.startsWith('./');
}
//# sourceMappingURL=validation.js.map