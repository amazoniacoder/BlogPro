// client/src/admin/pages/users/state/reducer.ts
import { UsersState, UsersAction, User } from "./types";

export const initialState: UsersState = {
  users: [],
  filteredUsers: [],
  loading: false,
  error: null,
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortField: "createdAt",
  sortDirection: "desc",
  filters: {
    search: "",
    status: "",
    role: "",
    dateFrom: "",
    dateTo: "",
    emailVerified: "",
  },
  selectedUsers: [],
  deleteModalOpen: false,
  userToDelete: null,
  editor: {
    isOpen: false,
    loading: false,
    mode: 'create',
    currentUser: null,
    formData: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "user",
      emailVerified: false,
      profileImageUrl: "",
      status: "active",
      isBlocked: false,
    },
  },
};

// Helper function to filter and sort users
const filterAndSortUsers = (
  users: User[],
  filters: UsersState["filters"],
  sortField: string,
  sortDirection: "asc" | "desc"
): User[] => {
  // Filter logic
  let result = users.filter((user) => {
    const searchMatch =
      !filters.search ||
      (user.username && user.username.toLowerCase().includes(filters.search.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(filters.search.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(filters.search.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(filters.search.toLowerCase()));

    const statusMatch = !filters.status || user.status === filters.status;
    const roleMatch = !filters.role || user.role.toLowerCase() === filters.role.toLowerCase();
    
    const dateFromMatch = !filters.dateFrom || new Date(user.createdAt) >= new Date(filters.dateFrom);
    const dateToMatch = !filters.dateTo || new Date(user.createdAt) <= new Date(filters.dateTo);
    const emailVerifiedMatch = !filters.emailVerified || 
      (filters.emailVerified === 'true' && user.emailVerified) ||
      (filters.emailVerified === 'false' && !user.emailVerified);

    return searchMatch && statusMatch && roleMatch && dateFromMatch && dateToMatch && emailVerifiedMatch;
  });

  // Sort logic
  result.sort((a, b) => {
    const aValue = a[sortField as keyof User];
    const bValue = b[sortField as keyof User];

    if (!aValue && !bValue) return 0;
    if (!aValue) return sortDirection === "asc" ? -1 : 1;
    if (!bValue) return sortDirection === "asc" ? 1 : -1;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return result;
};

export const usersReducer = (
  state: UsersState,
  action: UsersAction
): UsersState => {
  switch (action.type) {
    case "USERS/FETCH_START":
      return { ...state, loading: true, error: null };

    case "USERS/FETCH_SUCCESS": {
      const filteredUsers = filterAndSortUsers(
        action.payload,
        state.filters,
        state.sortField,
        state.sortDirection
      );

      return {
        ...state,
        users: action.payload,
        filteredUsers,
        totalItems: filteredUsers.length,
        loading: false,
      };
    }

    case "USERS/FETCH_FAILURE":
      return { ...state, loading: false, error: action.error };

    case "USERS/SET_PAGE":
      return { ...state, currentPage: action.page };

    case "USERS/SET_ITEMS_PER_PAGE":
      return { ...state, itemsPerPage: action.count, currentPage: 1 };

    case "USERS/SET_SORT": {
      const filteredUsers = filterAndSortUsers(
        state.users,
        state.filters,
        action.field,
        action.direction
      );

      return {
        ...state,
        sortField: action.field,
        sortDirection: action.direction,
        filteredUsers,
      };
    }

    case "USERS/SET_FILTER": {
      const newFilters = {
        ...state.filters,
        [action.field]: action.value,
      };

      const filteredUsers = filterAndSortUsers(
        state.users,
        newFilters,
        state.sortField,
        state.sortDirection
      );

      return {
        ...state,
        filters: newFilters,
        filteredUsers,
        totalItems: filteredUsers.length,
        currentPage: 1,
      };
    }

    case "USERS/TOGGLE_SELECTION": {
      const isSelected = state.selectedUsers.includes(action.userId);
      const selectedUsers = isSelected
        ? state.selectedUsers.filter((id) => id !== action.userId)
        : [...state.selectedUsers, action.userId];

      return { ...state, selectedUsers };
    }

    case "USERS/SELECT_ALL": {
      const selectedUsers = action.selected
        ? state.filteredUsers.map((user) => user.id)
        : [];

      return { ...state, selectedUsers };
    }

    case "USERS/CLEAR_SELECTION":
      return { ...state, selectedUsers: [] };

    case "USERS/SHOW_DELETE_MODAL":
      return { ...state, deleteModalOpen: true, userToDelete: action.userId };

    case "USERS/HIDE_DELETE_MODAL":
      return { ...state, deleteModalOpen: false, userToDelete: null };

    case "USERS/DELETE_START":
      return { ...state, loading: true };

    case "USERS/DELETE_SUCCESS": {
      console.log(`🗑️ DELETE_USER_SUCCESS: Removing user ${action.userId} from state`);
      console.log(`📊 Before: ${state.users.length} users, ${state.filteredUsers.length} filtered`);
      
      const updatedUsers = state.users.filter((user) => user.id !== action.userId);
      const updatedFilteredUsers = state.filteredUsers.filter(
        (user) => user.id !== action.userId
      );
      const updatedSelectedUsers = state.selectedUsers.filter((id) => id !== action.userId);
      
      console.log(`📊 After: ${updatedUsers.length} users, ${updatedFilteredUsers.length} filtered`);
      
      return {
        ...state,
        loading: false,
        users: updatedUsers,
        filteredUsers: updatedFilteredUsers,
        selectedUsers: updatedSelectedUsers,
        totalItems: Math.max(0, state.totalItems - 1),
      };
    }

    case "USERS/DELETE_FAILURE":
      return { ...state, loading: false, error: action.error };
      
    case "USERS/UPDATE_STATUS": {
      // Update user status in both users and filteredUsers arrays
      const updatedUsers = state.users.map(user => 
        user.id === action.userId ? { 
          ...user, 
          status: action.status,
          isBlocked: action.status !== 'active'
        } : user
      );
      
      const updatedFilteredUsers = state.filteredUsers.map(user => 
        user.id === action.userId ? { 
          ...user, 
          status: action.status,
          isBlocked: action.status !== 'active'
        } : user
      );
      
      return {
        ...state,
        users: updatedUsers,
        filteredUsers: updatedFilteredUsers
      };
    }

    case "USERS/CREATE_SUCCESS": {
      // Prevent duplicates by checking if user already exists
      const existingIndex = state.users.findIndex(user => user.id === action.user.id);
      if (existingIndex >= 0) {
        return state;
      }
      
      const updatedUsers = [...state.users, action.user];
      const filteredUsers = filterAndSortUsers(
        updatedUsers,
        state.filters,
        state.sortField,
        state.sortDirection
      );
      
      return {
        ...state,
        loading: false,
        users: updatedUsers,
        filteredUsers,
        totalItems: filteredUsers.length,
        editor: {
          ...initialState.editor
        }
      };
    }
    
    case "USERS/UPDATE_SUCCESS": {
      const updatedUsers = state.users.map(user => 
        user.id === action.user.id ? action.user : user
      );
      
      const filteredUsers = filterAndSortUsers(
        updatedUsers,
        state.filters,
        state.sortField,
        state.sortDirection
      );
      
      return {
        ...state,
        loading: false,
        users: updatedUsers,
        filteredUsers,
        totalItems: filteredUsers.length,
        editor: {
          ...initialState.editor
        }
      };
    }

    case "USERS/OPERATION_FAILURE":
      return { ...state, loading: false, error: action.error };
      
    case "USERS/CLEAR_ERROR":
      return { ...state, error: null };

    case "EDITOR/OPEN":
      return {
        ...state,
        editor: {
          ...state.editor,
          isOpen: true,
          mode: action.mode,
          currentUser: action.user || null,
          formData: action.user ? { ...action.user } : initialState.editor.formData
        }
      };

    case "EDITOR/CLOSE":
      return {
        ...state,
        editor: {
          ...initialState.editor
        }
      };

    case "EDITOR/SET_LOADING":
      return {
        ...state,
        editor: {
          ...state.editor,
          loading: action.loading
        }
      };

    case "EDITOR/UPDATE_FIELD":
      return {
        ...state,
        editor: {
          ...state.editor,
          formData: {
            ...state.editor.formData,
            [action.field]: action.value
          }
        }
      };



    default:
      return state;
  }
};
