import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { ProductGrid } from '@/ui-system/patterns/ProductGrid';
import { ProductExportMenu } from '@/ui-system/patterns/ProductExportMenu';
import { Icon } from '@/ui-system/icons/components';
import { Button } from '@/ui-system/components/button';
import { ProductCategory } from '../../../../../shared/types/product-category';

const ProductCategoryPage: React.FC = () => {
  const [match, params] = useRoute('/products/category/:slug');
  const [currentCategory, setCurrentCategory] = useState<ProductCategory | null>(null);
  
  const { products, loading: productsLoading, error: productsError } = useProducts({
    category: params?.slug || '',
    active: true
  });
  
  const { categories, loading: categoriesLoading } = useProductCategories();

  useEffect(() => {
    if (!match || !params?.slug || !categories.length) return;

    const findCategoryBySlug = (cats: any[], slug: string): any => {
      for (const cat of cats) {
        if (cat.slug === slug) return cat;
        if (cat.children) {
          const found = findCategoryBySlug(cat.children, slug);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategoryBySlug(categories, params.slug);
    setCurrentCategory(category);

    if (category) {
      document.title = `${category.name} - Products - BlogPro`;
    }
  }, [match, params?.slug, categories]);

  if (categoriesLoading || productsLoading) {
    return (
      <div className="category-page__loading">
        <div className="category-page__spinner">Loading category...</div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="category-page__error">
        <Icon name="alert-circle" size={48} />
        <h2>Category Not Found</h2>
        <p>The requested category could not be found.</p>
        <Link href="/products">
          <Button>
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-page__container">
        <div className="category-page__header">
          <div className="category-page__breadcrumb">
            <Link href="/products">Products</Link>
            <Icon name="arrow-right" size={16} />
            <span>{currentCategory.name}</span>
          </div>

          <div className="category-page__title-section">
            <h1 className="category-page__title">{currentCategory.name}</h1>
            {currentCategory.description && (
              <p className="category-page__description">
                {currentCategory.description}
              </p>
            )}
          </div>

          <div className="category-page__actions">
            <ProductExportMenu 
              products={products} 
              categories={[currentCategory]} 
              type="catalog" 
            />
          </div>
        </div>

        <div className="category-page__content">
          {productsError ? (
            <div className="category-page__error">Error: {productsError}</div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryPage;