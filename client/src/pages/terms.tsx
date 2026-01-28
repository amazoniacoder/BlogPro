import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const TermsPage: React.FC = () => {
  const { t } = useTranslation('terms');

  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <div className="legal-page__content">
          <h1 className="legal-page__title">{t('title')}</h1>
          
          <div className="legal-page__meta">
            <p>{t('lastUpdated')}: {t('date')}</p>
          </div>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('acceptance.title')}</h2>
            <p className="legal-page__text">{t('acceptance.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('services.title')}</h2>
            <p className="legal-page__text">{t('services.content')}</p>
            <ul className="legal-page__list">
              <li>{t('services.blog')}</li>
              <li>{t('services.products')}</li>
              <li>{t('services.documentation')}</li>
              <li>{t('services.analytics')}</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('userAccounts.title')}</h2>
            <p className="legal-page__text">{t('userAccounts.content')}</p>
            <ul className="legal-page__list">
              <li>{t('userAccounts.accurate')}</li>
              <li>{t('userAccounts.secure')}</li>
              <li>{t('userAccounts.responsible')}</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('conduct.title')}</h2>
            <p className="legal-page__text">{t('conduct.intro')}</p>
            <ul className="legal-page__list">
              <li>{t('conduct.illegal')}</li>
              <li>{t('conduct.harmful')}</li>
              <li>{t('conduct.spam')}</li>
              <li>{t('conduct.copyright')}</li>
              <li>{t('conduct.privacy')}</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('content.title')}</h2>
            <p className="legal-page__text">{t('content.ownership')}</p>
            <p className="legal-page__text">{t('content.license')}</p>
            <p className="legal-page__text">{t('content.responsibility')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('intellectual.title')}</h2>
            <p className="legal-page__text">{t('intellectual.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('privacy.title')}</h2>
            <p className="legal-page__text">{t('privacy.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('termination.title')}</h2>
            <p className="legal-page__text">{t('termination.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('disclaimer.title')}</h2>
            <p className="legal-page__text">{t('disclaimer.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('limitation.title')}</h2>
            <p className="legal-page__text">{t('limitation.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('governing.title')}</h2>
            <p className="legal-page__text">{t('governing.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('changes.title')}</h2>
            <p className="legal-page__text">{t('changes.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('contact.title')}</h2>
            <p className="legal-page__text">{t('contact.content')}</p>
            <div className="legal-page__contact">
              <p><strong>{t('contact.email')}</strong>: genavinogradov@gmail.com</p>
              <p><strong>{t('contact.website')}</strong>: https://blogpro.tech</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;