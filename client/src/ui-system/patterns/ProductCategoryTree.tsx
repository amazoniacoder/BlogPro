import React from 'react';
import { ProductCategory } from '../../../../shared/types/product-category';
import { Icon } from '../icons/components';

interface ProductCategoryTreeProps {
  categories: ProductCategory[];
  selectedCategory?: string;
  onCategorySelect: (categorySlug: string) => void;
}

export const ProductCategoryTree: React.FC<ProductCategoryTreeProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  const renderCategory = (category: ProductCategory, level = 0) => (
    <div key={category.id} className="category-tree-public__item" style={{ paddingLeft: `${level * 16}px` }}>
      <button
        className={`category-tree-public__button ${
          selectedCategory === category.slug ? 'category-tree-public__button--active' : ''
        }`}
        onClick={() => onCategorySelect(category.slug)}
      >
        <Icon name="folder" size={16} />
        <span>{category.name}</span>
      </button>
      
      {category.children && category.children.length > 0 && (
        <div className="category-tree-public__children">
          {category.children.map(child => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  const rootCategories = categories.filter(cat => !cat.parentId);

  return (
    <div className="category-tree-public">
      <div className="category-tree-public__header">
        <h3 className="category-tree-public__title">Categories</h3>
        {selectedCategory && (
          <button
            className="category-tree-public__clear"
            onClick={() => onCategorySelect('')}
          >
            <Icon name="x" size={14} />
            Clear
          </button>
        )}
      </div>
      
      <div className="category-tree-public__list">
        <button
          className={`category-tree-public__button ${
            !selectedCategory ? 'category-tree-public__button--active' : ''
          }`}
          onClick={() => onCategorySelect('')}
        >
          <Icon name="grid" size={16} />
          <span>All Products</span>
        </button>
        
        {rootCategories.map(category => renderCategory(category))}
      </div>
    </div>
  );
};
