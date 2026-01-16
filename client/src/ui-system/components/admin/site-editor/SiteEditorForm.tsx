import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import type { MenuItem } from '@/types/menu';

interface SiteEditorFormProps {
  item?: MenuItem | null;
  menuItems: MenuItem[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const SiteEditorForm: React.FC<SiteEditorFormProps> = ({
  item,
  menuItems,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation(['admin', 'common']);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    parent_id: '',
    order_index: 0,
    is_active: true,
    target: '_self' as '_self' | '_blank',
    icon: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        url: item.url || '',
        parent_id: item.parent_id?.toString() || '',
        order_index: item.order_index || 0,
        is_active: item.is_active !== undefined ? item.is_active : true,
        target: item.target || '_self',
        icon: item.icon || ''
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : undefined,
      url: formData.url || undefined
    };

    onSave(submitData);
  };

  const getParentOptions = (items: MenuItem[], excludeId?: number): MenuItem[] => {
    const flatItems: MenuItem[] = [];
    
    const flatten = (menuItems: MenuItem[], level = 0) => {
      menuItems.forEach(menuItem => {
        if (menuItem.id !== excludeId) {
          flatItems.push({ ...menuItem, level });
          if (menuItem.children) {
            flatten(menuItem.children, level + 1);
          }
        }
      });
    };
    
    flatten(items);
    return flatItems;
  };

  const parentOptions = getParentOptions(menuItems, item?.id);

  return (
    <div className="site-editor-form">
      <div className="site-editor-form__header">
        <h3 className="site-editor-form__title">
          {item 
            ? t('admin:editMenuItem', { defaultValue: 'Edit Menu Item' })
            : t('admin:createMenuItem', { defaultValue: 'Create Menu Item' })
          }
        </h3>
        <button
          onClick={onCancel}
          className="admin-button admin-button--secondary"
        >
          <Icon name="arrow-left" size={16} />
          {t('admin:backToList', { defaultValue: 'Back to List' })}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="site-editor-form__content">
        <div className="site-editor-form__grid">
          <div className="site-editor-form__group">
            <label className="site-editor-form__label">
              {t('admin:title', { defaultValue: 'Title' })} <span className="site-editor-form__required">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="site-editor-form__input"
              required
            />
          </div>

          <div className="site-editor-form__group">
            <label className="site-editor-form__label">
              {t('admin:url', { defaultValue: 'URL' })}
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="site-editor-form__input"
              placeholder="/about, https://example.com"
            />
          </div>

          <div className="site-editor-form__group">
            <label className="site-editor-form__label">
              {t('admin:parentItem', { defaultValue: 'Parent Item' })}
            </label>
            <select
              value={formData.parent_id}
              onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
              className="site-editor-form__select"
            >
              <option value="">{t('admin:rootLevel', { defaultValue: 'Root Level' })}</option>
              {parentOptions.map(option => (
                <option key={option.id} value={option.id.toString()}>
                  {'—'.repeat(option.level || 0)} {option.title}
                </option>
              ))}
            </select>
          </div>

          <div className="site-editor-form__group">
            <label className="site-editor-form__label">
              {t('admin:order', { defaultValue: 'Order' })}
            </label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
              className="site-editor-form__input"
              min="0"
            />
          </div>

          <div className="site-editor-form__group">
            <label className="site-editor-form__label">
              {t('admin:linkTarget', { defaultValue: 'Link Target' })}
            </label>
            <select
              value={formData.target}
              onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value as '_self' | '_blank' }))}
              className="site-editor-form__select"
            >
              <option value="_self">{t('admin:currentWindow', { defaultValue: 'Current Window' })}</option>
              <option value="_blank">{t('admin:newWindow', { defaultValue: 'New Window' })}</option>
            </select>
          </div>

          <div className="site-editor-form__group">
            <label className="site-editor-form__label">
              {t('admin:icon', { defaultValue: 'Icon' })}
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="site-editor-form__input"
              placeholder="🏠, 📄, ✉️"
            />
          </div>
        </div>

        <div className="site-editor-form__checkbox">
          <label className="site-editor-form__checkbox-label">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="site-editor-form__checkbox-input"
            />
            {t('admin:active', { defaultValue: 'Active' })}
          </label>
        </div>

        <div className="site-editor-form__actions">
          <button
            type="button"
            onClick={onCancel}
            className="admin-button admin-button--secondary"
          >
            <Icon name="x" size={16} />
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            type="submit"
            className="admin-button admin-button--primary"
          >
            <Icon name="check" size={16} />
            {t('common:save', { defaultValue: 'Save' })}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteEditorForm;
