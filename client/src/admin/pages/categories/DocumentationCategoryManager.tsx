// client/src/admin/pages/categories/DocumentationCategoryManager.tsx
import React, { useState, useEffect } from 'react';
import { 
  CategoryForm, 
  type DocumentationCategory,
  type CategoryFormData
} from '../../../ui-system/components/admin/documentation';
import { DocumentationCategoryTree } from '../../../ui-system/components/admin/categories';
import { Button, Spinner } from '../../../ui-system/components';
import { documentationService } from '../../../services/documentationService';

const DocumentationCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<DocumentationCategory[]>([]);
  const [categoryTree, setCategoryTree] = useState<DocumentationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentationCategory | null>(null);
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [flatCategories, treeCategories] = await Promise.all([
        documentationService.getCategories(),
        documentationService.getCategoryTree()
      ]);
      setCategories(flatCategories);
      setCategoryTree(treeCategories);
      setError(null);
    } catch (err) {
      console.error('Error loading documentation categories:', err);
      setError('Ошибка загрузки категорий документации');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setParentCategoryId(null);
    setShowForm(true);
  };

  const handleAddSubcategory = (parentId: number) => {
    setEditingCategory(null);
    setParentCategoryId(parentId);
    setShowForm(true);
  };

  const handleEdit = (category: DocumentationCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setParentCategoryId(null);
  };

  const handleSave = async (data: CategoryFormData) => {
    try {
      const categoryData = {
        ...data,
        parent_id: parentCategoryId ?? data.parent_id
      };
      
      if (editingCategory) {
        await documentationService.updateCategory(editingCategory.id, categoryData);
      } else {
        await documentationService.createCategory(categoryData);
      }
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
      setParentCategoryId(null);
    } catch (error) {
      console.error('Error saving documentation category:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию? Все документы будут перемещены в "Без категории".')) {
      try {
        await documentationService.deleteCategory(id);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting documentation category:', error);
        alert('Ошибка удаления категории');
      }
    }
  };

  if (loading) {
    return (
      <div className="documentation-category-manager">
        <div className="documentation-category-manager__loading">
          <Spinner size="lg" />
          <p>Загрузка категорий документации...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documentation-category-manager">
        <div className="documentation-category-manager__error">
          <p>Ошибка: {error}</p>
          <Button onClick={loadCategories}>Попробовать снова</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="documentation-category-manager">
      {!showForm && (
        <div className="documentation-category-manager__actions" style={{ display: 'none' }}>
          <button 
            className="admin-button admin-button--primary"
            onClick={handleCreate}
          >
            Создать категорию
          </button>
        </div>
      )}

      <div className="documentation-category-manager__content">
        {showForm ? (
          <CategoryForm
            onSave={handleSave}
            onCancel={handleCancel}
            editingCategory={editingCategory}
            categories={categories}
            defaultParentId={parentCategoryId}
          />
        ) : (
          <DocumentationCategoryTree
            categories={categoryTree}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddSubcategory={handleAddSubcategory}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentationCategoryManager;
