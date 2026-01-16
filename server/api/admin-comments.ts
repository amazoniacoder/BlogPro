import { Router, Request, Response } from 'express';
import { requireAuth as authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { securityHeadersMiddleware } from '../middleware/security';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHelpers';
import { pool } from '../db/db';

const router = Router();

// Apply security middleware
router.use(securityHeadersMiddleware);

// GET /api/admin/comments - Get all comments for admin (direct database query)
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [limit, offset];
    
    if (status && status !== 'all') {
      whereClause += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }
    
    const query = `
      SELECT 
        c.*,
        u.username,
        u.first_name,
        u.last_name,
        bp.title as post_title
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN blog_posts bp ON c.post_id = bp.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, params);
    
    res.json(createSuccessResponse(
      result.rows,
      'Admin comments retrieved successfully'
    ));
  } catch (error: any) {
    console.error('Error fetching admin comments:', error);
    res.status(500).json(createErrorResponse(error.message, 'Failed to retrieve admin comments'));
  }
});

// GET /api/admin/comments/stats - Get comment statistics (direct database query)
router.get('/stats', authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
      FROM comments
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0];
    
    res.json(createSuccessResponse(
      stats,
      'Comment statistics retrieved successfully'
    ));
  } catch (error: any) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json(createErrorResponse(error.message, 'Failed to retrieve comment statistics'));
  }
});

// PUT /api/admin/comments/:id/approve - Approve comment
router.put('/:id/approve', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;
    
    const query = `
      UPDATE comments 
      SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [adminId, id]);
    const comment = result.rows[0];
    
    res.json(createSuccessResponse(
      comment,
      'Comment approved successfully'
    ));
  } catch (error: any) {
    console.error('Error approving comment:', error);
    res.status(500).json(createErrorResponse(error.message, 'Failed to approve comment'));
  }
});

// PUT /api/admin/comments/:id/reject - Reject comment
router.put('/:id/reject', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;
    
    const query = `
      UPDATE comments 
      SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [adminId, id]);
    const comment = result.rows[0];
    
    res.json(createSuccessResponse(
      comment,
      'Comment rejected successfully'
    ));
  } catch (error: any) {
    console.error('Error rejecting comment:', error);
    res.status(500).json(createErrorResponse(error.message, 'Failed to reject comment'));
  }
});

// DELETE /api/admin/comments/:id - Admin delete comment
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    
    res.json(createSuccessResponse(
      { id: parseInt(id) },
      'Comment deleted successfully'
    ));
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json(createErrorResponse(error.message, 'Failed to delete comment'));
  }
});

export default router;