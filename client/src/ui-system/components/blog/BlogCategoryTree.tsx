import React, { useState } from 'react';
import { Icon } from '../../icons/components';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  children?: BlogCategory[];
  parentId?: string;
}

interface BlogCategoryTreeProps {
  categories: BlogCategory[];
  selectedCategory?: string;
  onCategorySelect: (categoryId: string | null) => void;
}

export const BlogCategoryTree: React.FC<BlogCategoryTreeProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const isCurrentlyExpanded = expandedCategories.has(categoryId);
    if (isCurrentlyExpanded) {
      // Close the category
      const newExpanded = new Set(expandedCategories);
      newExpanded.delete(categoryId);
      setExpandedCategories(newExpanded);
    } else {
      // Close all others and open this one (accordion behavior)
      setExpandedCategories(new Set([categoryId]));
    }
  };

  const renderCategory = (category: BlogCategory, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;

    return (
      <div key={category.id} className="blog-category-tree__item">
        <div 
          className={`blog-category-tree__content ${isSelected ? 'blog-category-tree__content--selected' : ''}`}
          style={{ '--level': level } as React.CSSProperties}
        >
          <button
            className="blog-category-tree__button"
            onClick={() => onCategorySelect(category.id)}
          >
            <span className="blog-category-tree__count">{category.count}</span>
            <Icon name="folder" size={16} />
            <span className="blog-category-tree__name">{category.name}</span>
          </button>
          
          {hasChildren && (
            <button
              className="blog-category-tree__arrow"
              onClick={() => toggleExpanded(category.id)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <Icon name={isExpanded ? 'arrow-down' : 'arrow-right'} size={12} />
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="blog-category-tree__children">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootCategories = categories.filter(cat => !cat.parentId);

  return (
    <div className="blog-category-tree">
      <button
        className={`blog-category-tree__all ${!selectedCategory ? 'blog-category-tree__all--selected' : ''}`}
        onClick={() => onCategorySelect(null)}
      >
        <Icon name="grid" size={16} />
        <span>All Posts</span>
      </button>
      
      {rootCategories.map(category => renderCategory(category))}
    </div>
  );
};