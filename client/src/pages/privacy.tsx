import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation('privacy');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        
        <div className="text-sm text-gray-600 mb-8">
          <p>{t('lastUpdated')}: {t('date')}</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('introduction.title')}</h2>
          <p className="mb-4">{t('introduction.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('dataCollection.title')}</h2>
          <p className="mb-4">{t('dataCollection.intro')}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t('dataCollection.personal')}</li>
            <li>{t('dataCollection.usage')}</li>
            <li>{t('dataCollection.technical')}</li>
            <li>{t('dataCollection.cookies')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('dataUse.title')}</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>{t('dataUse.service')}</li>
            <li>{t('dataUse.communication')}</li>
            <li>{t('dataUse.improvement')}</li>
            <li>{t('dataUse.legal')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('dataSharing.title')}</h2>
          <p className="mb-4">{t('dataSharing.content')}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t('dataSharing.consent')}</li>
            <li>{t('dataSharing.legal')}</li>
            <li>{t('dataSharing.business')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('security.title')}</h2>
          <p className="mb-4">{t('security.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('rights.title')}</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>{t('rights.access')}</li>
            <li>{t('rights.correct')}</li>
            <li>{t('rights.delete')}</li>
            <li>{t('rights.portability')}</li>
            <li>{t('rights.object')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('cookies.title')}</h2>
          <p className="mb-4">{t('cookies.content')}</p>
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

export default PrivacyPage;