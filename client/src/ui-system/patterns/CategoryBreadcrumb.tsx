import React from 'react';
import { Link } from 'wouter';
import { Icon } from '@/ui-system/icons/components';

export interface BreadcrumbItem {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="category-breadcrumb">
      <Link href="/blog" className="category-breadcrumb__item">
        Blog
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <Icon name="arrow-right" size={16} className="category-breadcrumb__separator" />
          {index === items.length - 1 ? (
            <span className="category-breadcrumb__item category-breadcrumb__item--current">
              {item.name}
            </span>
          ) : (
            <Link 
              href={`/blog/category/${item.slug}`} 
              className="category-breadcrumb__item"
            >
              {item.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
