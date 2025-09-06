import { TemplateService } from './templateService';
import { VariableService } from './variableService';
import { ContentService } from './contentService';

export interface PublicationConfig {
  templateId: string;
  dakRepository: string;
  userContent?: Record<string, any>;
  options?: {
    format?: 'html' | 'pdf' | 'markdown' | 'docbook' | 'epub';
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
    const format = variables['publication.format'] || 'html';
    
    if (format === 'docbook') {
      return this.renderDocBook(template, variables);
    } else if (format === 'epub') {
      return this.renderEPUB(template, variables);
    }
    
    // Default HTML rendering
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

    // Add CSS styling for HTML
    content = this.addStyling(content);

    return content;
  }

  private renderDocBook(template: any, variables: Record<string, any>): string {
    let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
    content += '<!DOCTYPE book PUBLIC "-//OASIS//DTD DocBook XML V4.5//EN"\n';
    content += '  "http://www.oasis-open.org/docbook/xml/4.5/docbookx.dtd">\n';
    content += '<book xmlns="http://docbook.org/ns/docbook" version="5.0">\n';
    
    // Book metadata
    content += '  <info>\n';
    content += `    <title>${variables['publication.title'] || 'DAK Publication'}</title>\n`;
    content += `    <author><personname>${variables['publication.author'] || 'World Health Organization'}</personname></author>\n`;
    content += `    <date>${variables['publication.date'] || new Date().toISOString().split('T')[0]}</date>\n`;
    content += `    <abstract><para>${variables['publication.description'] || 'WHO SMART Guidelines Digital Adaptation Kit'}</para></abstract>\n`;
    content += '  </info>\n\n';

    // Render each section as chapters
    for (const section of template.sections) {
      content += `  <chapter xml:id="${section.id}">\n`;
      content += `    <title>${section.name || section.id}</title>\n`;
      
      // Convert HTML template to DocBook XML
      let sectionContent = this.htmlToDocBook(section.template);
      
      // Variable substitution
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        sectionContent = sectionContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
      }

      content += sectionContent;
      content += '  </chapter>\n\n';
    }
    
    content += '</book>';
    return content;
  }

  private htmlToDocBook(htmlContent: string): string {
    // Convert common HTML elements to DocBook equivalents
    let docBookContent = htmlContent
      .replace(/<h1>/g, '<title>')
      .replace(/<\/h1>/g, '</title>')
      .replace(/<h2>/g, '<subtitle>')
      .replace(/<\/h2>/g, '</subtitle>')
      .replace(/<p>/g, '    <para>')
      .replace(/<\/p>/g, '</para>')
      .replace(/<ul>/g, '    <itemizedlist>')
      .replace(/<\/ul>/g, '    </itemizedlist>')
      .replace(/<li>/g, '      <listitem><para>')
      .replace(/<\/li>/g, '</para></listitem>')
      .replace(/<strong>/g, '<emphasis role="bold">')
      .replace(/<\/strong>/g, '</emphasis>')
      .replace(/<em>/g, '<emphasis>')
      .replace(/<\/em>/g, '</emphasis>')
      .replace(/<code>/g, '<code>')
      .replace(/<\/code>/g, '</code>')
      .replace(/<div[^>]*>/g, '')
      .replace(/<\/div>/g, '');

    return docBookContent;
  }

  private renderEPUB(template: any, variables: Record<string, any>): string {
    // EPUB is essentially a ZIP file with XHTML content
    // For this proof-of-concept, we'll generate the main content.opf and XHTML
    
    let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
    content += '<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">\n';
    
    // Metadata
    content += '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n';
    content += `    <dc:title>${variables['publication.title'] || 'DAK Publication'}</dc:title>\n`;
    content += `    <dc:creator>${variables['publication.author'] || 'World Health Organization'}</dc:creator>\n`;
    content += `    <dc:identifier id="BookId">${variables['publication.id'] || 'dak-pub-' + Date.now()}</dc:identifier>\n`;
    content += `    <dc:language>en</dc:language>\n`;
    content += `    <dc:date>${variables['publication.date'] || new Date().toISOString().split('T')[0]}</dc:date>\n`;
    content += '    <meta property="dcterms:modified">' + new Date().toISOString() + '</meta>\n';
    content += '  </metadata>\n\n';
    
    // Manifest
    content += '  <manifest>\n';
    content += '    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n';
    content += '    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>\n';
    content += '  </manifest>\n\n';
    
    // Spine
    content += '  <spine>\n';
    content += '    <itemref idref="content"/>\n';
    content += '  </spine>\n';
    
    content += '</package>\n\n';
    
    // Add XHTML content
    content += '<!-- XHTML Content (content.xhtml) -->\n';
    content += '<?xml version="1.0" encoding="UTF-8"?>\n';
    content += '<html xmlns="http://www.w3.org/1999/xhtml">\n';
    content += '<head>\n';
    content += `  <title>${variables['publication.title'] || 'DAK Publication'}</title>\n`;
    content += '</head>\n';
    content += '<body>\n';
    
    // Render sections as XHTML
    for (const section of template.sections) {
      content += `  <section id="${section.id}">\n`;
      
      let sectionContent = section.template;
      
      // Variable substitution
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        sectionContent = sectionContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
      }

      content += sectionContent;
      content += '  </section>\n';
    }
    
    content += '</body>\n';
    content += '</html>';
    
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