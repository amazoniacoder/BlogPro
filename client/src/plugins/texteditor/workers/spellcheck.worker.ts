/**
 * Spell Check Web Worker
 */

interface SpellCheckRequest {
  id: string;
  text: string;
  language: string;
}

interface SpellCheckResponse {
  id: string;
  errors: Array<{
    word: string;
    start: number;
    end: number;
    suggestions: string[];
  }>;
}

// Simple spell check implementation
const commonMisspellings: Record<string, string[]> = {
  'teh': ['the'],
  'recieve': ['receive'],
  'seperate': ['separate'],
  'occured': ['occurred'],
  'definately': ['definitely']
};

function checkSpelling(text: string, language: string): SpellCheckResponse['errors'] {
  const errors: SpellCheckResponse['errors'] = [];
  const words = text.match(/\b\w+\b/g) || [];
  let currentIndex = 0;

  // Use language for future dictionary selection
  const dictionary = language === 'ru' ? commonMisspellings : commonMisspellings;

  for (const word of words) {
    const wordIndex = text.indexOf(word, currentIndex);
    const lowerWord = word.toLowerCase();
    
    if (dictionary[lowerWord]) {
      errors.push({
        word,
        start: wordIndex,
        end: wordIndex + word.length,
        suggestions: dictionary[lowerWord]
      });
    }
    
    currentIndex = wordIndex + word.length;
  }

  return errors;
}

self.onmessage = (event: MessageEvent<SpellCheckRequest>) => {
  const { id, text, language } = event.data;
  
  try {
    const errors = checkSpelling(text, language);
    
    const response: SpellCheckResponse = {
      id,
      errors
    };
    
    self.postMessage(response);
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
