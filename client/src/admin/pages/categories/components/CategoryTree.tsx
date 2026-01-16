// client/src/admin/pages/categories/components/CategoryTree.tsx
import React from 'react';
import { CategoryTreeNode, BlogCategory } from '@/../../shared/types/api';
import { CategoryTree as UICategoryTree } from '@/ui-system/components/admin';

interface CategoryTreeProps {
  categories: CategoryTreeNode[];
  onEdit: (category: BlogCategory) => void;
  onDelete: (category: BlogCategory) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, onEdit, onDelete }) => {
  return (
    <UICategoryTree 
      categories={categories}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default CategoryTree;
