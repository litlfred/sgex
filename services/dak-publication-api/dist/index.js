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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = exports.PublicationService = exports.ContentService = exports.VariableService = exports.TemplateService = exports.DAKPublicationServer = void 0;
var server_1 = require("./server");
Object.defineProperty(exports, "DAKPublicationServer", { enumerable: true, get: function () { return server_1.DAKPublicationServer; } });
var templateService_1 = require("./services/templateService");
Object.defineProperty(exports, "TemplateService", { enumerable: true, get: function () { return templateService_1.TemplateService; } });
var variableService_1 = require("./services/variableService");
Object.defineProperty(exports, "VariableService", { enumerable: true, get: function () { return variableService_1.VariableService; } });
var contentService_1 = require("./services/contentService");
Object.defineProperty(exports, "ContentService", { enumerable: true, get: function () { return contentService_1.ContentService; } });
var publicationService_1 = require("./services/publicationService");
Object.defineProperty(exports, "PublicationService", { enumerable: true, get: function () { return publicationService_1.PublicationService; } });
var integrationService_1 = require("./services/integrationService");
Object.defineProperty(exports, "IntegrationService", { enumerable: true, get: function () { return integrationService_1.IntegrationService; } });
__exportStar(require("./types/template"), exports);
__exportStar(require("./types/api"), exports);
// Main entry point for the application
const server_2 = require("./server");
if (require.main === module) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
    const server = new server_2.DAKPublicationServer(port);
    server.start().catch((error) => {
        console.error('Failed to start DAK Publication API server:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map