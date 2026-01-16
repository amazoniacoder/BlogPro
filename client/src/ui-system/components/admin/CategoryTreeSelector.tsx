/**
 * BlogPro UI System - Admin Category Tree Selector Component
 * Hierarchical category selector with expand/collapse functionality
 */

import React, { useState } from 'react';
import { CategoryTreeNode } from '@/../../shared/types/api';

export interface CategoryTreeSelectorProps {
  categories: CategoryTreeNode[];
  selectedId?: number;
  onSelect: (categoryId: number | undefined) => void;
  excludeId?: number;
}

interface CategoryTreeItemProps {
  category: CategoryTreeNode;
  level: number;
  selectedId?: number;
  onSelect: (categoryId: number) => void;
  excludeId?: number;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  level,
  selectedId,
  onSelect,
  excludeId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isExcluded = excludeId === category.id;
  const isSelected = selectedId === category.id;

  if (isExcluded) return null;

  return (
    <div className="category-tree-selector__item">
      <div 
        className={`category-tree-selector__row ${isSelected ? 'category-tree-selector__row--selected' : ''}`}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={() => onSelect(category.id)}
      >
        {hasChildren && (
          <button
            className="category-tree-selector__toggle"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        )}
        <span className="category-tree-selector__name">{category.name}</span>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="category-tree-selector__children">
          {category.children.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              excludeId={excludeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTreeSelector: React.FC<CategoryTreeSelectorProps> = ({
  categories,
  selectedId,
  onSelect,
  excludeId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const findCategoryById = (cats: CategoryTreeNode[], id?: number): CategoryTreeNode | null => {
    if (!id) return null;
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedCategory = findCategoryById(categories, selectedId);
  
  return (
    <div className="category-tree-selector">
      <button
        type="button"
        className="category-tree-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="category-tree-selector__value">
          {selectedCategory ? selectedCategory.name : 'No parent (root category)'}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      
      {isOpen && (
        <div className="category-tree-selector__dropdown">
          <div 
            className="category-tree-selector__row"
            onClick={() => {
              onSelect(undefined);
              setIsOpen(false);
            }}
          >
            <span className="category-tree-selector__name">No parent (root category)</span>
          </div>
          
          {categories.map(category => (
            <CategoryTreeItem
              key={category.id}
              category={category}
              level={0}
              selectedId={selectedId}
              onSelect={(id) => {
                onSelect(id);
                setIsOpen(false);
              }}
              excludeId={excludeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryTreeSelector;
