import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// GET /api/mailings/templates - List all templates
router.get('/', requireAdmin, async (_req, res) => {
  // Placeholder response since emailTemplates table doesn't exist
  const templates: any[] = [];
  res.json(templates);
});

// POST /api/mailings/templates - Create template
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, subject, content } = req.body;
    console.log('Creating template with data:', { name, subject, content });
    
    const insertData = {
      name: name?.trim(),
      subject: subject?.trim(),
      content: content?.trim()
    };
    
    console.log('Insert data:', insertData);
    
    // Placeholder response since emailTemplates table doesn't exist
    const template = {
      id: Date.now(),
      ...insertData,
      createdAt: new Date()
    };
      
    console.log('Created template:', template);
    
    // Broadcast template creation via WebSocket
    const wss = (global as any).wss;
    if (wss && wss.clients) {
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'template_created',
            data: template
          }));
        }
      });
    }
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    res.status(500).json({ error: 'Failed to create template', details: errorMessage });
  }
});

// PUT /api/mailings/templates/:id - Update template
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, subject, content } = req.body;
    console.log('Updating template with data:', { name, subject, content });
    
    // Placeholder response since emailTemplates table doesn't exist
    const template = {
      id: parseInt(req.params.id),
      name: name?.trim(), 
      subject: subject?.trim(), 
      content: content?.trim(),
      updatedAt: new Date()
    };
      
    console.log('Updated template:', template);
    
    // Broadcast template update via WebSocket
    const wss = (global as any).wss;
    if (wss && wss.clients) {
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'template_updated',
            data: template
          }));
        }
      });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    res.status(500).json({ error: 'Failed to update template', details: errorMessage });
  }
});

// DELETE /api/mailings/templates/:id - Delete template
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    
    // Placeholder logic since emailTemplates table doesn't exist
    console.log('Delete template:', templateId);
    
    // Broadcast template deletion via WebSocket
    const wss = (global as any).wss;
    if (wss && wss.clients) {
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'template_deleted',
            data: { id: templateId }
          }));
        }
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to delete template', details: errorMessage });
  }
});

export default router;
