// client/src/admin/pages/users/hooks/useUsersData.ts
import { useReducer, useEffect, useCallback } from "react";
import { usersReducer, initialState } from "../state/reducer";
import { userService } from "@/services/api/users";
import { User } from "../state/types";
import websocketService from "@/services/websocket-service";

export const useUsersData = () => {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  const fetchUsers = useCallback(async (forceRefresh = false) => {
    dispatch({ type: "USERS/FETCH_START" });

    try {
      let users;
      if (forceRefresh) {
        // Clear all user-related cache
        const { cacheService } = await import('@/services/cache');
        cacheService.invalidateByPattern('/api/users');
        cacheService.clear(); // Clear entire cache for force refresh
        console.log('🗑️ Force refresh: Cache cleared');
        // Force bypass cache on this request
        users = await userService.getAll(true); // bypassCache = true
      } else {
        users = await userService.getAll(false); // use cache
      }
      
      const formattedUsers = users.map(user => {
        const username = user.username || user.firstName || (user.email ? user.email.split('@')[0] : "");
        let status: "active" | "inactive" | "banned" | "under_deletion";
        
        if (user.isScheduledForDeletion) {
          status = "under_deletion";
        } else {
          status = user.isBlocked ? "inactive" : "active";
        }
        
        const profileImageUrl = user.profileImageUrl || "";
        
        return {
          ...user,
          username,
          status,
          role: user.role || "user",
          profileImageUrl,
          emailVerified: user.emailVerified || false,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || user.createdAt || new Date().toISOString(),
        };
      }) as User[];
      
      dispatch({ type: "USERS/FETCH_SUCCESS", payload: formattedUsers });
      console.log(`📊 Fetched ${formattedUsers.length} users${forceRefresh ? ' (force refresh)' : ''}`);
      return formattedUsers;
    } catch (error) {
      dispatch({
        type: "USERS/FETCH_FAILURE",
        error: error instanceof Error ? error.message : "Failed to fetch users",
      });
      return [];
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    dispatch({ type: "USERS/DELETE_START", userId });

    try {
      const isAdmin = state.users.some(user => 
        user.id === userId && (user.role.toLowerCase() === "admin" || user.isAdmin)
      );
      
      if (isAdmin) {
        dispatch({
          type: "USERS/DELETE_FAILURE",
          error: "Administrator accounts cannot be deleted",
        });
        return { success: false, error: "Administrator accounts cannot be deleted" };
      }
      
      await userService.deleteUser(userId);
      // Update state immediately for responsive UI
      dispatch({ type: "USERS/DELETE_SUCCESS", userId });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
      dispatch({
        type: "USERS/DELETE_FAILURE",
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, [state.users]);

  const handleSort = useCallback(
    (field: string) => {
      const newDirection =
        state.sortField === field && state.sortDirection === "asc"
          ? "desc"
          : "asc";

      dispatch({
        type: "USERS/SET_SORT",
        field,
        direction: newDirection,
      });
    },
    [state.sortField, state.sortDirection]
  );

  useEffect(() => {
    // Initial load
    fetchUsers();
    
    // Set up WebSocket listeners for real-time updates
    const handleUserCreated = (userData: User) => {
      console.log('🔄 WebSocket: User created', userData);
      dispatch({ type: "USERS/CREATE_SUCCESS", user: userData });
    };
    
    const handleUserUpdated = (userData: User) => {
      console.log('🔄 WebSocket: User updated (including profile changes)', userData);
      // Format user data to match expected structure
      let status: "active" | "inactive" | "banned" | "under_deletion";
      
      if (userData.isScheduledForDeletion) {
        status = "under_deletion";
      } else {
        status = userData.isBlocked ? "inactive" : "active";
      }
      
      const formattedUser = {
        ...userData,
        username: userData.username || userData.firstName || (userData.email ? userData.email.split('@')[0] : ""),
        status,
        role: userData.role || "user",
        profileImageUrl: userData.profileImageUrl || "",
        emailVerified: userData.emailVerified || false,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || userData.createdAt || new Date().toISOString(),
      } as User;
      dispatch({ type: "USERS/UPDATE_SUCCESS", user: formattedUser });
    };
    
    const handleUserDeleted = (data: { userId: string }) => {
      console.log('🔄 WebSocket: User deleted', data.userId);
      dispatch({ type: "USERS/DELETE_SUCCESS", userId: data.userId });
    };
    
    const handleUserDeletionScheduled = (data: { userId: string; deletionScheduledAt: Date; deletionReason?: string }) => {
      console.log('🔄 WebSocket: User deletion scheduled', data);
      // Update user status to show under deletion
      const user = state.users.find(u => u.id === data.userId);
      if (user) {
        const updatedUser = {
          ...user,
          isScheduledForDeletion: true,
          deletionScheduledAt: data.deletionScheduledAt.toISOString(),
          deletionReason: data.deletionReason,
          status: "under_deletion" as const
        };
        dispatch({ type: "USERS/UPDATE_SUCCESS", user: updatedUser });
      }
    };
    
    const handleUserDeletionCancelled = (data: { userId: string }) => {
      console.log('🔄 WebSocket: User deletion cancelled', data);
      // Update user status to restore normal access
      const currentUsers = state.users;
      const user = currentUsers.find(u => u.id === data.userId);
      if (user) {
        const updatedUser = {
          ...user,
          isScheduledForDeletion: false,
          deletionScheduledAt: undefined,
          deletionReason: undefined,
          status: user.isBlocked ? "inactive" as const : "active" as const
        };
        console.log('Updating user after cancellation:', updatedUser);
        dispatch({ type: "USERS/UPDATE_SUCCESS", user: updatedUser });
      } else {
        console.log('User not found in current state:', data.userId);
      }
    };
    
    // Subscribe to WebSocket events
    websocketService.subscribe('user_created', handleUserCreated);
    websocketService.subscribe('user_updated', handleUserUpdated);
    websocketService.subscribe('user_deleted', handleUserDeleted);
    websocketService.subscribe('user_deletion_scheduled', handleUserDeletionScheduled);
    websocketService.subscribe('user_deletion_cancelled', handleUserDeletionCancelled);
    
    // Connect WebSocket if not already connected
    if (!websocketService.isConnected()) {
      websocketService.connect();
    }
    
    // Cleanup function
    return () => {
      websocketService.unsubscribe('user_created', handleUserCreated);
      websocketService.unsubscribe('user_updated', handleUserUpdated);
      websocketService.unsubscribe('user_deleted', handleUserDeleted);
      websocketService.unsubscribe('user_deletion_scheduled', handleUserDeletionScheduled);
      websocketService.unsubscribe('user_deletion_cancelled', handleUserDeletionCancelled);
    };
  }, []);

  const updateUserStatus = useCallback(async (userId: string, status: "active" | "inactive" | "banned") => {
    try {
      // Check if user is admin
      const isAdmin = state.users.some(user => 
        user.id === userId && (user.role.toLowerCase() === "admin" || user.isAdmin)
      );
      
      if (isAdmin) {
        return { success: false, error: "Administrator accounts cannot be blocked" };
      }
      
      // Dispatch action to update UI immediately
      dispatch({ type: "USERS/UPDATE_STATUS", userId, status });
      
      // Update user status in the API
      await userService.updateStatus(userId, status);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user status";
      return { success: false, error: errorMessage };
    }
  }, [state.users, dispatch]);

  // Add a direct method to add a user to the state
  const addUser = useCallback((user: User) => {
    // Generate login from firstName or email
    const username = user.firstName || (user.email ? user.email.split('@')[0] : "");
    
    // Determine status based on isBlocked
    const status = user.isBlocked ? "inactive" : "active";
    
    const formattedUser = {
      ...user,
      username,
      status,
      role: user.role || "user",
      profileImageUrl: user.profileImageUrl || "",
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || user.createdAt || new Date().toISOString(),
    } as User;
    
    dispatch({ type: "USERS/CREATE_SUCCESS", user: formattedUser });
  }, []);

  const createUser = useCallback(async (userData: Partial<User>) => {
    dispatch({ type: "EDITOR/SET_LOADING", loading: true });

    try {
      const newUser = await userService.create(userData);
      const formattedUser = {
        ...newUser,
        username: newUser.username || newUser.firstName || (newUser.email ? newUser.email.split('@')[0] : ""),
        status: newUser.isBlocked ? "inactive" as const : "active" as const,
        role: newUser.role || "user",
        profileImageUrl: newUser.profileImageUrl || "",
        emailVerified: newUser.emailVerified || false,
        createdAt: newUser.createdAt || new Date().toISOString(),
        updatedAt: newUser.updatedAt || newUser.createdAt || new Date().toISOString(),
      } as User;
      dispatch({ type: "USERS/CREATE_SUCCESS", user: formattedUser });
      return formattedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create user";
      dispatch({ type: "USERS/OPERATION_FAILURE", error: errorMessage });
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    dispatch({ type: "EDITOR/SET_LOADING", loading: true });

    try {
      const updatedUser = await userService.update(userId, userData);
      const formattedUser = {
        ...updatedUser,
        username: updatedUser.username || updatedUser.firstName || (updatedUser.email ? updatedUser.email.split('@')[0] : ""),
        status: updatedUser.isBlocked ? "inactive" as const : "active" as const,
        role: updatedUser.role || "user",
        profileImageUrl: updatedUser.profileImageUrl || "",
        emailVerified: updatedUser.emailVerified || false,
        createdAt: updatedUser.createdAt || new Date().toISOString(),
        updatedAt: updatedUser.updatedAt || updatedUser.createdAt || new Date().toISOString(),
      } as User;
      dispatch({ type: "USERS/UPDATE_SUCCESS", user: formattedUser });
      return formattedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user";
      dispatch({ type: "USERS/OPERATION_FAILURE", error: errorMessage });
      throw error;
    }
  }, []);

  const verifyEmail = useCallback(async (userId: string) => {
    try {
      const updatedUser = await userService.verifyEmail(userId);
      const formattedUser = {
        ...updatedUser,
        username: updatedUser.username || updatedUser.firstName || (updatedUser.email ? updatedUser.email.split('@')[0] : ""),
        status: updatedUser.isBlocked ? "inactive" as const : "active" as const,
        role: updatedUser.role || "user",
        profileImageUrl: updatedUser.profileImageUrl || "",
        emailVerified: updatedUser.emailVerified || false,
        createdAt: updatedUser.createdAt || new Date().toISOString(),
        updatedAt: updatedUser.updatedAt || updatedUser.createdAt || new Date().toISOString(),
      } as User;
      dispatch({ type: "USERS/UPDATE_SUCCESS", user: formattedUser });
      return formattedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to verify email";
      dispatch({ type: "USERS/OPERATION_FAILURE", error: errorMessage });
      throw error;
    }
  }, []);

  return {
    state,
    dispatch,
    fetchUsers,
    deleteUser,
    updateUserStatus,
    handleSort,
    addUser,
    createUser,
    updateUser,
    verifyEmail
  };
};
