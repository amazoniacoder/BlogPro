// client/src/admin/pages/categories/components/CategoryTreeSelector.tsx
import React from 'react';
import { CategoryTreeNode } from '@/../../shared/types/api';
import { CategoryTreeSelector as UICategoryTreeSelector } from '@/ui-system/components/admin';

interface CategoryTreeSelectorProps {
  categories: CategoryTreeNode[];
  selectedId?: number;
  onSelect: (categoryId: number | undefined) => void;
  excludeId?: number;
}

const CategoryTreeSelector: React.FC<CategoryTreeSelectorProps> = ({
  categories,
  selectedId,
  onSelect,
  excludeId
}) => {
  return (
    <UICategoryTreeSelector 
      categories={categories}
      selectedId={selectedId}
      onSelect={onSelect}
      excludeId={excludeId}
    />
  );
};

export default CategoryTreeSelector;
