import { Router } from 'express';
import * as cartController from './controller';

const router = Router();

// Temporarily remove auth requirement for cart endpoints during development
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update/:itemId', cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

export default router;