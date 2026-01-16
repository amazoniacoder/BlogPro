/**
 * BlogPro Documentation Form Component
 * UI System component for creating/editing documentation
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Input, Textarea, FormField } from '../../form';
import { ContentEditableEditor } from '../../../../plugins/texteditor';
import { DocumentationCategoryTreeSelector } from './DocumentationCategoryTreeSelector';
import type { Documentation, DocumentationCategory } from '../../../../../../shared/types/documentation';
import './DocumentationForm.css';

export interface DocumentationFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id?: number;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
}

export interface DocumentationFormProps {
  onSave: (data: DocumentationFormData) => Promise<void>;
  onCancel: () => void;
  categories: DocumentationCategory[];
  editingDoc?: Documentation | null;
}

export const DocumentationForm: React.FC<DocumentationFormProps> = ({
  onSave,
  onCancel,
  categories,
  editingDoc
}) => {
  const [formData, setFormData] = useState<DocumentationFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: undefined,
    is_published: true,
    meta_title: '',
    meta_description: ''
  });
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState<string>('');

  useEffect(() => {
    if (editingDoc) {
      const content = editingDoc.content || '';
      setFormData({
        title: editingDoc.title || '',
        slug: editingDoc.slug || '',
        content,
        excerpt: editingDoc.excerpt || '',
        category_id: editingDoc.category_id,
        is_published: editingDoc.is_published ?? true,
        meta_title: editingDoc.meta_title || '',
        meta_description: editingDoc.meta_description || ''
      });
      setEditorContent(content);
    }
  }, [editingDoc]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-я]/g, (char) => {
        const map: { [key: string]: string } = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !editingDoc ? generateSlug(title) : prev.slug
    }));
  };

  const handleContentChange = (content: string) => {
    setEditorContent(content);
    setFormData(prev => ({ ...prev, content }));
  };

  const handleEditorSave = async (content: string) => {
    handleContentChange(content);
  };



  const getCategoryPath = (categoryId?: number): string => {
    if (!categoryId) return '';
    const category = categories?.find(cat => cat.id === categoryId);
    if (!category) return '';
    
    const buildPath = (cat: DocumentationCategory): string => {
      if (cat.parent_id) {
        const parent = categories?.find(p => p.id === cat.parent_id);
        if (parent) {
          return buildPath(parent) + '/' + cat.slug;
        }
      }
      return cat.slug;
    };
    
    return buildPath(category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documentation-form">

      <form onSubmit={handleSubmit} className="documentation-form__content">
        <div className="documentation-form__metadata-row">
          <FormField label="Заголовок" required>
            <Input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Slug" required>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Категория" required>
            <DocumentationCategoryTreeSelector
              categories={categories || []}
              selectedId={formData.category_id}
              onSelect={(id) => setFormData(prev => ({ ...prev, category_id: id }))}
              placeholder="Выберите категорию"
              allowEmpty={false}
            />
          </FormField>

          <FormField label="Краткое описание">
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
            />
          </FormField>

          {formData.category_id && formData.slug && (
            <div className="url-preview">
              <strong>URL документа:</strong>
              <span className="url-path">
                /documentation/{getCategoryPath(formData.category_id)}/{formData.slug}
              </span>
            </div>
          )}
        </div>



        <div className="documentation-form__content-section">
          <FormField label="Содержание" required>
            <ContentEditableEditor
              initialContent={editorContent}
              onChange={handleContentChange}
              onSave={handleEditorSave}
              placeholder="Начните писать документацию..."
              className="documentation-content-editor"
            />
          </FormField>
        </div>

        <div className="documentation-form__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  );
};
