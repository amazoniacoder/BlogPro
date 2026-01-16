// client/src/pages/auth/state/types.ts
export interface AuthState {
  activeTab: "login" | "register" | "forgot";
  login: {
    username: string; // Changed from email to username
    password: string;
    rememberMe: boolean;
    isSubmitting: boolean;
    error: string | null;
  };
  register: {
    username: string; // Added username field
    email: string;
    password: string;
    confirmPassword: string;
    captchaVerified: boolean; // Added captcha verification
    agreeToTerms: boolean;
    isSubmitting: boolean;
    error: string | null;
  };
  forgot: {
    email: string;
    isSubmitting: boolean;
    success: boolean;
    error: string | null;
  };
}

export type AuthAction =
  | { type: "SET_ACTIVE_TAB"; payload: "login" | "register" | "forgot" }
  | { type: "SET_LOGIN_FIELD"; field: keyof AuthState["login"]; value: any }
  | {
      type: "SET_REGISTER_FIELD";
      field: keyof AuthState["register"];
      value: any;
    }
  | { type: "SET_FORGOT_FIELD"; field: keyof AuthState["forgot"]; value: any }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS" }
  | { type: "LOGIN_FAILURE"; error: string }
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS" }
  | { type: "REGISTER_FAILURE"; error: string }
  | { type: "FORGOT_START" }
  | { type: "FORGOT_SUCCESS" }
  | { type: "FORGOT_FAILURE"; error: string }
  | { type: "RESET_FORMS" };
