import { Router } from 'express';
import { db } from '../../db/db';
import { settings } from '../../../shared/types/schema';
import { requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Get public settings (no auth required)
router.get('/', async (_req, res) => {
  try {
    const allSettings = await db.select().from(settings);
    const settingsObj = allSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {} as Record<string, string>);
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get all settings (admin only)
router.get('/admin', requireAdmin, async (_req, res) => {
  try {
    const allSettings = await db.select().from(settings);
    const settingsObj = allSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {} as Record<string, string>);
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.post('/', requireAdmin, async (req, res) => {
  try {
    const settingsData = req.body;
    
    for (const [key, value] of Object.entries(settingsData)) {
      await db.insert(settings)
        .values({ key, value: String(value) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: String(value), updatedAt: new Date() }
        });
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;