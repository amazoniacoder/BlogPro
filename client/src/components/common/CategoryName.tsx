// Component for displaying translated category names
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CategoryNameProps {
  categoryName: string;
  className?: string;
}

const CategoryName: React.FC<CategoryNameProps> = ({ categoryName, className }) => {
  const { t } = useTranslation('categories');
  
  // Convert category name to translation key (camelCase)
  const getTranslationKey = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
      .replace(/\s/g, '');
  };
  
  const translationKey = getTranslationKey(categoryName);
  const translatedName = t(translationKey, { defaultValue: categoryName });
  
  return <span className={className}>{translatedName}</span>;
};

export default CategoryName;
