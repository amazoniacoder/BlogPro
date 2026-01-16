// client/src/admin/pages/blog/components/BlogTable.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BlogPost } from "@/types/blog";
import { BlogAction } from "../state/types";
import { categoriesService } from "@/services/api/categories";
import { CategoryTreeNode } from "@/../../shared/types/api";
import { AdminTable, AdminTableColumn, AdminTableAction } from '@/ui-system/components/admin';
import { Icon } from '@/ui-system/icons/components';

interface BlogTableProps {
  posts: BlogPost[];
  sortField: string;
  sortDirection: "asc" | "desc";
  dispatch: React.Dispatch<BlogAction>;
  onEditPost: (postId: string) => void;
}

const BlogTable: React.FC<BlogTableProps> = ({
  posts,
  sortField,
  sortDirection,
  dispatch,
  onEditPost,
}) => {
  const { t } = useTranslation(['admin', 'blog', 'common']);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.getCategoriesTree();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const getCategoryName = (categoryId: number | undefined): string => {
    if (!categoryId) return t('admin:uncategorized', { defaultValue: 'Без категории' });
    
    const findCategory = (cats: CategoryTreeNode[]): string | null => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat.name;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findCategory(categories) || t('admin:unknownCategory', { defaultValue: 'Неизвестная категория' });
  };
  const handleEditClick = (post: BlogPost) => {
    onEditPost(post.id);
  };

  const handleDeleteClick = (postId: string) => {
    dispatch({ type: "BLOG/SHOW_DELETE_MODAL", postId });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return "N/A";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleDateString();
    } catch (error) {
      return "N/A";
    }
  };

  const columns: AdminTableColumn[] = [
    { key: 'imageUrl', label: t('admin:image', { defaultValue: 'Изображение' }) },
    { key: 'title', label: t('admin:title'), sortable: true },
    { 
      key: 'status', 
      label: t('admin:status'), 
      sortable: true,
      render: (value) => {
        const getStatusIcon = () => {
          switch (value) {
            case 'published': return { icon: 'check', color: '#16a34a' };
            case 'archived': return { icon: 'folder', color: '#eab308' };
            default: return { icon: 'x', color: '#dc2626' };
          }
        };
        const { icon, color } = getStatusIcon();
        return (
          <span className={`admin-badge admin-badge--${value.toLowerCase()}`}>
            <Icon name={icon as any} size={16} style={{ color }} />
          </span>
        );
      }
    },
    { 
      key: 'categoryId', 
      label: t('admin:category'), 
      sortable: true,
      render: (value) => getCategoryName(value)
    },
    { 
      key: 'createdAt', 
      label: t('blog:publishedOn'), 
      sortable: true,
      render: (value, row) => row.status === "published" ? formatDate(value) : "N/A"
    },
    { 
      key: 'updatedAt', 
      label: t('admin:updatedAt'), 
      sortable: true,
      render: (value) => formatDate(value)
    }
  ];

  const actions: AdminTableAction[] = [
    {
      key: 'edit',
      label: t('admin:editPost'),
      icon: 'edit',
      variant: 'edit',
      onClick: handleEditClick
    },
    {
      key: 'delete',
      label: t('admin:deletePost'),
      icon: 'delete',
      variant: 'delete',
      onClick: (post) => handleDeleteClick(post.id)
    }
  ];

  const mobileInfoFields = [
    { key: 'status', label: t('admin:status') },
    { key: 'categoryId', label: t('admin:category') },
    { key: 'createdAt', label: t('blog:publishedOn') },
    { key: 'updatedAt', label: t('admin:updatedAt') }
  ];

  return (
    <AdminTable
      columns={columns}
      data={posts}
      actions={actions}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={(field, direction) => {
        dispatch({
          type: "BLOG/SET_SORT",
          field,
          direction,
        });
      }}
      imageField="imageUrl"
      titleField="title"
      subtitleField="slug"
      mobileInfoFields={mobileInfoFields}
    />
  );
};

export default React.memo(BlogTable);
