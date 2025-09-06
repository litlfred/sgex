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
  template: string; // HTML template with variable placeholders
  variables: string[]; // List of variable names used in this section
  userEditable?: string[]; // List of user-editable variables
  required?: boolean;
  order?: number;
}

export interface TemplateVariable {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'rich_text' | 'date';
  default?: any;
  source?: string; // e.g., 'faq:dak-name', 'mcp:generate-summary', 'user:custom'
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