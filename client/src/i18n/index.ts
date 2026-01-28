import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enNav from '../locales/en/nav.json';
import enForms from '../locales/en/forms.json';
import enBlog from '../locales/en/blog.json';
import enErrors from '../locales/en/errors.json';
import enAdmin from '../locales/en/admin.json';

import ruCommon from '../locales/ru/common.json';
import ruAuth from '../locales/ru/auth.json';
import ruNav from '../locales/ru/nav.json';
import ruForms from '../locales/ru/forms.json';
import ruBlog from '../locales/ru/blog.json';
import ruErrors from '../locales/ru/errors.json';
import ruAdmin from '../locales/ru/admin.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ru',
    fallbackLng: 'ru',
    debug: process.env.NODE_ENV === 'development',
    
    ns: ['common', 'auth', 'nav', 'forms', 'blog', 'errors', 'admin'],
    defaultNS: 'common',
    
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        nav: enNav,
        forms: enForms,
        blog: enBlog,
        errors: enErrors,
        admin: enAdmin
      },
      ru: {
        common: ruCommon,
        auth: ruAuth,
        nav: ruNav,
        forms: ruForms,
        blog: ruBlog,
        errors: ruErrors,
        admin: ruAdmin
      }
    },
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'querystring', 'cookie', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      lookupSessionStorage: 'i18nextLng',
    }
  });

export default i18n;
