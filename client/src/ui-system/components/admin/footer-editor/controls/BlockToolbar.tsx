import React from 'react';
import { AdminButton } from '../../AdminButton';
import { Icon } from '../../../../icons/components';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface BlockToolbarProps {
  block: FooterBlock;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  block,
  onDelete,
  onDuplicate
}) => {
  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Удалить этот блок?')) {
      onDelete();
    }
  };

  const handleDuplicate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onDuplicate();
  };

  return (
    <div className="block-toolbar">
      <div className="block-toolbar__info">
        <span className="block-toolbar__type">
          {getBlockTypeLabel(block.type)}
        </span>
      </div>
      
      <div className="block-toolbar__actions">
        <AdminButton
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          title="Дублировать блок"
        >
          <Icon name="add" size={14} />
        </AdminButton>
        
        <AdminButton
          variant="outline"
          size="sm"
          onClick={handleDelete}
          title="Удалить блок"
          className="block-toolbar__delete"
        >
          <Icon name="delete" size={14} />
        </AdminButton>
      </div>
    </div>
  );
};

function getBlockTypeLabel(type: FooterBlock['type']): string {
  const labels = {
    brand: 'Брендинг',
    links: 'Ссылки',
    contact: 'Контакты',
    social: 'Соцсети',
    newsletter: 'Подписка',
    custom: 'Произвольный'
  };
  return labels[type] || type;
}