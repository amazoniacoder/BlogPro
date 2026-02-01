import { Router } from 'express';
import { footerService } from '../services/footerService.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { z } from 'zod';

const router = Router();

const FooterConfigSchema = z.object({
  version: z.number().min(1),
  isActive: z.boolean(),
  layout: z.object({
    type: z.enum(['grid', 'flex', 'columns']),
    columns: z.number().min(1).max(6),
    gap: z.string(),
    maxWidth: z.string()
  }),
  blocks: z.array(z.object({
    id: z.string(),
    type: z.enum(['brand', 'links', 'contact', 'social', 'newsletter', 'custom']),
    position: z.object({ x: z.number(), y: z.number() }),
    size: z.object({ width: z.string(), height: z.string() }),
    content: z.record(z.any()),
    styles: z.record(z.any())
  })),
  styles: z.object({
    theme: z.enum(['light', 'dark', 'custom']),
    backgroundColor: z.string(),
    textColor: z.string(),
    linkColor: z.string(),
    borderColor: z.string(),
    padding: z.string(),
    margin: z.string()
  }),
  responsive: z.object({
    mobile: z.record(z.any()),
    tablet: z.record(z.any())
  }),
  visibility: z.object({
    showOnScroll: z.boolean(),
    hideOnPages: z.array(z.string()),
    showOnlyOnPages: z.array(z.string())
  })
});

// Получить активную конфигурацию футера
router.get('/config', async (_req, res) => {
  try {
    const config = await footerService.getActiveConfig();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Active footer configuration not found'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting active footer config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get footer configuration'
    });
  }
});

// Получить все конфигурации (только для админов)
router.get('/configs', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const configs = await footerService.getAllConfigs();
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Error getting footer configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get footer configurations'
    });
  }
});

// Создать новую конфигурацию
router.post('/config', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validatedData = FooterConfigSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const newConfig = await footerService.createConfig(validatedData, userId);
    
    res.status(201).json({
      success: true,
      data: newConfig,
      message: 'Footer configuration created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Error creating footer config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create footer configuration'
    });
  }
});

// Обновить конфигурацию
router.put('/config/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const configId = parseInt(req.params.id);
    const validatedData = FooterConfigSchema.partial().parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (isNaN(configId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration ID'
      });
    }

    const updatedConfig = await footerService.updateConfig(configId, validatedData, userId);
    
    res.json({
      success: true,
      data: updatedConfig,
      message: 'Footer configuration updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Error updating footer config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update footer configuration'
    });
  }
});

// Удалить конфигурацию
router.delete('/config/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const configId = parseInt(req.params.id);

    if (isNaN(configId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration ID'
      });
    }

    await footerService.deleteConfig(configId);
    
    res.json({
      success: true,
      message: 'Footer configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting footer config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete footer configuration'
    });
  }
});

// Активировать конфигурацию
router.post('/activate/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const configId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (isNaN(configId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration ID'
      });
    }

    const activatedConfig = await footerService.activateConfig(configId, userId);
    
    res.json({
      success: true,
      data: activatedConfig,
      message: 'Footer configuration activated successfully'
    });
  } catch (error) {
    console.error('Error activating footer config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate footer configuration'
    });
  }
});

// Получить историю изменений
router.get('/history/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const configId = parseInt(req.params.id);

    if (isNaN(configId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration ID'
      });
    }

    const history = await footerService.getHistory(configId);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting footer history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get footer configuration history'
    });
  }
});

// Предварительный просмотр
router.post('/preview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validatedData = FooterConfigSchema.parse(req.body);
    
    res.json({
      success: true,
      data: validatedData,
      message: 'Preview configuration validated'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Error validating preview config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate preview configuration'
    });
  }
});

export default router;