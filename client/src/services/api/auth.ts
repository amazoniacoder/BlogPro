// client/src/services/api/auth.ts
import { httpClient } from '@/services/cache/http-client';
import { User } from '@/types/user';

interface AuthResponse {
  user: User;
  token?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string | null;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
}

class AuthService {
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await httpClient.post('/api/auth/login', { username, password });
      
      // Clear any existing auth data and store new JWT token
      localStorage.clear();
      sessionStorage.clear();
      httpClient.clearCache();
      
      // Extract data from standardized response format
      const authData = response.data || response;
      
      if (authData.token) {
        localStorage.setItem('authToken', authData.token);
      }
      
      return authData;
    } catch (error: any) {
      throw new Error(error?.message || 'Invalid username or password');
    }
  }

  async register(userData: RegisterData): Promise<void> {
    try {
      await httpClient.post('/api/auth/register', userData);
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post('/api/auth/logout');
    } catch (error) {
      // Silent error handling
    } finally {
      // Clear JWT token and all caches
      localStorage.removeItem('authToken');
      httpClient.clearCache();
      
      // Clear any other auth-related storage
      localStorage.clear();
      sessionStorage.clear();
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await httpClient.get('/api/auth/me', { bypassCache: true });
      // Handle both direct response and standardized response format
      return response.user ? response : { user: response };
    } catch (error) {
      throw new Error('Not authenticated');
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await httpClient.put('/api/auth/profile', data);
      return response.user;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }

  async updateAvatar(imageData: string | null): Promise<User> {
    try {
      const response = await httpClient.put('/api/auth/avatar', { profileImageUrl: imageData });
      return response.user;
    } catch (error) {
      console.error('Avatar update error:', error);
      throw new Error('Failed to update avatar');
    }
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await httpClient.put('/api/auth/password', data);
    } catch (error) {
      console.error('Password change error:', error);
      throw new Error('Failed to change password');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await httpClient.post('/api/auth/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await httpClient.post(`/api/auth/reset-password/${token}`, { password });
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Failed to reset password');
    }
  }

  async scheduleAccountDeletion(reason?: string): Promise<void> {
    try {
      await httpClient.post('/api/auth/schedule-deletion', { reason });
    } catch (error) {
      console.error('Schedule deletion error:', error);
      throw new Error('Failed to schedule account deletion');
    }
  }

  async getDeletionStatus(): Promise<any> {
    try {
      const response = await httpClient.get('/api/auth/deletion-status');
      return response;
    } catch (error) {
      console.error('Get deletion status error:', error);
      throw new Error('Failed to get deletion status');
    }
  }
}

export const authService = new AuthService();
