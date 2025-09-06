import { Router, Request, Response } from 'express';
import { TemplateService } from '../services/templateService';

const router = Router();
const templateService = new TemplateService();

// GET /api/templates - List all templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const templates = await templateService.listTemplates();
    res.json({
      success: true,
      data: templates,
      total: templates.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve templates',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/templates/:id - Get specific template
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const template = await templateService.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
        message: `Template with ID '${req.params.id}' does not exist`,
      });
    }
    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve template',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/templates - Create new template
router.post('/', async (req: Request, res: Response) => {
  try {
    const template = await templateService.createTemplate(req.body);
    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create template',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /api/templates/:id - Update template
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const template = await templateService.updateTemplate(req.params.id, req.body);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
        message: `Template with ID '${req.params.id}' does not exist`,
      });
    }
    res.json({
      success: true,
      data: template,
      message: 'Template updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update template',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/templates/:id - Delete template
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await templateService.deleteTemplate(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
        message: `Template with ID '${req.params.id}' does not exist`,
      });
    }
    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete template',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as templateRoutes };