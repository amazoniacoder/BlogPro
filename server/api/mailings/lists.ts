import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// GET /api/mailings/lists - List all mailing lists
router.get('/', requireAdmin, async (_req, res) => {
  // Placeholder response since mailingLists table doesn't exist
  const lists: any[] = [];
  res.json(lists);
});

// POST /api/mailings/lists - Create mailing list
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description, status, templateId } = req.body;
    console.log('Creating mailing list with data:', { name, description, status, templateId });
    
    // Placeholder response since mailingLists table doesn't exist
    const list = {
      id: Date.now(),
      name: name?.trim(),
      description: description?.trim() || null,
      status: status || 'draft',
      templateId: templateId && templateId !== '' ? parseInt(templateId) : null,
      createdAt: new Date()
    };
      
    console.log('Created list:', list);
    res.status(201).json(list);
  } catch (error) {
    console.error('Error creating mailing list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    res.status(500).json({ error: 'Failed to create mailing list', details: errorMessage });
  }
});

// PUT /api/mailings/lists/:id - Update mailing list
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, status, templateId } = req.body;
    // Placeholder response since mailingLists table doesn't exist
    const list = {
      id: parseInt(req.params.id),
      name, 
      description, 
      status,
      templateId: templateId || null,
      updatedAt: new Date()
    };
    res.json(list);
  } catch (error) {
    console.error('Error updating mailing list:', error);
    res.status(500).json({ error: 'Failed to update mailing list' });
  }
});



// GET /api/mailings/lists/:id/recipients - Get list recipients
router.get('/:id/recipients', requireAdmin, async (_, res) => {
  try {
    // Placeholder response since mailingListRecipients table doesn't exist
    const recipients: any[] = [];
    res.json(recipients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipients' });
  }
});

// POST /api/mailings/lists/:id/recipients - Add recipients to mailing list
router.post('/:id/recipients', requireAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    // Placeholder response since mailingListRecipients table doesn't exist
    const recipients = userIds?.length > 0 ? userIds.map((userId: string) => ({
      id: Date.now(),
      mailingListId: parseInt(req.params.id),
      userId
    })) : [];
    
    res.status(201).json(recipients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add recipients' });
  }
});

// DELETE /api/mailings/lists/:id/recipients/:userId - Remove recipient
router.delete('/:id/recipients/:userId', requireAdmin, async (req, res) => {
  try {
    // Placeholder logic since mailingListRecipients table doesn't exist
    console.log('Remove recipient:', req.params.userId, 'from list:', req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove recipient' });
  }
});

export default router;