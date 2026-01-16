import React, { useState, useEffect } from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { CategoryForm } from './CategoryForm';
import { CategoryTree } from './CategoryTree';
import websocketService from '@/services/websocket-service';
import { ProductCategory } from '../../../../../../shared/types/product-category';
import '../categories.css';

export const CategoriesManager: React.FC = () => {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, fetchCategories } = useProductCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  useEffect(() => {
    websocketService.connect();

    const handleCategoryChange = () => {
      fetchCategories();
    };

    websocketService.subscribe('category_created', handleCategoryChange);
    websocketService.subscribe('category_updated', handleCategoryChange);
    websocketService.subscribe('category_deleted', handleCategoryChange);

    return () => {
      websocketService.unsubscribe('category_created', handleCategoryChange);
      websocketService.unsubscribe('category_updated', handleCategoryChange);
      websocketService.unsubscribe('category_deleted', handleCategoryChange);
    };
  }, [fetchCategories]);

  const handleCreate = async (categoryData: any) => {
    try {
      await createCategory(categoryData);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdate = async (categoryData: any) => {
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, categoryData);
      setEditingCategory(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  if (loading) {
    return <div className="categories-manager__loading">Loading categories...</div>;
  }

  if (error) {
    return <div className="categories-manager__error">Error: {error}</div>;
  }

  return (
    <div className="categories-manager">

      {showForm && (
        <div className="categories-manager__form">
          <CategoryForm
            category={editingCategory}
            categories={categories}
            onSubmit={editingCategory ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="categories-manager__content">
        <CategoryTree
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
