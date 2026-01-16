import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from './ConfirmModal';
import websocketService from '@/services/websocket-service';

interface User {
  id: string;
  login?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  marketingEmails: boolean;
}

interface UserSelectorProps {
  onUsersSelected?: (userIds: string[]) => void;
}

const UserSelector = ({ onUsersSelected }: UserSelectorProps) => {
  const { t } = useTranslation(['admin', 'common']);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState({ mailingList: 'all', search: '' });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [mailingLists, setMailingLists] = useState<{id: number, name: string}[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMailingList, setSelectedMailingList] = useState<{id: number, name: string} | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.mailingList !== 'all') params.append('mailingListId', filters.mailingList);
      if (filters.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/users/for-mailing?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMailingLists = async () => {
    try {
      const response = await fetch('/api/mailings/lists');
      if (response.ok) {
        const data = await response.json();
        setMailingLists(data);
      }
    } catch (error) {
      console.error('Failed to fetch mailing lists:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMailingLists();
    setCurrentPage(1);
    
    // Initialize WebSocket connection
    console.log('UserSelector: Initializing WebSocket connection');
    if (!websocketService.isConnected()) {
      console.log('UserSelector: WebSocket not connected, connecting...');
      websocketService.connect();
    } else {
      console.log('UserSelector: WebSocket already connected');
    }
    
    // Listen for user updates
    const handleUserUpdate = (userData: any) => {
      console.log('UserSelector: Received user update:', userData);
      setUsers(prevUsers => {
        const updated = prevUsers.map(user => 
          user.id === userData.id ? {
            ...user,
            login: userData.login || user.login,
            firstName: userData.firstName || user.firstName,
            lastName: userData.lastName || user.lastName,
            email: userData.email || user.email,
            role: userData.role || user.role,
            emailVerified: userData.emailVerified ?? user.emailVerified,
            marketingEmails: userData.marketingEmails ?? user.marketingEmails
          } : user
        );
        console.log('UserSelector: Updated users list');
        return updated;
      });
    };
    
    // Listen for user deletions
    const handleUserDeleted = (data: any) => {
      console.log('UserSelector: User deleted:', data);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== data.userId));
      setSelectedUsers(prevSelected => prevSelected.filter(id => id !== data.userId));
    };
    
    websocketService.subscribe('user_updated', handleUserUpdate);
    websocketService.subscribe('user_deleted', handleUserDeleted);
    
    return () => {
      websocketService.unsubscribe('user_updated', handleUserUpdate);
      websocketService.unsubscribe('user_deleted', handleUserDeleted);
    };
  }, [filters]);

  const handleMailingListSelect = (listId: string) => {
    const list = mailingLists.find(l => l.id === parseInt(listId));
    if (list) {
      setSelectedMailingList(list);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmAddUsers = async () => {
    if (!selectedMailingList || selectedUsers.length === 0) return;
    
    try {
      const response = await fetch(`/api/mailings/lists/${selectedMailingList.id}/recipients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userIds: selectedUsers })
      });
      
      if (response.ok) {
        setSelectedUsers([]);
        onUsersSelected?.(selectedUsers);
      }
    } catch (error) {
      console.error('Failed to add users to mailing list:', error);
    } finally {
      setShowConfirmModal(false);
      setSelectedMailingList(null);
    }
  };



  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="user-selector">
      <div className="admin-section__header">
        <h3>{t('admin:selectUsersForMailingList', { defaultValue: 'Выбрать пользователей для списка рассылки' })}</h3>
        <div className="user-selector__filters">
          <input
            type="text"
            placeholder={t('admin:searchUsers', { defaultValue: 'Поиск пользователей...' })}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="admin-form__input"
          />
          <select 
            value={filters.mailingList}
            onChange={(e) => setFilters(prev => ({ ...prev, mailingList: e.target.value }))}
            className="admin-form__select"
          >
            <option value="all">{t('admin:allMailings', { defaultValue: 'Все рассылки' })}</option>
            {mailingLists.map(list => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
          <select 
            value=""
            onChange={(e) => e.target.value && handleMailingListSelect(e.target.value)}
            className="admin-form__select"
            disabled={selectedUsers.length === 0}
          >
            <option value="">{t('admin:addToMailingList', { count: selectedUsers.length, defaultValue: 'Добавить в список рассылки ({{count}})' })}</option>
            {mailingLists.map(list => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-section__loading">{t('common:loading')}</div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead className="admin-table__head">
                <tr>
                  <th className="admin-table__header-cell admin-table__cell--checkbox">
                    <input
                      type="checkbox"
                      checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.includes(u.id))}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="admin-table__header-cell">{t('admin:login')}</th>
                  <th className="admin-table__header-cell">{t('admin:email')}</th>
                  <th className="admin-table__header-cell">{t('admin:role')}</th>
                  <th className="admin-table__header-cell">{t('admin:status')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => (
                  <tr key={user.id} className="admin-table__row">
                    <td className="admin-table__cell admin-table__cell--checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className="admin-table__cell">
                      {user.login || user.firstName || user.email.split('@')[0]}
                    </td>
                    <td className="admin-table__cell">{user.email}</td>
                    <td className="admin-table__cell">
                      <span className={`admin-badge admin-badge--${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="admin-table__cell">
                      <div className="user-status-indicators">
                        {user.emailVerified ? (
                          <span className="admin-badge admin-badge--success">{t('admin:verified', { defaultValue: 'Подтвержден' })}</span>
                        ) : (
                          <span className="admin-badge admin-badge--warning">{t('admin:unverified', { defaultValue: 'Не подтвержден' })}</span>
                        )}
                        {user.marketingEmails && (
                          <span className="admin-badge admin-badge--info">{t('admin:marketingOk', { defaultValue: 'Маркетинг ОК' })}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-table-controls">
            <div className="admin-table-controls__info">
              {t('admin:showingUsersRange', {
                start: startIndex + 1,
                end: Math.min(startIndex + itemsPerPage, users.length),
                total: users.length,
                defaultValue: 'Показано {{start}}-{{end}} из {{total}} пользователей'
              })}
              {selectedUsers.length > 0 && ` | ${selectedUsers.length} ${t('admin:selected', { defaultValue: 'выбрано' })}`}
            </div>
            
            {totalPages > 1 && (
              <div className="admin-table-controls__pagination">
                <button
                  className="admin-button admin-button--small"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  {t('common:previous', { defaultValue: 'Предыдущая' })}
                </button>
                <span className="pagination-info">
                  {t('admin:pageOf', { current: currentPage, total: totalPages, defaultValue: 'Страница {{current}} из {{total}}' })}
                </span>
                <button
                  className="admin-button admin-button--small"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('common:next', { defaultValue: 'Следующая' })}
                </button>
              </div>
            )}
          </div>

          <ConfirmModal
            isOpen={showConfirmModal}
            title={t('admin:addUsersToMailingList', { defaultValue: 'Добавить пользователей в список рассылки' })}
            message={selectedMailingList ? 
              `Add ${selectedUsers.length} selected user${selectedUsers.length !== 1 ? 's' : ''} to mailing list "${selectedMailingList.name}"?` : 
              ''
            }
            onConfirm={handleConfirmAddUsers}
            onCancel={() => setShowConfirmModal(false)}
            confirmText={t('admin:addUsers', { defaultValue: 'Добавить пользователей' })}
            confirmButtonClass="admin-button--primary"
          />
        </>
      )}
    </div>
  );
};

export default UserSelector;
