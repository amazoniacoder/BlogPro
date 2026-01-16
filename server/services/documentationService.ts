// server/services/documentationService.ts
import { pool } from '../db/db';

export interface DocumentationCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order_index: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  children?: DocumentationCategory[];
}

export interface Documentation {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category_id?: number;
  parent_id?: number;
  order_index: number;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  menu_item_id?: number;
  auto_menu: boolean;
  menu_title?: string;
  menu_parent_id?: number;
  created_at: string;
  updated_at: string;
  category?: DocumentationCategory;
}

// Helper functions to transform between snake_case and camelCase
const transformCategory = (row: any): DocumentationCategory => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  icon: row.icon,
  order_index: row.order_index,
  parent_id: row.parent_id,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const transformDocumentation = (row: any): Documentation => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  content: row.content,
  excerpt: row.excerpt,
  category_id: row.category_id,
  parent_id: row.parent_id,
  order_index: row.order_index,
  is_published: row.is_published,
  meta_title: row.meta_title,
  meta_description: row.meta_description,
  menu_item_id: row.menu_item_id,
  auto_menu: row.auto_menu ?? true,
  menu_title: row.menu_title,
  menu_parent_id: row.menu_parent_id,
  created_at: row.created_at,
  updated_at: row.updated_at
});

export const documentationService = {
  // Get all categories
  async getCategories(): Promise<DocumentationCategory[]> {
    const result = await pool.query(
      'SELECT * FROM documentation_categories ORDER BY order_index ASC'
    );
    return result.rows.map(transformCategory);
  },

  // Get all documentation with categories
  async getAll(): Promise<Documentation[]> {
    const result = await pool.query(`
      SELECT d.*, dc.name as category_name, dc.slug as category_slug
      FROM documentation d
      LEFT JOIN documentation_categories dc ON d.category_id = dc.id
      ORDER BY dc.order_index ASC, d.order_index ASC
    `);
    return result.rows.map(transformDocumentation);
  },

  // Get published documentation for public view
  async getPublished(): Promise<Documentation[]> {
    const result = await pool.query(`
      SELECT d.*, dc.name as category_name, dc.slug as category_slug
      FROM documentation d
      LEFT JOIN documentation_categories dc ON d.category_id = dc.id
      WHERE d.is_published = true
      ORDER BY dc.order_index ASC, d.order_index ASC
    `);
    return result.rows.map(transformDocumentation);
  },

  // Get documentation by slug
  async getBySlug(slug: string): Promise<Documentation | null> {
    const result = await pool.query(`
      SELECT d.*, dc.name as category_name, dc.slug as category_slug
      FROM documentation d
      LEFT JOIN documentation_categories dc ON d.category_id = dc.id
      WHERE d.slug = $1
    `, [slug]);
    return result.rows[0] ? transformDocumentation(result.rows[0]) : null;
  },

  // Get category by ID (for menu service integration)
  async getCategoryById(id: number): Promise<DocumentationCategory | null> {
    const result = await pool.query('SELECT * FROM documentation_categories WHERE id = $1', [id]);
    return result.rows[0] ? transformCategory(result.rows[0]) : null;
  },

  // Create new documentation
  async create(data: Partial<Documentation>): Promise<Documentation> {
    console.log('Service create called with:', data);
    try {
      const result = await pool.query(`
        INSERT INTO documentation (title, slug, content, excerpt, category_id, is_published, auto_menu, menu_title, menu_parent_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        data.title,
        data.slug,
        data.content || '',
        data.excerpt || '',
        data.category_id || null,
        data.is_published !== false,
        data.auto_menu !== false,
        data.menu_title || null,
        data.menu_parent_id || null
      ]);
      console.log('Database result:', result.rows[0]);
      const doc = transformDocumentation(result.rows[0]);
      
      // Auto-sync to menu if published and auto_menu is enabled
      if (doc.is_published && doc.auto_menu) {
        try {
          const { documentationMenuService } = await import('./documentationMenuService');
          await documentationMenuService.syncDocumentationToMenu(doc);
        } catch (menuError) {
          console.error('Menu sync failed, but document created:', menuError);
          // Don't throw - document was created successfully
        }
      }
      
      return doc;
    } catch (error) {
      console.error('Database error in create:', error);
      throw error;
    }
  },

  // Update documentation with retry logic
  async update(id: number, data: Partial<Documentation>, retries = 2): Promise<Documentation> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await pool.query(`
          UPDATE documentation 
          SET title = $2, slug = $3, content = $4, excerpt = $5, category_id = $6, 
              parent_id = $7, order_index = $8, is_published = $9, meta_title = $10, meta_description = $11,
              auto_menu = $12, menu_title = $13, menu_parent_id = $14, menu_item_id = $15
          WHERE id = $1
          RETURNING *
        `, [
          id,
          data.title,
          data.slug,
          data.content,
          data.excerpt,
          data.category_id || null,
          data.parent_id || null,
          data.order_index || 0,
          data.is_published !== undefined ? data.is_published : true,
          data.meta_title || null,
          data.meta_description || null,
          data.auto_menu !== undefined ? data.auto_menu : true,
          data.menu_title || null,
          data.menu_parent_id || null,
          data.menu_item_id || null
        ]);
        
        const doc = transformDocumentation(result.rows[0]);
        
        // Sync menu changes with retry
        try {
          const { documentationMenuService } = await import('./documentationMenuService');
          await documentationMenuService.syncDocumentationToMenu(doc);
        } catch (menuError) {
          console.error(`Menu sync failed during update (attempt ${attempt + 1}):`, menuError);
          if (attempt === retries) {
            console.error('❌ Menu sync failed after all retries');
          }
          // Don't throw - document was updated successfully
        }
        
        return doc;
      } catch (error) {
        console.error(`Error updating documentation (attempt ${attempt + 1}):`, error);
        if (attempt === retries) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    throw new Error('Update failed after all retries');
  },

  // Delete documentation
  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM documentation WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },



  // Validate menu-document relationships
  async validateMenuRelationships(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      const allDocs = await this.getAll();
      const { menuService } = await import('./menuService');
      const allMenuItems = await menuService.getAllMenuItems();
      
      // Check for docs with invalid menu_item_id
      for (const doc of allDocs) {
        if (doc.menu_item_id) {
          const menuExists = allMenuItems.some(item => item.id === doc.menu_item_id);
          if (!menuExists) {
            issues.push(`Document ${doc.id} (${doc.title}) references non-existent menu item ${doc.menu_item_id}`);
          }
        }
      }
      
      // Check for orphaned documentation menu items
      const docMenuItems = allMenuItems.filter(item => item.type === 'documentation');
      for (const menuItem of docMenuItems) {
        const docExists = allDocs.some(doc => doc.menu_item_id === menuItem.id);
        if (!docExists) {
          issues.push(`Menu item ${menuItem.id} (${menuItem.title}) has no corresponding documentation`);
        }
      }
      
      return { valid: issues.length === 0, issues };
    } catch (error) {
      console.error('Error validating menu relationships:', error);
      return { valid: false, issues: ['Validation failed due to error'] };
    }
  },

  // Get documentation by ID
  async getById(id: number): Promise<Documentation | null> {
    const result = await pool.query(`
      SELECT d.*, dc.name as category_name, dc.slug as category_slug
      FROM documentation d
      LEFT JOIN documentation_categories dc ON d.category_id = dc.id
      WHERE d.id = $1
    `, [id]);
    return result.rows[0] ? transformDocumentation(result.rows[0]) : null;
  },



  // Get category tree with hierarchy
  async getCategoryTree(): Promise<DocumentationCategory[]> {
    const categories = await this.getCategories();
    return this.buildCategoryTree(categories);
  },

  // Build hierarchical category tree
  buildCategoryTree(categories: DocumentationCategory[]): DocumentationCategory[] {
    const categoryMap = new Map<number, DocumentationCategory>();
    const rootCategories: DocumentationCategory[] = [];
    
    // Create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });
    
    // Build hierarchy
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });
    
    return rootCategories;
  },

  // Validate hierarchy to prevent circular references
  async validateHierarchy(categoryId: number, parentId: number): Promise<boolean> {
    if (categoryId === parentId) return false;
    
    // Check if parentId is a descendant of categoryId
    const checkDescendant = async (checkId: number): Promise<boolean> => {
      const result = await pool.query('SELECT parent_id FROM documentation_categories WHERE id = $1', [checkId]);
      if (result.rows.length === 0) return false;
      
      const parent = result.rows[0].parent_id;
      if (!parent) return false;
      if (parent === categoryId) return true;
      
      return await checkDescendant(parent);
    };
    
    return !(await checkDescendant(parentId));
  },

  // Create category
  async createCategory(data: Partial<DocumentationCategory>): Promise<DocumentationCategory> {
    // Validate hierarchy if parent_id is provided
    if (data.parent_id) {
      const parentExists = await pool.query('SELECT id FROM documentation_categories WHERE id = $1', [data.parent_id]);
      if (parentExists.rows.length === 0) {
        throw new Error('Parent category does not exist');
      }
    }
    
    const result = await pool.query(`
      INSERT INTO documentation_categories (name, slug, description, icon, order_index, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.name,
      data.slug,
      data.description || '',
      data.icon || '',
      data.order_index || 0,
      data.parent_id || null
    ]);
    return transformCategory(result.rows[0]);
  },

  // Update category
  async updateCategory(id: number, data: Partial<DocumentationCategory>): Promise<DocumentationCategory> {
    // Validate hierarchy if parent_id is being changed
    if (data.parent_id !== undefined && data.parent_id !== null) {
      const isValid = await this.validateHierarchy(id, data.parent_id);
      if (!isValid) {
        throw new Error('Invalid hierarchy: would create circular reference');
      }
      
      const parentExists = await pool.query('SELECT id FROM documentation_categories WHERE id = $1', [data.parent_id]);
      if (parentExists.rows.length === 0) {
        throw new Error('Parent category does not exist');
      }
    }
    
    const result = await pool.query(`
      UPDATE documentation_categories 
      SET name = $2, slug = $3, description = $4, icon = $5, order_index = $6, parent_id = $7
      WHERE id = $1
      RETURNING *
    `, [
      id,
      data.name,
      data.slug,
      data.description,
      data.icon,
      data.order_index,
      data.parent_id || null
    ]);
    
    const category = transformCategory(result.rows[0]);
    
    // Update associated menu items
    const { documentationMenuService } = await import('./documentationMenuService');
    await documentationMenuService.updateCategoryMenu(category);
    
    return category;
  },

  // Delete category with transaction support
  async deleteCategory(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { documentationMenuService } = await import('./documentationMenuService');
      
      // Handle category deletion with menu cleanup
      await documentationMenuService.handleCategoryDeletion(id);
      
      const result = await client.query('DELETE FROM documentation_categories WHERE id = $1', [id]);
      const success = (result.rowCount ?? 0) > 0;
      
      if (success) {
        await client.query('COMMIT');
        console.log('✅ Category deleted successfully:', id);
      } else {
        await client.query('ROLLBACK');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Category deletion failed, rolling back:', error);
      await client.query('ROLLBACK');
      return false;
    } finally {
      client.release();
    }
  }
};