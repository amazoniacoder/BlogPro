import React from "react";
import { Icon } from '@/ui-system/icons/components';
import { FormField } from "@/ui-system/components/form";
import { Input } from "@/ui-system/components/input";
import { Button } from "@/ui-system/components/button";
import { Heading, Text } from "@/ui-system/components/typography";
import { Alert } from "@/ui-system/components/feedback";

interface ForgotPasswordProps {
  formState: {
    email: string;
    isSubmitting: boolean;
    success: boolean;
    error: string | null;
  };
  dispatch: React.Dispatch<any>;
  onSubmit: (e: React.FormEvent) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  formState,
  dispatch,
  onSubmit,
}) => {
  const handleChange = (field: string, value: any) => {
    dispatch({
      type: "SET_FORGOT_FIELD",
      field: field as keyof typeof formState,
      value,
    });
  };

  const handleBackToLogin = () => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: "login" });
  };

  if (formState.success) {
    return (
      <div className="auth-form" style={{ textAlign: 'center' }}>
        <Icon name="success" size={48} style={{ color: 'var(--success-600)', marginBottom: '1rem' }} />
        <Heading level={2} className="auth-form__title">Check Your Email</Heading>
        <Text className="auth-form__description">
          We've sent password reset instructions to your email address. Please
          check your inbox and follow the link to reset your password.
        </Text>
        <Button variant="secondary" onClick={handleBackToLogin}>
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <Heading level={2} className="auth-form__title">Reset Your Password</Heading>
      <Text className="auth-form__description">
        Enter your email address and we'll send you instructions to reset your
        password.
      </Text>

      {formState.error && (
        <Alert variant="error" className="auth-form__error">
          {formState.error}
        </Alert>
      )}

      <FormField label="Email Address" required>
        <Input
          type="email"
          id="forgot-email"
          value={formState.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={formState.isSubmitting || !formState.email}
        className="auth-form__button"
      >
        {formState.isSubmitting ? "Sending..." : "Reset Password"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={handleBackToLogin}
      >
        Back to Login
      </Button>
    </form>
  );
};

export default React.memo(ForgotPassword);
