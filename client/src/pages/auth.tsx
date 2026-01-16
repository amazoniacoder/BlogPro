import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Spinner } from "@/ui-system/components/feedback";
import { LoginForm } from "@/ui-system/patterns/LoginForm";
import { ForgotPasswordForm } from "@/ui-system/patterns/ForgotPasswordForm";
import { RegisterForm } from "@/ui-system/patterns/RegisterForm";
import { useTranslation } from "@/hooks/useTranslation";


export default function AuthPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [location] = useLocation();
  const [loading, setLoading] = useState(true);

  const [registeredCredentials, setRegisteredCredentials] = useState<{ username: string, password: string } | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  // Check if there's a hash in the URL to determine which tab to show
  useEffect(() => {
    if (location.includes("#register")) {
      setActiveTab("register");
    }
  }, [location]);
  
  // Listen for register tab switch event
  useEffect(() => {
    const handleSwitchToRegister = () => {
      setActiveTab("register");
    };
    
    window.addEventListener('switchToRegister', handleSwitchToRegister);
    return () => window.removeEventListener('switchToRegister', handleSwitchToRegister);
  }, []);
  
  useEffect(() => {
    // Simulate initial loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle successful registration
  const handleRegistrationSuccess = (username: string, password: string, email: string) => {
    setRegisteredCredentials({ username, password });
    setVerificationEmail(email);
    setShowVerificationModal(true);
    
    // Set flag in localStorage to track verification
    localStorage.setItem('pendingVerification', email);
    
    // Listen for verification completion
    const checkVerification = () => {
      if (localStorage.getItem('emailVerified') === email) {
        localStorage.removeItem('emailVerified');
        localStorage.removeItem('pendingVerification');
        setShowVerificationModal(false);
        window.location.href = '/';
      }
    };
    
    // Check when window regains focus (user comes back from email)
    window.addEventListener('focus', checkVerification);
    
    // Also check periodically
    const interval = setInterval(checkVerification, 1000);
    
    // Cleanup
    setTimeout(() => {
      window.removeEventListener('focus', checkVerification);
      clearInterval(interval);
    }, 300000); // 5 minutes timeout
  };
  

  
  if (loading) {
    return (
      <div className="container">
        <div className="auth__loading">
          <Spinner />
          <p className="auth__loading-text">{t('auth:preparingLogin')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth">
      <div className="auth-form">
        <div className="auth-form__tabs">
          <button
            type="button"
            className={`auth-form__tab ${activeTab === 'login' ? 'auth-form__tab--active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            {t('auth:login')}
          </button>
          <button
            type="button"
            className={`auth-form__tab ${activeTab === 'register' ? 'auth-form__tab--active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            {t('auth:register')}
          </button>
        </div>
        
        <div className="auth-form__content">
          {activeTab === 'login' && (
            showForgotPassword ? (
              <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
            ) : (
              <LoginForm 
                initialCredentials={registeredCredentials}
                onForgotPasswordClick={() => setShowForgotPassword(true)}
              />
            )
          )}
          
          {activeTab === 'register' && (
            <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
          )}
        </div>
      </div>
                
      {showVerificationModal && (
        <div className="auth__modal-overlay">
          <div className="auth__modal">
            <h3>📧 {t('auth:emailVerificationRequired')}</h3>
            <div className="verification-spinner"></div>
            <div className="verification-status waiting">
              <span>⏳ {t('auth:waitingVerification')}</span>
            </div>
            <p>{t('auth:verificationSent')}</p>
            <strong>{verificationEmail}</strong>
            <p>{t('auth:checkEmail')}</p>
            <div className="auth__modal-actions">
              <button 
                className="auth__button auth__button--secondary"
                onClick={() => setShowVerificationModal(false)}
              >
                {t('auth:verifyLater')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
