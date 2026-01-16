// Hook for handling language-aware routing
import { useTranslation } from 'react-i18next';
import { getLocalizedRoute } from '@/utils/transliteration';

export const useLanguageRoutes = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const getRoute = (route: string): string => {
    return getLocalizedRoute(route, currentLanguage);
  };

  const getBlogRoute = (): string => {
    return `/${getRoute('blog')}`;
  };

  const getCategoryRoute = (slug: string): string => {
    return `/${getRoute('blog')}/${getRoute('category')}/${slug}`;
  };

  return {
    getRoute,
    getBlogRoute,
    getCategoryRoute,
    currentLanguage
  };
};
