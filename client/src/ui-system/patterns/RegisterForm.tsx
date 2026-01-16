/**
 * BlogPro Register Form Pattern
 * User registration form with validation
 */

import React, { useState } from 'react';
import { useAuth } from '@/store/auth-context';
import { useToast } from '@/ui-system/components/feedback';
import { Input } from '../components/form';
import { PasswordInput } from '../components/input';
import { Button } from '../components/button';
import { CaptchaButton } from '@/plugins/captcha';
import './register-form.css';

export interface RegisterFormProps {
  onRegistrationSuccess?: (username: string, password: string, email: string, userId?: string) => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegistrationSuccess,
  className = ''
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { register, loading } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (!captchaVerified) {
      showToast('Please verify the captcha', 'error');
      return;
    }

    try {
      await register({
        username,
        email,
        password
      });
      showToast('Registration successful! Please check your email.', 'success');
      
      if (onRegistrationSuccess) {
        onRegistrationSuccess(username, password, email);
      }
      
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCaptchaVerified(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      showToast(errorMessage, 'error');
    }
  };

  const handleCaptchaSolved = () => {
    setCaptchaVerified(true);
  };

  const handleCaptchaError = (error: string) => {
    console.error('Captcha error:', error);
    setCaptchaVerified(false);
  };

  return (
    <form className={`auth-form auth-form--register ${className}`} onSubmit={handleSubmit}>
      <div className="auth-form__container">
        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label htmlFor="register-username" className="auth-form__label">
              Username <span className="required-field">*</span>
            </label>
            <Input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="auth-form__input"
            />
          </div>
          
          <div className="auth-form__field">
            <label htmlFor="register-email" className="auth-form__label">
              Email <span className="required-field">*</span>
            </label>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="auth-form__input"
            />
          </div>
          
          <div className="auth-form__field">
            <label htmlFor="register-password" className="auth-form__label">
              Password <span className="required-field">*</span>
            </label>
            <PasswordInput
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="auth-form__input"
              minLength={8}
            />
            <p className="auth-form__hint">Min 8 characters</p>
          </div>
          
          <div className="auth-form__field">
            <label htmlFor="register-confirm-password" className="auth-form__label">
              Confirm Password <span className="required-field">*</span>
            </label>
            <PasswordInput
              id="register-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="auth-form__input"
              minLength={8}
            />
          </div>
        </div>
        
        <div className="auth-form__bottom">
          <div className="auth-form__submit-section">
            <div className="auth-form__captcha">
              <CaptchaButton
                onSolved={handleCaptchaSolved}
                onError={handleCaptchaError}
                disabled={loading}
                size="md"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading || !captchaVerified}
              className="auth-form__submit"
            >
              {loading ? '...' : 'Register'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;
