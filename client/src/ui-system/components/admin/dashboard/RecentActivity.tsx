import React from 'react';
import { Icon } from '@/ui-system/icons/components';

interface Activity {
  id: string;
  type: string;
  title: string;
  user: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'blog':
        return <Icon name="edit" size={20} />;
      case 'media':
        return <Icon name="image" size={20} />;
      case 'user':
        return <Icon name="users" size={20} />;
      default:
        return <Icon name="info" size={20} />;
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  const displayActivities = activities.length > 0 ? activities : [
    {
      id: 'placeholder',
      type: 'blog',
      title: 'No recent activity - start creating content!',
      user: 'System',
      timestamp: new Date().toISOString()
    }
  ];

  if (loading) {
    return (
      <div className="admin-card admin-dashboard__recent">
        <div className="admin-card__header">
          <h3 className="admin-card__title">Recent Activity</h3>
        </div>
        <div className="admin-card__body">
          <div className="admin-loading">Loading activities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card admin-dashboard__recent">
      <div className="admin-card__header">
        <h3 className="admin-card__title">Recent Activity</h3>
      </div>
      <div className="admin-card__body">
        <div className="admin-dashboard__activity-table">
          <table className="admin-table admin-dashboard__table">
            <thead>
              <tr>
                <th className="admin-table__header admin-table__header--icon"></th>
                <th className="admin-table__header admin-table__header--title">Activity</th>
                <th className="admin-table__header admin-table__header--user">User</th>
                <th className="admin-table__header admin-table__header--date">Date</th>
              </tr>
            </thead>
            <tbody>
              {displayActivities.map((activity) => (
                <tr key={activity.id} className="admin-table__row">
                  <td className="admin-table__cell admin-table__cell--icon">
                    <div className={`admin-dashboard__activity-icon admin-dashboard__activity-icon--${activity.type}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                  </td>
                  <td className="admin-table__cell admin-table__cell--title">
                    <div className="admin-dashboard__activity-title">{activity.title}</div>
                  </td>
                  <td className="admin-table__cell admin-table__cell--user">
                    <div className="admin-dashboard__activity-user">{activity.user}</div>
                  </td>
                  <td className="admin-table__cell admin-table__cell--date">
                    <div className="admin-dashboard__activity-date">{formatDate(activity.timestamp)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
