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
export declare class PublicationService {
    private templateService;
    private variableService;
    private contentService;
    private publications;
    constructor();
    generatePublication(config: PublicationConfig): Promise<Publication>;
    private renderTemplate;
    private renderDocBook;
    private htmlToDocBook;
    private renderEPUB;
    private addStyling;
    getPublication(id: string): Promise<Publication | null>;
    updatePublication(id: string, updates: Partial<Publication>): Promise<Publication | null>;
    listPublications(): Promise<Publication[]>;
    deletePublication(id: string): Promise<boolean>;
}
//# sourceMappingURL=publicationService.d.ts.map