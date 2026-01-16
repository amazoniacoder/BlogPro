import React from 'react';
import { ProductCategory } from '../../../../../../shared/types/product-category';
import { Icon } from '../../../icons/components';

interface CategoryTreeProps {
  categories: ProductCategory[];
  onEdit: (category: ProductCategory) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onEdit,
  onDelete
}) => {
  const renderCategory = (category: ProductCategory, level = 0) => {
    return (
      <div key={category.id} className="category-tree__item" style={{ '--level': level } as React.CSSProperties}>
        <div className="category-tree__content">
          <div className="category-tree__info">
            <div className="category-tree__name">
              {level > 0 && <span className="category-tree__indent">{'└─ '.repeat(level)}</span>}
              {category.name}
            </div>
            <div className="category-tree__meta">
              <span className="category-tree__slug">/{category.slug}</span>
              <span className={`category-tree__status ${category.isActive ? 'active' : 'inactive'}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {category.description && (
              <div className="category-tree__description">
                {category.description}
              </div>
            )}
          </div>
          
          <div className="category-tree__actions">
            <button
              className="admin-category-item__action admin-category-item__action--edit cursor-pointer"
              onClick={() => onEdit(category)}
              title="Edit category"
            >
              <Icon name="edit" size={12} />
            </button>
            <button
              className="admin-category-item__action admin-category-item__action--delete cursor-pointer"
              onClick={() => onDelete(category.id)}
              title="Delete category"
            >
              <Icon name="delete" size={12} />
            </button>
          </div>
        </div>
        
        {category.children && category.children.length > 0 && (
          <div className="category-tree__children">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="category-tree__empty">
        <Icon name="folder" size={48} />
        <p>No categories yet. Create your first category to get started.</p>
      </div>
    );
  }

  const rootCategories = categories.filter(cat => !cat.parentId);

  return (
    <div className="category-tree">
      {rootCategories.map(category => renderCategory(category))}
    </div>
  );
};
