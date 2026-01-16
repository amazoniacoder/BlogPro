// client/src/admin/pages/documentation/categories.tsx
import React, { useState, useEffect } from 'react';
import { 
  CategoryList, 
  CategoryForm,
  type DocumentationCategory,
  type CategoryFormData
} from '../../../ui-system/components/admin/documentation';
import { Button, Spinner } from '../../../ui-system/components';
import { documentationService } from '../../../services/documentationService';
import { useMenuUpdates } from '../../../hooks/useMenuUpdates';
import './categories.css';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<DocumentationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentationCategory | null>(null);

  // Listen for real-time menu updates
  useMenuUpdates({
    onCategoryUpdate: (categoryId) => {
      console.log('📋 Category menu updated:', categoryId);
      // Reload categories to reflect changes
      loadCategories();
    }
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await documentationService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: DocumentationCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSave = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await documentationService.updateCategory(editingCategory.id, data);
      } else {
        await documentationService.createCategory(data);
      }
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию? Все документы будут перемещены в "Без категории".')) {
      try {
        await documentationService.deleteCategory(id);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Ошибка удаления категории');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-categories">
        <div className="admin-categories__loading">
          <Spinner size="lg" />
          <p>Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-categories">
        <div className="admin-categories__error">
          <p>Ошибка: {error}</p>
          <Button onClick={loadCategories}>Попробовать снова</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      {!showForm && (
        <div className="admin-categories__header">
          <div className="admin-categories__title-section">
            <h1 className="admin-categories__title">Управление категориями</h1>
            <p className="admin-categories__description">
              Создавайте и редактируйте категории для организации документации
            </p>
          </div>
          <Button 
            variant="primary"
            onClick={handleCreate}
          >
            + Создать категорию
          </Button>
        </div>
      )}

      <div className="admin-categories__content">
        {showForm ? (
          <CategoryForm
            onSave={handleSave}
            onCancel={handleCancel}
            editingCategory={editingCategory}
          />
        ) : (
          <CategoryList
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
