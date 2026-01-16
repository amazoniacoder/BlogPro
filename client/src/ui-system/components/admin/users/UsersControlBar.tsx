import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import UsersAdvancedFilters from './UsersAdvancedFilters';
import type { UsersAction } from '@/admin/pages/users/state/types';

interface UsersControlBarProps {
  filters: {
    search: string;
    status: string;
    role: string;
    dateFrom?: string;
    dateTo?: string;
    emailVerified?: string;
  };
  dispatch: React.Dispatch<UsersAction>;
  onAddUserClick: () => void;
}

const UsersControlBar: React.FC<UsersControlBarProps> = ({
  filters,
  dispatch,
  onAddUserClick
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    dispatch({ type: 'USERS/SET_FILTER', field, value });
  };

  const handleResetFilters = () => {
    handleFilterChange('search', '');
    handleFilterChange('status', '');
    handleFilterChange('role', '');
    handleFilterChange('dateFrom', '');
    handleFilterChange('dateTo', '');
    handleFilterChange('emailVerified', '');
  };

  return (
    <div className="admin-users-controls-wrapper">
      <div className="admin-users-controls">
        <div className="admin-users-controls__top-row">
          <div className="admin-users-controls__search" ref={searchRef}>
            <button
              className={`admin-users-search__toggle ${showSearch ? 'admin-users-search__toggle--active' : ''}`}
              onClick={() => setShowSearch(!showSearch)}
              title={t('admin:toggleSearch', { defaultValue: 'Поиск' })}
            >
              <Icon name="search" size={16} />
              {filters.search && <span className="admin-users__filter-indicator" />}
            </button>
            {showSearch && (
              <div className="admin-users-search">
                <input
                  type="text"
                  placeholder={t('admin:searchUsersPlaceholder', { defaultValue: 'Поиск пользователей по имени или email...' })}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="admin-users-search__input"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="admin-users-controls__filters">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="admin-users-controls__select"
            >
              <option value="">{t('admin:allStatuses', { defaultValue: 'Все статусы' })}</option>
              <option value="active">{t('admin:active', { defaultValue: 'Активный' })}</option>
              <option value="inactive">{t('admin:inactive', { defaultValue: 'Неактивный' })}</option>
              <option value="banned">{t('admin:banned', { defaultValue: 'Заблокирован' })}</option>
            </select>

            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="admin-users-controls__select"
            >
              <option value="">{t('admin:allRoles', { defaultValue: 'Все роли' })}</option>
              <option value="admin">{t('admin:adminRole', { defaultValue: 'Администратор' })}</option>
              <option value="editor">{t('admin:editorRole', { defaultValue: 'Редактор' })}</option>
              <option value="user">{t('admin:userRole', { defaultValue: 'Пользователь' })}</option>
            </select>
          </div>

          <UsersAdvancedFilters
            filters={filters}
            isExpanded={showAdvanced}
            onToggle={() => setShowAdvanced(!showAdvanced)}
          />

          <button
            className="admin-users-controls__reset"
            onClick={handleResetFilters}
            title={t('admin:resetFilters', { defaultValue: 'Сбросить фильтры' })}
          >
            <Icon name="refresh" size={16} />
          </button>
        </div>

        <div className="admin-users-controls__actions">
          <button
            className="admin-button admin-button--primary admin-users-controls__add-button"
            onClick={onAddUserClick}
          >
            <Icon name="add" size={16} />
            {t('admin:addNewUser', { defaultValue: 'Добавить пользователя' })}
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="admin-users__advanced-content">
          <div className="admin-users__advanced-grid">
            <div className="admin-users__filter-group">
              <label className="admin-users__filter-label">
                {t('admin:registrationDateFrom', { defaultValue: 'Дата регистрации с' })}
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="admin-users__filter-input"
              />
            </div>

            <div className="admin-users__filter-group">
              <label className="admin-users__filter-label">
                {t('admin:registrationDateTo', { defaultValue: 'Дата регистрации до' })}
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="admin-users__filter-input"
              />
            </div>

            <div className="admin-users__filter-group">
              <label className="admin-users__filter-label">
                {t('admin:emailVerification', { defaultValue: 'Подтверждение email' })}
              </label>
              <select
                value={filters.emailVerified || ''}
                onChange={(e) => handleFilterChange('emailVerified', e.target.value)}
                className="admin-users__filter-select"
              >
                <option value="">{t('admin:all', { defaultValue: 'Все' })}</option>
                <option value="true">{t('admin:verified', { defaultValue: 'Подтвержден' })}</option>
                <option value="false">{t('admin:notVerified', { defaultValue: 'Не подтвержден' })}</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersControlBar;
