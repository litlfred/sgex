export interface Template {
    id: string;
    name: string;
    description: string;
    version: string;
    sections: TemplateSection[];
    variables: Record<string, TemplateVariable>;
    metadata: TemplateMetadata;
}
export interface TemplateSection {
    id: string;
    name: string;
    template: string;
    variables: string[];
    userEditable?: string[];
    required?: boolean;
    order?: number;
}
export interface TemplateVariable {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'rich_text' | 'date';
    default?: any;
    source?: string;
    userEditable?: boolean;
    validation?: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        options?: string[];
    };
    description?: string;
}
export interface TemplateMetadata {
    createdAt: string;
    updatedAt: string;
    author: string;
    version?: string;
    tags?: string[];
    category?: string;
}
export interface TemplateRenderContext {
    template: Template;
    variables: Record<string, any>;
    userContent?: Record<string, any>;
    options?: {
        includeMetadata?: boolean;
        format?: 'html' | 'markdown' | 'pdf' | 'docbook' | 'epub';
    };
}
//# sourceMappingURL=template.d.ts.map