// client/src/admin/components/CategorySelector.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { categoriesService } from '@/services/api/categories';
import { CategoryTreeNode } from '@/../../shared/types/api';
import CategoryTreeSelector from '../pages/categories/components/CategoryTreeSelector';
// Category tree selector styles are now included in UI System

interface CategorySelectorProps {
  value?: number;
  onChange: (categoryId: number | undefined) => void;
  className?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const { t } = useTranslation('admin');
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getCategoriesTree();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="category-selector">
        <div className={`admin-form__select ${className}`} style={{ padding: '10px 14px', color: '#6b7280' }}>
          {t('loading', { ns: 'common' })}
        </div>
      </div>
    );
  }

  return (
    <div className={`category-selector ${className}`}>
      <CategoryTreeSelector
        categories={categories}
        selectedId={value}
        onSelect={onChange}
      />
    </div>
  );
};

export default CategorySelector;
