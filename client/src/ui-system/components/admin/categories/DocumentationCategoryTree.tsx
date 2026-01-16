/**
 * BlogPro Documentation Category Tree Component
 * Hierarchical tree display for documentation categories
 */

import React, { useState } from 'react';
import { Icon, type IconName } from '../../../icons/components';
import type { DocumentationCategory } from '../../../../../../shared/types/documentation';

interface CategoryTreeNodeProps {
  category: DocumentationCategory;
  level: number;
  onEdit: (category: DocumentationCategory) => void;
  onDelete: (id: number) => void;
  onAddSubcategory: (parentId: number) => void;
}

const getIconByName = (name: string): IconName => {
  const lowerName = name.toLowerCase();
  
  if (lowerName === 'начало работы') return 'rocket-diamond';
  if (lowerName === 'справочник api') return 'file-search';
  if (lowerName === 'руководство пользователя') return 'file-users';
  if (lowerName === 'руководство администратора') return 'file-crown';
  if (lowerName === 'разработка') return 'gear';
  if (lowerName === 'часто задаваемые вопросы') return 'info';
  
  if (lowerName.includes('начало')) return 'rocket-diamond';
  if (lowerName.includes('справочник')) return 'file-search';
  if (lowerName.includes('руководство пользователя')) return 'file-users';
  if (lowerName.includes('руководство администратора')) return 'file-crown';
  if (lowerName.includes('разработка')) return 'gear';
  if (lowerName.includes('руководство')) return 'book';
  
  return 'folder';
};

const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({
  category,
  level,
  onEdit,
  onDelete,
  onAddSubcategory
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const getTotalSubcategoryCount = (cat: DocumentationCategory): number => {
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
          {hasChildren ? (
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
          ) : (
            <div className="admin-category-item__spacer" />
          )}
          
          <div className="admin-category-item__details">
            <div className="admin-category-item__icon">
              <Icon name={getIconByName(category.name)} size={18} />
            </div>
            <div className="admin-category-item__text">
              <span className="admin-category-item__name">{category.name}</span>
              <span className="admin-category-item__slug">/{category.slug}</span>
            </div>
          </div>
          <span className="admin-category-item__count leading-none">
            {getTotalSubcategoryCount(category)}
          </span>
        </div>
        
        <div className="admin-category-item__actions">
          <button
            className="admin-category-item__action admin-category-item__action--edit"
            onClick={() => onAddSubcategory(category.id)}
            title="Add Subcategory"
          >
            <Icon name="add" size={12} />
          </button>
          <button
            className="admin-category-item__action admin-category-item__action--edit"
            onClick={() => onEdit(category)}
            title="Edit Category"
          >
            <Icon name="edit" size={12} />
          </button>
          <button
            className="admin-category-item__action admin-category-item__action--delete"
            onClick={() => onDelete(category.id)}
            title="Delete Category"
          >
            <Icon name="delete" size={12} />
          </button>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="admin-category-item__children">
          {category.children!.map(child => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubcategory={onAddSubcategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export interface DocumentationCategoryTreeProps {
  categories: DocumentationCategory[];
  onEdit: (category: DocumentationCategory) => void;
  onDelete: (id: number) => void;
  onAddSubcategory: (parentId: number) => void;
}

export const DocumentationCategoryTree: React.FC<DocumentationCategoryTreeProps> = ({
  categories,
  onEdit,
  onDelete,
  onAddSubcategory
}) => {
  if (categories.length === 0) {
    return (
      <div className="admin-category-tree">
        <div className="admin-category-tree__empty">
          <div className="admin-category-tree__empty-icon">📁</div>
          <p className="admin-category-tree__empty-text">
            Категории не найдены. Создайте первую категорию для организации документации.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-category-tree">
      {categories.map(category => (
        <CategoryTreeNode
          key={category.id}
          category={category}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubcategory={onAddSubcategory}
        />
      ))}
    </div>
  );
};
