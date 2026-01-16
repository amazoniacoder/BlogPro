import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Product } from '../../../../shared/types/product';
import { productsService } from '@/services/api/products';
import { ProductShareMenu } from '@/ui-system/patterns/ProductShareMenu';
import { ProductExportMenu } from '@/ui-system/patterns/ProductExportMenu';
import { Icon } from '@/ui-system/icons/components';
import { Button } from '@/ui-system/components/button';
import { AddToCartButton } from '@/ui-system/components/ecommerce/cart/AddToCartButton';

const ProductDetailPage: React.FC = () => {
  const [match, params] = useRoute('/products/:slug');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !params?.slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await productsService.getBySlug(params.slug);
        setProduct(productData);
        
        // Update page title and meta
        document.title = `${productData.title} - BlogPro`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', productData.description);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [match, params?.slug]);

  if (loading) {
    return (
      <div className="product-detail__loading">
        <div className="product-detail__spinner">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail__error">
        <Icon name="alert-circle" size={48} />
        <h2>Product Not Found</h2>
        <p>{error || 'The requested product could not be found.'}</p>
        <Link href="/products">
          <Button>
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail__container">
        <div className="product-detail__header">
          <div className="product-detail__breadcrumb">
            <Link href="/products">Products</Link>
            {product.category && (
              <>
                <Icon name="arrow-right" size={16} />
                <Link href={`/products/category/${product.category.slug}`}>
                  {product.category.name}
                </Link>
              </>
            )}
            <Icon name="arrow-right" size={16} />
            <span>{product.title}</span>
          </div>

          <div className="product-detail__actions">
            <ProductShareMenu product={product} />
            <ProductExportMenu product={product} type="single" />
          </div>
        </div>

        <div className="product-detail__content">
          <div className="product-detail__main">
            <div className="product-detail__image">
              {product.image ? (
                <img src={product.image} alt={product.title} />
              ) : (
                <div className="product-detail__placeholder">
                  <Icon name="image" size={64} />
                </div>
              )}
            </div>

            <div className="product-detail__info">
              <div className="product-detail__meta">
                {product.category && (
                  <span className="product-detail__category">
                    {product.category.name}
                  </span>
                )}
                {product.price && (
                  <span className="product-detail__price">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <h1 className="product-detail__title">{product.title}</h1>
              
              <p className="product-detail__description">
                {product.description}
              </p>

              {product.features && product.features.length > 0 && (
                <div className="product-detail__features">
                  <h3>Features</h3>
                  <ul className="product-detail__feature-list">
                    {product.features.map((feature, index) => (
                      <li key={index} className="product-detail__feature">
                        <Icon name="check" size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="product-detail__cta">
                <AddToCartButton 
                  productId={product.id} 
                  className="product-detail__add-to-cart"
                >
                  Add to Cart
                </AddToCartButton>
                <Link href="/contact">
                  <Button size="lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg">
                    Browse More Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {product.content && (
            <div className="product-detail__content-section">
              <h2>Product Details</h2>
              <div 
                className="product-detail__rich-content"
                dangerouslySetInnerHTML={{ __html: product.content }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;