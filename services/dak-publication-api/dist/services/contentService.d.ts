export interface UserContent {
    userId: string;
    templateId: string;
    content: Record<string, any>;
    lastModified: string;
    autoSaveEnabled: boolean;
}
export declare class ContentService {
    private userContent;
    getUserContent(userId: string): Promise<UserContent | null>;
    updateUserContent(userId: string, contentData: Partial<UserContent>): Promise<UserContent>;
    autoSaveContent(userId: string, contentKey: string, content: any): Promise<void>;
    deleteUserContent(userId: string): Promise<boolean>;
    listUserContent(): Promise<UserContent[]>;
}
//# sourceMappingURL=contentService.d.ts.map