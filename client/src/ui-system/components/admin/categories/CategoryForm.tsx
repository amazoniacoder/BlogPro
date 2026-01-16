import React, { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Input } from '../../form';
import { ProductCategory } from '../../../../../../shared/types/product-category';

interface CategoryFormProps {
  category?: ProductCategory | null;
  categories: ProductCategory[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  categories,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    sortOrder: 0
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || '',
        sortOrder: category.sortOrder
      });
    }
  }, [category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: !category ? generateSlug(name) : prev.slug
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const availableParents = categories.filter(cat => 
    !category || cat.id !== category.id
  );

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <div className="category-form__header">
        <h3>{category ? 'Edit Category' : 'Create Category'}</h3>
      </div>

      <div className="category-form__fields">
        <div className="category-form__field">
          <label htmlFor="name">Name *</label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            required
          />
        </div>

        <div className="category-form__field">
          <label htmlFor="slug">Slug *</label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>

        <div className="category-form__field">
          <label htmlFor="parentId">Parent Category</label>
          <select
            id="parentId"
            value={formData.parentId}
            onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
          >
            <option value="">No Parent (Root Category)</option>
            {availableParents.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="category-form__field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="category-form__field">
          <label htmlFor="sortOrder">Sort Order</label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="category-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {category ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  );
};
