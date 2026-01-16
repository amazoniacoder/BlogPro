// D:\WebDesignStudio\client\src\pages\auth\state\actions.ts
import { AuthAction } from "./types";

// Tab navigation
export const setActiveTab = (
  tab: "login" | "register" | "forgot"
): AuthAction => ({
  type: "SET_ACTIVE_TAB",
  payload: tab,
});

// Login form actions
export const setLoginField = (field: string, value: any): AuthAction => ({
  type: "SET_LOGIN_FIELD",
  field: field as any,
  value,
});

export const loginStart = (): AuthAction => ({
  type: "LOGIN_START",
});

export const loginSuccess = (): AuthAction => ({
  type: "LOGIN_SUCCESS",
});

export const loginFailure = (error: string): AuthAction => ({
  type: "LOGIN_FAILURE",
  error,
});

// Register form actions
export const setRegisterField = (field: string, value: any): AuthAction => ({
  type: "SET_REGISTER_FIELD",
  field: field as any,
  value,
});

export const registerStart = (): AuthAction => ({
  type: "REGISTER_START",
});

export const registerSuccess = (): AuthAction => ({
  type: "REGISTER_SUCCESS",
});

export const registerFailure = (error: string): AuthAction => ({
  type: "REGISTER_FAILURE",
  error,
});

// Forgot password actions
export const setForgotField = (field: string, value: any): AuthAction => ({
  type: "SET_FORGOT_FIELD",
  field: field as any,
  value,
});

export const forgotStart = (): AuthAction => ({
  type: "FORGOT_START",
});

export const forgotSuccess = (): AuthAction => ({
  type: "FORGOT_SUCCESS",
});

export const forgotFailure = (error: string): AuthAction => ({
  type: "FORGOT_FAILURE",
  error,
});

// Reset all forms
export const resetForms = (): AuthAction => ({
  type: "RESET_FORMS",
});
