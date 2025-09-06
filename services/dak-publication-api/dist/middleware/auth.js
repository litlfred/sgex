"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    // Skip authentication for health checks and public documentation
    if (req.path === '/' || req.path === '/health' || req.path === '/status' || req.path.startsWith('/docs')) {
        return next();
    }
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    // Bearer token authentication
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            // TODO: Implement proper JWT validation
            // For now, accept any non-empty token for development
            if (token && token.length > 0) {
                req.user = {
                    id: 'dev-user',
                    email: 'dev@who.int',
                    roles: ['user', 'editor'],
                };
                return next();
            }
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                message: 'The provided authentication token is invalid',
            });
        }
    }
    // API Key authentication
    if (apiKey) {
        try {
            // TODO: Implement proper API key validation
            // For now, accept any non-empty API key for development
            if (apiKey && apiKey.length > 0) {
                req.user = {
                    id: 'api-user',
                    email: 'api@who.int',
                    roles: ['api', 'user'],
                };
                return next();
            }
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key',
                message: 'The provided API key is invalid',
            });
        }
    }
    return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid authentication token or API key',
        documentation: {
            bearerToken: 'Use Authorization: Bearer <token> header',
            apiKey: 'Use X-API-Key: <key> header',
        },
    });
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map