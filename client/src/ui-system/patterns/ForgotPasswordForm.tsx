/**
 * BlogPro Forgot Password Form Pattern
 * Password reset form with email validation
 */

import React, { useState } from 'react';
import { Input } from '../components/form';
import { Button } from '../components/button';
import { useNotification } from '@/ui-system/components/feedback';
import { authService } from '@/services/api/auth';
import './forgot-password-form.css';

export interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
  className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onBackToLogin,
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showError, showSuccess } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      showSuccess('Password reset instructions sent to your email');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (onBackToLogin) {
      onBackToLogin();
    }
  };

  if (success) {
    return (
      <div className={`auth-form ${className}`}>
        <div className="auth-form__container">
          <div className="auth-form__success">
            <h2 className="auth-form__title">Check Your Email</h2>
            <p className="auth-form__description">
              We've sent password reset instructions to your email address.
            </p>
            <div className="auth-form__actions auth-form__actions--centered">
              <Button 
                type="button" 
                onClick={handleBackClick}
                className="auth-form__button"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className={`auth-form ${className}`} onSubmit={handleSubmit}>
      <div className="auth-form__container">
        <div className="auth-form__header">
          <h2 className="auth-form__title">Reset Password</h2>
          <p className="auth-form__description">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label htmlFor="email" className="auth-form__label">
              Email Address <span className="required-field">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-form__input"
            />
          </div>
        </div>

        <div className="auth-form__actions auth-form__actions--centered">
          <Button 
            type="submit" 
            disabled={loading || !email}
            className="auth-form__button"
          >
            {loading ? '...' : 'Reset Password'}
          </Button>

          <div className="auth-form__links auth-form__links--centered">
            <a href="#" onClick={handleBackClick} className="auth-form__link">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
