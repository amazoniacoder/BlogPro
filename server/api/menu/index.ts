// server/api/menu/index.ts
import { Router } from 'express';
import { menuService } from '../../services/menuService';
import { requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Public routes - no authentication required
router.get('/tree', async (_, res) => {
  try {
    const menuTree = await menuService.getMenuTree();
    res.json(menuTree);
  } catch (error) {
    console.error('Error fetching menu tree:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Admin route - get full menu tree including inactive items
router.get('/admin/tree', requireAdmin, async (_, res) => {
  try {
    const menuTree = await menuService.getFullMenuTree();
    res.json(menuTree);
  } catch (error) {
    console.error('Error fetching full menu tree:', error);
    res.status(500).json({ error: 'Failed to fetch full menu tree' });
  }
});

// Admin routes - require admin privileges  
router.get('/', requireAdmin, async (_, res) => {
  console.log('✅ Menu endpoint accessed successfully by admin');
  try {
    const menuItems = await menuService.getAllMenuItems();
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching all menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const menuItem = await menuService.getById(id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const menuItem = await menuService.create(req.body);
    
    // Emit WebSocket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('menuCreated', menuItem);
    }
    
    // Also broadcast using WebSocket service
    const { broadcastToAll } = require('../../websocket');
    broadcastToAll('menu_updated', { menuItem, type: 'create' });
    
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const menuItem = await menuService.update(id, req.body);
    
    // Emit WebSocket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('menuUpdated', menuItem);
    }
    
    // Also broadcast using WebSocket service
    const { broadcastToAll } = require('../../websocket');
    broadcastToAll('menu_updated', { menuItem, type: 'update' });
    
    res.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const success = await menuService.delete(id);
    if (success) {
      // Emit WebSocket event for real-time updates
      if (req.app.locals.io) {
        req.app.locals.io.emit('menuDeleted', { id });
      }
      
      // Also broadcast using WebSocket service
      const { broadcastToAll } = require('../../websocket');
      broadcastToAll('menu_updated', { menuItemId: id, type: 'delete' });
      
      res.json({ message: 'Menu item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Menu item not found' });
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

router.post('/reorder', requireAdmin, async (req, res) => {
  try {
    await menuService.reorder(req.body.items);
    
    // Emit WebSocket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('menuUpdated', { reordered: true });
    }
    
    res.json({ message: 'Menu items reordered successfully' });
  } catch (error) {
    console.error('Error reordering menu items:', error);
    res.status(500).json({ error: 'Failed to reorder menu items' });
  }
});

export default router;