import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../../middleware/authMiddleware';
import * as shopController from './controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', shopController.getDashboard);
router.get('/orders', shopController.getAllOrders);
router.get('/inventory', shopController.getInventory);
router.get('/payments', shopController.getPayments);
router.get('/customers', shopController.getCustomers);
router.put('/settings', shopController.updateSettings);

export default router;