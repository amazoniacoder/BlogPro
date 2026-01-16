// client/src/store/auth-context.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "@/types/user";
import { authService } from "@/services/api/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Function to update user data
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      try {
        const response = await authService.getCurrentUser();
        if (response && response.user) {
          setUser(response.user);
        } else {
          setUser(null);
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Import WebSocket service dynamically to avoid circular dependencies
    import('@/services/websocket-service').then(({ default: websocketService }) => {
      // Listen for user updates via WebSocket
      const handleUserUpdate = (userData: any) => {
        if (user && userData.id === user.id) {
          console.log('Auth context: User updated via WebSocket', userData);
          setUser(userData);
        }
      };

      websocketService.subscribe('user_updated', handleUserUpdate);
      
      return () => {
        websocketService.unsubscribe('user_updated', handleUserUpdate);
      };
    });

    // WebSocket handles real-time updates, no polling needed
    return () => {
      // Cleanup handled by WebSocket service
    };
  }, [user?.id]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Clear any existing user state first
      setUser(null);
      
      const response = await authService.login(username, password);
      if (response && response.user) {
        setUser(response.user);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      await authService.register(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Clear user state immediately
    setUser(null);
    setLoading(true);
    
    try {
      await authService.logout();
    } catch (error) {
      // Silent logout - don't show errors
    } finally {
      // Ensure user state is cleared
      setUser(null);
      setLoading(false);
      
      // Clear any WebSocket subscriptions
      try {
        const { default: websocketService } = await import('@/services/websocket-service');
        websocketService.disconnect();
      } catch {
        // Ignore websocket cleanup errors
      }
      
      // Redirect to main page
      window.location.href = '/';
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
