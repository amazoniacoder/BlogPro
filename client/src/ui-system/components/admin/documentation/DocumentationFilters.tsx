/**
 * BlogPro Documentation Filters Component
 * UI System component for filtering documentation by category
 */

import React from 'react';
import { DocumentationCategoryTreeSelector } from './DocumentationCategoryTreeSelector';
import { Button } from '../../../components/button';
import type { DocumentationCategory } from '../../../../../../shared/types/documentation';

export interface DocumentationFiltersProps {
  categories: DocumentationCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onCreateDocument: () => void;
}

export const DocumentationFilters: React.FC<DocumentationFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onCreateDocument
}) => {
  return (
    <div className="documentation-filters">
      <div className="documentation-filters__selector">
        <DocumentationCategoryTreeSelector
          categories={categories || []}
          selectedId={selectedCategory === 'all' ? undefined : parseInt(selectedCategory)}
          onSelect={(id) => onCategoryChange(id?.toString() || 'all')}
          placeholder="Все категории"
          allowEmpty={true}
        />
      </div>
      <Button 
        variant="primary"
        onClick={onCreateDocument}
      >
        + Создать документ
      </Button>
    </div>
  );
};
