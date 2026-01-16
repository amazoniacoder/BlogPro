import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SiteEditorTreeItem from './SiteEditorTreeItem';
import type { MenuItem } from '@/types/menu';

interface SiteEditorTreeProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  selectedItems?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

const SiteEditorTree: React.FC<SiteEditorTreeProps> = ({
  items,
  onEdit,
  onDelete,
  selectedItems = [],
  onSelectionChange
}) => {
  const { t } = useTranslation(['admin', 'common']);


  
  // Handle selection
  const handleSelect = useCallback((id: number, selected: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = selected 
      ? [...selectedItems, id]
      : selectedItems.filter(itemId => itemId !== id);
    
    onSelectionChange(newSelection);
  }, [selectedItems, onSelectionChange]);

  if (!items || items.length === 0) {
    return (
      <div className="site-editor-tree site-editor-tree--empty">
        <div className="site-editor-tree__empty-icon">
          📁
        </div>
        <div className="site-editor-tree__empty-title">
          {t('admin:noMenuItems', { defaultValue: 'No menu items found' })}
        </div>
        <div className="site-editor-tree__empty-description">
          {t('admin:createFirstMenuItem', { defaultValue: 'Create your first menu item to get started' })}
        </div>
      </div>
    );
  }

  return (
    <div className="site-editor-tree" role="tree">
      {items.map(item => (
        <SiteEditorTreeItem
          key={item.id}
          item={item}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={handleSelect}
          isSelected={selectedItems.includes(item.id)}
        />
      ))}
    </div>
  );
};

export default SiteEditorTree;
