/**
 * BlogPro Category Form Component
 * UI System component for creating/editing documentation categories
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Input, BasicSelect, Textarea, FormField } from '../../form';
import type { DocumentationCategory } from '../../../../../../shared/types/documentation';
import './CategoryForm.css';

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  parent_id?: number;
}

export interface CategoryFormProps {
  onSave: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  editingCategory?: DocumentationCategory | null;
  categories?: DocumentationCategory[];
  defaultParentId?: number | null;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSave,
  onCancel,
  editingCategory,
  categories = [],
  defaultParentId
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    order_index: 0,
    parent_id: undefined
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        slug: editingCategory.slug || '',
        description: editingCategory.description || '',
        icon: editingCategory.icon || '',
        order_index: editingCategory.order_index || 0,
        parent_id: editingCategory.parent_id
      });
    } else if (defaultParentId) {
      setFormData(prev => ({
        ...prev,
        parent_id: defaultParentId
      }));
    }
  }, [editingCategory, defaultParentId]);

  const generateSlug = (name: string) => {
    return name
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

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !editingCategory ? generateSlug(name) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form">
      <form onSubmit={handleSubmit} className="category-form__content">
        <div className="category-form__fields">
          <FormField label="Название *" required>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Slug *" required>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Описание">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </FormField>

          <FormField label="Иконка">
            <BasicSelect
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            >
              <option value="">Выберите иконку</option>
              <option value="rocket-diamond">Начало работы</option>
              <option value="file-search">Справочник API</option>
              <option value="file-users">Руководство пользователя</option>
              <option value="file-crown">Руководство администратора</option>
              <option value="gear">Разработка</option>
              <option value="info">Часто задаваемые вопросы</option>
            </BasicSelect>
          </FormField>

          <FormField label="Родительская категория">
            <BasicSelect
              value={formData.parent_id?.toString() || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                parent_id: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              disabled={!!defaultParentId}
            >
              <option value="">Корневая категория</option>
              {categories.filter(cat => cat.id !== editingCategory?.id).map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </BasicSelect>
            {defaultParentId && (
              <small className="form-field__help">
                Создание подкатегории для выбранной родительской категории
              </small>
            )}
          </FormField>

          <FormField label="Порядок сортировки">
            <Input
              type="number"
              value={formData.order_index.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
            />
          </FormField>
        </div>

        <div className="category-form__actions">
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
