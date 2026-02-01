import React from "react";
import { FormField, Checkbox } from "@/ui-system/components/form";
import { Input, PasswordInput } from "@/ui-system/components/input";
import { Button } from "@/ui-system/components/button";
import { Heading } from "@/ui-system/components/typography";
import { Alert } from "@/ui-system/components/feedback";
import { useTranslation } from "@/hooks/useTranslation";

interface LoginFormProps {
  formState: {
    username: string;
    password: string;
    rememberMe: boolean;
    isSubmitting: boolean;
    error: string | null;
  };
  dispatch: React.Dispatch<any>;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  formState,
  dispatch,
  onSubmit,
}) => {
  const { t } = useTranslation('auth');
  
  const handleChange = (field: string, value: any) => {
    dispatch({
      type: "SET_LOGIN_FIELD",
      field: field as keyof typeof formState,
      value,
    });
  };

  return (
    <form onSubmit={onSubmit} className="auth-form" autoComplete="off">
      {/* Honeypot fields to prevent autofill */}
      <input type="text" name="username" style={{display: 'none'}} tabIndex={-1} autoComplete="off" />
      <input type="password" name="password" style={{display: 'none'}} tabIndex={-1} autoComplete="off" />
      
      <Heading level={2} className="auth-form__title text-center">{t('loginToAccount', 'Login to Your Account')}</Heading>

      {formState.error && (
        <Alert variant="error" className="auth-form__error">
          {formState.error}
        </Alert>
      )}

      <FormField label={t('username')} required>
        <Input
          type="text"
          id="username"
          value={formState.username}
          onChange={(e) => handleChange("username", e.target.value)}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          required
        />
      </FormField>

      <FormField label={t('password')} required>
        <PasswordInput
          id="password"
          value={formState.password}
          onChange={(e) => handleChange("password", e.target.value)}
          autoComplete="new-password"
          required
        />
      </FormField>

      <Checkbox
        id="rememberMe"
        checked={formState.rememberMe}
        onChange={(e) => handleChange("rememberMe", e.target.checked)}
        label={t('rememberMe', 'Remember me')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={formState.isSubmitting}
        className="auth-form__button"
      >
        {t('login')}
      </Button>
    </form>
  );
};

export default React.memo(LoginForm);
