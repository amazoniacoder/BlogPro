/**
 * BlogPro Category List Component
 * UI System component for displaying and managing documentation categories
 */

import React from 'react';
import { Button } from '../../button';
import { Icon, type IconName } from '../../../icons/components';
import type { DocumentationCategory } from '../../../../../../shared/types/documentation';
import './CategoryList.css';

export interface CategoryListProps {
  categories: DocumentationCategory[];
  onEdit: (category: DocumentationCategory) => void;
  onDelete: (id: number) => void;
}

const getIconByName = (name: string): IconName => {
  const lowerName = name.toLowerCase();
  
  if (lowerName === 'начало работы') return 'rocket-diamond';
  if (lowerName === 'справочник api') return 'file-search';
  if (lowerName === 'руководство пользователя') return 'file-users';
  if (lowerName === 'руководство администратора') return 'file-crown';
  if (lowerName === 'разработка') return 'gear';
  if (lowerName === 'часто задаваемые вопросы') return 'info';
  
  if (lowerName.includes('начало')) return 'rocket-diamond';
  if (lowerName.includes('справочник')) return 'file-search';
  if (lowerName.includes('руководство пользователя')) return 'file-users';
  if (lowerName.includes('руководство администратора')) return 'file-crown';
  if (lowerName.includes('разработка')) return 'gear';
  if (lowerName.includes('руководство')) return 'book';
  
  return 'folder';
};

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete
}) => {
  if (categories.length === 0) {
    return (
      <div className="category-list category-list--empty">
        <p className="category-list__empty-message">
          Категории не найдены. Создайте первую категорию для организации документации.
        </p>
      </div>
    );
  }

  return (
    <div className="category-list">
      <div className="category-list__grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-card__header">
              <div className="category-card__icon">
                <Icon name={getIconByName(category.name)} size={24} />
              </div>
              <div className="category-card__info">
                <h3 className="category-card__name">{category.name}</h3>
                <p className="category-card__slug">/{category.slug}</p>
              </div>
            </div>
            
            {category.description && (
              <p className="category-card__description">
                {category.description}
              </p>
            )}
            
            <div className="category-card__meta">
              <span className="category-card__order">
                Порядок: {category.order_index}
              </span>
            </div>
            
            <div className="category-card__actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(category)}
              >
                Редактировать
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(category.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
