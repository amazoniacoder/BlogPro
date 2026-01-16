/**
 * Public Documentation API Routes
 * No authentication required - public access to documentation content
 */

import { Router } from 'express';
import { enhancedDocumentationService } from '../../services/enhancedDocumentationService';

const router = Router();

// Get sections by library type (public access)
router.get('/sections/:libraryType', async (req, res) => {
  try {
    const { libraryType } = req.params;
    
    // Validate library type
    if (!['texteditor', 'website'].includes(libraryType)) {
      return res.status(400).json({ 
        error: 'Invalid library type. Must be "texteditor" or "website"' 
      });
    }

    const sections = await enhancedDocumentationService.getSectionsByLibrary(libraryType);
    res.json(sections);
  } catch (error) {
    console.error('Error loading sections:', error);
    res.status(500).json({ 
      error: 'Failed to load sections',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get content by library type (public access)
router.get('/content/:libraryType', async (req, res) => {
  try {
    const { libraryType } = req.params;
    
    // Validate library type
    if (!['texteditor', 'website'].includes(libraryType)) {
      return res.status(400).json({ 
        error: 'Invalid library type. Must be "texteditor" or "website"' 
      });
    }

    const content = await enhancedDocumentationService.getContentByLibrary(libraryType);
    res.json(content);
  } catch (error) {
    console.error('Error loading content:', error);
    res.status(500).json({ 
      error: 'Failed to load content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific content by slug (public access)
router.get('/content/:libraryType/:slug', async (req, res) => {
  try {
    const { libraryType, slug } = req.params;
    
    // Validate library type
    if (!['texteditor', 'website'].includes(libraryType)) {
      return res.status(400).json({ 
        error: 'Invalid library type. Must be "texteditor" or "website"' 
      });
    }

    const content = await enhancedDocumentationService.getContentBySlug(slug);
    
    if (!content || content.library_type !== libraryType || !content.is_published) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Error loading content by slug:', error);
    res.status(500).json({ 
      error: 'Failed to load content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search content within library (public access)
router.get('/search/:libraryType', async (req, res) => {
  try {
    const { libraryType } = req.params;
    const { q: query } = req.query;
    
    // Validate library type
    if (!['texteditor', 'website'].includes(libraryType)) {
      return res.status(400).json({ 
        error: 'Invalid library type. Must be "texteditor" or "website"' 
      });
    }

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }

    const results = await enhancedDocumentationService.searchContent(query.trim(), libraryType);
    res.json({ results, query: query.trim(), libraryType });
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get library statistics (public access)
router.get('/stats/:libraryType', async (req, res) => {
  try {
    const { libraryType } = req.params;
    
    // Validate library type
    if (!['texteditor', 'website'].includes(libraryType)) {
      return res.status(400).json({ 
        error: 'Invalid library type. Must be "texteditor" or "website"' 
      });
    }

    const stats = await enhancedDocumentationService.getLibraryStats(libraryType);
    res.json({ ...stats, libraryType });
  } catch (error) {
    console.error('Error loading library stats:', error);
    res.status(500).json({ 
      error: 'Failed to load statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available libraries (public access)
router.get('/libraries', async (_req, res) => {
  try {
    const libraries = await enhancedDocumentationService.getAvailableLibraries();
    res.json({ libraries });
  } catch (error) {
    console.error('Error loading available libraries:', error);
    res.status(500).json({ 
      error: 'Failed to load libraries',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;