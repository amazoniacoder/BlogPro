/**
 * BlogPro Language Switcher Component
 * Toggle between supported languages
 */

import { useTranslation } from '@/hooks/useTranslation';

export interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '' 
}) => {
  const { t, changeLanguage, language } = useTranslation('nav');

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ru' : 'en';
    changeLanguage(newLang);
  };

  const currentLang = language === 'en' ? 'RU' : 'EN';
  const tooltipKey = language === 'en' ? 'switchToRussian' : 'switchToEnglish';

  return (
    <button
      onClick={toggleLanguage}
      className={`header__icon-link lang-switcher ${className}`.trim()}
      title={t(tooltipKey)}
    >
      {currentLang}
    </button>
  );
};

export default LanguageSwitcher;
