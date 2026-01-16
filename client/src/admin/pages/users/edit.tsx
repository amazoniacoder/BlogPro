import React from 'react';
import { useParams, useLocation } from 'wouter';
import { Spinner } from '@/ui-system/components/feedback';
import { Button } from '@/ui-system/components/button';
import { Input } from '@/ui-system/components/input';
import { useUserEdit } from './hooks/useUserEdit';
// Admin user edit styles are now included in UI System

const UserEditPage: React.FC = () => {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const [, navigate] = useLocation();
  
  const {
    user,
    loading,
    saving,
    formData,
    handleInputChange,
    saveUser,
    handleBlockToggle,
    deleteUser
  } = useUserEdit(userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveUser();
    if (success) {
      // Navigate back to users list after successful save
      setTimeout(() => navigate('/admin/users'), 1000);
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="admin-user-edit">
          <div className="admin-user-edit__loading">
            <Spinner />
            <p>Loading user...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-section">
        <div className="admin-user-edit">
          <div className="admin-user-edit__error">
            <p>User not found</p>
            <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">{userId === 'new' ? 'Create User' : 'Edit User'}</h2>
        <div className="admin-section__actions">
          <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
        </div>
      </div>
      
      <div className="admin-user-edit">
        <div className="admin-user-edit__header">
          <h3>User Details</h3>
        </div>

        <div className="admin-user-edit__content grid-cols-1">
          {userId !== 'new' && (
            <>
              <div className="admin-user-edit__status">
                <h2>User Status</h2>
                <div className="admin-user-edit__status-info">
                  <span className={`admin-user-edit__status-badge admin-user-edit__status-badge--${!user.isBlocked ? 'active' : 'blocked'}`}>
                    {!user.isBlocked ? 'Active' : 'Inactive'}
                  </span>
                  {!isAdmin ? (
                    <Button
                      variant={!user.isBlocked ? 'danger' : 'primary'}
                      disabled={saving}
                      onClick={handleBlockToggle}
                    >
                      {saving ? <Spinner size="sm" /> : !user.isBlocked ? 'Deactivate User' : 'Activate User'}
                    </Button>
                  ) : (
                    <span className="admin-user-edit__admin-note">Administrator accounts cannot be deactivated</span>
                  )}
                </div>
              </div>
              
              {!isAdmin && (
                <div className="admin-user-edit__danger-zone">
                  <h2>Danger Zone</h2>
                  <div className="admin-user-edit__danger-actions">
                    <Button
                      variant="danger"
                      disabled={saving}
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete user ${user.firstName || user.email}? This action cannot be undone.`)) {
                          const success = await deleteUser();
                          if (success) {
                            navigate('/admin/users');
                          }
                        }
                      }}
                    >
                      Delete User
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <form className="admin-user-edit__form grid-cols-1" onSubmit={handleSubmit}>
            <div className="admin-user-edit__form-group">
              <label htmlFor="firstName">First Name</label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>

            <div className="admin-user-edit__form-group">
              <label htmlFor="lastName">Last Name</label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>

            <div className="admin-user-edit__form-group">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="admin-user-edit__form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="admin-user-edit__select"
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <h3>Notification Preferences</h3>

            <div className="admin-user-edit__form-group admin-user-edit__form-group--checkbox">
              <label>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                />
                Email Notifications
              </label>
            </div>

            <div className="admin-user-edit__form-group admin-user-edit__form-group--checkbox">
              <label>
                <input
                  type="checkbox"
                  name="marketingEmails"
                  checked={formData.marketingEmails}
                  onChange={handleInputChange}
                />
                Marketing Emails
              </label>
            </div>



            <div className="admin-user-edit__form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? <Spinner size="sm" /> : userId === 'new' ? 'Create User' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserEditPage;
