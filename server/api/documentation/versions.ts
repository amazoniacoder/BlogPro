/**
 * Documentation Versioning API
 * Endpoints for content version management
 * Handles version history, restoration, and comparison
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';
import { pool } from '../../db/db';

const router = Router();

/**
 * Get content version history
 * GET /api/documentation/content/:id/versions
 */
router.get('/content/:id/versions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        id, version, title, excerpt, change_summary, 
        created_by, created_at
       FROM documentation_content_versions 
       WHERE content_id = $1 
       ORDER BY version DESC`,
      [id]
    );

    res.json({
      success: true,
      versions: result.rows
    });
  } catch (error) {
    console.error('Error fetching content versions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content versions'
    });
  }
});

/**
 * Get specific version content
 * GET /api/documentation/content/:id/versions/:version
 */
router.get('/content/:id/versions/:version', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id, version } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM documentation_content_versions 
       WHERE content_id = $1 AND version = $2`,
      [id, version]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Version not found'
      });
    }

    res.json({
      success: true,
      version: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching version:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch version'
    });
  }
});

/**
 * Restore content to specific version
 * POST /api/documentation/content/:id/restore/:version
 */
router.post('/content/:id/restore/:version', 
  requireAuth, 
  requireRole(['admin', 'editor']), 
  async (req: Request, res: Response) => {
    try {
      const { id, version } = req.params;
      const userId = (req as any).user?.username || (req as any).user?.userId;

      // Use the database function to restore version
      const result = await pool.query(
        'SELECT restore_content_version($1, $2, $3) as success',
        [id, parseInt(version), userId]
      );

      if (!result.rows[0].success) {
        return res.status(404).json({
          success: false,
          error: 'Version not found or restore failed'
        });
      }

      res.json({
        success: true,
        message: `Content restored to version ${version}`
      });
    } catch (error) {
      console.error('Error restoring version:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to restore version'
      });
    }
  }
);

/**
 * Compare two versions
 * GET /api/documentation/content/:id/diff/:version1/:version2
 */
router.get('/content/:id/diff/:version1/:version2', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id, version1, version2 } = req.params;
    
    const result = await pool.query(
      `SELECT 
        v1.version as version1, v1.title as title1, v1.content as content1, v1.created_at as date1,
        v2.version as version2, v2.title as title2, v2.content as content2, v2.created_at as date2
       FROM documentation_content_versions v1
       CROSS JOIN documentation_content_versions v2
       WHERE v1.content_id = $1 AND v1.version = $2
         AND v2.content_id = $1 AND v2.version = $3`,
      [id, parseInt(version1), parseInt(version2)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'One or both versions not found'
      });
    }

    const diff = result.rows[0];
    
    // Simple diff calculation (can be enhanced with proper diff library)
    const titleChanged = diff.title1 !== diff.title2;
    const contentChanged = diff.content1 !== diff.content2;

    res.json({
      success: true,
      diff: {
        version1: {
          version: diff.version1,
          title: diff.title1,
          content: diff.content1,
          date: diff.date1
        },
        version2: {
          version: diff.version2,
          title: diff.title2,
          content: diff.content2,
          date: diff.date2
        },
        changes: {
          titleChanged,
          contentChanged,
          summary: `${titleChanged ? 'Title' : ''}${titleChanged && contentChanged ? ' and ' : ''}${contentChanged ? 'Content' : ''} changed`
        }
      }
    });
  } catch (error) {
    console.error('Error comparing versions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare versions'
    });
  }
});

export default router;