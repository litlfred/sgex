import axios from 'axios';
import { TemplateService } from './templateService';

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

export class VariableService {
  private templateService: TemplateService;
  private mcpServiceUrl: string;

  constructor() {
    this.templateService = new TemplateService();
    this.mcpServiceUrl = process.env.MCP_SERVICE_URL || 'http://localhost:3001';
  }

  async resolveVariables(request: VariableResolutionRequest): Promise<ResolvedVariables> {
    const template = await this.templateService.getTemplate(request.templateId);
    if (!template) {
      throw new Error(`Template not found: ${request.templateId}`);
    }

    const resolvedVariables: ResolvedVariables = {};

    // Process each variable defined in the template
    for (const [variableName, variableConfig] of Object.entries(template.variables)) {
      try {
        let value = variableConfig.default || '';

        // Resolve based on variable source
        switch (variableConfig.source?.split(':')[0]) {
          case 'faq':
            if (request.serviceIntegration?.useFAQ) {
              value = await this.resolveFromFAQ(request.dakRepository, variableConfig.source);
            }
            break;

          case 'mcp':
            if (request.serviceIntegration?.useMCP) {
              value = await this.resolveFromMCP(request.dakRepository, variableConfig.source);
            }
            break;

          case 'context':
            value = this.resolveFromContext(request, variableConfig.source);
            break;

          case 'system':
            value = this.resolveFromSystem(variableConfig.source);
            break;

          case 'user':
          default:
            // Use user content if available
            if (request.userContent && request.userContent[variableName]) {
              value = request.userContent[variableName];
            }
            break;
        }

        resolvedVariables[variableName] = value;
      } catch (error) {
        console.warn(`Failed to resolve variable ${variableName}:`, error);
        resolvedVariables[variableName] = variableConfig.default || '';
      }
    }

    return resolvedVariables;
  }

  private async resolveFromFAQ(dakRepository: string, source: string): Promise<any> {
    const questionId = source.split(':')[1];
    
    try {
      // Call the MCP service FAQ endpoint
      const response = await axios.post(`${this.mcpServiceUrl}/api/faq/process`, {
        questions: [{ questionId, dakRepository }],
      });

      return response.data.results?.[0]?.answer || '';
    } catch (error) {
      console.warn(`FAQ resolution failed for ${questionId}:`, error);
      return '';
    }
  }

  private async resolveFromMCP(dakRepository: string, source: string): Promise<any> {
    const operation = source.split(':')[1];
    
    try {
      // Call the MCP service for AI-driven content generation
      const response = await axios.post(`${this.mcpServiceUrl}/api/mcp/execute`, {
        operation,
        context: { dakRepository },
      });

      return response.data.result || '';
    } catch (error) {
      console.warn(`MCP resolution failed for ${operation}:`, error);
      return '';
    }
  }

  private resolveFromContext(request: VariableResolutionRequest, source: string): any {
    const contextKey = source.split(':')[1];
    
    switch (contextKey) {
      case 'repository':
        return request.dakRepository;
      default:
        return '';
    }
  }

  private resolveFromSystem(source: string): any {
    const systemKey = source.split(':')[1];
    
    switch (systemKey) {
      case 'current-date':
        return new Date().toISOString().split('T')[0];
      case 'current-year':
        return new Date().getFullYear().toString();
      case 'current-timestamp':
        return new Date().toISOString();
      default:
        return '';
    }
  }

  async getTemplateVariables(templateId: string): Promise<Record<string, any>> {
    const template = await this.templateService.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return template.variables;
  }

  async validateVariables(variables: Record<string, any>, schema?: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation - check for required variables
    const requiredVariables = ['publication.title', 'dak.repository'];
    
    for (const required of requiredVariables) {
      if (!variables[required] || variables[required].toString().trim() === '') {
        errors.push(`Required variable '${required}' is missing or empty`);
      }
    }

    // Type validation
    for (const [key, value] of Object.entries(variables)) {
      if (key.includes('.date') || key.includes('.timestamp')) {
        if (value && isNaN(Date.parse(value.toString()))) {
          errors.push(`Variable '${key}' must be a valid date`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}