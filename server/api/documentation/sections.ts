/**
 * Documentation Sections API
 * 
 * API endpoints for managing hierarchical documentation sections.
 */

import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';
import { enhancedDocumentationService } from '../../services/enhancedDocumentationService';

const router = Router();

/**
 * Get all sections in hierarchical structure
 */
router.get('/', async (_req, res) => {
  try {
    console.log('📚 Sections endpoint called');
    const sections = await enhancedDocumentationService.getSectionsHierarchy();
    console.log('📚 Sections loaded from database:', sections.length);
    res.json(sections);
  } catch (error) {
    console.error('📚 Error fetching sections from database:', error);
    // Fallback to mock data if database is not available
    const mockSections = [
      {
        id: '1',
        name: 'Getting Started',
        slug: 'getting-started',
        description: 'Introduction and setup guides',
        level: 0,
        order_index: 0,
        is_active: true,
        children: []
      },
      {
        id: '2',
        name: 'API Reference',
        slug: 'api-reference',
        description: 'Complete API documentation',
        level: 0,
        order_index: 1,
        is_active: true,
        children: []
      },
      {
        id: '3',
        name: 'Examples',
        slug: 'examples',
        description: 'Code examples and tutorials',
        level: 0,
        order_index: 2,
        is_active: true,
        children: []
      }
    ];
    console.log('📚 Returning mock sections:', mockSections.length);
    res.json(mockSections);
  }
});

/**
 * Create new section
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, parent_id, icon, order_index } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }
    
    const section = await enhancedDocumentationService.createSection({
      name,
      slug,
      description,
      parent_id,
      icon,
      order_index
    });
    
    res.status(201).json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Section with this slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create section' });
    }
  }
});

/**
 * Update section
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, order_index } = req.body;
    
    const section = await enhancedDocumentationService.updateSection(id, {
      name,
      description,
      icon,
      order_index
    });
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

/**
 * Delete section
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await enhancedDocumentationService.deleteSection(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

/**
 * Reorder sections
 */
router.post('/reorder', requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body;
    
    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Sections array is required' });
    }
    
    // Update order_index for each section
    for (const section of sections) {
      await enhancedDocumentationService.updateSection(section.id, {
        order_index: section.order_index
      });
    }
    
    res.json({ message: 'Sections reordered successfully' });
  } catch (error) {
    console.error('Error reordering sections:', error);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
});

export default router;