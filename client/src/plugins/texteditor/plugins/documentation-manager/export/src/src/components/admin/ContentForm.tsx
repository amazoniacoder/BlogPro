import { Icon } from '../../../../../../../../../ui-system/icons/components';
/**
 * Content Form Component
 * Form for creating and editing documentation content
 * Max 300 lines - strict TypeScript compliance
 */

import React, { useState, useEffect } from 'react';
import { ContentItem, Section } from '../../types/SharedTypes';

interface ContentFormProps {
  readonly content: ContentItem | null;
  readonly sections: Section[];
  readonly textEditor: React.ReactNode;
  readonly isCreating: boolean;
  readonly onSave: (content: Partial<ContentItem>) => Promise<void>;
  readonly onCancel: () => void;
}

/**
 * Form component for creating and editing content
 */
export const ContentForm: React.FC<ContentFormProps> = ({
  content,
  sections,
  textEditor,
  isCreating,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    sectionId: '',
    isPublished: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Initialize form data when content changes
   */
  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        slug: content.slug || '',
        excerpt: content.excerpt || '',
        content: content.content || '',
        sectionId: content.sectionId || '',
        isPublished: content.isPublished || false
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        sectionId: '',
        isPublished: false
      });
    }
    setErrors({});
  }, [content]);

  /**
   * Generate slug from title
   */
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  /**
   * Handle form field changes
   */
  const handleChange = (field: string, value: string | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      const newSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save content:', error);
      setErrors({ submit: 'Failed to save content. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="content-form">
      <div className="content-form__header">
        <h3 className="content-form__title">
          {isCreating ? '<Icon name="add" size={16} /> Create New Content' : '<Icon name="edit" size={16} /> Edit Content'}
        </h3>
        
        <div className="content-form__actions">
          <button
            type="button"
            className="content-form__cancel"
            onClick={onCancel}
            disabled={isSaving}
          >
            <Icon name="arrow-left" size={16} /> Cancel
          </button>
        </div>
      </div>

      <form className="content-form__form" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-field">
          <label className="form-field__label" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            className={`form-field__input ${errors.title ? 'form-field__input--error' : ''}`}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter content title"
            disabled={isSaving}
          />
          {errors.title && (
            <span className="form-field__error">{errors.title}</span>
          )}
        </div>

        {/* Slug */}
        <div className="form-field">
          <label className="form-field__label" htmlFor="slug">
            Slug *
          </label>
          <input
            id="slug"
            type="text"
            className={`form-field__input ${errors.slug ? 'form-field__input--error' : ''}`}
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="url-friendly-slug"
            disabled={isSaving}
          />
          {errors.slug && (
            <span className="form-field__error">{errors.slug}</span>
          )}
        </div>

        {/* Section */}
        <div className="form-field">
          <label className="form-field__label" htmlFor="section">
            Section
          </label>
          <select
            id="section"
            className="form-field__select"
            value={formData.sectionId}
            onChange={(e) => handleChange('sectionId', e.target.value)}
            disabled={isSaving}
          >
            <option value="">No section</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div className="form-field">
          <label className="form-field__label" htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            className="form-field__textarea"
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            placeholder="Brief description (optional)"
            rows={3}
            disabled={isSaving}
          />
        </div>

        {/* Content Editor */}
        <div className="form-field">
          <label className="form-field__label">
            Content *
          </label>
          <div className={`form-field__editor ${errors.content ? 'form-field__editor--error' : ''}`}>
            {textEditor}
          </div>
          {errors.content && (
            <span className="form-field__error">{errors.content}</span>
          )}
        </div>

        {/* Published Status */}
        <div className="form-field form-field--checkbox">
          <label className="form-field__checkbox-label">
            <input
              type="checkbox"
              className="form-field__checkbox"
              checked={formData.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              disabled={isSaving}
            />
            <span className="form-field__checkbox-text">
              ✅ Publish immediately
            </span>
          </label>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="form-error">
            <span className="form-error__text">{errors.submit}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="form-actions__submit"
            disabled={isSaving}
          >
            {isSaving ? '⏳ Saving...' : (isCreating ? '<Icon name="add" size={16} /> Create Content' : '<Icon name="save" size={16} /> Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;
