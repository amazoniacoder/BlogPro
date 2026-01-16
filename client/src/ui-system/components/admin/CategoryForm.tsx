/**
 * BlogPro UI System - Admin Category Form Component
 * Form for creating and editing categories
 */

import React, { useState, useEffect } from 'react';
import { BlogCategory, CategoryTreeNode } from '@/../../shared/types/api';
import { CategoryTreeSelector } from './CategoryTreeSelector';

export interface CategoryFormProps {
  category?: BlogCategory | null;
  categories: CategoryTreeNode[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ 
  category, 
  categories, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: undefined as number | undefined,
    sortOrder: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId,
        sortOrder: category.sortOrder
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: undefined,
        sortOrder: 0
      });
    }
  }, [category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: !category ? generateSlug(name) : prev.slug
    }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = generateSlug(e.target.value);
    setFormData(prev => ({ ...prev, slug }));
    if (errors.slug) {
      setErrors(prev => ({ ...prev, slug: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      parentId: formData.parentId || undefined
    };

    onSave(submitData);
  };

  return (
    <div className="admin-category-form">
      <form onSubmit={handleSubmit} className="admin-category-form__body">
        <div className="admin-category-form__row grid-cols-1">
          <div className="admin-category-form__group flex-col">
            <label htmlFor="name" className="admin-category-form__label">
              Name <span className="admin-category-form__required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              className={`admin-category-form__input ${errors.name ? 'admin-category-form__input--error' : ''}`}
              placeholder="Category name"
              autoFocus
            />
            {errors.name && <span className="admin-category-form__error">{errors.name}</span>}
          </div>

          <div className="admin-category-form__group flex-col">
            <label htmlFor="slug" className="admin-category-form__label">
              Slug <span className="admin-category-form__required">*</span>
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              className={`admin-category-form__input ${errors.slug ? 'admin-category-form__input--error' : ''}`}
              placeholder="category-slug"
            />
            {errors.slug && <span className="admin-category-form__error">{errors.slug}</span>}
          </div>
        </div>

        <div className="admin-category-form__group flex-col">
          <label htmlFor="description" className="admin-category-form__label">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="admin-category-form__textarea"
            placeholder="Category description"
            rows={3}
          />
        </div>

        <div className="admin-category-form__row grid-cols-1">
          <div className="admin-category-form__group flex-col">
            <label className="admin-category-form__label">
              Parent Category
            </label>
            <CategoryTreeSelector
              categories={categories}
              selectedId={formData.parentId}
              onSelect={(parentId) => setFormData(prev => ({ ...prev, parentId }))}
              excludeId={category?.id}
            />
          </div>

          <div className="admin-category-form__group flex-col">
            <label htmlFor="sortOrder" className="admin-category-form__label">
              Sort Order
            </label>
            <input
              type="number"
              id="sortOrder"
              value={formData.sortOrder}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                sortOrder: parseInt(e.target.value) || 0 
              }))}
              className="admin-category-form__input"
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        <div className="admin-category-form__footer">
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-button admin-button--primary"
          >
            {category ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
