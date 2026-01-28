// client/src/admin/pages/categories/index.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategoryData } from './hooks/useCategoryData';
import CategoryTree from './components/CategoryTree';
import CategoryForm from './components/CategoryForm';
import DocumentationCategoryManager from './DocumentationCategoryManager';
import ProductCategoriesPage from './ProductCategoriesPage';
import { ErrorDisplay } from '@/ui-system/components/feedback';
import { useNotification } from "@/ui-system/components/feedback";
import { BlogCategory } from '@/../../shared/types/api';
import './categories.css';

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const {
    state,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories
  } = useCategoryData();
  
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState<'blog' | 'documentation' | 'products'>('blog');

  // URL-based tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['blog', 'documentation', 'products'].includes(tab)) {
      setActiveTab(tab as 'blog' | 'documentation' | 'products');
    }
  }, []);

  const handleTabChange = (tab: 'blog' | 'documentation' | 'products') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (category: BlogCategory) => {
    if (!confirm(t('admin:confirmDeleteCategory', { name: category.name }))) {
      return;
    }

    try {
      await deleteCategory(category.id);
      showSuccess(t('admin:categoryDeleted'));
      refreshCategories();
    } catch (error) {
      showError(t('admin:categoryDeleteError'));
    }
  };

  const handleSaveCategory = async (data: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        showSuccess(t('admin:categoryUpdated'));
      } else {
        await createCategory(data);
        showSuccess(t('admin:categoryCreated'));
      }
      setShowForm(false);
      setEditingCategory(null);
      refreshCategories();
    } catch (error) {
      showError(editingCategory ? t('admin:categoryUpdateError') : t('admin:categoryCreateError'));
    }
  };

  return (
    <div className="admin-section admin-categories">
      {state.error && (
        <ErrorDisplay
          error={{ message: state.error, code: 'CATEGORY_ERROR' }}
          onDismiss={() => {}}
        />
      )}



      <div className="admin-categories__tabs">
        <div className="admin-categories__tab-group" role="tablist" aria-label="Category management tabs">
          <button 
            className={`admin-categories__tab ${activeTab === 'blog' ? 'admin-categories__tab--active' : ''}`}
            onClick={() => handleTabChange('blog')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleTabChange('documentation');
              }
            }}
            role="tab"
            aria-selected={activeTab === 'blog'}
          >
            Категории блога
          </button>
          <button 
            className={`admin-categories__tab ${activeTab === 'documentation' ? 'admin-categories__tab--active' : ''}`}
            onClick={() => handleTabChange('documentation')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handleTabChange('blog');
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleTabChange('products');
              }
            }}
            role="tab"
            aria-selected={activeTab === 'documentation'}
          >
            Категории документации
          </button>
          <button 
            className={`admin-categories__tab ${activeTab === 'products' ? 'admin-categories__tab--active' : ''}`}
            onClick={() => handleTabChange('products')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handleTabChange('documentation');
              }
            }}
            role="tab"
            aria-selected={activeTab === 'products'}
          >
            Категории товаров
          </button>
        </div>
        
        <div className="admin-categories__actions">
          {activeTab === 'blog' && !showForm && (
            <button 
              className="admin-button admin-button--primary"
              onClick={handleCreateCategory}
            >
              {t('admin:addCategory')}
            </button>
          )}
          {activeTab === 'documentation' && (
            <button 
              className="admin-button admin-button--primary"
              onClick={() => {
                const docManager = document.querySelector('.documentation-category-manager__actions button');
                if (docManager) {
                  (docManager as HTMLButtonElement).click();
                }
              }}
            >
              Создать категорию
            </button>
          )}
          {activeTab === 'products' && (
            <button 
              className="admin-button admin-button--primary"
              onClick={() => {
                const productManager = document.querySelector('.categories-manager__header button');
                if (productManager) {
                  (productManager as HTMLButtonElement).click();
                }
              }}
            >
              Создать категорию
            </button>
          )}
        </div>
      </div>

      <div className="admin-categories__content">
        {activeTab === 'blog' ? (
          <div className="blog-category-manager">
            {showForm && (
              <CategoryForm
                category={editingCategory}
                categories={state.categories}
                onSave={handleSaveCategory}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
              />
            )}

            <div className="admin-card">
              <div className="admin-card__body">
                {state.loading ? (
                  <div className="admin-loading">
                    <div className="admin-loading__spinner"></div>
                    <p>{t('common:loading')}</p>
                  </div>
                ) : (
                  <CategoryTree
                    categories={state.categories}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'documentation' ? (
          <DocumentationCategoryManager />
        ) : (
          <ProductCategoriesPage />
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
