/**
 * Documentation Conversion API
 * 
 * API endpoints for document format conversion.
 */

import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';
import { documentConverter } from '../../services/documentConverter';

const router = Router();

/**
 * Get supported formats
 */
router.get('/formats', async (_req, res) => {
  try {
    const formats = documentConverter.getSupportedFormats();
    res.json({ formats });
  } catch (error) {
    console.error('Error getting supported formats:', error);
    res.status(500).json({ error: 'Failed to get supported formats' });
  }
});

/**
 * Convert document
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { sourceFileId, targetFormat, sourceContent } = req.body;
    
    if (!sourceFileId || !targetFormat) {
      return res.status(400).json({ 
        error: 'Source file ID and target format are required' 
      });
    }
    
    const result = await documentConverter.convertDocument(
      sourceFileId,
      targetFormat,
      sourceContent
    );
    
    res.status(202).json(result);
  } catch (error) {
    console.error('Error starting conversion:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Conversion failed' });
  }
});

/**
 * Get conversion status
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const status = await documentConverter.getConversionStatus(id);
    res.json(status);
  } catch (error) {
    console.error('Error getting conversion status:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: 'Conversion not found' });
    } else {
      res.status(500).json({ error: 'Failed to get conversion status' });
    }
  }
});

/**
 * Download converted document
 */
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await documentConverter.getConvertedContent(id);
    const status = await documentConverter.getConversionStatus(id);
    
    // Set appropriate headers
    const filename = `converted.${status.target_format}`;
    const mimeTypes = {
      'txt': 'text/plain',
      'md': 'text/markdown',
      'html': 'text/html',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    res.setHeader('Content-Type', mimeTypes[status.target_format as keyof typeof mimeTypes] || 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(content);
  } catch (error) {
    console.error('Error downloading converted document:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: 'Conversion not found' });
    } else if (error instanceof Error && error.message.includes('not completed')) {
      res.status(409).json({ error: 'Conversion not completed yet' });
    } else {
      res.status(500).json({ error: 'Failed to download converted document' });
    }
  }
});

/**
 * Get conversion history
 */
router.get('/history', requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        c.id,
        c.source_format,
        c.target_format,
        c.conversion_status,
        c.created_at,
        c.completed_at,
        f.filename,
        f.filepath
      FROM documentation_conversions c
      LEFT JOIN documentation_files f ON c.source_file_id = f.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const { pool } = await import('../../db/db');
    const result = await pool.query(query, [
      parseInt(limit as string),
      parseInt(offset as string)
    ]);
    
    res.json({
      conversions: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error getting conversion history:', error);
    res.status(500).json({ error: 'Failed to get conversion history' });
  }
});

/**
 * Delete conversion record
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { pool } = await import('../../db/db');
    const query = `DELETE FROM documentation_conversions WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Conversion not found' });
    }
    
    res.json({ message: 'Conversion record deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversion:', error);
    res.status(500).json({ error: 'Failed to delete conversion record' });
  }
});

export default router;