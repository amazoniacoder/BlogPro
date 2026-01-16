import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';


interface UsersAdvancedFiltersProps {
  filters: {
    search: string;
    status: string;
    role: string;
    dateFrom?: string;
    dateTo?: string;
    emailVerified?: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

const UsersAdvancedFilters: React.FC<UsersAdvancedFiltersProps> = ({
  filters,
  isExpanded,
  onToggle
}) => {
  const { t } = useTranslation(['admin', 'common']);

  const hasAdvancedFilters = filters.dateFrom || filters.dateTo || filters.emailVerified;

  return (
    <button
      className={`admin-users__advanced-toggle ${isExpanded ? 'admin-users__advanced-toggle--active' : ''}`}
      onClick={onToggle}
      title={t('admin:advancedFilters', { defaultValue: 'Расширенные фильтры' })}
    >
      <Icon name="gear" size={16} />
      {hasAdvancedFilters && <span className="admin-users__filter-indicator" />}
    </button>
  );
};

export default UsersAdvancedFilters;
