/**
 * Documentation File System API
 * 
 * API endpoints for file system integration with /docs directory.
 */

import { Router } from 'express';
import { requireAdmin } from '../../middleware/authMiddleware';
import { enhancedDocumentationService } from '../../services/enhancedDocumentationService';

const router = Router();

/**
 * Scan docs directory and sync with database
 */
router.get('/scan', requireAdmin, async (_req, res) => {
  try {
    const files = await enhancedDocumentationService.scanDocsDirectory();
    
    res.json({
      message: 'Directory scan completed',
      filesFound: files.length,
      files: files.map(f => ({
        filename: f.filename,
        filepath: f.filepath,
        type: f.file_type,
        size: f.file_size
      }))
    });
  } catch (error) {
    console.error('Error scanning directory:', error);
    res.status(500).json({ error: 'Failed to scan directory' });
  }
});

/**
 * Get directory tree structure
 */
router.get('/tree', async (_req, res) => {
  try {
    // This will be implemented to return hierarchical directory structure
    // For now, return a simple structure
    const files = await enhancedDocumentationService.scanDocsDirectory();
    
    // Build tree structure
    const tree = buildDirectoryTree(files);
    
    res.json(tree);
  } catch (error) {
    console.error('Error getting directory tree:', error);
    res.status(500).json({ error: 'Failed to get directory tree' });
  }
});

/**
 * Get file content
 */
router.get('/file/*', async (req, res) => {
  try {
    // Extract file path from URL (everything after /file/)
    const filepath = (req.params as any)[0];
    
    if (!filepath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const result = await enhancedDocumentationService.getFileContent(filepath);
    
    res.json({
      filepath,
      content: result.content,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error reading file:', error);
    if (error instanceof Error && error.message.includes('Invalid file path')) {
      res.status(403).json({ error: 'Access denied' });
    } else if (error instanceof Error && error.message.includes('ENOENT')) {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(500).json({ error: 'Failed to read file' });
    }
  }
});

/**
 * Update file content
 */
router.put('/file/*', requireAdmin, async (req, res) => {
  try {
    // Extract file path from URL (everything after /file/)
    const filepath = (req.params as any)[0];
    const { content } = req.body;
    
    if (!filepath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    await enhancedDocumentationService.updateFile(filepath, content);
    
    res.json({ 
      message: 'File updated successfully',
      filepath 
    });
  } catch (error) {
    console.error('Error updating file:', error);
    if (error instanceof Error && error.message.includes('Invalid file path')) {
      res.status(403).json({ error: 'Access denied' });
    } else {
      res.status(500).json({ error: 'Failed to update file' });
    }
  }
});

/**
 * Sync files with database
 */
router.post('/sync', requireAdmin, async (_req, res) => {
  try {
    const files = await enhancedDocumentationService.scanDocsDirectory();
    
    res.json({
      message: 'Files synchronized with database',
      syncedFiles: files.length
    });
  } catch (error) {
    console.error('Error syncing files:', error);
    res.status(500).json({ error: 'Failed to sync files' });
  }
});

/**
 * Helper function to build directory tree structure
 */
function buildDirectoryTree(files: any[]): any {
  const tree: any = {
    name: 'docs',
    type: 'directory',
    children: []
  };
  
  const pathMap = new Map();
  pathMap.set('', tree);
  
  // Sort files by path to ensure parent directories are processed first
  files.sort((a, b) => a.filepath.localeCompare(b.filepath));
  
  for (const file of files) {
    const pathParts = file.filepath.split('/');
    let currentPath = '';
    
    // Create directory structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      const dirName = pathParts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${dirName}` : dirName;
      
      if (!pathMap.has(currentPath)) {
        const dirNode = {
          name: dirName,
          type: 'directory',
          path: currentPath,
          children: []
        };
        
        const parent = pathMap.get(parentPath);
        parent.children.push(dirNode);
        pathMap.set(currentPath, dirNode);
      }
    }
    
    // Add file to its parent directory
    const fileName = pathParts[pathParts.length - 1];
    const parentPath = pathParts.slice(0, -1).join('/');
    const parent = pathMap.get(parentPath);
    
    if (parent) {
      parent.children.push({
        name: fileName,
        type: 'file',
        path: file.filepath,
        fileType: file.file_type,
        size: file.file_size
      });
    }
  }
  
  return tree;
}

export default router;