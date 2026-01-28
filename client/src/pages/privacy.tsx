import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation('privacy');

  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <div className="legal-page__content">
          <h1 className="legal-page__title">{t('title')}</h1>
          
          <div className="legal-page__meta">
            <p>{t('lastUpdated')}: {t('date')}</p>
          </div>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('introduction.title')}</h2>
            <p className="legal-page__text">{t('introduction.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('dataCollection.title')}</h2>
            <p className="legal-page__text">{t('dataCollection.intro')}</p>
            <ul className="legal-page__list">
              <li>{t('dataCollection.personal')}</li>
              <li>{t('dataCollection.usage')}</li>
              <li>{t('dataCollection.technical')}</li>
              <li>{t('dataCollection.cookies')}</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('dataUse.title')}</h2>
            <ul className="legal-page__list">
              <li>{t('dataUse.service')}</li>
              <li>{t('dataUse.communication')}</li>
              <li>{t('dataUse.improvement')}</li>
              <li>{t('dataUse.legal')}</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('dataSharing.title')}</h2>
            <p className="legal-page__text">{t('dataSharing.content')}</p>
            <ul className="legal-page__list">
              <li>{t('dataSharing.consent')}</li>
              <li>{t('dataSharing.legal')}</li>
              <li>{t('dataSharing.business')}</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('security.title')}</h2>
            <p className="legal-page__text">{t('security.content')}</p>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('rights.title')}</h2>
            <ul className="legal-page__list">
              <li>{t('rights.access')}</li>
              <li>{t('rights.correct')}</li>
              <li>{t('rights.delete')}</li>
              <li>{t('rights.portability')}</li>
              <li>{t('rights.object')}</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2 className="legal-page__heading">{t('cookies.title')}</h2>
            <p className="legal-page__text">{t('cookies.content')}</p>
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

export default PrivacyPage;