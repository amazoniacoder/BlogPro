/**
 * BlogPro UI System - Admin Category Tree Component
 * Hierarchical category management with expand/collapse functionality
 */

import React, { useState } from 'react';
import { Icon } from '../../icons/components';
import { CategoryTreeNode, BlogCategory } from '@/../../shared/types/api';

export interface CategoryTreeProps {
  categories: CategoryTreeNode[];
  onEdit: (category: BlogCategory) => void;
  onDelete: (category: BlogCategory) => void;
  className?: string;
}

interface CategoryItemProps {
  category: CategoryTreeNode;
  onEdit: (category: BlogCategory) => void;
  onDelete: (category: BlogCategory) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const getTotalSubcategoryCount = (cat: CategoryTreeNode): number => {
    if (!cat.children || cat.children.length === 0) return 0;
    let count = cat.children.length;
    cat.children.forEach(child => {
      count += getTotalSubcategoryCount(child);
    });
    return count;
  };

  return (
    <div className="admin-category-item">
      <div className="admin-category-item__header">
        <div 
          className="admin-category-item__info"
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
          style={{ cursor: hasChildren ? 'pointer' : 'default' }}
        >
          {hasChildren && (
            <div className="admin-category-item__toggle">
              <Icon 
                name="arrow-right" 
                size={16}
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>
          )}
          {!hasChildren && (
            <div className="admin-category-item__spacer"></div>
          )}
          <div className="admin-category-item__details">
            <div className="admin-category-item__icon">
              <Icon name={hasChildren ? "folder" : "file"} size={18} />
            </div>
            <div className="admin-category-item__text">
              <span className="admin-category-item__name">
                {category.name}
              </span>
              <span className="admin-category-item__slug">/{category.slug}</span>
            </div>
          </div>
          <span className="admin-category-item__count leading-none">
            {getTotalSubcategoryCount(category)}
          </span>
        </div>
        <div className="admin-category-item__actions">
          <button
            className="admin-category-item__action admin-category-item__action--edit cursor-pointer"
            onClick={() => onEdit(category)}
            title="Edit Category"
          >
            <Icon name="edit" size={12} />
          </button>
          <button
            className="admin-category-item__action admin-category-item__action--delete cursor-pointer"
            onClick={() => onDelete(category)}
            title="Delete Category"
          >
            <Icon name="delete" size={12} />
          </button>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="admin-category-item__children">
          {category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: React.FC<CategoryTreeProps> = ({ 
  categories, 
  onEdit, 
  onDelete, 
  className = '' 
}) => {
  if (!categories.length) {
    return (
      <div className={`admin-category-tree ${className}`.trim()}>
        <div className="admin-category-tree__empty">
          <div className="admin-category-tree__empty-icon">📁</div>
          <p className="admin-category-tree__empty-text">No categories found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-category-tree ${className}`.trim()}>
      {categories.map(category => (
        <CategoryItem
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CategoryTree;
