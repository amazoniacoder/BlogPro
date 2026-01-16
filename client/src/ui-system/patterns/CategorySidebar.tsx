/**
 * BlogPro Category Sidebar Pattern
 * Category filtering sidebar for blog pages
 */

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export interface Category {
  id: number;
  name: string;
  count?: number;
}

export interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  className?: string;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  className = ''
}) => {
  const { t } = useTranslation('blog');
  return (
    <div className={`blog-page__categories ${className}`}>
      <button
        className={`blog-page__category-button ${selectedCategoryId === null ? 'blog-page__category-button--active' : ''}`}
        onClick={() => onCategorySelect(null)}
      >
        {t('allCategories', 'All Categories')}
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          className={`blog-page__category-button ${selectedCategoryId === category.id ? 'blog-page__category-button--active' : ''}`}
          onClick={() => onCategorySelect(category.id)}
        >
          {category.name}
          {category.count !== undefined && (
            <span className="blog-page__category-count"> ({category.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategorySidebar;
