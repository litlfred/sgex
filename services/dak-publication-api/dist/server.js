"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAKPublicationServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const YAML = __importStar(require("yamljs"));
const path_1 = require("path");
const templates_1 = require("./routes/templates");
const variables_1 = require("./routes/variables");
const content_1 = require("./routes/content");
const publication_1 = require("./routes/publication");
const integration_1 = require("./routes/integration");
const health_1 = require("./routes/health");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const validation_1 = require("./middleware/validation");
class DAKPublicationServer {
    constructor(port = 3002) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.rateLimit)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
        });
        this.app.use('/api', limiter);
        // Body parsing and compression
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Logging
        this.app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
        // Authentication middleware (for protected routes)
        this.app.use('/api', auth_1.authMiddleware);
        // Request validation middleware
        this.app.use('/api', validation_1.validationMiddleware);
    }
    setupRoutes() {
        // Health check routes (public)
        this.app.use('/', health_1.healthRoutes);
        // API documentation
        const swaggerDocument = YAML.load((0, path_1.join)(__dirname, '../openapi.yaml'));
        this.app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
            explorer: true,
            swaggerOptions: {
                docExpansion: 'none',
                filter: true,
                showRequestDuration: true,
            },
        }));
        // API routes
        this.app.use('/api/templates', templates_1.templateRoutes);
        this.app.use('/api/variables', variables_1.variableRoutes);
        this.app.use('/api/content', content_1.contentRoutes);
        this.app.use('/api/publication', publication_1.publicationRoutes);
        this.app.use('/api/integrations', integration_1.integrationRoutes);
        // Catch-all route for undefined endpoints
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
                documentation: '/docs',
            });
        });
    }
    setupErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    async start() {
        return new Promise((resolve, reject) => {
            try {
                const server = this.app.listen(this.port, () => {
                    console.log(`🚀 DAK Publication API Server running on port ${this.port}`);
                    console.log(`📚 API Documentation: http://localhost:${this.port}/docs`);
                    console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
                    resolve();
                });
                server.on('error', (error) => {
                    console.error('Failed to start server:', error);
                    reject(error);
                });
                // Graceful shutdown
                process.on('SIGTERM', () => {
                    console.log('SIGTERM signal received: closing HTTP server');
                    server.close(() => {
                        console.log('HTTP server closed');
                        process.exit(0);
                    });
                });
                process.on('SIGINT', () => {
                    console.log('SIGINT signal received: closing HTTP server');
                    server.close(() => {
                        console.log('HTTP server closed');
                        process.exit(0);
                    });
                });
            }
            catch (error) {
                console.error('Failed to start server:', error);
                reject(error);
            }
        });
    }
    getApp() {
        return this.app;
    }
}
exports.DAKPublicationServer = DAKPublicationServer;
// Start server if this file is run directly
if (require.main === module) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
    const server = new DAKPublicationServer(port);
    server.start().catch((error) => {
        console.error('Failed to start DAK Publication API server:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map