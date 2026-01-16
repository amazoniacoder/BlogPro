import { Router } from 'express';
import { downloadProduct, getDownloadStatus } from './controller';

const router = Router();

// Download product by token
router.get('/:token', downloadProduct);

// Get download status
router.get('/:token/status', getDownloadStatus);

export default router;