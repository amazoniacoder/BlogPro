import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import * as paymentController from './controller';

const router = Router();

router.post('/create-intent', requireAuth, paymentController.createPaymentIntent);
router.post('/confirm', requireAuth, paymentController.confirmPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/methods', paymentController.getPaymentMethods);

export default router;