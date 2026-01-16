// client/src/services/api/users.ts
import { httpClient } from '@/services/cache/http-client';
import { cacheService } from '@/services/cache';
import { User } from '@/types/user';

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'admin' | 'editor' | 'user';
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  profileImageUrl?: string;
  login?: string;
  password?: string;
  status?: string;
  isActive?: boolean;
  isBlocked?: boolean;
}



export const userService = {
  async create(userData: UpdateUserData): Promise<User> {
    try {
      const response = await httpClient.post('/api/users', userData, {
        bypassCache: true // Bypass cache for mutations
      });
      // Selective cache invalidation - only invalidate users list
      cacheService.invalidateByPattern('/api/users');
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  },

  async getAll(bypassCache = false): Promise<User[]> {
    try {
      let response;
      
      if (bypassCache) {
        // Direct fetch bypassing all caches
        console.log('🔄 Direct fetch bypassing all caches');
        const fetchResponse = await fetch('/api/users', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        response = await fetchResponse.json();
      } else {
        // Use HTTP client with cache bypass
        response = await httpClient.get('/api/users', {
          bypassCache: true
        }, 0); // TTL = 0 means no caching
      }
      
      console.log('Users API response:', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  async getById(userId: string): Promise<User> {
    try {
      const response = await httpClient.get(`/api/users/${userId}`);
      
      if (!response) {
        throw new Error('Empty response');
      }
      
      return response as User;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async update(userId: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await httpClient.put(`/api/users/${userId}`, data, {
        bypassCache: true // Bypass cache for mutations
      });
      // Selective cache invalidation
      cacheService.invalidateByPattern('/api/users');
      cacheService.invalidateByPattern(`/api/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw new Error('Failed to update user');
    }
  },

  async blockUser(userId: string, isBlocked: boolean): Promise<User> {
    try {
      const response = await httpClient.put(`/api/users/${userId}`, { isBlocked }, {
        bypassCache: true // Bypass cache for mutations
      });
      return response;
    } catch (error) {
      console.error(`Error ${isBlocked ? 'blocking' : 'unblocking'} user ${userId}:`, error);
      throw new Error(`Failed to ${isBlocked ? 'block' : 'unblock'} user`);
    }
  },
  
  async updateStatus(userId: string, status: "active" | "inactive" | "banned"): Promise<User> {
    try {
      // Use the main update method for consistency
      return await userService.update(userId, {
        status,
        isBlocked: status !== 'active'
      });
    } catch (error) {
      console.error(`Error updating status for user ${userId}:`, error);
      throw new Error('Failed to update user status');
    }
  },
  
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    try {
      console.log(`🗑️ Attempting to delete user: ${userId}`);
      const response = await httpClient.delete(`/api/users/${userId}`, {
        bypassCache: true // Bypass cache for mutations
      });
      console.log(`✅ Delete response:`, response);
      
      // Selective cache invalidation only after successful deletion
      cacheService.invalidateByPattern('/api/users');
      cacheService.invalidateByPattern(`/api/users/${userId}`);
      console.log(`🗑️ User ${userId} deleted successfully from server`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error deleting user ${userId}:`, error);
      
      // Provide specific error messages based on status
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          throw new Error('Server error: User may have associated data that prevents deletion');
        } else if (error.message.includes('404')) {
          throw new Error('User not found or already deleted');
        } else if (error.message.includes('403')) {
          throw new Error('Permission denied: Cannot delete this user');
        }
      }
      
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async verifyEmail(userId: string): Promise<User> {
    try {
      const response = await httpClient.post(`/api/auth/users/${userId}/verify-email`, {}, {
        bypassCache: true
      });
      cacheService.invalidateByPattern('/api/users');
      return response.user;
    } catch (error) {
      console.error(`Error verifying email for user ${userId}:`, error);
      throw new Error('Failed to verify email');
    }
  }
};
