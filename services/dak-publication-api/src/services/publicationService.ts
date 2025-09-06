import { TemplateService } from './templateService';
import { VariableService } from './variableService';
import { ContentService } from './contentService';

export interface PublicationConfig {
  templateId: string;
  dakRepository: string;
  userContent?: Record<string, any>;
  options?: {
    format?: 'html' | 'pdf' | 'markdown';
    includeAssets?: boolean;
  };
}

export interface Publication {
  id: string;
  templateId: string;
  dakRepository: string;
  content: string;
  format: string;
  generatedAt: string;
  metadata: {
    templateVersion: string;
    variablesResolved: number;
    userCustomizations: number;
  };
}

export class PublicationService {
  private templateService: TemplateService;
  private variableService: VariableService;
  private contentService: ContentService;
  private publications: Map<string, Publication> = new Map();

  constructor() {
    this.templateService = new TemplateService();
    this.variableService = new VariableService();
    this.contentService = new ContentService();
  }

  async generatePublication(config: PublicationConfig): Promise<Publication> {
    // Get template
    const template = await this.templateService.getTemplate(config.templateId);
    if (!template) {
      throw new Error(`Template not found: ${config.templateId}`);
    }

    // Resolve variables
    const resolvedVariables = await this.variableService.resolveVariables({
      templateId: config.templateId,
      dakRepository: config.dakRepository,
      serviceIntegration: {
        useFAQ: true,
        useMCP: true,
      },
      userContent: config.userContent,
    });

    // Generate content
    const content = await this.renderTemplate(template, resolvedVariables);

    // Create publication record
    const publication: Publication = {
      id: `pub-${Date.now()}`,
      templateId: config.templateId,
      dakRepository: config.dakRepository,
      content,
      format: config.options?.format || 'html',
      generatedAt: new Date().toISOString(),
      metadata: {
        templateVersion: template.version || '1.0.0',
        variablesResolved: Object.keys(resolvedVariables).length,
        userCustomizations: config.userContent ? Object.keys(config.userContent).length : 0,
      },
    };

    this.publications.set(publication.id, publication);
    return publication;
  }

  private async renderTemplate(template: any, variables: Record<string, any>): Promise<string> {
    let content = '<div class="dak-publication">';

    // Render each section
    for (const section of template.sections) {
      content += `<section id="${section.id}" class="${section.id}">`;
      
      // Simple variable substitution (in a real implementation, use a proper template engine)
      let sectionContent = section.template;
      
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        sectionContent = sectionContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
      }

      content += sectionContent;
      content += '</section>';
    }

    content += '</div>';

    // Add CSS styling
    content = this.addStyling(content);

    return content;
  }

  private addStyling(content: string): string {
    const css = `
    <style>
      .dak-publication {
        max-width: 800px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .title-page {
        text-align: center;
        padding: 40px 0;
        border-bottom: 2px solid #0078d4;
        margin-bottom: 30px;
      }
      .title-page h1 {
        color: #0078d4;
        font-size: 2.5em;
        margin-bottom: 10px;
      }
      .title-page h2 {
        color: #666;
        font-size: 1.5em;
        font-weight: normal;
        margin-bottom: 30px;
      }
      .metadata {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 5px;
        display: inline-block;
        text-align: left;
      }
      .preface, .dak-components, .copyright {
        margin: 30px 0;
        padding: 20px 0;
      }
      .component {
        border-left: 4px solid #0078d4;
        padding-left: 20px;
        margin: 20px 0;
      }
      .user-content {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
        min-height: 50px;
      }
      .assets ul {
        list-style-type: disc;
        margin-left: 20px;
      }
      .copyright {
        border-top: 1px solid #ccc;
        padding-top: 20px;
        color: #666;
        font-size: 0.9em;
      }
    </style>
    `;
    
    return css + content;
  }

  async getPublication(id: string): Promise<Publication | null> {
    return this.publications.get(id) || null;
  }

  async updatePublication(id: string, updates: Partial<Publication>): Promise<Publication | null> {
    const existing = this.publications.get(id);
    if (!existing) {
      return null;
    }

    const updated: Publication = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
    };

    this.publications.set(id, updated);
    return updated;
  }

  async listPublications(): Promise<Publication[]> {
    return Array.from(this.publications.values());
  }

  async deletePublication(id: string): Promise<boolean> {
    return this.publications.delete(id);
  }
}