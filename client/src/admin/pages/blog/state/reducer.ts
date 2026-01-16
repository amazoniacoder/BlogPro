// client/src/admin/pages/blog/state/reducer.ts
import { BlogState, BlogAction, BlogPost } from "./types";

export const initialState: BlogState = {
  posts: [],
  filteredPosts: [],
  loading: false,
  error: null,
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  totalPages: 1,
  sortField: "created_at",
  sortDirection: "desc",
  filters: {
    search: "",
    status: "",
    category: "",
  },
  selectedPosts: [],
  deleteModalOpen: false,
  postToDelete: null,
  editor: {
    isOpen: false,
    loading: false,
    currentPost: null,
    formData: {
      title: "",
      slug: "",
      description: "",
      content: "",
      status: "published",
      categoryId: undefined,
      tags: [],
      imageUrl: null,
      thumbnailUrl: null,
      projectUrl: null,
      technologies: [],
    },
  },
  mediaModalOpen: false,
  mediaItems: [],
  mediaLoading: false,
};

// Helper function to filter posts
const filterPosts = (
  posts: BlogPost[],
  filters: BlogState["filters"]
): BlogPost[] => {
  return posts.filter((post) => {
    const searchMatch =
      !filters.search ||
      post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.description.toLowerCase().includes(filters.search.toLowerCase());

    const statusMatch = !filters.status || post.status === filters.status;
    const categoryMatch =
      !filters.category || post.categoryId?.toString() === filters.category;

    return searchMatch && statusMatch && categoryMatch;
  });
};



export const blogReducer = (
  state: BlogState,
  action: BlogAction
): BlogState => {
  switch (action.type) {
    case "BLOG/FETCH_START":
      return { ...state, loading: true, error: null };

    case "BLOG/FETCH_SUCCESS": {
      // Ensure unique posts by ID to prevent duplicate keys
      const uniquePosts = action.payload.filter((post, index, arr) => 
        arr.findIndex(p => p.id === post.id) === index
      );
      const filteredPosts = filterPosts(uniquePosts, state.filters);

      return {
        ...state,
        posts: uniquePosts,
        filteredPosts,
        totalItems: action.totalItems,
        totalPages: action.totalPages,
        loading: false,
      };
    }

    case "BLOG/FETCH_FAILURE":
      return { ...state, loading: false, error: action.error };

    case "BLOG/SET_PAGE":
      return { ...state, currentPage: action.page };

    case "BLOG/SET_ITEMS_PER_PAGE":
      return { ...state, itemsPerPage: action.count, currentPage: 1 };

    case "BLOG/SET_SORT": {
      return {
        ...state,
        sortField: action.field,
        sortDirection: action.direction,
        currentPage: 1, // Reset to first page when sorting changes
      };
    }

    case "BLOG/SET_FILTER": {
      const newFilters = {
        ...state.filters,
        [action.field]: action.value,
      };

      const filteredPosts = filterPosts(state.posts, newFilters);

      return {
        ...state,
        filters: newFilters,
        filteredPosts,
        totalItems: filteredPosts.length,
        currentPage: 1, // Reset to first page when filters change
      };
    }

    case "BLOG/TOGGLE_POST_SELECTION": {
      const isSelected = state.selectedPosts.includes(action.postId);
      const selectedPosts = isSelected
        ? state.selectedPosts.filter((id) => id !== action.postId)
        : [...state.selectedPosts, action.postId];

      return { ...state, selectedPosts };
    }

    case "BLOG/SELECT_ALL_POSTS": {
      const selectedPosts = action.selected
        ? state.filteredPosts.map((post) => post.id)
        : [];

      return { ...state, selectedPosts };
    }

    case "BLOG/SHOW_DELETE_MODAL":
      return {
        ...state,
        deleteModalOpen: true,
        postToDelete: action.postId,
      };

    case "BLOG/HIDE_DELETE_MODAL":
      return { ...state, deleteModalOpen: false, postToDelete: null };

    case "EDITOR/OPEN":
      return {
        ...state,
        editor: {
          ...state.editor,
          isOpen: true,
          currentPost: action.post || null,
          formData: action.post ? {
            ...action.post,
            status: action.post.status || "published"
          } : initialState.editor.formData
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

    case "EDITOR/UPDATE_TITLE": {
      // Inline transliteration to avoid async import in reducer
      const cyrillicToLatin = (text: string): string => {
        const map: { [key: string]: string } = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
          'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
          'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
          'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return text.split('').map(char => map[char] || char).join('');
      };
      
      const slug = cyrillicToLatin(action.value)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      return {
        ...state,
        editor: {
          ...state.editor,
          formData: {
            ...state.editor.formData,
            title: action.value,
            slug
          }
        }
      };
    }

    case "BLOG/DELETE_START":
      return { ...state, loading: true };

    case "BLOG/DELETE_SUCCESS": {
      console.log(`🗑️ DELETE_POST_SUCCESS: Removing post ${action.postId} from state`);
      console.log(`📊 Before: ${state.posts.length} posts, ${state.filteredPosts.length} filtered`);
      
      // Remove the deleted post from all post lists
      const updatedPosts = state.posts.filter(
        (post) => post.id !== action.postId
      );
      
      const updatedFilteredPosts = state.filteredPosts.filter(
        (post) => post.id !== action.postId
      );
      
      const updatedSelectedPosts = state.selectedPosts.filter(
        (id) => id !== action.postId
      );
      
      console.log(`📊 After: ${updatedPosts.length} posts, ${updatedFilteredPosts.length} filtered`);
      
      // Calculate total items after filtering
      const totalItems = Math.max(0, state.totalItems - 1);
      
      // Adjust current page if needed (if the page becomes empty)
      const maxPage = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
      const adjustedCurrentPage = Math.min(state.currentPage, maxPage);
      
      return {
        ...state,
        loading: false,
        posts: updatedPosts,
        filteredPosts: updatedFilteredPosts,
        selectedPosts: updatedSelectedPosts,
        totalItems,
        totalPages: Math.ceil(totalItems / state.itemsPerPage),
        currentPage: adjustedCurrentPage,
      };
    }

    case "BLOG/DELETE_FAILURE":
      return { ...state, loading: false, error: action.error };

    case "BLOG/UPDATE_SUCCESS":
    case "BLOG/CREATE_SUCCESS": {
      // Check if the post already exists in the list
      const postExists = state.posts.some(post => post.id === action.post.id);
      
      // If it's a new post, add it to the list; otherwise, update the existing one
      const updatedPosts = postExists
        ? state.posts.map((post) => post.id === action.post.id ? action.post : post)
        : [action.post, ...state.posts]; // Add new post at the beginning for visibility

      // Ensure unique posts by ID
      const uniquePosts = updatedPosts.filter((post, index, arr) => 
        arr.findIndex(p => p.id === post.id) === index
      );
      const filteredPosts = filterPosts(uniquePosts, state.filters);

      return {
        ...state,
        loading: false,
        posts: uniquePosts,
        filteredPosts,
        totalItems: state.totalItems + (postExists ? 0 : 1), // Increment total if it's a new post
        editor: {
          ...initialState.editor
        }
      };
    }

    case "BLOG/OPERATION_FAILURE":
      return { ...state, loading: false, error: action.error };
      
    case "BLOG/CLEAR_ERROR":
      return { ...state, error: null };


      
    // Media-related actions
    case "MEDIA/SHOW_MODAL":
      return { ...state, mediaModalOpen: true };
      
    case "MEDIA/HIDE_MODAL":
      return { ...state, mediaModalOpen: false };
      
    case "MEDIA/FETCH_START":
      return { ...state, mediaLoading: true };
      
    case "MEDIA/FETCH_SUCCESS":
      return { 
        ...state, 
        mediaItems: action.payload,
        mediaLoading: false 
      };
      
    case "MEDIA/FETCH_FAILURE":
      return { 
        ...state, 
        mediaLoading: false,
        error: action.error 
      };
      
    case "MEDIA/SELECT_IMAGE": {
      return {
        ...state,
        mediaModalOpen: false,
        editor: {
          ...state.editor,
          formData: {
            ...state.editor.formData,
            imageUrl: action.url
          }
        }
      };
    }
      
    case "WEBSOCKET/INIT":
      // Initialize WebSocket connection
      import('@/services/websocket-service').then(({ default: ws }) => {
        ws.connect();
      });
      return state;

    case "WEBSOCKET/CLEANUP":
      // Cleanup WebSocket connection - no action needed
      return state;

    default:
      return state;
  }
};
