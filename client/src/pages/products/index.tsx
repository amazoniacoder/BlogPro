import React, { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { ProductGrid } from '@/ui-system/patterns/ProductGrid';
import { ProductCategoryTree } from '@/ui-system/patterns/ProductCategoryTree';
import { ProductSearch } from '@/ui-system/patterns/ProductSearch';
import { ProductPagination } from '@/ui-system/patterns/ProductPagination';
import { ProductExportMenu } from '@/ui-system/patterns/ProductExportMenu';
import websocketService from '@/services/websocket-service';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 12,
    search: '',
    category: ''
  });

  const { products, pagination, loading, error, fetchProducts } = useProducts(searchParams);
  const { categories, fetchCategories } = useProductCategories();

  useEffect(() => {
    // Connect WebSocket for real-time updates
    websocketService.connect();

    // Listen for product and category updates
    const handleProductChange = () => {
      fetchProducts();
    };

    const handleCategoryChange = () => {
      fetchCategories();
    };

    websocketService.subscribe('product_created', handleProductChange);
    websocketService.subscribe('product_updated', handleProductChange);
    websocketService.subscribe('product_deleted', handleProductChange);
    websocketService.subscribe('category_created', handleCategoryChange);
    websocketService.subscribe('category_updated', handleCategoryChange);
    websocketService.subscribe('category_deleted', handleCategoryChange);

    return () => {
      websocketService.unsubscribe('product_created', handleProductChange);
      websocketService.unsubscribe('product_updated', handleProductChange);
      websocketService.unsubscribe('product_deleted', handleProductChange);
      websocketService.unsubscribe('category_created', handleCategoryChange);
      websocketService.unsubscribe('category_updated', handleCategoryChange);
      websocketService.unsubscribe('category_deleted', handleCategoryChange);
    };
  }, [fetchProducts, fetchCategories]);

  const handleSearch = (search: string) => {
    setSearchParams(prev => ({ ...prev, search, page: 1 }));
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSearchParams(prev => ({ ...prev, category: categorySlug, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  return (
    <div className="products-page">
      <div className="products-page__container">
        <div className="products-page__header">
          <div className="products-page__title-section">
            <h1 className="products-page__title">Our Products</h1>
            <p className="products-page__description">
              Discover our range of professional digital solutions designed to help your business succeed online.
            </p>
          </div>
          <div className="products-page__actions">
            <ProductExportMenu products={products} categories={categories} type="catalog" />
          </div>
        </div>

        <div className="products-page__content">
          <aside className="products-page__sidebar">
            <div className="products-page__search">
              <ProductSearch onSearch={handleSearch} />
            </div>
            <div className="products-page__categories">
              <ProductCategoryTree
                categories={categories}
                selectedCategory={searchParams.category}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          </aside>

          <main className="products-page__main">
            {loading ? (
              <div className="products-page__loading">Loading products...</div>
            ) : error ? (
              <div className="products-page__error">Error: {error}</div>
            ) : (
              <>
                <ProductGrid products={products} />
                {pagination.pages > 1 && (
                  <ProductPagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
