import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';
import { MailingService } from '../../services/mailingService';

const router = Router();
const mailingService = new MailingService();

// GET /api/mailings/campaigns - List all campaigns
router.get('/', requireAdmin, async (_req, res) => {
  // Placeholder response since mailingCampaigns table doesn't exist
  const campaigns: any[] = [];
  res.json(campaigns);
});

// POST /api/mailings/campaigns/send - Send campaign
router.post('/send', requireAdmin, async (req, res) => {
  try {
    const { mailingListId } = req.body;
    
    if (!mailingListId) {
      return res.status(400).json({ error: 'Mailing list ID is required' });
    }
    
    await mailingService.sendMailing(mailingListId);
    res.json({ message: 'Campaign sent successfully' });
  } catch (error) {
    console.error('Error sending campaign:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to send campaign', details: errorMessage });
  }
});

// POST /api/mailings/campaigns - Create campaign
router.post('/', requireAdmin, async (req, res) => {
  const { mailingListId } = req.body;
  // Placeholder response since mailingCampaigns table doesn't exist
  const campaign = { id: Date.now(), mailingListId, createdAt: new Date() };
  res.status(201).json(campaign);
});

export default router;