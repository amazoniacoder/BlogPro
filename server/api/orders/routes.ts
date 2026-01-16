import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import * as orderController from './controller';

const router = Router();

router.get('/', requireAuth, orderController.getUserOrders);
router.get('/:id', requireAuth, orderController.getOrder);
router.post('/create', requireAuth, orderController.createOrder);
router.put('/:id/status', requireAuth, orderController.updateOrderStatus);
router.get('/:id/track', orderController.trackOrder);

export default router;