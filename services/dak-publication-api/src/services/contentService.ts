export interface UserContent {
  userId: string;
  templateId: string;
  content: Record<string, any>;
  lastModified: string;
  autoSaveEnabled: boolean;
}

export class ContentService {
  private userContent: Map<string, UserContent> = new Map();

  async getUserContent(userId: string): Promise<UserContent | null> {
    return this.userContent.get(userId) || null;
  }

  async updateUserContent(userId: string, contentData: Partial<UserContent>): Promise<UserContent> {
    const existing = this.userContent.get(userId);
    
    const updated: UserContent = {
      userId,
      templateId: contentData.templateId || 'who-dak-standard-v1',
      content: contentData.content || {},
      lastModified: new Date().toISOString(),
      autoSaveEnabled: contentData.autoSaveEnabled ?? true,
      ...existing,
      ...contentData,
    };

    this.userContent.set(userId, updated);
    return updated;
  }

  async autoSaveContent(userId: string, contentKey: string, content: any): Promise<void> {
    const existing = this.userContent.get(userId);
    
    if (!existing) {
      // Create new user content record
      await this.updateUserContent(userId, {
        content: { [contentKey]: content },
      });
    } else {
      // Update existing content
      existing.content[contentKey] = content;
      existing.lastModified = new Date().toISOString();
      this.userContent.set(userId, existing);
    }
  }

  async deleteUserContent(userId: string): Promise<boolean> {
    return this.userContent.delete(userId);
  }

  async listUserContent(): Promise<UserContent[]> {
    return Array.from(this.userContent.values());
  }
}