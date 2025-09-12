import { Router, Request, Response } from 'express';
import { ContentService } from '../services/contentService';

const router = Router();
const contentService = new ContentService();

// GET /api/content/user/:userId - Get user content
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const content = await contentService.getUserContent(req.params.userId);
    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'User content not found',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /api/content/user/:userId - Update user content
router.put('/user/:userId', async (req: Request, res: Response) => {
  try {
    const content = await contentService.updateUserContent(req.params.userId, req.body);
    res.json({
      success: true,
      data: content,
      message: 'User content updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update user content',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/content/auto-save - Auto-save user content (WYSIWYG)
router.post('/auto-save', async (req: Request, res: Response) => {
  try {
    const { userId, contentKey, content } = req.body;
    await contentService.autoSaveContent(userId, contentKey, content);
    res.json({
      success: true,
      message: 'Content auto-saved successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to auto-save content',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as contentRoutes };