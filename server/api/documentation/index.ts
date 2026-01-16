// server/api/documentation/index.ts
import { Router } from 'express';
import { documentationService } from '../../services/documentationService';
import { requireAuth, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Import routes synchronously
import sectionsRouter from './sections';
import contentRouter from './content';
import menuRouter from './menu';
import searchRouter from './search';
import conversionRouter from './conversion';
import analyticsRouter from './analytics';
import publicRouter from './public';
import versionsRouter from './versions';
import locksRouter from './locks';

// Public routes (no authentication required)
router.use('/public', publicRouter);

// Database-driven documentation management routes
router.use('/sections', sectionsRouter);
router.use('/content', contentRouter);
router.use('/menu', menuRouter);
router.use('/search', searchRouter);
router.use('/conversion', conversionRouter);
router.use('/analytics', analyticsRouter);
router.use('/', versionsRouter);
router.use('/', locksRouter);

// Legacy filesystem routes (for backward compatibility)
router.use('/filesystem', (_, __, next) => {
  // Redirect filesystem requests to new database API
  console.log('Legacy filesystem route accessed, consider migrating to database API');
  next();
});

// Test route
router.get('/test', async (_, res) => {
  res.json({ message: 'Documentation API is working', timestamp: new Date().toISOString() });
});

// Test public directory route
router.get('/test-directory', async (_, res) => {
  res.json({ message: 'Public directory route is working', timestamp: new Date().toISOString() });
});

// Public routes - no authentication required
router.get('/public', async (_, res) => {
  try {
    const docs = await documentationService.getPublished();
    res.json(docs);
  } catch (error) {
    console.error('Error fetching public documentation:', error);
    res.status(500).json({ error: 'Failed to fetch documentation' });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const doc = await documentationService.getBySlug(req.params.slug);
    if (!doc || !doc.is_published) {
      return res.status(404).json({ error: 'Documentation not found' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Error fetching documentation by slug:', error);
    res.status(500).json({ error: 'Failed to fetch documentation' });
  }
});

router.get('/categories', async (_, res) => {
  try {
    console.log('Fetching categories...');
    const categories = await documentationService.getCategories();
    console.log('Found categories:', categories.length, 'items');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/categories/tree', async (_, res) => {
  try {
    const categoryTree = await documentationService.getCategoryTree();
    res.json(categoryTree);
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({ error: 'Failed to fetch category tree' });
  }
});

// Admin routes - require authentication
router.get('/', requireAuth, async (_, res) => {
  try {
    console.log('Fetching all documentation...');
    const docs = await documentationService.getAll();
    console.log('Found documentation:', docs.length, 'items');
    res.json(docs);
  } catch (error) {
    console.error('Error fetching all documentation:', error);
    res.status(500).json({ error: 'Failed to fetch documentation' });
  }
});

router.get('/:slug', requireAuth, async (req, res) => {
  try {
    const doc = await documentationService.getBySlug(req.params.slug);
    if (!doc) {
      return res.status(404).json({ error: 'Documentation not found' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Error fetching documentation by slug:', error);
    res.status(500).json({ error: 'Failed to fetch documentation' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    console.log('Creating documentation with data:', req.body);
    const doc = await documentationService.create(req.body);
    console.log('Created documentation:', doc);
    
    // Broadcast WebSocket event for real-time updates
    const wss = (global as any).wss;
    if (wss && wss.clients) {
      const message = JSON.stringify({
        type: 'documentation_created',
        data: doc,
        timestamp: new Date().toISOString()
      });
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
        }
      });
      console.log('📡 Broadcasted documentation_created event');
    }
    
    res.status(201).json(doc);
  } catch (error) {
    console.error('Error creating documentation:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Failed to create documentation' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await documentationService.update(id, req.body);
    
    // Broadcast WebSocket event for real-time updates
    const wss = (global as any).wss;
    if (wss && wss.clients) {
      const message = JSON.stringify({
        type: 'documentation_updated',
        data: doc,
        timestamp: new Date().toISOString()
      });
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
        }
      });
      console.log('📡 Broadcasted documentation_updated event');
    }
    
    res.json(doc);
  } catch (error) {
    console.error('Error updating documentation:', error);
    res.status(500).json({ error: 'Failed to update documentation' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    console.log('DELETE request for documentation ID:', req.params.id);
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const success = await documentationService.delete(id);
    console.log('Delete result:', success);
    
    if (success) {
      // WebSocket events are now handled in documentationService.delete()
      // This ensures proper sequencing: delete doc -> remove menu -> broadcast events
      res.json({ message: 'Documentation deleted successfully' });
    } else {
      res.status(404).json({ error: 'Documentation not found' });
    }
  } catch (error) {
    console.error('Error deleting documentation:', error);
    res.status(500).json({ error: 'Failed to delete documentation' });
  }
});

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const category = await documentationService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const category = await documentationService.updateCategory(id, req.body);
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await documentationService.deleteCategory(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Bulk sync all documentation to menu
router.post('/sync-menu', requireAdmin, async (_, res) => {
  try {
    const { documentationMenuService } = await import('../../services/documentationMenuService');
    await documentationMenuService.bulkSyncAllDocumentation();
    
    // Broadcast WebSocket event
    const wss = (global as any).wss;
    if (wss && wss.clients) {
      const message = JSON.stringify({
        type: 'menu_bulk_synced',
        data: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }
    
    res.json({ message: 'All documentation synced to menu successfully' });
  } catch (error) {
    console.error('Error syncing documentation to menu:', error);
    res.status(500).json({ error: 'Failed to sync documentation to menu' });
  }
});

// Clean up orphaned menu items with statistics
router.post('/cleanup-menu', requireAdmin, async (_, res) => {
  try {
    const { documentationMenuService } = await import('../../services/documentationMenuService');
    const stats = await documentationMenuService.cleanupOrphanedMenuItems();
    
    res.json({ 
      message: `Cleanup completed: ${stats.cleaned} orphaned menu items removed`,
      stats
    });
  } catch (error) {
    console.error('Error cleaning up menu items:', error);
    res.status(500).json({ error: 'Failed to cleanup menu items' });
  }
});

// Get cleanup statistics
router.get('/cleanup-stats', requireAdmin, async (_, res) => {
  try {
    const { documentationMenuService } = await import('../../services/documentationMenuService');
    const stats = await documentationMenuService.getCleanupStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    res.status(500).json({ error: 'Failed to get cleanup statistics' });
  }
});

// Validate menu-document relationships
router.get('/validate-menu', requireAdmin, async (_, res) => {
  try {
    const validation = await documentationService.validateMenuRelationships();
    
    res.json(validation);
  } catch (error) {
    console.error('Error validating menu relationships:', error);
    res.status(500).json({ error: 'Failed to validate menu relationships' });
  }
});

// File system routes for text editor plugin
router.get('/filesystem/directory', async (_, res) => {
  console.log('[DEBUG] Filesystem directory route called');
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const docsPath = path.resolve(__dirname, '../../../client/src/plugins/texteditor/docs');
    console.log('[DEBUG] Docs path:', docsPath);
    
    const readDirectory = async (dirPath: string): Promise<any> => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = [];
      const directories = [];
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(docsPath, fullPath);
        
        if (entry.isDirectory()) {
          directories.push({
            path: relativePath,
            name: entry.name,
            isDirectory: true,
            children: await readDirectory(fullPath)
          });
        } else {
          const stats = await fs.stat(fullPath);
          files.push({
            path: relativePath,
            name: entry.name,
            isDirectory: false,
            size: stats.size,
            lastModified: stats.mtime
          });
        }
      }
      
      return { files, directories };
    };
    
    const structure = await readDirectory(docsPath);
    res.json({
      ...structure,
      totalFiles: structure.files.length,
      totalDirectories: structure.directories.length,
      supportedFiles: structure.files.length
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({ error: 'Failed to read directory' });
  }
});

router.get('/filesystem/file', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const docsPath = path.join(__dirname, '../../../client/src/plugins/texteditor/docs');
    const fullPath = path.join(docsPath, filePath);
    
    const content = await fs.readFile(fullPath, 'utf8');
    const stats = await fs.stat(fullPath);
    
    res.json({
      content,
      size: stats.size,
      lastModified: stats.mtime
    });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

router.post('/filesystem/file', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
    }
    
    const docsPath = path.join(__dirname, '../../../client/src/plugins/texteditor/docs');
    const fullPath = path.join(docsPath, filePath);
    
    await fs.writeFile(fullPath, content, 'utf8');
    
    res.json({ message: 'File saved successfully' });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

export default router;