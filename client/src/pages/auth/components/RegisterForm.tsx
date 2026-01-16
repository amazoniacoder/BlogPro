import React, { useState } from "react";
import { FormField, Checkbox } from "@/ui-system/components/form";
import { Input, PasswordInput } from "@/ui-system/components/input";
import { Button } from "@/ui-system/components/button";
import { Heading, Text, Link } from "@/ui-system/components/typography";
import { Alert } from "@/ui-system/components/feedback";
import { useTranslation } from "@/hooks/useTranslation";

interface RegisterFormProps {
  formState: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    captchaVerified: boolean;
    agreeToTerms: boolean;
    isSubmitting: boolean;
    error: string | null;
  };
  dispatch: React.Dispatch<any>;
  onSubmit: (e: React.FormEvent) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  formState,
  dispatch,
  onSubmit,
}) => {
  const { t } = useTranslation('auth');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const handleChange = (field: string, value: any) => {
    dispatch({
      type: "SET_REGISTER_FIELD",
      field: field as keyof typeof formState,
      value,
    });

    if (field === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return t('passwordWeak', 'Weak');
    if (passwordStrength <= 4) return t('passwordMedium', 'Medium');
    return t('passwordStrong', 'Strong');
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "var(--error-600)";
    if (passwordStrength <= 4) return "var(--warning-600)";
    return "var(--success-600)";
  };

  return (
    <form onSubmit={onSubmit} className="auth-form" autoComplete="off">
      <Heading level={2} className="auth-form__title">{t('createAccount', 'Create an Account')}</Heading>

      {formState.error && (
        <Alert variant="error" className="auth-form__error">
          {formState.error}
        </Alert>
      )}

      <FormField label={t('username')} required>
        <Input
          type="text"
          id="register-username"
          value={formState.username}
          onChange={(e) => handleChange("username", e.target.value)}
          autoComplete="off"
          required
        />
      </FormField>

      <FormField label={t('emailAddress', 'Email Address')} required>
        <Input
          type="email"
          id="register-email"
          value={formState.email}
          onChange={(e) => handleChange("email", e.target.value)}
          autoComplete="off"
          required
        />
      </FormField>

      <FormField label={t('password')} required>
        <PasswordInput
          id="register-password"
          value={formState.password}
          onChange={(e) => handleChange("password", e.target.value)}
          autoComplete="new-password"
          required
        />
        <Text size="sm" color="muted">
          {t('passwordHint', 'Min 8 characters')}
        </Text>
        {formState.password && (
          <div className="auth-form__password-strength" style={{ marginTop: '0.5rem' }}>
            <div className="auth-form__strength-bar" style={{ 
              width: '100%', 
              height: '4px', 
              backgroundColor: 'var(--bg-alt)', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div
                className="auth-form__strength-indicator"
                style={{
                  width: `${(passwordStrength / 5) * 100}%`,
                  height: '100%',
                  backgroundColor: getStrengthColor(),
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            <Text size="sm" color={passwordStrength <= 2 ? 'error' : passwordStrength <= 4 ? 'warning' : 'success'}>
              {getStrengthLabel()}
            </Text>
          </div>
        )}
      </FormField>

      <FormField label={t('confirmPassword')} required>
        <PasswordInput
          id="register-confirm-password"
          value={formState.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          autoComplete="new-password"
          required
        />
        {formState.password && formState.confirmPassword && formState.password !== formState.confirmPassword && (
          <Text color="error" size="sm">
            {t('passwordsDoNotMatch', 'Passwords do not match')}
          </Text>
        )}
      </FormField>

      <div className="checkbox-wrapper">
        <Checkbox
          id="agreeToTerms"
          checked={formState.agreeToTerms}
          onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
          required
        />
        <Text size="sm">
          {t('agreeToTermsStart', 'I agree to the')}{" "}
          <Link href="/terms" external>
            {t('termsOfService', 'Terms of Service')}
          </Link>{" "}
          {t('and', 'and')}{" "}
          <Link href="/privacy" external>
            {t('privacyPolicy', 'Privacy Policy')}
          </Link>
        </Text>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={
          formState.isSubmitting ||
          !formState.agreeToTerms ||
          formState.password !== formState.confirmPassword ||
          !formState.captchaVerified ||
          passwordStrength < 3
        }
        className="auth-form__button"
      >
        {formState.isSubmitting ? t('creatingAccount', 'Creating Account...') : t('register')}
      </Button>
    </form>
  );
};

export default React.memo(RegisterForm);
