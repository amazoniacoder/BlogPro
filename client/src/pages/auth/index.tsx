// client/src/pages/auth/index.tsx
import React, { useReducer, useEffect } from "react";
import { useLocation } from "wouter";
import { authReducer, initialState } from "./state/reducer";
import { LoginForm } from "@/ui-system/patterns/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPassword from "./components/ForgotPassword";
import { useAuth } from "@/store/auth-context";
import { useTranslation } from "@/hooks/useTranslation";

const AuthPage: React.FC = () => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const auth = useAuth(); // Get the entire auth object
  const [, navigate] = useLocation();
  const { t } = useTranslation('auth');



  useEffect(() => {
    const handleSwitchToRegister = () => {
      dispatch({ type: "SET_ACTIVE_TAB", payload: "register" });
    };
    
    window.addEventListener('switchToRegister', handleSwitchToRegister);
    return () => window.removeEventListener('switchToRegister', handleSwitchToRegister);
  }, []);



  const handleRegister = async (e: React.FormEvent) => {
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
      // Pass login, email and password separately
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
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "FORGOT_START" });

    try {
      // Implement a simple alert since the function doesn't exist
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
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__tabs">
          <button
            className={`auth__tab ${
              state.activeTab === "login" ? "auth__tab--active" : ""
            }`}
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "login" })
            }
          >
            {t('login')}
          </button>
          <button
            className={`auth__tab ${
              state.activeTab === "register" ? "auth__tab--active" : ""
            }`}
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "register" })
            }
          >
            {t('register')}
          </button>
        </div>

        <div className="auth__content">
          {state.activeTab === "login" && (
            <LoginForm />
          )}

          {state.activeTab === "register" && (
            <RegisterForm
              formState={state.register}
              dispatch={dispatch}
              onSubmit={handleRegister}
            />
          )}

          {state.activeTab === "forgot" && (
            <ForgotPassword
              formState={state.forgot}
              dispatch={dispatch}
              onSubmit={handleForgotPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
