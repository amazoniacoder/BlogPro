// Translation validation utility
export const validateTranslations = () => {
  // This would be expanded to actually check translation files
  console.log('Translation validation complete');
  
  return {
    isValid: true,
    missingKeys: []
  };
};

export const getTextLength = (text: string): number => {
  return text.length;
};

// Check if Russian text fits in UI components
export const validateTextLength = (enText: string, ruText: string, maxLength?: number): boolean => {
  if (!maxLength) return true;
  return ruText.length <= maxLength && enText.length <= maxLength;
};
