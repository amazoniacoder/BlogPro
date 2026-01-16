// D:\WebDesignStudio\client\src\pages\auth\hooks\useAuthForm.ts
import { useReducer, useCallback } from "react";
import { useAuth } from "@/store/auth-context";
import { useLocation } from "wouter";
import { authReducer, initialState } from "../state/reducer";

export const useAuthForm = () => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const auth = useAuth(); // Get the entire auth object
  const [, navigate] = useLocation();

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch({ type: "LOGIN_START" });

      try {
        // Updated to use login instead of email
        await auth.login(state.login.username, state.login.password);
        dispatch({ type: "LOGIN_SUCCESS" });
        navigate("/");
      } catch (error) {
        dispatch({
          type: "LOGIN_FAILURE",
          error: error instanceof Error ? error.message : "Login failed",
        });
      }
    },
    [
      state.login.username, // Changed from email to username
      state.login.password,
      auth.login,
      navigate,
    ]
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate passwords match
      if (state.register.password !== state.register.confirmPassword) {
        dispatch({
          type: "REGISTER_FAILURE",
          error: "Passwords do not match",
        });
        return;
      }

      // Validate captcha
      if (!state.register.captchaVerified) {
        dispatch({
          type: "REGISTER_FAILURE",
          error: "Please complete the captcha verification",
        });
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
        navigate("/");
      } catch (error) {
        dispatch({
          type: "REGISTER_FAILURE",
          error: error instanceof Error ? error.message : "Registration failed",
        });
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
    ]
  );

  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch({ type: "FORGOT_START" });

      try {
        // Use alert since resetPassword doesn't exist
        alert(`Password reset requested for: ${state.forgot.email}`);
        console.log(
          "Password reset functionality not implemented in auth context"
        );

        dispatch({ type: "FORGOT_SUCCESS" });
      } catch (error) {
        dispatch({
          type: "FORGOT_FAILURE",
          error:
            error instanceof Error
              ? error.message
              : "Password reset request failed",
        });
      }
    },
    [state.forgot.email]
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
