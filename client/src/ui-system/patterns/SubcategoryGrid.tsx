import React from 'react';
import { Link } from 'wouter';
import { Heading, Text } from '@/ui-system/components/typography';

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}

export interface SubcategoryGridProps {
  subcategories: Subcategory[];
  title?: string;
}

export const SubcategoryGrid: React.FC<SubcategoryGridProps> = ({ 
  subcategories, 
  title = "Subcategories" 
}) => {
  if (subcategories.length === 0) return null;

  return (
    <div className="subcategory-grid">
      <Heading level={2}>{title}</Heading>
      <div className="subcategory-grid__items">
        {subcategories.map(subcategory => (
          <Link 
            key={subcategory.id} 
            href={`/blog/category/${subcategory.slug}`}
            className="subcategory-grid__item"
          >
            <Heading level={3}>{subcategory.name}</Heading>
            <Text>{subcategory.postCount || 0} posts</Text>
          </Link>
        ))}
      </div>
    </div>
  );
};
