import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/ui-system/icons/components';
import type { MenuItem } from '@/types/menu';

interface SiteEditorTreeItemProps {
  item: MenuItem;
  level: number;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggle?: (id: number, expanded: boolean) => void;
  onSelect?: (id: number, selected: boolean) => void;
  isSelected?: boolean;
  isSaving?: boolean;
}

const SiteEditorTreeItem: React.FC<SiteEditorTreeItemProps> = ({
  item,
  level,
  onEdit,
  onDelete,
  onToggle,
  onSelect,
  isSelected = false,
  isSaving = false
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const childrenRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newExpanded = !isExpanded;
    
    // Add animation class
    if (childrenRef.current) {
      childrenRef.current.classList.add(
        newExpanded ? 'site-editor-tree-item__children--expanding' : 'site-editor-tree-item__children--collapsing'
      );
    }
    
    // Update state after a brief delay for smooth animation
    setTimeout(() => {
      setIsExpanded(newExpanded);
      onToggle?.(item.id, newExpanded);
      
      // Clean up animation classes
      setTimeout(() => {
        if (childrenRef.current) {
          childrenRef.current.classList.remove(
            'site-editor-tree-item__children--expanding',
            'site-editor-tree-item__children--collapsing'
          );
        }
        setIsAnimating(false);
      }, 400);
    }, 50);
  }, [isExpanded, isAnimating, item.id, onToggle]);



  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onEdit(item);
        break;
      case 'ArrowRight':
        if (hasChildren && !isExpanded) {
          handleToggle();
        }
        break;
      case 'ArrowLeft':
        if (hasChildren && isExpanded) {
          handleToggle();
        }
        break;
      case 'Delete':
        e.preventDefault();
        onDelete(item.id);
        break;
    }
  }, [item, hasChildren, isExpanded, handleToggle, onEdit, onDelete]);

  // Context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
  }, []);

  // Selection
  const handleSelect = useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      onSelect?.(item.id, !isSelected);
    }
  }, [item.id, isSelected, onSelect]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  const getMenuIcon = (): IconName => {
    if (hasChildren) return 'folder';
    if (item.url?.startsWith('http')) return 'share';
    return 'file';
  };

  const getStatusClass = () => {
    if (!item.is_active) return 'site-editor-tree-item__status--inactive';
    return 'site-editor-tree-item__status--active';
  };

  // Generate dynamic classes
  const itemClasses = [
    'site-editor-tree-item',
    isSelected && 'site-editor-tree-item--selected',
    isSaving && 'site-editor-tree-item--saving'
  ].filter(Boolean).join(' ');

  const toggleClasses = [
    'site-editor-tree-item__toggle',
    isExpanded && 'site-editor-tree-item__toggle--expanded',
    isAnimating && 'site-editor-tree-item__toggle--loading'
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={itemRef}
      className={itemClasses} 
      style={{ '--level': level } as React.CSSProperties}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onClick={handleSelect}
      tabIndex={0}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      <div 
        className={`site-editor-tree-item__header ${hasChildren ? 'site-editor-tree-item__header--clickable' : ''}`}
        onClick={hasChildren ? handleToggle : undefined}
      >
        <div className="site-editor-tree-item__content">
          {hasChildren ? (
            <button
              className={toggleClasses}
              disabled={isAnimating}
              aria-label={isExpanded ? t('common:collapse') : t('common:expand')}
              aria-expanded={isExpanded}
            >
              <Icon name="arrow-right" size={12} />
            </button>
          ) : (
            <div className="site-editor-tree-item__spacer" />
          )}

          <div className="site-editor-tree-item__icon">
            <Icon name={getMenuIcon()} size={16} />
          </div>

          <div className="site-editor-tree-item__info">
            <div className="site-editor-tree-item__title">{item.title}</div>
            {item.url && (
              <div className="site-editor-tree-item__url">{item.url}</div>
            )}
            <div className={`site-editor-tree-item__status ${getStatusClass()}`}>
              {item.is_active ? t('admin:active') : t('admin:inactive')}
            </div>
          </div>
        </div>

        <div className="site-editor-tree-item__actions">
          <button
            className="site-editor-tree-item__action site-editor-tree-item__action--edit"
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            title={t('admin:edit')}
          >
            <Icon name="edit" size={14} />
          </button>
          <button
            className="site-editor-tree-item__action site-editor-tree-item__action--delete"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            title={t('admin:delete')}
          >
            <Icon name="delete" size={14} />
          </button>
        </div>
      </div>

      {hasChildren && (
        <div 
          ref={childrenRef}
          className={`site-editor-tree-item__children ${isExpanded ? 'site-editor-tree-item__children--expanded' : 'site-editor-tree-item__children--collapsed'}`}
          role="group"
        >
          {item.children!.map(child => (
            <SiteEditorTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onSelect={onSelect}
              isSelected={isSelected}
              isSaving={isSaving}
            />
          ))}
        </div>
      )}

      {showContextMenu && (
        <div className="site-editor-tree-item__context-menu">
          <button onClick={() => { onEdit(item); setShowContextMenu(false); }}>
            <Icon name="edit" size={14} /> {t('admin:edit')}
          </button>
          <button onClick={() => { onDelete(item.id); setShowContextMenu(false); }}>
            <Icon name="delete" size={14} /> {t('admin:delete')}
          </button>
          <button onClick={() => { onSelect?.(item.id, !isSelected); setShowContextMenu(false); }}>
            <Icon name="check" size={14} /> {isSelected ? t('admin:deselect') : t('admin:select')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SiteEditorTreeItem;
