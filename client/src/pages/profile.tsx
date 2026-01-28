import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth-context';
import { Tabs } from '@/ui-system/components/navigation';
import { Spinner } from '@/ui-system/components/feedback';
import { Input, PasswordInput } from '@/ui-system/components/input';
import { Button } from '@/ui-system/components/button';
import { authService } from '@/services/api/auth';
import websocketService from '@/services/websocket-service';
import { DeleteAccountDialog } from '@/components/common/delete-account-dialog';
import { useNotification } from '@/ui-system/components/feedback';
import { Icon } from '@/ui-system/icons/components';
import { CommentArchive } from '@/ui-system/components/user/CommentArchive';

const Profile: React.FC = () => {
  const { user, logout, updateUser: updateAuthUser } = useAuth();
  
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize to max 200px while maintaining aspect ratio
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };
  // Get tab from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const [activeTab] = useState(urlParams.get('tab') || 'account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<any>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    // Load user data
    const timer = setTimeout(() => {
      if (user) {
        setFormData({
          ...formData,
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        });
        
        // Set avatar image from user profile if available
        if (user.profileImageUrl) {
          setAvatarImage(user.profileImageUrl);
        }
      }
      setLoading(false);
    }, 1000);

    // Initialize WebSocket connection for real-time updates
    if (!websocketService.isConnected()) {
      websocketService.connect();
    }

    // Load deletion status
    loadDeletionStatus();

    // Listen for user updates from admin panel
    const handleUserUpdate = (userData: any) => {
      if (user && userData.id === user.id) {
        console.log('Profile: Received profileImageUrl:', userData.profileImageUrl);
        
        // Update form data
        setFormData({
          username: userData.username || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // Update avatar
        if (userData.profileImageUrl) {
          console.log('Setting avatar to:', userData.profileImageUrl);
          setAvatarImage(userData.profileImageUrl);
        } else if (userData.profileImageUrl === null || userData.profileImageUrl === '') {
          setAvatarImage(null);
        }
        
        // Update user context
        updateAuthUser(userData);
      }
    };

    websocketService.subscribe('user_updated', handleUserUpdate);

    return () => {
      clearTimeout(timer);
      websocketService.unsubscribe('user_updated', handleUserUpdate);
    };
  }, [user, updateAuthUser]);

  const loadDeletionStatus = async () => {
    try {
      const status = await authService.getDeletionStatus();
      setDeletionStatus(status);
    } catch (error) {
      // User not scheduled for deletion or error - ignore
      setDeletionStatus(null);
    }
  };

  const handleDeleteAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDeleteDialog(true);
  };

  const handleConfirmDeletion = async () => {
    try {
      await authService.scheduleAccountDeletion('User requested deletion');
      setShowDeleteDialog(false);
      showSuccess('Account scheduled for deletion. You will be logged out.');
      
      // Log out user after a short delay
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule deletion';
      showError(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('Updating profile with data:', {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      
      // Save to server
      const updatedUser = await authService.updateProfile({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      
      console.log('Profile update response:', updatedUser);
      
      // Update user in context
      if (user) {
        const updatedUserData = {
          ...user,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email
        };
        console.log('Updating user context with:', updatedUserData);
        updateAuthUser(updatedUserData);
      }
      
      setNotification({
        type: 'success',
        message: 'Account information updated successfully!',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      console.error('Error details:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update account information. Please try again.'
      });
    } finally {
      setSaving(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setSaving(false);
      setNotification({
        type: 'error',
        message: 'New passwords do not match.',
      });
      return;
    }

    try {
      // Call password change API
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setNotification({
        type: 'success',
        message: 'Password updated successfully!',
      });

      // Clear form
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update password. Please check your current password.',
      });
    } finally {
      setSaving(false);
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  
  const handleNotificationChange = (field: 'emailNotifications' | 'marketingEmails') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Create updated user data
      const updatedUserData = {
        ...user,
        [field]: e.target.checked
      };
      
      // Update user in context
      updateAuthUser(updatedUserData);
      
      // Save to server
      await authService.updateProfile({
        [field]: e.target.checked
      });
      
      setNotification({
        type: 'success',
        message: 'Notification preferences updated!'
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update notification preferences. Please try again.'
      });
    } finally {
      setSaving(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="profile__loading">
          <Spinner />
          <p className="profile__loading-text">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="profile">
      <div className="profile__header">
        <div className="profile__header-left">
          <div className="profile__avatar-container">
            <div className="profile__avatar">
              {avatarImage ? (
                <img src={avatarImage} alt={user?.name || 'User'} />
              ) : user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user?.name || 'User'} />
              ) : (
                <div className="profile__avatar-placeholder">
                  <Icon name="user" size={32} />
                </div>
              )}
            </div>
            <div className="profile__avatar-actions">
              <label className="profile__avatar-edit" title="Change avatar">
                <Icon name="edit" size={16} />
                <input 
                  type="file" 
                  className="profile__avatar-upload" 
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        // Resize the image before uploading
                        const resizedImageData = await resizeImage(e.target.files[0]);
                        
                        // Set the avatar image to display immediately
                        setAvatarImage(resizedImageData);
                        
                        // Save the avatar to the server
                        setSaving(true);
                        const updatedUser = await authService.updateAvatar(resizedImageData);
                        
                        // Update the user context with the new profile image
                        if (user) {
                          const updatedUserData = {
                            ...user,
                            profileImageUrl: updatedUser.profileImageUrl
                          };
                          updateAuthUser(updatedUserData);
                        }
                        
                        // Update the avatar image state with the URL from the server
                        if (updatedUser.profileImageUrl) {
                          setAvatarImage(updatedUser.profileImageUrl);
                        }
                        
                        setNotification({
                          type: 'success',
                          message: 'Profile image updated successfully!'
                        });
                      } catch (error) {
                        console.error('Failed to update avatar:', error);
                        setNotification({
                          type: 'error',
                          message: 'Failed to update profile image. Please try again.'
                        });
                      } finally {
                        setSaving(false);
                        
                        // Clear notification after 3 seconds
                        setTimeout(() => {
                          setNotification(null);
                        }, 3000);
                      }
                    }
                  }}
                />
              </label>
              {(avatarImage || user?.profileImageUrl) && (
                <button 
                  className="profile__avatar-delete" 
                  title="Remove avatar"
                  onClick={async () => {
                    try {
                      setSaving(true);
                      setAvatarImage(null);
                      
                      // Remove the avatar on the server
                      await authService.updateAvatar(null);
                      
                      // Update the user context with the removed profile image
                      if (user) {
                        const updatedUserData = {
                          ...user,
                          profileImageUrl: undefined
                        };
                        updateAuthUser(updatedUserData);
                      }
                      
                      setNotification({
                        type: 'success',
                        message: 'Profile image removed successfully!'
                      });
                    } catch (error) {
                      console.error('Failed to remove avatar:', error);
                      setNotification({
                        type: 'error',
                        message: 'Failed to remove profile image. Please try again.'
                      });
                    } finally {
                      setSaving(false);
                      setTimeout(() => {
                        setNotification(null);
                      }, 3000);
                    }
                  }}
                >
                  <Icon name="delete" size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="profile__info">
            <h1 className="profile__name">{user?.name || 'User'}</h1>
            <p className="profile__email">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <Button 
          onClick={logout} 
          className="profile__logout-button"
        >
          Log Out
        </Button>
      </div>

      {notification && (
        <div className={`profile__notification profile__notification--${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="profile__content">
        <Tabs 
          items={[
            {
              id: 'account',
              label: 'Account',
              content: (
                <form className="auth-form" onSubmit={handleAccountSubmit}>
              <div className="auth-form__container">
                <div className="auth-form__fields">
                  <div className="auth-form__field">
                    <label htmlFor="username" className="auth-form__label">Username <span className="required-field">*</span></label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="auth-form__input"
                      required
                    />
                  </div>

                  <div className="auth-form__field">
                    <label htmlFor="firstName" className="auth-form__label">Name</label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="auth-form__input"
                    />
                  </div>

                  <div className="auth-form__field">
                    <label htmlFor="lastName" className="auth-form__label">Last Name</label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="auth-form__input"
                    />
                  </div>

                  <div className="auth-form__field">
                    <label htmlFor="email" className="auth-form__label">Email <span className="required-field">*</span></label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="auth-form__input"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form__actions auth-form__actions--centered">
                  <Button
                    type="submit"
                    className="auth-form__button"
                    disabled={saving}
                  >
                    {saving ? '...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
                </form>
              )
            },
            {
              id: 'password',
              label: 'Password',
              content: (
                <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <div className="auth-form__container">
                <div className="auth-form__fields">
                  <div className="auth-form__field">
                    <label htmlFor="currentPassword" className="auth-form__label">Current Password <span className="required-field">*</span></label>
                    <PasswordInput
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="password-input"
                      required
                    />
                  </div>

                  <div className="auth-form__field">
                    <label htmlFor="newPassword" className="auth-form__label">New Password <span className="required-field">*</span></label>
                    <PasswordInput
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="password-input"
                      required
                    />
                  </div>

                  <div className="auth-form__field">
                    <label htmlFor="confirmPassword" className="auth-form__label">Confirm New Password <span className="required-field">*</span></label>
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="password-input"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form__actions auth-form__actions--centered">
                  <Button
                    type="submit"
                    className="auth-form__button"
                    disabled={saving}
                  >
                    {saving ? '...' : 'Update Password'}
                  </Button>
                </div>
              </div>
                </form>
              )
            },
            {
              id: 'comments',
              label: 'My Comments',
              content: <CommentArchive />
            },
            {
              id: 'preferences',
              label: 'Preferences',
              content: (
                <div className="profile__preferences">
              <h2 className="profile__section-title">Notification Preferences</h2>
              
              <div className="profile__preference-item">
                <div className="profile__preference-info">
                  <h3 className="profile__preference-title">Email Notifications</h3>
                  <p className="profile__preference-description">Receive updates and news via email</p>
                </div>
                <label className="profile__switch">
                  <input 
                    type="checkbox" 
                    checked={user?.emailNotifications !== false}
                    onChange={handleNotificationChange('emailNotifications')}
                  />
                  <span className="profile__switch-slider"></span>
                </label>
              </div>
              
              <div className="profile__preference-item">
                <div className="profile__preference-info">
                  <h3 className="profile__preference-title">Marketing Emails</h3>
                  <p className="profile__preference-description">Receive promotional content and offers</p>
                </div>
                <label className="profile__switch">
                  <input 
                    type="checkbox" 
                    checked={user?.marketingEmails === true}
                    onChange={handleNotificationChange('marketingEmails')}
                  />
                  <span className="profile__switch-slider"></span>
                </label>
              </div>
              
              <div className="profile__preference-item profile__preference-item--danger">
                <div className="profile__preference-info">
                  <h3 className="profile__preference-title">Account Deletion</h3>
                  {deletionStatus?.isScheduledForDeletion ? (
                    <p className="profile__preference-description">
                      Account scheduled for deletion in {deletionStatus.hoursUntilDeletion} hours
                    </p>
                  ) : (
                    <p className="profile__preference-description">Permanently delete your account and all associated data</p>
                  )}
                </div>
                {deletionStatus?.isScheduledForDeletion ? (
                  <span className="profile__delete-status">Under deletion</span>
                ) : (
                  <a href="#" onClick={handleDeleteAccountClick} className="profile__delete-link">
                    Delete account
                  </a>
                )}
              </div>

                </div>
              )
            }
          ]}
          defaultTab={activeTab}
          className="profile__tabs"
        />
      </div>


      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDeletion}
        loading={saving}
      />
      </div>
    </>
  );
};

export default Profile;
