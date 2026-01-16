// client/src/admin/pages/users/hooks/useUserEdit.ts
// DEPRECATED: This hook is replaced by the unified useUsersData hook
// Use the main Users page with editor state instead

import { useState } from 'react';
import { userService } from '@/services/api/users';
import { User, UserRole } from '@/types/user';
import { useToast } from '@/ui-system/components/feedback';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  emailNotifications: boolean;
  marketingEmails: boolean;
  profileImageUrl?: string;
} 

export const useUserEdit = (userId: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    emailNotifications: true,
    marketingEmails: false,
    profileImageUrl: '',
  });

  const fetchUser = async (id: string) => {
    try {
      setLoading(true);
      console.log(`Fetching user with ID: ${id}`);
      
      const userData = await userService.getById(id);
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      setUser(userData);
      
      // Initialize form data
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        role: userData.role,
        emailNotifications: userData.emailNotifications !== false,
        marketingEmails: userData.marketingEmails === true,
        profileImageUrl: userData.profileImageUrl || '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      showToast('Failed to load user', 'error');
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  // Direct initialization instead of useEffect
  if (userId && userId !== 'new' && !user && loading) {
    fetchUser(userId);
  } else if (userId === 'new' && !user && loading) {
    // Initialize empty form for new user
    setUser({
      id: 'new',
      email: '',
      role: 'user',
      isBlocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: false
    });
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      emailNotifications: true,
      marketingEmails: false,
      profileImageUrl: '',
    });
    setLoading(false);
  } else if (!userId && loading) {
    setLoading(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const saveUser = async () => {
    if (!userId) return false;
    
    try {
      setSaving(true);
      
      if (userId === 'new') {
        // Create new user
        await userService.create(formData);
        showToast('User created successfully', 'success');
      } else {
        // Update existing user
        const updatedUser = await userService.update(userId, formData);
        setUser(updatedUser);
        showToast('User updated successfully', 'success');
      }
      
      return true;
    } catch (error) {
      showToast(
        userId === 'new' ? 'Failed to create user' : 'Failed to update user', 
        'error'
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!user) return false;
    
    try {
      setSaving(true);
      const updatedUser = await userService.blockUser(user.id, !user.isBlocked);
      setUser(updatedUser);
      showToast(
        `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`, 
        'success'
      );
      return true;
    } catch (error) {
      showToast(
        `Failed to ${user.isBlocked ? 'unblock' : 'block'} user`, 
        'error'
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!user) return false;
    
    try {
      setSaving(true);
      await userService.deleteUser(user.id);
      showToast('User deleted successfully', 'success');
      return true;
    } catch (error) {
      showToast('Failed to delete user', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    loading,
    saving,
    formData,
    setFormData,
    handleInputChange,
    saveUser,
    handleBlockToggle,
    deleteUser
  };
};
