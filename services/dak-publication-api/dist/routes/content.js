"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentRoutes = void 0;
const express_1 = require("express");
const contentService_1 = require("../services/contentService");
const router = (0, express_1.Router)();
exports.contentRoutes = router;
const contentService = new contentService_1.ContentService();
// GET /api/content/user/:userId - Get user content
router.get('/user/:userId', async (req, res) => {
    try {
        const content = await contentService.getUserContent(req.params.userId);
        res.json({
            success: true,
            data: content,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: 'User content not found',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// PUT /api/content/user/:userId - Update user content
router.put('/user/:userId', async (req, res) => {
    try {
        const content = await contentService.updateUserContent(req.params.userId, req.body);
        res.json({
            success: true,
            data: content,
            message: 'User content updated successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: 'Failed to update user content',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// POST /api/content/auto-save - Auto-save user content (WYSIWYG)
router.post('/auto-save', async (req, res) => {
    try {
        const { userId, contentKey, content } = req.body;
        await contentService.autoSaveContent(userId, contentKey, content);
        res.json({
            success: true,
            message: 'Content auto-saved successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: 'Failed to auto-save content',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
//# sourceMappingURL=content.js.map