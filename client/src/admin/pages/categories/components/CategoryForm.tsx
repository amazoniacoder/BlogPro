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
  const handleSave = async (data: any) => {
    onSave(data);
  };

  return (
    <UICategoryForm 
      editingCategory={category as any}
      categories={categories as any}
      onSave={handleSave}
      onCancel={onCancel}
    />
  );
};

export default CategoryForm;
