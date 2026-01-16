import React, { useState } from 'react';
import { Icon } from '../../icons/components';
import type { Documentation, DocumentationCategory } from '../../../../../shared/types/documentation';
import { useTranslation } from '@/hooks/useTranslation';
import './documentation-tree.css';

interface DocumentationTreeProps {
  categories: DocumentationCategory[];
  documents: Documentation[];
  activeDocId?: number;
  onDocumentClick?: (doc: Documentation) => void;
  className?: string;
}

export const DocumentationTree: React.FC<DocumentationTreeProps> = ({
  categories,
  documents,
  activeDocId,
  onDocumentClick,
  className = ''
}) => {
  const { t } = useTranslation('common');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set<number>();
    if (!expandedCategories.has(categoryId)) {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDocumentClick = (doc: Documentation) => {
    onDocumentClick?.(doc);
  };

  const renderCategory = (category: DocumentationCategory, level = 0) => {
    const categoryDocs = documents.filter(doc => doc.category_id === category.id);
    const isExpanded = expandedCategories.has(category.id);
    const hasContent = categoryDocs.length > 0 || (category.children && category.children.length > 0);

    if (!hasContent) return null;

    return (
      <div key={category.id} className={`documentation-tree__category documentation-tree__category--level-${level}`}>
        <button
          className="documentation-tree__category-toggle"
          onClick={() => toggleCategory(category.id)}
        >
          <Icon 
            name="arrow-right" 
            size={16} 
            className={`documentation-tree__arrow ${isExpanded ? 'documentation-tree__arrow--expanded' : ''}`}
          />
          <span className="documentation-tree__category-name">{category.name}</span>
        </button>

        {isExpanded && (
          <div className="documentation-tree__category-content">
            {/* Documents in this category */}
            {categoryDocs.map(doc => (
              <button
                key={doc.id}
                className={`documentation-tree__document ${activeDocId === doc.id ? 'documentation-tree__document--active' : ''}`}
                onClick={() => handleDocumentClick(doc)}
              >
                <Icon name="file" size={14} />
                <span className="documentation-tree__document-title">{doc.title}</span>
              </button>
            ))}

            {/* Subcategories */}
            {category.children?.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`documentation-tree ${className}`}>
      <div className="documentation-tree__header">
        <h3 className="documentation-tree__title">{t('documentation', 'Documentation')}</h3>
      </div>
      <div className="documentation-tree__content">
        {categories.map(category => renderCategory(category))}
      </div>
    </div>
  );
};
