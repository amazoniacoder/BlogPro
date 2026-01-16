/**
 * Documentation Content API
 * 
 * API endpoints for managing documentation content.
 */

import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';
import { enhancedDocumentationService } from '../../services/enhancedDocumentationService';

const router = Router();

/**
 * Get all content
 */
router.get('/', async (_req, res) => {
  try {
    const content = await enhancedDocumentationService.getContent();
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * Get content by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const content = await enhancedDocumentationService.getContentBySlug(slug);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content by slug:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * Create new content
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      section_id,
      parent_id,
      order_index,
      is_published,
      meta_title,
      meta_description,
      tags
    } = req.body;
    
    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }
    
    const newContent = await enhancedDocumentationService.createContent({
      title,
      slug,
      content,
      excerpt,
      section_id,
      parent_id,
      order_index,
      is_published,
      meta_title,
      meta_description,
      tags,
      created_by: req.user?.id || 'admin'
    });
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Content with this slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create content' });
    }
  }
});

/**
 * Update content
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      section_id,
      is_published,
      meta_title,
      meta_description,
      tags
    } = req.body;
    
    const updatedContent = await enhancedDocumentationService.updateContent(id, {
      title,
      content,
      excerpt,
      section_id,
      is_published,
      meta_title,
      meta_description,
      tags,
      updated_by: req.user?.id || 'admin'
    });
    
    if (!updatedContent) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

/**
 * Delete content
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await enhancedDocumentationService.deleteContent(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

/**
 * Reorder content
 */
router.post('/reorder', requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!Array.isArray(content)) {
      return res.status(400).json({ error: 'Content array is required' });
    }
    
    // Update order_index for each content item
    for (const item of content) {
      await enhancedDocumentationService.updateContent(item.id, {
        order_index: item.order_index
      });
    }
    
    res.json({ message: 'Content reordered successfully' });
  } catch (error) {
    console.error('Error reordering content:', error);
    res.status(500).json({ error: 'Failed to reorder content' });
  }
});

export default router;