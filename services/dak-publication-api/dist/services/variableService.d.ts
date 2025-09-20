export interface VariableResolutionRequest {
    templateId: string;
    dakRepository: string;
    serviceIntegration?: {
        useFAQ?: boolean;
        useMCP?: boolean;
    };
    userContent?: Record<string, any>;
}
export interface ResolvedVariables {
    [key: string]: any;
}
export declare class VariableService {
    private templateService;
    private mcpServiceUrl;
    constructor();
    resolveVariables(request: VariableResolutionRequest): Promise<ResolvedVariables>;
    private resolveFromFAQ;
    private resolveFromMCP;
    private resolveFromContext;
    private resolveFromSystem;
    getTemplateVariables(templateId: string): Promise<Record<string, any>>;
    validateVariables(variables: Record<string, any>, schema?: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
//# sourceMappingURL=variableService.d.ts.map