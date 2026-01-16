// server/api/categories/index.ts
import { Router } from 'express';
import { categoryService } from '../../services/categoryService';
import { createCategorySchema, updateCategorySchema, categoryQuerySchema } from '../../../shared/validation/categories';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

// GET /api/categories - Get all categories as tree
router.get('/', async (_, res) => {
  try {
    const categories = await categoryService.getCategoriesTree();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const query = categoryQuerySchema.parse(req.query);
    const category = await categoryService.getCategoryById(
      id, 
      query.includeChildren
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
});

// POST /api/categories - Create new category (Admin only)
router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(data);

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// PUT /api/categories/:id - Update category (Admin only)
router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const data = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(id, data);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// DELETE /api/categories/:id - Delete category (Admin only)
router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const success = await categoryService.deleteCategory(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

export default router;