import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import type { UsersAction } from '@/admin/pages/users/state/types';

interface UsersActionsProps {
  selectedUsers: string[];
  dispatch: React.Dispatch<UsersAction>;
  onBulkDelete: (userIds: string[]) => void;
  onBulkStatusChange: (userIds: string[], status: 'active' | 'inactive' | 'banned') => void;
}

const UsersActions: React.FC<UsersActionsProps> = ({
  selectedUsers,
  dispatch,
  onBulkDelete,
  onBulkStatusChange
}) => {
  const { t } = useTranslation(['admin', 'common']);

  if (selectedUsers.length === 0) return null;

  return (
    <div className="admin-users__bulk-actions">
      <div className="admin-users__bulk-info">
        <Icon name="check" size={16} />
        {t('admin:selectedUsers', { count: selectedUsers.length, defaultValue: '{{count}} пользователей выбрано' })}
      </div>
      
      <div className="admin-users__bulk-controls">
        <select
          onChange={(e) => {
            if (e.target.value) {
              onBulkStatusChange(selectedUsers, e.target.value as 'active' | 'inactive' | 'banned');
              e.target.value = '';
            }
          }}
          className="admin-users__bulk-select"
          defaultValue=""
        >
          <option value="">{t('admin:changeStatus', { defaultValue: 'Изменить статус' })}</option>
          <option value="active">{t('admin:setActive', { defaultValue: 'Активировать' })}</option>
          <option value="inactive">{t('admin:setInactive', { defaultValue: 'Деактивировать' })}</option>
          <option value="banned">{t('admin:setBanned', { defaultValue: 'Заблокировать' })}</option>
        </select>

        <button
          className="admin-users__bulk-button admin-users__bulk-button--danger"
          onClick={() => onBulkDelete(selectedUsers)}
          title={t('admin:deleteSelected', { defaultValue: 'Удалить выбранных' })}
        >
          <Icon name="delete" size={16} />
          {t('admin:delete', { defaultValue: 'Удалить' })}
        </button>

        <button
          className="admin-users__bulk-button admin-users__bulk-button--secondary"
          onClick={() => dispatch({ type: 'USERS/CLEAR_SELECTION' })}
          title={t('admin:clearSelection', { defaultValue: 'Очистить выбор' })}
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
};

export default UsersActions;
