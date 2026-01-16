import { Icon } from '../../../../../../../ui-system/icons/components';
/**
 * Menu Builder
 * 
 * Component for building hierarchical navigation menus.
 */

import React, { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  title: string;
  url?: string;
  content_id?: string;
  section_id?: string;
  parent_id?: string;
  level: number;
  order_index: number;
  icon?: string;
  is_active: boolean;
  target: string;
  children?: MenuItem[];
}

interface MenuBuilderProps {
  onMenuUpdate?: () => void;
}

export const MenuBuilder: React.FC<MenuBuilderProps> = ({ onMenuUpdate }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documentation/menu', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (itemData: Partial<MenuItem>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documentation/menu', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(itemData)
      });
      
      if (response.ok) {
        await loadMenuItems();
        setShowCreateModal(false);
        onMenuUpdate?.();
      }
    } catch (error) {
      console.error('Failed to create menu item:', error);
    }
  };

  const handleUpdateItem = async (id: string, itemData: Partial<MenuItem>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documentation/menu/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(itemData)
      });
      
      if (response.ok) {
        await loadMenuItems();
        setEditingItem(null);
        onMenuUpdate?.();
      }
    } catch (error) {
      console.error('Failed to update menu item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documentation/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        await loadMenuItems();
        onMenuUpdate?.();
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const renderMenuTree = (items: MenuItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id} className="menu-item" style={{ marginLeft: `${level * 20}px` }}>
        <div className="menu-item__header">
          <span className="menu-item__icon">{item.icon || '🔗'}</span>
          <span className="menu-item__title">{item.title}</span>
          {item.url && <span className="menu-item__url">→ {item.url}</span>}
          
          <div className="menu-item__actions">
            <button
              onClick={() => setEditingItem(item)}
              className="btn btn--small btn--secondary"
            >
              <Icon name="edit" size={16} /> Edit
            </button>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="btn btn--small btn--danger"
            >
              <Icon name="delete" size={16} /> Delete
            </button>
          </div>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div className="menu-item__children">
            {renderMenuTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="menu-builder">
      <div className="menu-builder__header">
        <h1>🗂️ Menu Builder</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn--primary"
        >
          <Icon name="add" size={16} /> Add Menu Item
        </button>
      </div>

      <div className="menu-preview">
        <h3>📋 Menu Structure</h3>
        {menuItems.length > 0 ? (
          <div className="menu-tree">
            {renderMenuTree(menuItems)}
          </div>
        ) : (
          <div className="empty-state">
            <p>No menu items found. Create your first menu item to get started.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <MenuItemModal
          title="Create Menu Item"
          onSave={handleCreateItem}
          onClose={() => setShowCreateModal(false)}
          parentItems={menuItems}
        />
      )}

      {editingItem && (
        <MenuItemModal
          title="Edit Menu Item"
          item={editingItem}
          onSave={(data) => handleUpdateItem(editingItem.id, data)}
          onClose={() => setEditingItem(null)}
          parentItems={menuItems}
        />
      )}
    </div>
  );
};

interface MenuItemModalProps {
  title: string;
  item?: MenuItem;
  onSave: (data: Partial<MenuItem>) => void;
  onClose: () => void;
  parentItems: MenuItem[];
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  title,
  item,
  onSave,
  onClose,
  parentItems
}) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    url: item?.url || '',
    parent_id: item?.parent_id || '',
    icon: item?.icon || '🔗',
    target: item?.target || '_self',
    is_active: item?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const flattenMenuItems = (items: MenuItem[]): MenuItem[] => {
    const flattened: MenuItem[] = [];
    
    const flatten = (menuItems: MenuItem[], prefix = '') => {
      menuItems.forEach(menuItem => {
        flattened.push({
          ...menuItem,
          title: prefix + menuItem.title
        });
        
        if (menuItem.children && menuItem.children.length > 0) {
          flatten(menuItem.children, prefix + '  ');
        }
      });
    };
    
    flatten(items);
    return flattened;
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal__close">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal__content">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>URL</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="/path/to/page or https://external-link.com"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🔗"
              />
            </div>
            
            <div className="form-group">
              <label>Target</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              >
                <option value="_self">Same Window</option>
                <option value="_blank">New Window</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Parent Item</label>
            <select
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
            >
              <option value="">No Parent (Root Level)</option>
              {flattenMenuItems(parentItems)
                .filter(parent => parent.id !== item?.id) // Don't allow self as parent
                .map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.title}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
          
          <div className="modal__actions">
            <button type="button" onClick={onClose} className="btn btn--secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {item ? 'Update' : 'Create'} Menu Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
