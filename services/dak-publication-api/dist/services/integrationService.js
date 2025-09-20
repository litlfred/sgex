"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const axios_1 = __importDefault(require("axios"));
class IntegrationService {
    constructor() {
        this.lastServiceCheck = new Map();
        this.mcpServiceUrl = process.env.MCP_SERVICE_URL || 'http://localhost:3001';
    }
    async executeMCPService(request) {
        try {
            const response = await axios_1.default.post(`${this.mcpServiceUrl}/api/mcp/execute`, {
                operation: request.operation,
                context: request.context,
            }, {
                timeout: 30000, // 30 second timeout
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // Update service availability
            this.updateServiceStatus('mcp', true);
            return response.data;
        }
        catch (error) {
            this.updateServiceStatus('mcp', false);
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`MCP service error: ${error.message}`);
            }
            throw new Error(`Failed to execute MCP service: ${error}`);
        }
    }
    async executeFAQBatch(dakRepository, questions) {
        try {
            const response = await axios_1.default.post(`${this.mcpServiceUrl}/api/faq/batch`, {
                dakRepository,
                questions,
            }, {
                timeout: 60000, // 60 second timeout for batch operations
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // Update service availability
            this.updateServiceStatus('faq', true);
            return response.data.results || [];
        }
        catch (error) {
            this.updateServiceStatus('faq', false);
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`FAQ service error: ${error.message}`);
            }
            throw new Error(`Failed to execute FAQ batch: ${error}`);
        }
    }
    async getServiceStatus() {
        // Check MCP service availability
        const mcpStatus = await this.checkServiceAvailability(`${this.mcpServiceUrl}/health`);
        this.updateServiceStatus('mcp', mcpStatus);
        // FAQ service is part of MCP service, so same check applies
        const faqStatus = await this.checkServiceAvailability(`${this.mcpServiceUrl}/health`);
        this.updateServiceStatus('faq', faqStatus);
        const mcpServiceStatus = this.lastServiceCheck.get('mcp') || { available: false, lastChecked: '' };
        const faqServiceStatus = this.lastServiceCheck.get('faq') || { available: false, lastChecked: '' };
        return {
            mcpService: {
                available: mcpServiceStatus.available,
                url: this.mcpServiceUrl,
                lastChecked: mcpServiceStatus.lastChecked,
            },
            faqService: {
                available: faqServiceStatus.available,
                url: this.mcpServiceUrl,
                lastChecked: faqServiceStatus.lastChecked,
            },
        };
    }
    async checkServiceAvailability(url) {
        try {
            const response = await axios_1.default.get(url, {
                timeout: 5000,
            });
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    }
    updateServiceStatus(service, available) {
        this.lastServiceCheck.set(service, {
            available,
            lastChecked: new Date().toISOString(),
        });
    }
    // Utility method for direct FAQ question processing
    async processSingleFAQQuestion(dakRepository, questionId, parameters) {
        const results = await this.executeFAQBatch(dakRepository, [
            { questionId, parameters },
        ]);
        return results[0] || null;
    }
    // Utility method for getting DAK metadata via FAQ service
    async getDAKMetadata(dakRepository) {
        const metadataQuestions = [
            { questionId: 'dak-name' },
            { questionId: 'dak-version' },
            { questionId: 'dak-description' },
            { questionId: 'dak-components' },
            { questionId: 'business-processes' },
            { questionId: 'decision-logic' },
        ];
        try {
            const results = await this.executeFAQBatch(dakRepository, metadataQuestions);
            // Transform results into structured metadata
            const metadata = {};
            for (let i = 0; i < metadataQuestions.length; i++) {
                const questionId = metadataQuestions[i].questionId;
                metadata[questionId.replace('-', '_')] = results[i]?.answer || '';
            }
            return metadata;
        }
        catch (error) {
            console.warn('Failed to get DAK metadata:', error);
            return {};
        }
    }
}
exports.IntegrationService = IntegrationService;
//# sourceMappingURL=integrationService.js.map