import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const TermsPage: React.FC = () => {
  const { t } = useTranslation('terms');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        
        <div className="text-sm text-gray-600 mb-8">
          <p>{t('lastUpdated')}: {t('date')}</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('acceptance.title')}</h2>
          <p className="mb-4">{t('acceptance.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('services.title')}</h2>
          <p className="mb-4">{t('services.content')}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t('services.blog')}</li>
            <li>{t('services.products')}</li>
            <li>{t('services.documentation')}</li>
            <li>{t('services.analytics')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('userAccounts.title')}</h2>
          <p className="mb-4">{t('userAccounts.content')}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t('userAccounts.accurate')}</li>
            <li>{t('userAccounts.secure')}</li>
            <li>{t('userAccounts.responsible')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('conduct.title')}</h2>
          <p className="mb-4">{t('conduct.intro')}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t('conduct.illegal')}</li>
            <li>{t('conduct.harmful')}</li>
            <li>{t('conduct.spam')}</li>
            <li>{t('conduct.copyright')}</li>
            <li>{t('conduct.privacy')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('content.title')}</h2>
          <p className="mb-4">{t('content.ownership')}</p>
          <p className="mb-4">{t('content.license')}</p>
          <p className="mb-4">{t('content.responsibility')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('intellectual.title')}</h2>
          <p className="mb-4">{t('intellectual.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.title')}</h2>
          <p className="mb-4">{t('privacy.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('termination.title')}</h2>
          <p className="mb-4">{t('termination.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('disclaimer.title')}</h2>
          <p className="mb-4">{t('disclaimer.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('limitation.title')}</h2>
          <p className="mb-4">{t('limitation.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('governing.title')}</h2>
          <p className="mb-4">{t('governing.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
          <p className="mb-4">{t('changes.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
          <p className="mb-4">{t('contact.content')}</p>
          <p className="mb-2">
            <strong>{t('contact.email')}</strong>: genavinogradov@gmail.com
          </p>
          <p className="mb-2">
            <strong>{t('contact.website')}</strong>: https://blogpro.tech
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;