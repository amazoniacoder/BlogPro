// Translation fallback utilities
export const translationFallbacks = {
  // Common fallbacks
  loading: {
    en: 'Loading...',
    ru: 'Загрузка...'
  },
  error: {
    en: 'Error',
    ru: 'Ошибка'
  },
  save: {
    en: 'Save',
    ru: 'Сохранить'
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена'
  },
  // Blog fallbacks
  blog: {
    en: 'Blog',
    ru: 'Блог'
  },
  categories: {
    en: 'Categories',
    ru: 'Категории'
  },
  allPosts: {
    en: 'All Posts',
    ru: 'Все записи'
  }
};

export const getFallbackText = (key: string, language: string): string => {
  const fallback = translationFallbacks[key as keyof typeof translationFallbacks];
  if (fallback && fallback[language as keyof typeof fallback]) {
    return fallback[language as keyof typeof fallback];
  }
  return key; // Return key as last resort
};
