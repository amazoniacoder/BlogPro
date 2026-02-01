import React from 'react';
import { Card } from '../../card';
import { AdminButton } from '../AdminButton';
import { Icon } from '../../../icons/components';
import type { FooterBlock } from '../../../../../../shared/types/footer';

interface BlockLibraryProps {
  onBlockAdd: (blockType: FooterBlock['type']) => void;
  onClose?: () => void;
}

interface BlockTemplate {
  type: FooterBlock['type'];
  title: string;
  description: string;
  icon: string;
}

const blockTemplates: BlockTemplate[] = [
  {
    type: 'brand',
    title: 'Брендинг',
    description: 'Логотип, название и описание компании',
    icon: 'gear'
  },
  {
    type: 'links',
    title: 'Ссылки',
    description: 'Навигационные ссылки и меню',
    icon: 'gear'
  },
  {
    type: 'contact',
    title: 'Контакты',
    description: 'Адрес, телефон, email',
    icon: 'gear'
  },
  {
    type: 'social',
    title: 'Соцсети',
    description: 'Ссылки на социальные сети',
    icon: 'gear'
  },
  {
    type: 'newsletter',
    title: 'Подписка',
    description: 'Форма подписки на рассылку',
    icon: 'gear'
  },
  {
    type: 'custom',
    title: 'Произвольный',
    description: 'Пользовательский HTML контент',
    icon: 'gear'
  }
];

export const BlockLibrary: React.FC<BlockLibraryProps> = ({
  onBlockAdd,
  onClose
}) => {
  return (
    <div className="block-library">
      <div className="block-library__header">
        <h3>Библиотека блоков</h3>
        {onClose && (
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </AdminButton>
        )}
      </div>

      <div className="block-library__grid">
        {blockTemplates.map((template) => (
          <Card
            key={template.type}
            className="block-library__item"
            onClick={() => onBlockAdd(template.type)}
          >
            <div className="block-library__item-header">
              <Icon name={template.icon as any} size={24} />
              <h4>{template.title}</h4>
            </div>
            
            <p className="block-library__item-description">
              {template.description}
            </p>
            
            <AdminButton
              variant="primary"
              size="sm"
              fullWidth
            >
              <Icon name="add" size={14} />
              Добавить
            </AdminButton>
          </Card>
        ))}
      </div>
    </div>
  );
};