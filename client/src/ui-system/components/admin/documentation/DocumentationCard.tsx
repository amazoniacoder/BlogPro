/**
 * BlogPro Documentation Card Component
 * UI System component for displaying documentation items
 */

import React from 'react';
import { Button } from '../../button';
import { Badge } from '../../feedback';
import { Icon, type IconName } from '../../../icons/components';
import type { Documentation, DocumentationCategory } from '../../../../../../shared/types/documentation';

export interface DocumentationCardProps {
  documentation: Documentation;
  categories: DocumentationCategory[];
  onEdit: (doc: Documentation) => void;
  onDelete: (id: number) => void;
}

export const DocumentationCard: React.FC<DocumentationCardProps> = ({
  documentation,
  categories,
  onEdit,
  onDelete
}) => {
  const getCategoryInfo = (categoryId?: number) => {
    if (!categoryId) return { name: 'Без категории', icon: 'file' as IconName };
    const category = categories?.find(cat => cat.id === categoryId);
    if (!category) return { name: 'Неизвестная категория', icon: 'file' as IconName };
    
    // Map category names to BlogPro icons
    const getIconByName = (name: string): IconName => {
      const lowerName = name.toLowerCase();
      
      // Russian exact matches
      if (lowerName === 'начало работы') return 'rocket-diamond';
      if (lowerName === 'справочник api') return 'file-search';
      if (lowerName === 'руководство пользователя') return 'file-users';
      if (lowerName === 'руководство администратора') return 'file-crown';
      if (lowerName === 'разработка') return 'gear';
      if (lowerName === 'часто задаваемые вопросы') return 'info';
      
      // English fallbacks
      if (lowerName === 'user guide') return 'file-users';
      if (lowerName === 'administrator guide') return 'file-crown';
      if (lowerName === 'api reference') return 'file-search';
      
      // Pattern matches
      if (lowerName.includes('начало')) return 'rocket-diamond';
      if (lowerName.includes('справочник')) return 'file-search';
      if (lowerName.includes('руководство пользователя')) return 'file-users';
      if (lowerName.includes('руководство администратора')) return 'file-crown';
      if (lowerName.includes('разработка')) return 'gear';
      if (lowerName.includes('руководство')) return 'book';
      
      return 'file';
    };
    
    return { name: category.name, icon: getIconByName(category.name) };
  };

  return (
    <div className="documentation-card">
      <div className="documentation-card__header">
        <h3 className="documentation-card__title">
          {documentation.title || 'Без названия'}
        </h3>
        <Badge 
          variant={documentation.is_published ? 'success' : 'warning'}
          className="documentation-card__status"
        >
          {documentation.is_published ? 'Опубликован' : 'Черновик'}
        </Badge>
      </div>
      
      <div className="documentation-card__meta">
        <span className="documentation-card__category">
          <Icon 
            name={getCategoryInfo(documentation.category_id).icon} 
            size={['file-search', 'file-users', 'file-crown'].includes(getCategoryInfo(documentation.category_id).icon) ? 20 : 16} 
            className="documentation-card__category-icon"
          />
          {getCategoryInfo(documentation.category_id).name}
        </span>
        <span className="documentation-card__slug">
          /{documentation.slug || 'no-slug'}
        </span>
      </div>

      {documentation.excerpt && (
        <p className="documentation-card__excerpt">
          {documentation.excerpt}
        </p>
      )}

      <div className="documentation-card__actions">
        <Button 
          variant="primary"
          size="sm"
          onClick={() => onEdit(documentation)}
        >
          Редактировать
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onDelete(documentation.id)}
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};
