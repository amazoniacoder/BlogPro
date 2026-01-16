// client/src/admin/pages/blog/components/BlogFilters.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BlogAction } from "../state/types";
import { categoriesService } from "@/services/api/categories";
import { CategoryTreeNode } from "@/../../shared/types/api";
import CategoryTreeSelector from "../../../pages/categories/components/CategoryTreeSelector";
// Category tree selector styles are now included in UI System

interface BlogFiltersProps {
  filters: {
    search: string;
    status: string;
    category: string;
  };
  dispatch: React.Dispatch<BlogAction>;
  onCreatePost: () => void;
  onManageCategories: () => void;
}

const BlogFilters: React.FC<BlogFiltersProps> = ({ filters, dispatch, onCreatePost, onManageCategories }) => {
  const { t } = useTranslation(['admin', 'blog', 'common']);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, postsData] = await Promise.all([
          categoriesService.getCategoriesTree(),
          fetch('/api/blog/all', { 
            headers: { 
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            } 
          }).then(r => r.json())
        ]);
        setCategories(categoriesData);
        setBlogPosts(Array.isArray(postsData) ? postsData : postsData.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const calculatePostCounts = (cats: CategoryTreeNode[]): CategoryTreeNode[] => {
    return cats.map(cat => {
      const postCount = blogPosts.filter(post => post.categoryId === cat.id || post.category_id === cat.id).length;
      return {
        ...cat,
        postCount,
        children: cat.children ? calculatePostCounts(cat.children) : cat.children
      } as CategoryTreeNode;
    });
  };

  const categoriesWithCounts = calculatePostCounts(categories);


  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    dispatch({ type: "BLOG/SET_FILTER", field, value });
  };

  const handleResetFilters = () => {
    handleFilterChange("search", "");
    handleFilterChange("status", "");
    handleFilterChange("category", "");
  };

  return (
    <div className="admin-blog__filters">
      <div className="admin-blog__filters-row">
        <input
          id="blog-search"
          type="text"
          placeholder={t('blog:searchPlaceholder')}
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="admin-form__input"
        />

        <select
          id="blog-status"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="admin-form__select"
        >
          <option value="">{t('admin:status')}</option>
          <option value="published">{t('blog:published')}</option>
          <option value="draft">{t('blog:draft')}</option>
          <option value="archived">{t('blog:archived')}</option>
        </select>

        <CategoryTreeSelector
          categories={categoriesWithCounts}
          selectedId={filters.category ? parseInt(filters.category) : undefined}
          onSelect={(categoryId) => handleFilterChange("category", categoryId ? categoryId.toString() : "")}
        />

        <button
          className="admin-button admin-button--secondary"
          onClick={handleResetFilters}
          aria-label="Reset all filters"
        >
          {t('blog:reset')}
        </button>

        <div className="admin-blog__actions">
          <button 
            className="admin-button admin-button--secondary" 
            onClick={onManageCategories}
            title="Manage blog categories"
          >
            {t('admin:manageCategories')}
          </button>

          <button 
            className="admin-button admin-button--primary" 
            onClick={onCreatePost}
          >
            {t('admin:addNewPost')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BlogFilters);
