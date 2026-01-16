import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';

interface StatsProps {
  stats: {
    blogPosts: number;
    mediaFiles: number;
    users: number;
  };
}

const DashboardStats: React.FC<StatsProps> = ({ stats }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="admin-dashboard__stats">
      <div className="admin-dashboard__stat admin-dashboard__stat--blog">
        <div className="admin-dashboard__stat-icon">
          <Icon name="edit" size={24} />
        </div>
        <div className="admin-dashboard__stat-content gap-4">
          <h3 className="admin-dashboard__stat-title">{t('blogPosts')}</h3>
          <p className="admin-dashboard__stat-value">{stats.blogPosts}</p>
        </div>
      </div>

      <div className="admin-dashboard__stat admin-dashboard__stat--media">
        <div className="admin-dashboard__stat-icon">
          <Icon name="image" size={24} />
        </div>
        <div className="admin-dashboard__stat-content gap-4">
          <h3 className="admin-dashboard__stat-title">{t('media')}</h3>
          <p className="admin-dashboard__stat-value">{stats.mediaFiles}</p>
        </div>
      </div>

      <div className="admin-dashboard__stat admin-dashboard__stat--users">
        <div className="admin-dashboard__stat-icon">
          <Icon name="users" size={24} />
        </div>
        <div className="admin-dashboard__stat-content gap-4">
          <h3 className="admin-dashboard__stat-title">{t('users')}</h3>
          <p className="admin-dashboard__stat-value">{stats.users}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
