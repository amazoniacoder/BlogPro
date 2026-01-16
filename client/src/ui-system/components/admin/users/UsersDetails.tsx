import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/ui-system/icons/components";

interface UsersDetailsProps {
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    status: string;
    createdAt: string;
    lastLogin?: string;
    profileImageUrl?: string;
    emailVerified?: boolean;
    isBlocked?: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const UsersDetails: React.FC<UsersDetailsProps> = ({
  user,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation(['admin', 'common']);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  const getFullName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    }
    return user.username || "N/A";
  };

  const getStatusClass = () => {
    if (user.isBlocked) return "admin-users__user-status--blocked";
    switch (user.status) {
      case "active":
        return "admin-users__user-status--active";
      case "inactive":
        return "admin-users__user-status--blocked";
      case "banned":
        return "admin-users__user-status--blocked";
      default:
        return "admin-users__user-status--pending";
    }
  };

  const getRoleClass = () => {
    switch (user.role.toLowerCase()) {
      case "admin":
        return "admin-users__user-role--admin";
      case "editor":
        return "admin-users__user-role--editor";
      case "user":
        return "admin-users__user-role--user";
      default:
        return "admin-users__user-role--user";
    }
  };

  const getStatusText = () => {
    if (user.isBlocked) return t('admin:blocked', { defaultValue: 'Blocked' });
    return user.status === 'active' 
      ? t('admin:active', { defaultValue: 'Active' })
      : t('admin:inactive', { defaultValue: 'Inactive' });
  };

  return (
    <div className="admin-users__details">
      <div className="admin-users__details-avatar">
        <div className="admin-users__avatar admin-users__avatar--xl">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.username}
              className="admin-users__avatar-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.classList.add('admin-users__avatar--placeholder');
                  e.currentTarget.parentElement.textContent = (user.firstName?.[0] || user.username?.[0] || "U").toUpperCase();
                }
              }}
            />
          ) : (
            <div className="admin-users__avatar-placeholder">
              {(user.firstName?.[0] || user.username?.[0] || "U").toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="admin-users__details-info">
        <h2 className="admin-users__details-name">{getFullName()}</h2>
        <p className="admin-users__details-email">{user.email}</p>

        <div className="admin-users__details-meta">
          <div className="admin-users__meta-item">
            <span className="admin-users__meta-label">
              <Icon name="user" size={16} />
              {t('admin:username', { defaultValue: 'Username' })}
            </span>
            <span className="admin-users__meta-value">{user.username}</span>
          </div>

          <div className="admin-users__meta-item">
            <span className="admin-users__meta-label">
              <Icon name="admin" size={16} />
              {t('admin:role', { defaultValue: 'Role' })}
            </span>
            <span className={`admin-users__user-role ${getRoleClass()}`}>
              {user.role}
            </span>
          </div>

          <div className="admin-users__meta-item">
            <span className="admin-users__meta-label">
              <Icon name="check" size={16} />
              {t('admin:status', { defaultValue: 'Status' })}
            </span>
            <span className={`admin-users__user-status ${getStatusClass()}`}>
              {getStatusText()}
            </span>
          </div>

          <div className="admin-users__meta-item">
            <span className="admin-users__meta-label">
              <Icon name="calendar" size={16} />
              {t('admin:created', { defaultValue: 'Created' })}
            </span>
            <span className="admin-users__meta-value admin-users__user-date">
              {formatDate(user.createdAt)}
            </span>
          </div>

          <div className="admin-users__meta-item">
            <span className="admin-users__meta-label">
              <Icon name="clock" size={16} />
              {t('admin:lastLogin', { defaultValue: 'Last Login' })}
            </span>
            <span className="admin-users__meta-value admin-users__user-date">
              {user.lastLogin ? formatDate(user.lastLogin) : t('admin:never', { defaultValue: 'Never' })}
            </span>
          </div>

          <div className="admin-users__meta-item">
            <span className="admin-users__meta-label">
              <Icon name="info" size={16} />
              {t('admin:emailVerification', { defaultValue: 'Email Verification' })}
            </span>
            <span className={`admin-users__user-status ${user.emailVerified ? 'admin-users__user-status--active' : 'admin-users__user-status--pending'}`}>
              {user.emailVerified 
                ? t('admin:verified', { defaultValue: 'Verified' })
                : t('admin:notVerified', { defaultValue: 'Not Verified' })
              }
            </span>
          </div>
        </div>

        <div className="admin-users__status-section">
          <div className="admin-users__status-header">
            <h3 className="admin-users__status-title">
              {t('admin:accountStatus', { defaultValue: 'Account Status' })}
            </h3>
          </div>
          <div className="admin-users__user-actions">
            <button
              className="admin-users__action-button admin-users__action-button--edit"
              onClick={onEdit}
            >
              <Icon name="edit" size={16} />
              {t('admin:editUser', { defaultValue: 'Edit User' })}
            </button>
            {user.role.toLowerCase() !== 'admin' && (
              <button
                className="admin-users__action-button admin-users__action-button--delete"
                onClick={onDelete}
              >
                <Icon name="delete" size={16} />
                {t('admin:deleteUser', { defaultValue: 'Delete User' })}
              </button>
            )}
          </div>
        </div>

        {user.role.toLowerCase() !== 'admin' && (
          <div className="admin-users__danger-zone">
            <h4 className="admin-users__danger-title">
              {t('admin:dangerZone', { defaultValue: 'Danger Zone' })}
            </h4>
            <p className="admin-users__danger-description">
              {t('admin:deleteUserWarning', { defaultValue: 'Once you delete a user, there is no going back. Please be certain.' })}
            </p>
            <div className="admin-users__danger-actions">
              <button
                className="admin-users__danger-button"
                onClick={onDelete}
              >
                <Icon name="delete" size={16} />
                {t('admin:deleteThisUser', { defaultValue: 'Delete this user' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersDetails;
