import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguage = () => i18n.language;

  const isRussian = () => i18n.language === 'ru';
  const isEnglish = () => i18n.language === 'en';

  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    isRussian,
    isEnglish,
    language: i18n.language,
  };
};
