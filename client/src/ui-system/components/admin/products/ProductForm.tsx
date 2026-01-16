import React, { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Input } from '../../form';
import { Product } from '../../../../../../shared/types/product';
import { ProductCategory } from '../../../../../../shared/types/product-category';
import MediaSelector from '../../../../admin/pages/blog/components/MediaSelector';
import { ProductTextEditor } from './ProductTextEditor';
import { Icon } from '../../../icons/components';

interface ProductFormProps {
  product?: Product | null;
  categories: ProductCategory[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    image: '',
    categoryId: '',
    price: '',
    features: [] as string[],
    sortOrder: 0,
    emailTemplateId: '',
    customEmailSubject: '',
    customEmailContent: ''
  });

  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [showEmailEditor, setShowEmailEditor] = useState(false);

  const [newFeature, setNewFeature] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        slug: product.slug,
        description: product.description,
        content: product.content,
        image: product.image,
        categoryId: product.categoryId,
        price: product.price?.toString() || '',
        features: product.features || [],
        sortOrder: product.sortOrder,
        emailTemplateId: (product as any).emailTemplateId || '',
        customEmailSubject: (product as any).customEmailSubject || '',
        customEmailContent: (product as any).customEmailContent || ''
      });
    }
  }, [product]);

  // Load email templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/mailings/templates?type=product_delivery');
        if (response.ok) {
          const templates = await response.json();
          setEmailTemplates(templates);
        }
      } catch (error) {
        console.error('Failed to load email templates:', error);
      }
    };
    fetchTemplates();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: !product ? generateSlug(title) : prev.slug
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : undefined
    });
  };

  return (
    <>
      <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form__header">
        <h3>{product ? 'Edit Product' : 'Create Product'}</h3>
      </div>

      <div className="product-form__fields">
        <div className="product-form__field">
          <label htmlFor="title">Title *</label>
          <Input
            id="title"
            value={formData.title}
            onChange={handleTitleChange}
            required
          />
        </div>

        <div className="product-form__field">
          <label htmlFor="slug">Slug *</label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>

        <div className="product-form__field">
          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="product-form__field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="product-form__field product-form__field--editor">
          <label htmlFor="content">Product Content</label>
          <ProductTextEditor
            value={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            placeholder="Enter detailed product description with rich formatting..."
          />
        </div>

        <div className="product-form__field">
          <label htmlFor="image">Product Image</label>
          <div className="product-form__image-field">
            {formData.image ? (
              <div className="product-form__image-preview">
                <img src={formData.image} alt="Product preview" />
                <div className="product-form__image-actions">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    icon="edit"
                    onClick={() => setShowMediaPicker(true)}
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    icon="delete"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="product-form__image-placeholder">
                <Icon name="image" size={48} />
                <p>No image selected</p>
                <Button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                >
                  Select from Media Library
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="product-form__field">
          <label htmlFor="price">Price</label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          />
        </div>

        <div className="product-form__field">
          <label>Features</label>
          <div className="product-form__features">
            <div className="product-form__feature-input">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add feature"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} size="sm">
                Add
              </Button>
            </div>
            <div className="product-form__feature-list">
              {formData.features.map((feature, index) => (
                <div key={index} className="product-form__feature-item">
                  <span>{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="product-form__field">
          <label htmlFor="sortOrder">Sort Order</label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
          />
        </div>

        {/* Email Template Section */}
        <div className="product-form__section">
          <h4 className="product-form__section-title">
            <Icon name="email" size={20} />
            Email Delivery Settings
          </h4>
          
          <div className="product-form__field">
            <label htmlFor="emailTemplateId">Email Template</label>
            <select
              id="emailTemplateId"
              value={formData.emailTemplateId}
              onChange={(e) => setFormData(prev => ({ ...prev, emailTemplateId: e.target.value }))}
            >
              <option value="">Use Default Template</option>
              {emailTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="product-form__field">
            <label htmlFor="customEmailSubject">Custom Email Subject</label>
            <Input
              id="customEmailSubject"
              value={formData.customEmailSubject}
              onChange={(e) => setFormData(prev => ({ ...prev, customEmailSubject: e.target.value }))}
              placeholder="{{product_title}} - Your Purchase is Ready!"
            />
            <small className="product-form__help">
              Available variables: customer_name, product_title, order_number, license_key
            </small>
          </div>

          <div className="product-form__field">
            <label htmlFor="customEmailContent">Custom Email Content</label>
            <div className="product-form__email-editor">
              <textarea
                id="customEmailContent"
                value={formData.customEmailContent}
                onChange={(e) => setFormData(prev => ({ ...prev, customEmailContent: e.target.value }))}
                rows={8}
                placeholder="Enter custom HTML email content or leave empty to use template..."
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowEmailEditor(!showEmailEditor)}
              >
                {showEmailEditor ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
            {showEmailEditor && (
              <div className="product-form__email-preview">
                <h5>Email Preview:</h5>
                <div 
                  className="product-form__email-preview-content"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.customEmailContent || '<p>No custom content - will use template</p>' 
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="product-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {product ? 'Update' : 'Create'} Product
        </Button>
      </div>
    </form>

    {showMediaPicker && (
      <MediaSelector
        onSelect={(url) => {
          setFormData(prev => ({ ...prev, image: url }));
          setShowMediaPicker(false);
        }}
        onClose={() => setShowMediaPicker(false)}
      />
    )}
    </>
  );
};
