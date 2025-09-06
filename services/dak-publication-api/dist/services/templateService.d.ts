import { Template } from '../types/template';
export declare class TemplateService {
    private templates;
    constructor();
    private initializeDefaultTemplates;
    listTemplates(): Promise<Template[]>;
    getTemplate(id: string): Promise<Template | null>;
    createTemplate(templateData: Omit<Template, 'id' | 'metadata'>): Promise<Template>;
    updateTemplate(id: string, templateData: Partial<Template>): Promise<Template | null>;
    deleteTemplate(id: string): Promise<boolean>;
}
//# sourceMappingURL=templateService.d.ts.map