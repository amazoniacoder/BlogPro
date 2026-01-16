import { Router } from 'express';
import templatesRouter from './templates';
import listsRouter from './lists';
import campaignsRouter from './campaigns';

const router = Router();

// Test route
router.get('/test', (_req, res) => {
  res.json({ message: 'Mailings API is working' });
});

router.use('/templates', templatesRouter);
router.use('/lists', listsRouter);
router.use('/campaigns', campaignsRouter);

export default router;
