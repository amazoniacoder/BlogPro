/**
 * BlogPro Documentation List Component
 * UI System component for displaying documentation list with filtering
 */

import React from 'react';
import { DocumentationCard } from './DocumentationCard';
import { DocumentationFilters } from './DocumentationFilters';
import type { Documentation, DocumentationCategory } from '../../../../../../shared/types/documentation';

export interface DocumentationListProps {
  documentation: Documentation[];
  categories: DocumentationCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onEdit: (doc: Documentation) => void;
  onDelete: (id: number) => void;
  onCreateDocument: () => void;
}

export const DocumentationList: React.FC<DocumentationListProps> = ({
  documentation,
  categories,
  selectedCategory,
  onCategoryChange,
  onEdit,
  onDelete,
  onCreateDocument
}) => {
  const filteredDocs = selectedCategory === 'all' 
    ? (documentation || []).filter(doc => doc && doc.id) 
    : (documentation || []).filter(doc => doc && doc.id && doc.category_id === parseInt(selectedCategory));

  return (
    <div className="documentation-list">
      <DocumentationFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        onCreateDocument={onCreateDocument}
      />

      <div className="documentation-list__content">
        {filteredDocs.length === 0 ? (
          <div className="documentation-list__empty">
            <p>Документы не найдены</p>
          </div>
        ) : (
          <div className="documentation-list__grid">
            {filteredDocs.map(doc => (
              <DocumentationCard
                key={doc.id}
                documentation={doc}
                categories={categories}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
