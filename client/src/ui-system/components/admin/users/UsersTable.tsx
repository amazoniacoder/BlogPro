import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import type { User, UsersAction } from '@/admin/pages/users/state/types';

interface UsersTableProps {
  users: User[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  selectedUsers: string[];
  dispatch: React.Dispatch<UsersAction>;
  onDeleteClick: (userId: string) => void;
  onEditClick: (userId: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  sortField,
  sortDirection,
  selectedUsers,
  dispatch,
  onDeleteClick,
  onEditClick,
}) => {
  const { t } = useTranslation(['admin', 'common']);

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    dispatch({ type: 'USERS/SET_SORT', field, direction: newDirection });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'USERS/SELECT_ALL', selected: e.target.checked });
  };

  const handleSelectUser = (userId: string) => {
    dispatch({ type: 'USERS/TOGGLE_SELECTION', userId });
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };



  return (
    <div className="admin-users__table-wrapper">
      {users.length === 0 ? (
        <div className="admin-empty">
          <p>{t('admin:noUsersFound', { defaultValue: 'Пользователи не найдены.' })}</p>
        </div>
      ) : (
        <>
          {/* Desktop/Tablet Table View */}
          <div className="admin-table-container admin-users__table-desktop">
            <table className="admin-table">
              <thead className="admin-table__head">
                <tr>
                  <th className="admin-table__header-cell admin-table__cell--checkbox">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="admin-table__header-cell admin-table__cell--avatar">
                    {t('admin:avatar', { defaultValue: 'Аватар' })}
                  </th>
                  <th
                    onClick={() => handleSort('username')}
                    className="admin-table__header-cell admin-table__header-cell--sortable"
                  >
                    {t('admin:username', { defaultValue: 'Username' })} {getSortIcon('username')}
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="admin-table__header-cell admin-table__header-cell--sortable"
                  >
                    {t('admin:email', { defaultValue: 'Email' })} {getSortIcon('email')}
                  </th>
                  <th
                    onClick={() => handleSort('role')}
                    className="admin-table__header-cell admin-table__header-cell--sortable"
                  >
                    {t('admin:role', { defaultValue: 'Роль' })} {getSortIcon('role')}
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="admin-table__header-cell admin-table__header-cell--sortable"
                  >
                    {t('admin:status', { defaultValue: 'Статус' })} {getSortIcon('status')}
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="admin-table__header-cell admin-table__header-cell--sortable"
                  >
                    {t('admin:created', { defaultValue: 'Создан' })} {getSortIcon('createdAt')}
                  </th>
                  <th className="admin-table__header-cell">{t('admin:actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="admin-table__row">
                    <td className="admin-table__cell admin-table__cell--checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className="admin-table__cell admin-table__cell--avatar">
                      <div className="admin-table__avatar">
                        {user.profileImageUrl && user.profileImageUrl.trim() && !user.profileImageUrl.includes('undefined') ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt={user.firstName || ''} 
                            className="admin-table__avatar-image" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const placeholder = document.createElement('div');
                              placeholder.className = 'admin-table__avatar-placeholder';
                              placeholder.textContent = (user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase();
                              e.currentTarget.parentElement?.appendChild(placeholder);
                            }}
                          />
                        ) : (
                          <div className="admin-table__avatar-placeholder">
                            {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="admin-table__cell">{user.username || user.firstName || user.email.split('@')[0]}</td>
                    <td className="admin-table__cell">{user.email}</td>
                    <td className="admin-table__cell">
                      <span className={`admin-badge admin-badge--${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="admin-table__cell">
                      {user.isScheduledForDeletion ? (
                        <span className="admin-badge admin-badge--danger">Under deletion</span>
                      ) : (
                        <span className={`admin-badge admin-badge--${!user.isBlocked ? 'success' : 'secondary'}`}>
                          {user.isBlocked ? 'inactive' : 'active'}
                        </span>
                      )}
                    </td>
                    <td className="admin-table__cell">{formatDate(user.createdAt)}</td>
                    <td className="admin-table__cell admin-table__cell--actions">
                      <div className="admin-table__actions">
                        <button
                          className="admin-button admin-button--edit"
                          title={t('admin:editUser')}
                          onClick={() => onEditClick(user.id)}
                        >
                          <Icon name="edit" size={12} />
                        </button>
                        {user.role.toLowerCase() !== 'admin' && (
                          <>
                            {!user.isScheduledForDeletion && (
                              <button
                                className="admin-button admin-button--delete"
                                title={t('admin:deleteUser')}
                                onClick={() => onDeleteClick(user.id)}
                              >
                                <Icon name="delete" size={12} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="admin-users__mobile-cards">
            {users.map((user) => (
              <div key={user.id} className="admin-users__mobile-card">
                <div className="admin-users__mobile-card-header">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="admin-users__mobile-checkbox"
                  />
                  <div className="admin-users__mobile-avatar">
                    {user.profileImageUrl && user.profileImageUrl.trim() && !user.profileImageUrl.includes('undefined') ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.firstName || ''} 
                        className="admin-users__mobile-avatar-image" 
                      />
                    ) : (
                      <div className="admin-users__mobile-avatar-placeholder">
                        {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="admin-users__mobile-info">
                    <div className="admin-users__mobile-name">
                      {user.username || user.firstName || user.email.split('@')[0]}
                    </div>
                    <div className="admin-users__mobile-email">{user.email}</div>
                  </div>
                </div>
                <div className="admin-users__mobile-card-body">
                  <div className="admin-users__mobile-badges">
                    <span className={`admin-badge admin-badge--${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                    {user.isScheduledForDeletion ? (
                      <span className="admin-badge admin-badge--danger">Under deletion</span>
                    ) : (
                      <span className={`admin-badge admin-badge--${!user.isBlocked ? 'success' : 'secondary'}`}>
                        {user.isBlocked ? 'inactive' : 'active'}
                      </span>
                    )}
                  </div>
                  <div className="admin-users__mobile-date">
                    {t('admin:created', { defaultValue: 'Создан' })}: {formatDate(user.createdAt)}
                  </div>
                </div>
                <div className="admin-users__mobile-actions">
                  <button
                    className="admin-button admin-button--edit admin-button--small"
                    onClick={() => onEditClick(user.id)}
                  >
                    <Icon name="edit" size={14} />
                    {t('admin:edit', { defaultValue: 'Редактировать' })}
                  </button>
                  {user.role.toLowerCase() !== 'admin' && !user.isScheduledForDeletion && (
                    <button
                      className="admin-button admin-button--delete admin-button--small"
                      onClick={() => onDeleteClick(user.id)}
                    >
                      <Icon name="delete" size={14} />
                      {t('admin:delete', { defaultValue: 'Удалить' })}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(UsersTable);
