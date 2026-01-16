/**
 * BlogPro Login Form Pattern
 * Authentication login form with captcha
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/store/auth-context';
import { useToast } from '@/ui-system/components/feedback';
import { Input } from '../components/form';
import { PasswordInput } from '../components/input';
import { Button } from '../components/button';
import { CaptchaButton } from '@/plugins/captcha';
import { useTranslation } from '@/hooks/useTranslation';
import './login-form.css';

export interface LoginFormProps {
  initialCredentials?: { username: string; password: string } | null;
  onForgotPasswordClick?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  initialCredentials, 
  onForgotPasswordClick,
  className = ''
}) => {
  const { t } = useTranslation('auth');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (initialCredentials) {
      setUsername(initialCredentials.username);
      setPassword(initialCredentials.password);
    }
  }, [initialCredentials]);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setCaptchaVerified(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      showToast('Please verify the captcha', 'error');
      return;
    }

    try {
      await login(username, password);
      showToast('Login successful!', 'success');
      
      // Get fresh user data to determine redirect
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userResponse = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache'
            }
          });
          
          if (userResponse.ok) {
            const { user: currentUser } = await userResponse.json();
            if (currentUser.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/profile');
            }
          } else {
            navigate('/');
          }
        } catch {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      showToast(errorMessage, 'error');
      resetForm();
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
    <form className={`auth-form ${className}`} onSubmit={handleSubmit}>
      <div className="auth-form__container">
        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label htmlFor="username" className="auth-form__label">
              {t('username')} <span className="required-field">*</span>
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="auth-form__input"
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password" className="auth-form__label">
              {t('password')} <span className="required-field">*</span>
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="auth-form__input"
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
              {loading ? '...' : t('login')}
            </Button>
          </div>
        </div>

        <div className="auth-form__links auth-form__links--centered">
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              onForgotPasswordClick?.(); 
            }} 
            className="auth-form__link"
          >
            {t('forgotPassword')}
          </a>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
