import { Router, Request, Response } from 'express';
import { generateCSRFToken } from '../middleware/security';
import { sendSuccessResponse } from '../utils/responseHelpers';

const router = Router();

// GET /api/csrf-token - Get CSRF token for the session
router.get('/csrf-token', generateCSRFToken, (req: Request, res: Response) => {
  const csrfToken = (req.session as any)?.csrfToken;
  
  if (!csrfToken) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate CSRF token'
    });
  }
  
  sendSuccessResponse(res, { csrfToken }, 'CSRF token generated successfully');
});

export default router;