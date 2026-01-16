import { Request, Response } from 'express';
import { db } from '../../db/connection';

export const downloadProduct = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Verify download token
    const tokenQuery = `
      SELECT dt.*, p.title, p.slug
      FROM download_tokens dt
      JOIN products p ON dt.product_id = p.id::text
      WHERE dt.token = $1 AND dt.expires_at > NOW()
    `;
    
    const tokenResult = await db.query(tokenQuery, [token]);
    
    if (tokenResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired download link' });
    }
    
    const downloadData = tokenResult.rows[0];
    
    // Check download limits
    if (downloadData.download_count >= downloadData.max_downloads) {
      return res.status(403).json({ error: 'Download limit exceeded' });
    }
    
    // Update download count
    await db.query(`
      UPDATE download_tokens 
      SET download_count = download_count + 1, last_download_at = NOW()
      WHERE token = $1
    `, [token]);
    
    // For demo purposes, create a sample file
    const fileName = `${downloadData.slug || 'product'}-digital-download.zip`;
    const sampleContent = `
# ${downloadData.title}

This is your digital product download.

## Installation Instructions
1. Extract this archive
2. Follow the README.md instructions
3. Use your license key for activation

## License Key
Your license key was provided in the delivery email.

## Support
Contact support@blogpro.com for assistance.

Thank you for your purchase!
    `;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', Buffer.byteLength(sampleContent));
    
    // Send the sample content as a "file"
    res.send(sampleContent);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to process download' });
  }
};

export const getDownloadStatus = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    const query = `
      SELECT download_count, max_downloads, expires_at
      FROM download_tokens
      WHERE token = $1
    `;
    
    const result = await db.query(query, [token]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    const data = result.rows[0];
    
    res.json({
      downloadsRemaining: data.max_downloads - data.download_count,
      expiresAt: data.expires_at,
      isExpired: new Date(data.expires_at) < new Date()
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get download status' });
  }
};