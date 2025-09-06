import axios from 'axios';

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

export class IntegrationService {
  private mcpServiceUrl: string;
  private lastServiceCheck: Map<string, { available: boolean; lastChecked: string }> = new Map();

  constructor() {
    this.mcpServiceUrl = process.env.MCP_SERVICE_URL || 'http://localhost:3001';
  }

  async executeMCPService(request: MCPExecutionRequest): Promise<any> {
    try {
      const response = await axios.post(`${this.mcpServiceUrl}/api/mcp/execute`, {
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
    } catch (error) {
      this.updateServiceStatus('mcp', false);
      
      if (axios.isAxiosError(error)) {
        throw new Error(`MCP service error: ${error.message}`);
      }
      throw new Error(`Failed to execute MCP service: ${error}`);
    }
  }

  async executeFAQBatch(dakRepository: string, questions: FAQQuestion[]): Promise<any[]> {
    try {
      const response = await axios.post(`${this.mcpServiceUrl}/api/faq/batch`, {
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
    } catch (error) {
      this.updateServiceStatus('faq', false);
      
      if (axios.isAxiosError(error)) {
        throw new Error(`FAQ service error: ${error.message}`);
      }
      throw new Error(`Failed to execute FAQ batch: ${error}`);
    }
  }

  async getServiceStatus(): Promise<ServiceStatus> {
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

  private async checkServiceAvailability(url: string): Promise<boolean> {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private updateServiceStatus(service: string, available: boolean): void {
    this.lastServiceCheck.set(service, {
      available,
      lastChecked: new Date().toISOString(),
    });
  }

  // Utility method for direct FAQ question processing
  async processSingleFAQQuestion(dakRepository: string, questionId: string, parameters?: Record<string, any>): Promise<any> {
    const results = await this.executeFAQBatch(dakRepository, [
      { questionId, parameters },
    ]);

    return results[0] || null;
  }

  // Utility method for getting DAK metadata via FAQ service
  async getDAKMetadata(dakRepository: string): Promise<any> {
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
      const metadata: Record<string, any> = {};
      for (let i = 0; i < metadataQuestions.length; i++) {
        const questionId = metadataQuestions[i].questionId;
        metadata[questionId.replace('-', '_')] = results[i]?.answer || '';
      }

      return metadata;
    } catch (error) {
      console.warn('Failed to get DAK metadata:', error);
      return {};
    }
  }
}