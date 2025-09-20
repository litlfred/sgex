"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
class TemplateService {
    constructor() {
        this.templates = new Map();
        // Initialize with default WHO DAK template
        this.initializeDefaultTemplates();
    }
    initializeDefaultTemplates() {
        const whoDAKTemplate = {
            id: 'who-dak-standard-v1',
            name: 'WHO DAK Standard Template',
            description: 'Standard WHO SMART Guidelines Digital Adaptation Kit publication template',
            version: '1.0.0',
            sections: [
                {
                    id: 'title-page',
                    name: 'Title Page',
                    template: `
            <div class="title-page">
              <h1>{{publication.title}}</h1>
              <h2>{{publication.subtitle}}</h2>
              <div class="metadata">
                <p><strong>Version:</strong> {{dak.version}}</p>
                <p><strong>Generated:</strong> {{current.date}}</p>
                <p><strong>Repository:</strong> {{dak.repository}}</p>
              </div>
            </div>
          `,
                    variables: ['publication.title', 'publication.subtitle', 'dak.version', 'current.date', 'dak.repository'],
                    userEditable: ['publication.title', 'publication.subtitle'],
                },
                {
                    id: 'preface',
                    name: 'Preface',
                    template: `
            <div class="preface">
              <h2>Preface</h2>
              <div class="user-content">{{user.preface}}</div>
              <div class="generated-summary">
                <h3>DAK Overview</h3>
                <p>{{dak.description}}</p>
                <p><strong>Business Processes:</strong> {{dak.businessProcesses.count}} workflows</p>
                <p><strong>Decision Logic:</strong> {{dak.decisionLogic.count}} decision tables</p>
              </div>
            </div>
          `,
                    variables: ['user.preface', 'dak.description', 'dak.businessProcesses.count', 'dak.decisionLogic.count'],
                    userEditable: ['user.preface'],
                },
                {
                    id: 'components',
                    name: 'DAK Components',
                    template: `
            <div class="dak-components">
              <h2>Digital Adaptation Kit Components</h2>
              {{#each components}}
              <div class="component">
                <h3>{{this.name}}</h3>
                <p>{{this.description}}</p>
                <div class="user-content">{{this.userSummary}}</div>
                <div class="assets">
                  <h4>Assets ({{this.assets.length}})</h4>
                  <ul>
                    {{#each this.assets}}
                    <li>{{this.name}} - {{this.description}}</li>
                    {{/each}}
                  </ul>
                </div>
              </div>
              {{/each}}
            </div>
          `,
                    variables: ['components'],
                    userEditable: ['components.*.userSummary'],
                },
                {
                    id: 'copyright',
                    name: 'Copyright Notice',
                    template: `
            <div class="copyright">
              <h2>Copyright Notice</h2>
              <div class="user-content">{{user.copyright}}</div>
              <div class="default-notice">
                <p>© {{current.year}} World Health Organization</p>
                <p>This work is licensed under a Creative Commons Attribution 4.0 International License.</p>
              </div>
            </div>
          `,
                    variables: ['user.copyright', 'current.year'],
                    userEditable: ['user.copyright'],
                },
            ],
            variables: {
                'publication.title': { type: 'string', default: '${dak.name} - Digital Adaptation Kit', userEditable: true },
                'publication.subtitle': { type: 'string', default: 'WHO SMART Guidelines Implementation Guide', userEditable: true },
                'user.preface': { type: 'rich_text', default: '', userEditable: true },
                'user.copyright': { type: 'rich_text', default: '', userEditable: true },
                'dak.name': { type: 'string', source: 'faq:dak-name' },
                'dak.version': { type: 'string', source: 'faq:dak-version' },
                'dak.description': { type: 'string', source: 'faq:dak-description' },
                'dak.repository': { type: 'string', source: 'context:repository' },
                'current.date': { type: 'string', source: 'system:current-date' },
                'current.year': { type: 'string', source: 'system:current-year' },
                'components': { type: 'array', source: 'faq:dak-components' },
            },
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: 'WHO SMART Guidelines Team',
            },
        };
        this.templates.set(whoDAKTemplate.id, whoDAKTemplate);
    }
    async listTemplates() {
        return Array.from(this.templates.values());
    }
    async getTemplate(id) {
        return this.templates.get(id) || null;
    }
    async createTemplate(templateData) {
        const id = `template-${Date.now()}`;
        const template = {
            ...templateData,
            id,
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: 'User',
            },
        };
        this.templates.set(id, template);
        return template;
    }
    async updateTemplate(id, templateData) {
        const existingTemplate = this.templates.get(id);
        if (!existingTemplate) {
            return null;
        }
        const updatedTemplate = {
            ...existingTemplate,
            ...templateData,
            id, // Ensure ID doesn't change
            metadata: {
                ...existingTemplate.metadata,
                updatedAt: new Date().toISOString(),
            },
        };
        this.templates.set(id, updatedTemplate);
        return updatedTemplate;
    }
    async deleteTemplate(id) {
        return this.templates.delete(id);
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=templateService.js.map