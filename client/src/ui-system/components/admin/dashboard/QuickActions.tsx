import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Icon } from '@/ui-system/icons/components';

const QuickActions: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <div className="admin-card admin-dashboard__quick-actions">
      <div className="admin-card__header">
        <h3 className="admin-card__title">{t('quickActions')}</h3>
      </div>
      <div className="admin-card__body">
        <div className="admin-dashboard__actions-grid">
          <Link href="/admin/blog/" className="admin-dashboard__action admin-dashboard__action--blog">
            <div className="admin-dashboard__action-icon">
              <Icon name="edit" size={24} />
            </div>
            <div className="admin-dashboard__action-content flex-1">
              <span className="admin-dashboard__action-label">{t('createNewPost')}</span>
              <span className="admin-dashboard__action-description">{t('writeNewArticle', { defaultValue: 'Написать новую статью' })}</span>
            </div>
          </Link>
          
          <Link href="/admin/media" className="admin-dashboard__action admin-dashboard__action--media">
            <div className="admin-dashboard__action-icon">
              <Icon name="image" size={24} />
            </div>
            <div className="admin-dashboard__action-content flex-1">
              <span className="admin-dashboard__action-label">{t('uploadMedia', { defaultValue: 'Загрузить медиа' })}</span>
              <span className="admin-dashboard__action-description">{t('addImagesVideos', { defaultValue: 'Добавить изображения или видео' })}</span>
            </div>
          </Link>
          
          <Link href="/admin/users" className="admin-dashboard__action admin-dashboard__action--users">
            <div className="admin-dashboard__action-icon">
              <Icon name="users" size={24} />
            </div>
            <div className="admin-dashboard__action-content flex-1">
              <span className="admin-dashboard__action-label">{t('manageUsers', { defaultValue: 'Управление пользователями' })}</span>
              <span className="admin-dashboard__action-description">{t('viewEditUsers', { defaultValue: 'Просмотр и редактирование пользователей' })}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
