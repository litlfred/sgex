import { Router, Request, Response } from 'express';
import { PublicationService } from '../services/publicationService';

const router = Router();
const publicationService = new PublicationService();

// POST /api/publication/generate - Generate publication
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const publication = await publicationService.generatePublication(req.body);
    res.json({
      success: true,
      data: publication,
      message: 'Publication generated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to generate publication',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/publication/:id - Get publication by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const publication = await publicationService.getPublication(req.params.id);
    if (!publication) {
      return res.status(404).json({
        success: false,
        error: 'Publication not found',
        message: `Publication with ID '${req.params.id}' does not exist`,
      });
    }
    res.json({
      success: true,
      data: publication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve publication',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /api/publication/:id - Update publication
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const publication = await publicationService.updatePublication(req.params.id, req.body);
    if (!publication) {
      return res.status(404).json({
        success: false,
        error: 'Publication not found',
        message: `Publication with ID '${req.params.id}' does not exist`,
      });
    }
    res.json({
      success: true,
      data: publication,
      message: 'Publication updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update publication',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as publicationRoutes };