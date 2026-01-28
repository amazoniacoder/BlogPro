// client/src/admin/pages/site-editor/components/MenuEditor.tsx
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SiteEditorTree,
  SiteEditorForm,
  SiteEditorActions
} from '@/ui-system/components/admin/site-editor';
import { useKeyboardNavigation } from '@/ui-system/hooks/useKeyboardNavigation';
import { useMenuData } from '../hooks/useMenuData';
import type { MenuItem } from '../../../../types/menu';

export const MenuEditor: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { menuItems, loading, error, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemActive } = useMenuData();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleCreate = useCallback(() => {
    setEditingItem(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingItem(null);
  }, []);





  const handleSelectAll = useCallback(() => {
    const allIds = menuItems.map(item => item.id);
    setSelectedItems(allIds);
  }, [menuItems]);

  const handleDeselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот пункт меню?')) {
      try {
        await deleteMenuItem(id);
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  }, [deleteMenuItem]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedItems.length === 0) return;
    if (confirm(t('admin:confirmDeleteSelected', { 
      count: selectedItems.length,
      defaultValue: 'Delete {{count}} selected items?' 
    }))) {
      selectedItems.forEach(id => handleDelete(id));
      setSelectedItems([]);
    }
  }, [selectedItems, handleDelete, t]);

  const handleEditSelected = useCallback(() => {
    if (selectedItems.length === 1) {
      const item = menuItems.find(item => item.id === selectedItems[0]);
      if (item) handleEdit(item);
    }
  }, [selectedItems, menuItems, handleEdit]);

  // Keyboard navigation
  useKeyboardNavigation({
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onDelete: handleDeleteSelected,
    onEdit: handleEditSelected,
    onAdd: handleCreate,
    enabled: !showForm
  });

  // Listen for external create menu item events
  React.useEffect(() => {
    const handleCreateMenuItem = () => {
      if (!showForm) {
        handleCreate();
      }
    };

    window.addEventListener('createMenuItem', handleCreateMenuItem);
    return () => {
      window.removeEventListener('createMenuItem', handleCreateMenuItem);
    };
  }, [handleCreate, showForm]);

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
      } else {
        await createMenuItem(data);
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">{t('admin:editMainMenu', { defaultValue: 'Edit Main Menu' })}</h2>
        </div>
        <div className="admin-card__content">
          <div className="site-editor-tree site-editor-tree--loading">
            <p>{t('common:loading', { defaultValue: 'Loading...' })}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">{t('admin:editMainMenu', { defaultValue: 'Edit Main Menu' })}</h2>
        </div>
        <div className="admin-card__content">
          <p className="admin-error">{t('admin:error', { defaultValue: 'Error' })}: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card__content">
        {showForm ? (
          <SiteEditorForm
            item={editingItem}
            menuItems={menuItems}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <>
            {selectedItems.length > 0 && (
              <SiteEditorActions
                selectedCount={selectedItems.length}
                onActivate={() => console.log('Activate selected items')}
                onDeactivate={() => console.log('Deactivate selected items')}
                onDelete={handleDeleteSelected}
                onClearSelection={handleDeselectAll}
              />
            )}

            <SiteEditorTree
              items={menuItems}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={toggleMenuItemActive}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
            />
          </>
        )}
      </div>
    </div>
  );
};
