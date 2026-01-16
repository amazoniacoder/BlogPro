import { Router, Request, Response } from 'express';
import { pool } from '../db/db';
import { requireAuth } from '../middleware/authMiddleware';
import { HTTP_STATUS, sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } from '../utils/responseHelpers';
import { broadcastToAll } from '../websocket';

const router = Router();

// GET /api/comments/:postId/count - Get comment count for a post
router.get('/:postId/count', async (req: Request, res: Response) => {
  try {
    // Prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const { postId } = req.params;
    
    const result = await pool.query('SELECT COUNT(*) FROM comments WHERE post_id = $1', [postId]);
    const count = parseInt(result.rows[0].count);
    
    sendSuccessResponse(res, { count }, 'Comment count retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching comment count:', error);
    sendErrorResponse(res, error.message, 'Failed to retrieve comment count', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/comments/:commentId/replies - Direct database query for replies with pagination
router.get('/:commentId/replies', async (req: Request, res: Response) => {
  try {
    // Prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const query = `
      SELECT 
        c.*,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(DISTINCT reactions.id) as like_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_reactions reactions ON c.id = reactions.comment_id
      WHERE c.parent_id = $1
      GROUP BY c.id, u.username, u.first_name, u.last_name, u.profile_image_url
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [commentId, limit, offset]);
    
    // Get total count of replies
    const countResult = await pool.query('SELECT COUNT(*) FROM comments WHERE parent_id = $1', [commentId]);
    const total = parseInt(countResult.rows[0].count);
    
    sendPaginatedResponse(res, result.rows, { 
      page: parseInt(page as string), 
      limit: parseInt(limit as string), 
      total 
    }, 'Replies retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching replies:', error);
    sendErrorResponse(res, error.message, 'Failed to retrieve replies', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/comments/:postId - Direct database query, no cache
router.get('/:postId', async (req: Request, res: Response) => {
  try {
    // Prevent caching - comments should always be fresh
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const query = `
      SELECT 
        c.*,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(DISTINCT replies.id) as reply_count,
        COUNT(DISTINCT reactions.id) as like_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN comments replies ON c.id = replies.parent_id
      LEFT JOIN comment_reactions reactions ON c.id = reactions.comment_id
      WHERE c.post_id = $1 AND c.parent_id IS NULL
      GROUP BY c.id, u.username, u.first_name, u.last_name, u.profile_image_url
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [postId, limit, offset]);
    
    // Get total count (only top-level comments)
    const countResult = await pool.query('SELECT COUNT(*) FROM comments WHERE post_id = $1 AND parent_id IS NULL', [postId]);
    const total = parseInt(countResult.rows[0].count);
    
    sendPaginatedResponse(res, result.rows, { 
      page: parseInt(page as string), 
      limit: parseInt(limit as string), 
      total 
    }, 'Comments retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    sendErrorResponse(res, error.message, 'Failed to retrieve comments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/comments - Direct database insert, no cache
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { postId, content, parentId } = req.body;
    const userId = (req as any).user.id;
    
    if (!postId || !content?.trim()) {
      return sendErrorResponse(res, 'Post ID and content are required', 'Validation failed', HTTP_STATUS.BAD_REQUEST);
    }
    
    const query = `
      INSERT INTO comments (post_id, user_id, content, content_html, parent_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const contentHtml = content.replace(/\n/g, '<br>');
    const result = await pool.query(query, [
      postId, userId, content, contentHtml, parentId || null, req.ip, req.get('User-Agent')
    ]);
    
    // Get comment with user data
    const commentQuery = `
      SELECT c.*, u.username, u.first_name, u.last_name, u.profile_image_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const commentResult = await pool.query(commentQuery, [result.rows[0].id]);
    
    // Broadcast comment update to all clients
    broadcastToAll('COMMENT_CREATED', {
      postId: parseInt(postId),
      comment: commentResult.rows[0],
      isReply: !!parentId
    });
    
    sendSuccessResponse(res, commentResult.rows[0], 'Comment created successfully', HTTP_STATUS.CREATED);
  } catch (error: any) {
    console.error('Error creating comment:', error);
    sendErrorResponse(res, error.message, 'Failed to create comment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// PUT /api/comments/:id - Direct database update, no cache
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.id;
    
    if (!content?.trim()) {
      return sendErrorResponse(res, 'Content is required', 'Validation failed', HTTP_STATUS.BAD_REQUEST);
    }
    
    const contentHtml = content.replace(/\n/g, '<br>');
    const query = `
      UPDATE comments 
      SET content = $1, content_html = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [content, contentHtml, id, userId]);
    
    if (result.rows.length === 0) {
      return sendErrorResponse(res, 'Comment not found or unauthorized', 'Not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Broadcast comment update to all clients
    broadcastToAll('COMMENT_UPDATED', {
      commentId: parseInt(id),
      comment: result.rows[0]
    });
    
    sendSuccessResponse(res, result.rows[0], 'Comment updated successfully');
  } catch (error: any) {
    console.error('Error updating comment:', error);
    sendErrorResponse(res, error.message, 'Failed to update comment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /api/comments/:id - Hard delete, no cache
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    console.log('🗑️ DELETE request received:');
    console.log('  - Comment ID:', id, typeof id);
    console.log('  - User ID from token:', userId, typeof userId);
    
    // First, check if the comment exists and get its details
    const checkQuery = 'SELECT * FROM comments WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);
    
    console.log('  - Comment exists:', checkResult.rows.length > 0);
    if (checkResult.rows.length > 0) {
      const comment = checkResult.rows[0];
      console.log('  - Comment user_id:', comment.user_id, typeof comment.user_id);
      console.log('  - User ID match:', comment.user_id === userId);
      console.log('  - User ID string match:', String(comment.user_id) === String(userId));
    } else {
      await client.query('ROLLBACK');
      console.log('  - ❌ Comment not found');
      return sendErrorResponse(res, 'Comment not found', 'Not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Check authorization
    const comment = checkResult.rows[0];
    if (comment.user_id !== userId) {
      await client.query('ROLLBACK');
      console.log('  - ❌ Unauthorized: User does not own this comment');
      return sendErrorResponse(res, 'Unauthorized to delete this comment', 'Unauthorized', HTTP_STATUS.FORBIDDEN);
    }
    
    // Delete the comment
    const result = await client.query('DELETE FROM comments WHERE id = $1 RETURNING *', [id]);
    
    console.log('  - Delete result rows:', result.rows.length);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      console.log('  - ❌ Delete failed unexpectedly');
      return sendErrorResponse(res, 'Delete operation failed', 'Internal error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    
    await client.query('COMMIT');
    console.log('  - ✅ Comment deleted and committed successfully');
    
    // Verify deletion
    const verifyResult = await client.query('SELECT * FROM comments WHERE id = $1', [id]);
    console.log('  - Verification: Comment still exists?', verifyResult.rows.length > 0);
    
    // Broadcast comment deletion to all clients
    broadcastToAll('COMMENT_DELETED', {
      commentId: parseInt(id),
      postId: comment.post_id,
      isReply: !!comment.parent_id
    });
    
    sendSuccessResponse(res, { id: parseInt(id) }, 'Comment deleted successfully');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Error deleting comment:', error);
    sendErrorResponse(res, error.message, 'Failed to delete comment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  } finally {
    client.release();
  }
});

// POST /api/comments/:id/reactions - Add reaction
router.post('/:id/reactions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id: commentId } = req.params;
    const { reactionType } = req.body;
    const userId = (req as any).user.id;
    
    console.log('👍 POST /api/comments/:id/reactions');
    console.log('  - Comment ID:', commentId, typeof commentId);
    console.log('  - User ID:', userId, typeof userId);
    console.log('  - Reaction Type:', reactionType);
    
    if (!reactionType) {
      console.log('❌ Missing reaction type');
      return sendErrorResponse(res, 'Reaction type is required', 'Validation failed', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Insert or update reaction (upsert)
    const query = `
      INSERT INTO comment_reactions (comment_id, user_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (comment_id, user_id, reaction_type) DO NOTHING
      RETURNING *
    `;
    
    console.log('  - Executing query with params:', [commentId, userId, reactionType]);
    const result = await pool.query(query, [commentId, userId, reactionType]);
    console.log('  - Query result rows:', result.rows.length);
    console.log('  - Query result:', result.rows[0]);
    
    sendSuccessResponse(res, result.rows[0] || { exists: true }, 'Reaction added successfully', HTTP_STATUS.CREATED);
  } catch (error: any) {
    console.error('❌ Error adding reaction:', error);
    sendErrorResponse(res, error.message, 'Failed to add reaction', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /api/comments/:id/reactions - Remove reaction
router.delete('/:id/reactions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id: commentId } = req.params;
    const userId = (req as any).user.id;
    
    console.log('🗑️ DELETE /api/comments/:id/reactions');
    console.log('  - Comment ID:', commentId, typeof commentId);
    console.log('  - User ID:', userId, typeof userId);
    
    const query = 'DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2';
    console.log('  - Executing query with params:', [commentId, userId]);
    const result = await pool.query(query, [commentId, userId]);
    console.log('  - Deleted rows:', result.rowCount);
    
    sendSuccessResponse(res, { deleted: result.rowCount }, 'Reaction removed successfully');
  } catch (error: any) {
    console.error('❌ Error removing reaction:', error);
    sendErrorResponse(res, error.message, 'Failed to remove reaction', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/comments/:postId/reactions - Get user's reactions for all comments in a post
router.get('/:postId/reactions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;
    
    console.log('📊 GET /api/comments/:postId/reactions');
    console.log('  - Post ID:', postId, typeof postId);
    console.log('  - User ID:', userId, typeof userId);
    
    const query = `
      SELECT cr.comment_id, cr.reaction_type
      FROM comment_reactions cr
      JOIN comments c ON cr.comment_id = c.id
      WHERE c.post_id = $1 AND cr.user_id = $2
    `;
    
    console.log('  - Executing query with params:', [postId, userId]);
    const result = await pool.query(query, [postId, userId]);
    console.log('  - Query result rows:', result.rows.length);
    console.log('  - Raw rows:', result.rows);
    
    // Convert to object format { commentId: reactionType }
    const reactions = result.rows.reduce((acc, row) => {
      acc[row.comment_id] = row.reaction_type;
      return acc;
    }, {});
    
    console.log('  - Processed reactions:', reactions);
    
    sendSuccessResponse(res, reactions, 'Reactions retrieved successfully');
  } catch (error: any) {
    console.error('❌ Error fetching reactions:', error);
    sendErrorResponse(res, error.message, 'Failed to retrieve reactions', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

export default router;