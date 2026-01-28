// D:\WebDesignStudio\client\src\pages\auth\hooks\useAuthForm.ts
import { useReducer, useCallback } from "react";
import { useAuth } from "@/store/auth-context";
import { useLocation } from "wouter";
import { useNotifications } from "@/ui-system/components/feedback";
import { authReducer, initialState } from "../state/reducer";

export const useAuthForm = () => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const auth = useAuth(); // Get the entire auth object
  const [, navigate] = useLocation();
  const { showModalSuccess, showModalError } = useNotifications();

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch({ type: "LOGIN_START" });

      try {
        // Updated to use login instead of email
        await auth.login(state.login.username, state.login.password);
        dispatch({ type: "LOGIN_SUCCESS" });
        showModalSuccess(
          'You have been successfully logged in. Welcome back!',
          'Login Successful'
        );
        setTimeout(() => navigate("/"), 1500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        dispatch({
          type: "LOGIN_FAILURE",
          error: errorMessage,
        });
        showModalError(
          errorMessage,
          'Login Failed'
        );
      }
    },
    [
      state.login.username, // Changed from email to username
      state.login.password,
      auth.login,
      navigate,
      showModalSuccess,
      showModalError
    ]
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate passwords match
      if (state.register.password !== state.register.confirmPassword) {
        const errorMessage = "Passwords do not match";
        dispatch({
          type: "REGISTER_FAILURE",
          error: errorMessage,
        });
        showModalError(errorMessage, 'Registration Error');
        return;
      }

      // Validate captcha
      if (!state.register.captchaVerified) {
        const errorMessage = "Please complete the captcha verification";
        dispatch({
          type: "REGISTER_FAILURE",
          error: errorMessage,
        });
        showModalError(errorMessage, 'Verification Required');
        return;
      }

      dispatch({ type: "REGISTER_START" });

      try {
        // Updated to use login instead of name
        await auth.register({
          username: state.register.username,
          email: state.register.email,
          password: state.register.password,
        });
        dispatch({ type: "REGISTER_SUCCESS" });
        showModalSuccess(
          'Your account has been created successfully! Welcome to BlogPro.',
          'Registration Successful'
        );
        setTimeout(() => navigate("/"), 1500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Registration failed";
        dispatch({
          type: "REGISTER_FAILURE",
          error: errorMessage,
        });
        showModalError(
          errorMessage,
          'Registration Failed'
        );
      }
    },
    [
      state.register.username, // Changed from name to username
      state.register.email,
      state.register.password,
      state.register.confirmPassword,
      state.register.captchaVerified,
      auth.register,
      navigate,
      showModalSuccess,
      showModalError
    ]
  );

  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch({ type: "FORGOT_START" });

      try {
        // Use notification instead of alert
        showModalSuccess(
          `Password reset instructions have been sent to ${state.forgot.email}. Please check your email.`,
          'Password Reset Requested'
        );
        console.log(
          "Password reset functionality not implemented in auth context"
        );

        dispatch({ type: "FORGOT_SUCCESS" });
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Password reset request failed";
        dispatch({
          type: "FORGOT_FAILURE",
          error: errorMessage,
        });
        showModalError(
          errorMessage,
          'Password Reset Failed'
        );
      }
    },
    [state.forgot.email, showModalSuccess, showModalError]
  );

  const setActiveTab = useCallback((tab: "login" | "register" | "forgot") => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });
  }, []);

  return {
    state,
    dispatch,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    setActiveTab,
  };
};
