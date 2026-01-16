// client/src/pages/documentation.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useRoute } from 'wouter';
import { documentationApi } from '../services/api/documentation';
import { DocumentationLayout, DocumentationTree, DocumentationContent, Breadcrumb } from '../ui-system/components';
import type { Documentation, DocumentationCategory } from '../../../shared/types/documentation';
import { useTranslation } from '@/hooks/useTranslation';

const DocumentationPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [, simpleParams] = useRoute('/documentation/:slug?');
  const [, categoryParams] = useRoute('/documentation/:categoryPath+/:slug');
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [categories, setCategories] = useState<DocumentationCategory[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Documentation | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Determine current slug from either route pattern
  const currentSlug = categoryParams?.slug || simpleParams?.slug;
  
  // Initial data fetch (only once)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [docsData, categoriesData] = await Promise.all([
          documentationApi.getPublicDocumentation(),
          documentationApi.getCategoryTree()
        ]);
        setDocumentation(docsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // ← Only run once on mount
  
  // Handle URL-based document loading separately
  useEffect(() => {
    if (currentSlug && documentation.length > 0) {
      const loadDocumentFromUrl = async () => {
        try {
          const doc = await documentationApi.getPublicDocumentationBySlug(currentSlug);
          setCurrentDoc(doc);
        } catch (error) {
          console.error('Document not found:', error);
        }
      };
      loadDocumentFromUrl();
    } else if (!currentSlug) {
      setCurrentDoc(null);
    }
  }, [currentSlug, documentation.length]); // ← Separate effect for URL changes

  const handleDocumentClick = (doc: Documentation) => {
    setCurrentDoc(doc);
    const docUrl = buildDocumentUrl(doc);
    window.history.pushState(null, '', docUrl);
  };
  
  const buildDocumentUrl = (doc: Documentation): string => {
    if (!doc.category_id) {
      return `/documentation/${doc.slug}`;
    }
    
    const categoryPath = buildCategoryPath(doc.category_id);
    return categoryPath ? `/documentation/${categoryPath}/${doc.slug}` : `/documentation/${doc.slug}`;
  };
  
  const buildCategoryPath = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return '';
    
    if (category.parent_id) {
      const parentPath = buildCategoryPath(category.parent_id);
      return parentPath ? `${parentPath}/${category.slug}` : category.slug;
    }
    
    return category.slug;
  };

  const handleBackToList = () => {
    setCurrentDoc(null);
    window.history.pushState(null, '', '/documentation');
  };
  
  const buildBreadcrumbs = (doc: Documentation) => {
    const items = [{ label: t('documentation', 'Documentation'), href: '/documentation' }];
    
    if (doc.category_id) {
      const categoryBreadcrumbs = buildCategoryBreadcrumbs(doc.category_id);
      items.push(...categoryBreadcrumbs);
    }
    
    items.push({ label: doc.title, href: '' });
    return items;
  };
  
  const buildCategoryBreadcrumbs = (categoryId: number): Array<{label: string, href: string}> => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return [];
    
    const breadcrumbs = [];
    if (category.parent_id) {
      breadcrumbs.push(...buildCategoryBreadcrumbs(category.parent_id));
    }
    breadcrumbs.push({ label: category.name, href: '' });
    
    return breadcrumbs;
  };
  // Memoized category tree to prevent rebuilding
  const categoryTree = useMemo(() => {
    const buildCategoryTree = (cats: DocumentationCategory[]): DocumentationCategory[] => {
      const categoryMap = new Map<number, DocumentationCategory>();
      const rootCategories: DocumentationCategory[] = [];
      
      cats.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });
      
      cats.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id)!;
        
        if (category.parent_id) {
          const parent = categoryMap.get(category.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(categoryWithChildren);
          }
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });
      
      return rootCategories;
    };
    
    return buildCategoryTree(categories || []);
  }, [categories]);
  
  // Memoized sidebar to prevent re-renders during navigation
  const sidebar = useMemo(() => (
    <DocumentationTree
      categories={categoryTree}
      documents={documentation}
      activeDocId={currentDoc?.id}
      onDocumentClick={handleDocumentClick}
    />
  ), [categoryTree, documentation, currentDoc?.id]);


  if (loading) {
    return (
      <div className="container">
        <div className="documentation-loading">
          <p>{t('loadingDocumentation', 'Loading documentation...')}</p>
        </div>
      </div>
    );
  }

  return (
    <DocumentationLayout
      sidebar={sidebar}
      breadcrumbs={currentDoc ? <Breadcrumb items={buildBreadcrumbs(currentDoc)} /> : undefined}
    >
      <DocumentationContent 
        document={currentDoc}
        onBack={handleBackToList}
      />
    </DocumentationLayout>
  );
};

export default DocumentationPage;
