import React from 'react';
import { Spinner } from '@/ui-system/components/feedback';
import { Button } from '@/ui-system/components/button';
import { Heading, Text } from '@/ui-system/components/typography';

export interface CategoryPageProps {
  title: string;
  description?: string;
  postCount: number;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  subcategories?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  title,
  description,
  postCount,
  loading,
  error,
  children,
  sidebar,
  subcategories,
  breadcrumb
}) => {
  if (loading) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="category-page__loading">
            <Spinner size="lg" />
            <Text>Loading category...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="category-page__error">
            <Heading level={1}>Category Not Found</Heading>
            <Text>{error}</Text>
            <Button href="/blog" variant="primary">Back to Blog</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="container">
        <div className="category-page__header">
          {breadcrumb}
          <Heading level={1}>{title}</Heading>
          {description && <Text>{description}</Text>}
          <Text className="category-page__count">{postCount} posts</Text>
        </div>

        <div className="category-page__content">
          <div className="category-page__main">
            {subcategories}
            <div className="category-page__posts">
              {children}
            </div>
          </div>
          
          {sidebar && (
            <div className="category-page__sidebar">
              {sidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
