import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieBanner: React.FC = () => {
  const { t } = useTranslation('cookies');
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const rejected = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(rejected));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const savedPreferences = {
      ...preferences,
      timestamp: Date.now()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(savedPreferences));
    setIsVisible(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Always required
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner__overlay" />
      <div className="cookie-banner__container">
        <div className="cookie-banner__content">
          <div className="cookie-banner__header">
            <div className="cookie-banner__icon">🍪</div>
            <h3 className="cookie-banner__title">{t('title')}</h3>
          </div>
          
          <p className="cookie-banner__description">
            {t('description')}
          </p>

          {showSettings && (
            <div className="cookie-banner__settings">
              <div className="cookie-banner__category">
                <div className="cookie-banner__category-header">
                  <label className="cookie-banner__checkbox">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                    />
                    <span className="cookie-banner__checkmark"></span>
                    <span className="cookie-banner__label">{t('necessary.title')}</span>
                  </label>
                  <span className="cookie-banner__required">{t('required')}</span>
                </div>
                <p className="cookie-banner__category-desc">{t('necessary.description')}</p>
              </div>

              <div className="cookie-banner__category">
                <div className="cookie-banner__category-header">
                  <label className="cookie-banner__checkbox">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                    />
                    <span className="cookie-banner__checkmark"></span>
                    <span className="cookie-banner__label">{t('analytics.title')}</span>
                  </label>
                </div>
                <p className="cookie-banner__category-desc">{t('analytics.description')}</p>
              </div>

              <div className="cookie-banner__category">
                <div className="cookie-banner__category-header">
                  <label className="cookie-banner__checkbox">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                    />
                    <span className="cookie-banner__checkmark"></span>
                    <span className="cookie-banner__label">{t('marketing.title')}</span>
                  </label>
                </div>
                <p className="cookie-banner__category-desc">{t('marketing.description')}</p>
              </div>
            </div>
          )}

          <div className="cookie-banner__links">
            <a href="/privacy" className="cookie-banner__link">{t('privacyPolicy')}</a>
            <a href="/terms" className="cookie-banner__link">{t('termsOfService')}</a>
          </div>

          <div className="cookie-banner__actions">
            {!showSettings ? (
              <>
                <button
                  className="cookie-banner__button cookie-banner__button--secondary"
                  onClick={() => setShowSettings(true)}
                >
                  {t('customize')}
                </button>
                <button
                  className="cookie-banner__button cookie-banner__button--outline"
                  onClick={handleRejectAll}
                >
                  {t('rejectAll')}
                </button>
                <button
                  className="cookie-banner__button cookie-banner__button--primary"
                  onClick={handleAcceptAll}
                >
                  {t('acceptAll')}
                </button>
              </>
            ) : (
              <>
                <button
                  className="cookie-banner__button cookie-banner__button--secondary"
                  onClick={() => setShowSettings(false)}
                >
                  {t('back')}
                </button>
                <button
                  className="cookie-banner__button cookie-banner__button--primary"
                  onClick={handleSavePreferences}
                >
                  {t('savePreferences')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;