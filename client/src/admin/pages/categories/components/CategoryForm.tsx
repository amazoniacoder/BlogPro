// client/src/admin/pages/categories/components/CategoryForm.tsx
import React from 'react';
import { BlogCategory, CategoryTreeNode } from '@/../../shared/types/api';
import { CategoryForm as UICategoryForm } from '@/ui-system/components/admin';

interface CategoryFormProps {
  category?: BlogCategory | null;
  categories: CategoryTreeNode[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  category, 
  categories, 
  onSave, 
  onCancel 
}) => {
  return (
    <UICategoryForm 
      category={category}
      categories={categories}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
};

export default CategoryForm;
