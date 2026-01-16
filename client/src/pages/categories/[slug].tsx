// client/src/pages/categories/[slug].tsx
import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { categoriesService } from '@/services/api/categories';
import { CategoryWithPosts } from '@/../../shared/types/api';
import { CategoryPage, CategoryBreadcrumb, SubcategoryGrid, BlogCard, CategorySidebar } from '@/ui-system/patterns';

const CategoryPageComponent: React.FC = () => {
  const [match, params] = useRoute('/blog/category/:slug');
  const [categoryData, setCategoryData] = useState<CategoryWithPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (match && params?.slug) {
      loadCategoryData(params.slug);
    }
  }, [match, params?.slug]);

  const loadCategoryData = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const category = await categoriesService.getCategoryBySlug(slug);
      if (!category) {
        setError('Category not found');
        return;
      }

      const categoryWithPosts = await categoriesService.getCategoryPosts(category.id, true);
      setCategoryData(categoryWithPosts);
    } catch (err) {
      console.error('Error loading category data:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  if (!match) return null;

  // Mock breadcrumb data - replace with real data
  const breadcrumbItems = categoryData ? [{ id: categoryData.id, name: categoryData.name, slug: params?.slug || '' }] : [];

  return (
    <CategoryPage
      title={categoryData?.name || 'Category'}
      description={categoryData?.description}
      postCount={categoryData?.posts.length || 0}
      loading={loading}
      error={error}
      breadcrumb={<CategoryBreadcrumb items={breadcrumbItems} />}
      subcategories={
        categoryData?.children && categoryData.children.length > 0 ? (
          <SubcategoryGrid subcategories={categoryData.children} />
        ) : null
      }
      sidebar={
        <CategorySidebar 
          categories={[]} 
          selectedCategoryId={null} 
          onCategorySelect={() => {}} 
        />
      }
    >
      {categoryData?.posts.length ? (
        <div className="blog-grid">
          {categoryData.posts.map(post => (
            <BlogCard key={post.id} post={{
              ...post,
              imageUrl: post.imageUrl || null,
              thumbnailUrl: post.thumbnailUrl || null,
              projectUrl: post.projectUrl || null
            }} />
          ))}
        </div>
      ) : (
        <div className="category-page__empty">
          <p>No posts in this category yet.</p>
        </div>
      )}
    </CategoryPage>
  );
};

export default CategoryPageComponent;