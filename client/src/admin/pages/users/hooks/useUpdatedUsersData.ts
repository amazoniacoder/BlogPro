import { useReducer, useEffect, useCallback } from "react";
import { usersReducer, initialState } from "../state/reducer";
import { User } from "../state/types";
import { userService } from "@/services/api/users";

export const useUpdatedUsersData = () => {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  const fetchUsers = useCallback(async () => {
    dispatch({ type: "USERS/FETCH_START" });

    try {
      const apiUsers = await userService.getAll();
      
      // Transform users to match the expected type with status field
      const transformedUsers = apiUsers.map(user => {
        // Clean up profileImageUrl if it's a blob URL
        let profileImageUrl = user.profileImageUrl;
        if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
          // Remove blob URLs as they're temporary and won't work across sessions
          profileImageUrl = '';
        }
        
        return {
          ...user,
          // Add status field based on isBlocked with explicit type
          status: user.isBlocked ? "inactive" as const : "active" as const,
          // Add any other required fields
          login: user.firstName || user.email.split('@')[0],
          // Use cleaned profileImageUrl
          profileImageUrl
        };
      }) as User[];
      
      dispatch({ type: "USERS/FETCH_SUCCESS", payload: transformedUsers });
    } catch (error) {
      dispatch({
        type: "USERS/FETCH_FAILURE",
        error: error instanceof Error ? error.message : "Failed to fetch users",
      });
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    dispatch({ type: "USERS/DELETE_START", userId });

    try {
      await userService.deleteUser(userId);
      dispatch({ type: "USERS/DELETE_SUCCESS", userId });
    } catch (error) {
      dispatch({
        type: "USERS/DELETE_FAILURE",
        error: error instanceof Error ? error.message : "Failed to delete user",
      });
    }
  }, []);

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
    fetchUsers();
  }, [fetchUsers]);

  return {
    state,
    dispatch,
    fetchUsers,
    deleteUser,
    handleSort,
  };
};
