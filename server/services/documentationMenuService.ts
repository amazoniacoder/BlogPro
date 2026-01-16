// server/services/documentationMenuService.ts
import { Documentation, DocumentationCategory, documentationService } from './documentationService';
import { MenuItem, menuService } from './menuService';

export class DocumentationMenuService {
  // Sync documentation to menu system
  async syncDocumentationToMenu(doc: Documentation): Promise<void> {
    if (!doc.auto_menu || !doc.title || !doc.slug) return;
    
    const parentMenu = await this.getMenuParent(doc);
    
    if (doc.is_published) {
      await this.createOrUpdateMenuItem(doc, parentMenu);
    } else {
      await this.removeMenuItem(doc);
    }
  }

  // Get appropriate parent menu for documentation
  private async getMenuParent(doc: Documentation): Promise<MenuItem> {
    // Use custom parent if specified
    if (doc.menu_parent_id) {
      const customParent = await menuService.getById(doc.menu_parent_id);
      if (customParent) return customParent;
    }
    
    // Use category-based parent if category exists
    if (doc.category_id) {
      return await this.getCategoryMenu(doc.category_id);
    }
    
    // Fall back to documentation root menu
    return await this.getDocumentationRootMenu();
  }

  // Get or create category menu with hierarchy support
  private async getCategoryMenu(categoryId: number): Promise<MenuItem> {
    const category = await documentationService.getCategoryById(categoryId);
    if (!category) {
      return await this.getDocumentationRootMenu();
    }

    // Build hierarchical menu structure
    const parentMenu = category.parent_id 
      ? await this.getCategoryMenu(category.parent_id)
      : await this.getDocumentationRootMenu();
    
    const categoryPath = await this.buildCategoryPath(category);
    
    return await menuService.findOrCreate({
      title: category.name,
      url: `/documentation/${categoryPath}`,
      parent_id: parentMenu.id,
      type: 'category',
      order_index: category.order_index || await menuService.getNextOrderIndex(parentMenu.id),
      is_active: true,
      target: '_self'
    });
  }

  // Build category path for hierarchical URLs
  private async buildCategoryPath(category: DocumentationCategory): Promise<string> {
    if (!category.parent_id) {
      return category.slug;
    }
    
    const parent = await documentationService.getCategoryById(category.parent_id);
    if (!parent) {
      return category.slug;
    }
    
    const parentPath = await this.buildCategoryPath(parent);
    return `${parentPath}/${category.slug}`;
  }

  // Get documentation root menu
  private async getDocumentationRootMenu(): Promise<MenuItem> {
    const rootMenu = await menuService.findBySlug('documentation');
    if (!rootMenu) {
      // Create documentation root menu if it doesn't exist
      return await menuService.create({
        title: 'Documentation',
        url: '/documentation',
        type: 'manual',
        order_index: await menuService.getNextOrderIndex(),
        is_active: true,
        target: '_self'
      });
    }
    return rootMenu;
  }

  // Create or update menu item for documentation with category path
  async createOrUpdateMenuItem(doc: Documentation, parent: MenuItem): Promise<MenuItem> {
    const docUrl = await this.buildDocumentationUrl(doc);
    
    const menuData = {
      title: doc.menu_title || doc.title,
      url: docUrl,
      parent_id: parent.id,
      order_index: doc.order_index || await menuService.getNextOrderIndex(parent.id),
      is_active: doc.is_published,
      type: 'documentation' as const,
      target: '_self' as const
    };
    
    if (doc.menu_item_id) {
      // Update existing menu item
      return await menuService.update(doc.menu_item_id, menuData);
    } else {
      // Create new menu item and link it to documentation
      const menuItem = await menuService.create(menuData);
      // Only update if we have valid data to prevent NULL constraint violations
      if (doc.title && doc.slug) {
        await documentationService.update(doc.id, { menu_item_id: menuItem.id });
      }
      return menuItem;
    }
  }

  // Build documentation URL with category hierarchy
  private async buildDocumentationUrl(doc: Documentation): Promise<string> {
    if (!doc.category_id) {
      return `/documentation/${doc.slug}`;
    }
    
    const category = await documentationService.getCategoryById(doc.category_id);
    if (!category) {
      return `/documentation/${doc.slug}`;
    }
    
    const categoryPath = await this.buildCategoryPath(category);
    return `/documentation/${categoryPath}/${doc.slug}`;
  }

  // Remove menu item for documentation
  async removeMenuItem(doc: Documentation): Promise<void> {
    if (doc.menu_item_id) {
      try {
        // Delete menu item first
        await menuService.delete(doc.menu_item_id);
        console.log('✅ Menu item deleted:', doc.menu_item_id);
        
        // Clear menu_item_id reference (only if doc still exists)
        try {
          await documentationService.update(doc.id, { menu_item_id: undefined });
          console.log('✅ Menu reference cleared from document:', doc.id);
        } catch (updateError) {
          // Document might be deleted already - this is OK
          console.log('ℹ️ Could not update menu_item_id (document may be deleted):', updateError);
        }
      } catch (error) {
        console.error('❌ Failed to remove menu item:', error);
        throw error;
      }
    } else {
      console.log('ℹ️ No menu item to remove for document:', doc.id);
    }
  }

  // Handle category deletion - move docs to "Uncategorized"
  async handleCategoryDeletion(categoryId: number): Promise<void> {
    // Find all documentation in this category
    const docs = await documentationService.getAll();
    const categoryDocs = docs.filter(doc => doc.category_id === categoryId);
    
    // Remove category menu item
    const categoryMenu = await this.findCategoryMenuByCategory(categoryId);
    if (categoryMenu) {
      await menuService.delete(categoryMenu.id);
    }
    
    // Update documentation to be uncategorized and re-sync menus
    for (const doc of categoryDocs) {
      await documentationService.update(doc.id, { 
        category_id: undefined,
        menu_item_id: undefined // Force menu recreation under new parent
      });
      
      // Re-sync to menu under documentation root
      if (doc.auto_menu && doc.is_published) {
        await this.syncDocumentationToMenu({ ...doc, category_id: undefined, menu_item_id: undefined });
      }
    }
    
    // Broadcast category deletion
    this.broadcastCategoryDeletion(categoryId);
  }

  // Broadcast category deletion via WebSocket
  private broadcastCategoryDeletion(categoryId: number) {
    const wss = (global as any).wss;
    if (wss && wss.clients) {
      const message = JSON.stringify({
        type: 'category_menu_updated',
        data: { 
          categoryId, 
          action: 'deleted',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }
  }

  // Find category menu by category ID
  private async findCategoryMenuByCategory(categoryId: number): Promise<MenuItem | null> {
    const category = await menuService.getCategoryById(categoryId);
    if (!category) return null;
    
    return await menuService.findBySlug(`documentation-category-${category.slug}`);
  }

  // Bulk sync all documentation to menu
  async bulkSyncAllDocumentation(): Promise<void> {
    const allDocs = await documentationService.getAll();
    
    for (const doc of allDocs) {
      try {
        // Skip invalid records
        if (!doc.title || !doc.slug) {
          console.warn(`Skipping invalid documentation record ${doc.id}: missing title or slug`);
          continue;
        }
        await this.syncDocumentationToMenu(doc);
      } catch (error) {
        console.error(`Failed to sync documentation ${doc.id} to menu:`, error);
      }
    }
  }

  // Update category menu when category is updated
  async updateCategoryMenu(category: DocumentationCategory): Promise<void> {
    const categoryPath = await this.buildCategoryPath(category);
    const allMenuItems = await menuService.getAllMenuItems();
    
    // Find menu items that need updating
    const categoryMenuItems = allMenuItems.filter(item => 
      item.type === 'category' && 
      (item.url === `/documentation/${category.slug}` || 
       item.url === `/documentation/${categoryPath}`)
    );
    
    // Update category menu items
    for (const menuItem of categoryMenuItems) {
      await menuService.update(menuItem.id, {
        title: category.name,
        url: `/documentation/${categoryPath}`
      });
    }
    
    // Update all documentation URLs in this category and subcategories
    await this.updateDocumentationUrlsInCategory(category.id);
    
    // Broadcast category menu update
    this.broadcastCategoryMenuUpdate(category);
  }

  // Update documentation URLs when category hierarchy changes
  private async updateDocumentationUrlsInCategory(categoryId: number): Promise<void> {
    const allDocs = await documentationService.getAll();
    const categoryDocs = allDocs.filter(doc => doc.category_id === categoryId);
    
    for (const doc of categoryDocs) {
      if (doc.menu_item_id) {
        const newUrl = await this.buildDocumentationUrl(doc);
        await menuService.update(doc.menu_item_id, { url: newUrl });
      }
    }
    
    // Also update subcategories
    const allCategories = await documentationService.getCategories();
    const subcategories = allCategories.filter(cat => cat.parent_id === categoryId);
    
    for (const subcategory of subcategories) {
      await this.updateDocumentationUrlsInCategory(subcategory.id);
    }
  }

  // Broadcast category menu updates via WebSocket
  private broadcastCategoryMenuUpdate(category: DocumentationCategory) {
    const wss = (global as any).wss;
    if (wss && wss.clients) {
      const message = JSON.stringify({
        type: 'category_menu_updated',
        data: { 
          categoryId: category.id, 
          action: 'updated',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
      wss.clients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }
  }

  // Clean up orphaned menu items (documentation menu items without corresponding docs)
  async cleanupOrphanedMenuItems(): Promise<{ cleaned: number; total: number }> {
    const allMenuItems = await menuService.getAllMenuItems();
    const docMenuItems = allMenuItems.filter(item => item.type === 'documentation');
    const allDocs = await documentationService.getAll();
    
    let cleanedCount = 0;
    
    for (const menuItem of docMenuItems) {
      const hasCorrespondingDoc = allDocs.some(doc => doc.menu_item_id === menuItem.id);
      if (!hasCorrespondingDoc) {
        console.log(`🧹 Cleaning up orphaned menu item: ${menuItem.id} (${menuItem.title})`);
        await menuService.delete(menuItem.id);
        cleanedCount++;
      }
    }
    
    console.log(`✅ Cleanup complete: ${cleanedCount}/${docMenuItems.length} orphaned menu items removed`);
    return { cleaned: cleanedCount, total: docMenuItems.length };
  }

  // Get cleanup statistics
  async getCleanupStats(): Promise<{ orphaned: number; total: number }> {
    const allMenuItems = await menuService.getAllMenuItems();
    const docMenuItems = allMenuItems.filter(item => item.type === 'documentation');
    const allDocs = await documentationService.getAll();
    
    const orphanedCount = docMenuItems.filter(menuItem => 
      !allDocs.some(doc => doc.menu_item_id === menuItem.id)
    ).length;
    
    return { orphaned: orphanedCount, total: docMenuItems.length };
  }
}

// Export singleton instance
export const documentationMenuService = new DocumentationMenuService();