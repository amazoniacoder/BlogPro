/**
 * BlogPro Documentation Category Tree Selector Component
 * Hierarchical tree dropdown for documentation categories
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icon, type IconName } from '../../../icons/components';
import type { DocumentationCategory } from '../../../../../../shared/types/documentation';
import './DocumentationCategoryTreeSelector.css';

export interface DocumentationCategoryTreeSelectorProps {
  categories: DocumentationCategory[];
  selectedId?: number;
  onSelect: (categoryId: number | undefined) => void;
  placeholder?: string;
  allowEmpty?: boolean;
}

interface CategoryTreeItemProps {
  category: DocumentationCategory;
  level: number;
  selectedId?: number;
  onSelect: (categoryId: number) => void;
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

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  level,
  selectedId,
  onSelect
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  const handleRowClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(category.id);
  };

  return (
    <div className="doc-category-tree-selector__item">
      <div 
        className={`doc-category-tree-selector__row ${isSelected ? 'doc-category-tree-selector__row--selected' : ''} ${hasChildren ? 'doc-category-tree-selector__row--expandable' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={handleRowClick}
      >
        <div className="doc-category-tree-selector__icon">
          <Icon name={getIconByName(category.name)} size={16} />
        </div>
        
        <button 
          type="button"
          className="doc-category-tree-selector__name-button"
          onClick={handleNameClick}
        >
          {category.name}
        </button>
        
        <div className="doc-category-tree-selector__spacer" />
        
        {hasChildren && (
          <div className="doc-category-tree-selector__expand-area">
            <Icon 
              name="arrow-right" 
              size={16}
              className={`doc-category-tree-selector__expand-icon ${isExpanded ? 'doc-category-tree-selector__expand-icon--expanded' : ''}`}
            />
          </div>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="doc-category-tree-selector__children">
          {category.children!.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentationCategoryTreeSelector: React.FC<DocumentationCategoryTreeSelectorProps> = ({
  categories,
  selectedId,
  onSelect,
  placeholder = "Выберите категорию",
  allowEmpty = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const buildCategoryTree = (cats: DocumentationCategory[]): DocumentationCategory[] => {
    const categoryMap = new Map<number, DocumentationCategory>();
    const rootCategories: DocumentationCategory[] = [];
    
    cats.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });
    
    cats.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });
    
    return rootCategories;
  };
  
  const findCategoryById = (cats: DocumentationCategory[], id?: number): DocumentationCategory | null => {
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

  const categoryTree = buildCategoryTree(categories);
  const selectedCategory = findCategoryById(categories, selectedId);
  
  return (
    <div className="doc-category-tree-selector" ref={dropdownRef}>
      <button
        type="button"
        className="doc-category-tree-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="doc-category-tree-selector__value">
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <Icon
          name="arrow-down"
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>
      
      {isOpen && (
        <div className="doc-category-tree-selector__dropdown">
          {allowEmpty && (
            <div className="doc-category-tree-selector__row">
              <div className="doc-category-tree-selector__icon">
                <Icon name="folder" size={16} />
              </div>
              <button 
                type="button"
                className="doc-category-tree-selector__name-button"
                onClick={() => {
                  onSelect(undefined);
                  setIsOpen(false);
                }}
              >
                Все категории
              </button>
              <div className="doc-category-tree-selector__spacer" />
            </div>
          )}
          
          {categoryTree.map(category => (
            <CategoryTreeItem
              key={category.id}
              category={category}
              level={0}
              selectedId={selectedId}
              onSelect={(id) => {
                onSelect(id);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
