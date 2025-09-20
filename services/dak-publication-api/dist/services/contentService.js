"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
class ContentService {
    constructor() {
        this.userContent = new Map();
    }
    async getUserContent(userId) {
        return this.userContent.get(userId) || null;
    }
    async updateUserContent(userId, contentData) {
        const existing = this.userContent.get(userId);
        const updated = {
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
    async autoSaveContent(userId, contentKey, content) {
        const existing = this.userContent.get(userId);
        if (!existing) {
            // Create new user content record
            await this.updateUserContent(userId, {
                content: { [contentKey]: content },
            });
        }
        else {
            // Update existing content
            existing.content[contentKey] = content;
            existing.lastModified = new Date().toISOString();
            this.userContent.set(userId, existing);
        }
    }
    async deleteUserContent(userId) {
        return this.userContent.delete(userId);
    }
    async listUserContent() {
        return Array.from(this.userContent.values());
    }
}
exports.ContentService = ContentService;
//# sourceMappingURL=contentService.js.map