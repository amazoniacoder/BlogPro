import React, { useState, useEffect } from "react";
import { HeroSection } from "@/ui-system/patterns/HeroSection";
import { ProductShowcase, ProductCard } from "@/ui-system/patterns/ProductShowcase";
import { useTranslation } from "@/hooks/useTranslation";
import websocketService from "@/services/websocket-service";


const Home: React.FC = () => {
  const { t } = useTranslation('common');

  
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { productsService } = await import('@/services/api/products');
        const response = await productsService.getAll({ limit: 4, active: true });
        const productCards = response.products.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          image: product.image,
          href: `/products/${product.slug}`
        }));
        setProducts(productCards);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([
          {
            id: '1',
            title: 'Landing Page',
            description: 'Professional single-page websites designed to convert visitors into customers.',
            image: '/uploads/products/landing-page.webp',
            href: '/products/landing-page'
          },
          {
            id: '2', 
            title: 'Business Card Website',
            description: 'Simple, elegant websites perfect for showcasing your business information.',
            image: '/uploads/products/business-card.webp',
            href: '/products/business-card'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Connect WebSocket for real-time updates
    websocketService.connect();

    // Listen for product updates
    const handleProductCreated = (productData: any) => {
      console.log('Product created:', productData);
      fetchProducts(); // Refresh products
    };

    const handleProductUpdated = (productData: any) => {
      console.log('Product updated:', productData);
      fetchProducts(); // Refresh products
    };

    const handleProductDeleted = (data: any) => {
      console.log('Product deleted:', data);
      fetchProducts(); // Refresh products
    };

    websocketService.subscribe('product_created', handleProductCreated);
    websocketService.subscribe('product_updated', handleProductUpdated);
    websocketService.subscribe('product_deleted', handleProductDeleted);

    return () => {
      websocketService.unsubscribe('product_created', handleProductCreated);
      websocketService.unsubscribe('product_updated', handleProductUpdated);
      websocketService.unsubscribe('product_deleted', handleProductDeleted);
    };
  }, []);



  return (
    <>
      <HeroSection
        title={t('heroTitle', 'Your Web Design & Development Partner')}
        description={t('heroDescription', 'We create beautiful, functional websites that help your business grow.')}
        actions={[
          { label: t('readOurBlog', 'Read Our Blog'), variant: "primary", href: "/blog" },
          { label: t('getInTouch', 'Get in Touch'), variant: "secondary", href: "/contact" }
        ]}
      />
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
      ) : (
        <ProductShowcase
          title={t('ourProfessionalSolutions', 'Our Professional Solutions')}
          description={t('showcaseDescription', 'Choose from our range of professional web solutions designed to help your business succeed online.')}
          products={products}
          ctaLabel={t('allSolutions', 'All Solutions')}
          ctaHref="/products"
        />
      )}
      

    </>
  );
};

export default Home;
