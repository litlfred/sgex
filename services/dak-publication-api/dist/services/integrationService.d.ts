export interface MCPExecutionRequest {
    operation: string;
    context: Record<string, any>;
}
export interface FAQQuestion {
    questionId: string;
    parameters?: Record<string, any>;
}
export interface ServiceStatus {
    mcpService: {
        available: boolean;
        url: string;
        lastChecked: string;
    };
    faqService: {
        available: boolean;
        url: string;
        lastChecked: string;
    };
}
export declare class IntegrationService {
    private mcpServiceUrl;
    private lastServiceCheck;
    constructor();
    executeMCPService(request: MCPExecutionRequest): Promise<any>;
    executeFAQBatch(dakRepository: string, questions: FAQQuestion[]): Promise<any[]>;
    getServiceStatus(): Promise<ServiceStatus>;
    private checkServiceAvailability;
    private updateServiceStatus;
    processSingleFAQQuestion(dakRepository: string, questionId: string, parameters?: Record<string, any>): Promise<any>;
    getDAKMetadata(dakRepository: string): Promise<any>;
}
//# sourceMappingURL=integrationService.d.ts.map