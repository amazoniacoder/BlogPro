import React from 'react';
import { ContactForm, ContactPage } from '@/ui-system/patterns';
import { useTranslation } from '@/hooks/useTranslation';

const Contact: React.FC = () => {
  const { t } = useTranslation('forms');

  return (
    <div className="container">
      <ContactPage
        title={t('contactUs', 'Contact Us')}
        description={t('contactDescription', "We'd love to hear from you. Send us a message and we'll respond as soon as possible.")}
      >
        <ContactForm />
      </ContactPage>
    </div>
  );
};

export default Contact;
