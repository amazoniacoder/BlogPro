import React, { useRef, useEffect } from 'react';
import { Icon } from '../../../../icons/components';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface ContextMenuProps {
  block: FooterBlock;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  block,
  position,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      label: 'Редактировать',
      icon: 'edit',
      onClick: () => {
        onEdit();
        onClose();
      }
    },
    {
      label: 'Дублировать',
      icon: 'add',
      onClick: () => {
        onDuplicate();
        onClose();
      }
    },
    { type: 'separator' },
    {
      label: 'Переместить вверх',
      icon: 'arrow-up',
      onClick: () => {
        onMoveUp();
        onClose();
      }
    },
    {
      label: 'Переместить вниз',
      icon: 'arrow-down',
      onClick: () => {
        onMoveDown();
        onClose();
      }
    },
    { type: 'separator' },
    {
      label: 'Удалить',
      icon: 'delete',
      onClick: () => {
        if (confirm('Удалить этот блок?')) {
          onDelete();
          onClose();
        }
      },
      className: 'context-menu__item--danger'
    }
  ];

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000
      }}
    >
      <div className="context-menu__header">
        <span className="context-menu__title">
          {getBlockTypeLabel(block.type)}
        </span>
      </div>
      
      <div className="context-menu__items">
        {menuItems.map((item, index) => {
          if (item.type === 'separator') {
            return <div key={index} className="context-menu__separator" />;
          }

          return (
            <button
              key={index}
              className={`context-menu__item ${item.className || ''}`}
              onClick={item.onClick}
            >
              <Icon name={item.icon as any} size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

function getBlockTypeLabel(type: FooterBlock['type']): string {
  const labels = {
    brand: 'Блок брендинга',
    links: 'Блок ссылок',
    contact: 'Блок контактов',
    social: 'Блок соцсетей',
    newsletter: 'Блок подписки',
    custom: 'Произвольный блок'
  };
  return labels[type] || type;
}