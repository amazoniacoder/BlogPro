// client/src/pages/auth/state/reducer.ts
import { AuthState, AuthAction } from "./types";

export const initialState: AuthState = {
  activeTab: "login",
  login: {
    username: "", // Changed from email to username
    password: "",
    rememberMe: false,
    isSubmitting: false,
    error: null,
  },
  register: {
    username: "", // Changed from name to username
    email: "",
    password: "",
    confirmPassword: "",
    captchaVerified: false, // Added captcha verification
    agreeToTerms: false,
    isSubmitting: false,
    error: null,
  },
  forgot: {
    email: "",
    isSubmitting: false,
    success: false,
    error: null,
  },
};

export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };

    case "SET_LOGIN_FIELD":
      return {
        ...state,
        login: { ...state.login, [action.field]: action.value },
      };

    case "SET_REGISTER_FIELD":
      return {
        ...state,
        register: { ...state.register, [action.field]: action.value },
      };

    case "SET_FORGOT_FIELD":
      return {
        ...state,
        forgot: { ...state.forgot, [action.field]: action.value },
      };

    case "LOGIN_START":
      return {
        ...state,
        login: { ...state.login, isSubmitting: true, error: null },
      };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        login: { ...state.login, isSubmitting: false, error: null },
      };

    case "LOGIN_FAILURE":
      return {
        ...state,
        login: { ...state.login, isSubmitting: false, error: action.error },
      };

    // Register actions
    case "REGISTER_START":
      return {
        ...state,
        register: { ...state.register, isSubmitting: true, error: null },
      };

    case "REGISTER_SUCCESS":
      return {
        ...state,
        register: { ...state.register, isSubmitting: false, error: null },
      };

    case "REGISTER_FAILURE":
      return {
        ...state,
        register: {
          ...state.register,
          isSubmitting: false,
          error: action.error,
        },
      };

    // Forgot password actions
    case "FORGOT_START":
      return {
        ...state,
        forgot: {
          ...state.forgot,
          isSubmitting: true,
          error: null,
          success: false,
        },
      };

    case "FORGOT_SUCCESS":
      return {
        ...state,
        forgot: {
          ...state.forgot,
          isSubmitting: false,
          error: null,
          success: true,
        },
      };

    case "FORGOT_FAILURE":
      return {
        ...state,
        forgot: {
          ...state.forgot,
          isSubmitting: false,
          error: action.error,
          success: false,
        },
      };

    case "RESET_FORMS":
      return initialState;

    default:
      return state;
  }
};
