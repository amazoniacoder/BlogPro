/**
 * Text Analyzer
 * 
 * Analyzes text patterns to predict which dictionary partitions
 * will be needed for spell checking optimization.
 */

interface LetterFrequency {
  letter: string;
  count: number;
  percentage: number;
}

interface TextAnalysis {
  letterFrequency: Map<string, number>;
  topLetters: string[];
  predictedPartitions: string[];
  textLength: number;
  uniqueLetters: number;
}

export class TextAnalyzer {
  private readonly RUSSIAN_LETTERS = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  private readonly NON_INITIAL_LETTERS = new Set(['ь', 'ъ', 'ы']); // ь, ъ, ы cannot start Russian words
  
  /**
   * Analyze text and return letter frequency data
   */
  analyzeText(text: string): TextAnalysis {
    const letterFreq = this.getLetterFrequency(text);
    const topLetters = this.getTopLetters(letterFreq, 5);
    const predictedPartitions = this.predictNextLetters(letterFreq, text);
    
    return {
      letterFrequency: letterFreq,
      topLetters,
      predictedPartitions,
      textLength: text.length,
      uniqueLetters: letterFreq.size
    };
  }
  
  /**
   * Get letter frequency from text
   */
  getLetterFrequency(text: string): Map<string, number> {
    const frequency = new Map<string, number>();
    const normalizedText = text.toLowerCase();
    
    for (const char of normalizedText) {
      if (this.RUSSIAN_LETTERS.includes(char)) {
        frequency.set(char, (frequency.get(char) || 0) + 1);
      }
    }
    
    return frequency;
  }
  
  /**
   * Get top N most frequent letters
   */
  getTopLetters(frequency: Map<string, number>, count: number): string[] {
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([letter]) => letter);
  }
  
  /**
   * Predict which partitions will be needed based on text patterns
   */
  predictNextLetters(frequency: Map<string, number>, text: string): string[] {
    const predictions = new Set<string>();
    
    // Add most frequent letters (excluding non-initial letters)
    const topLetters = this.getTopLetters(frequency, 3)
      .filter(letter => !this.NON_INITIAL_LETTERS.has(letter));
    topLetters.forEach(letter => predictions.add(letter));
    
    // Add letters from common Russian word patterns (excluding non-initial letters)
    const commonPatterns = this.analyzeWordPatterns(text)
      .filter(letter => !this.NON_INITIAL_LETTERS.has(letter));
    commonPatterns.forEach(letter => predictions.add(letter));
    
    // Add high-priority letters if text is short
    if (text.length < 100) {
      const highPriority = ['а', 'в', 'и', 'к', 'н', 'о', 'п', 'р', 'с', 'т'];
      highPriority.slice(0, 2).forEach(letter => predictions.add(letter));
    }
    
    return Array.from(predictions);
  }
  
  /**
   * Analyze word patterns to predict needed letters
   */
  private analyzeWordPatterns(text: string): string[] {
    const patterns = new Set<string>();
    const words = text.toLowerCase().match(/[а-яё]+/g) || [];
    
    words.forEach(word => {
      // Add first letters of words
      if (word.length > 0) {
        patterns.add(word[0]);
      }
      
      // Add letters from common prefixes
      const prefixes = ['пре', 'при', 'под', 'над', 'без', 'раз', 'воз'];
      prefixes.forEach(prefix => {
        if (word.startsWith(prefix)) {
          prefix.split('').forEach(letter => patterns.add(letter));
        }
      });
      
      // Add letters from common suffixes
      const suffixes = ['ние', 'тель', 'ость', 'ение', 'ание'];
      suffixes.forEach(suffix => {
        if (word.endsWith(suffix)) {
          suffix.split('').forEach(letter => patterns.add(letter));
        }
      });
    });
    
    return Array.from(patterns);
  }
  
  /**
   * Get detailed frequency statistics
   */
  getFrequencyStats(frequency: Map<string, number>): LetterFrequency[] {
    const total = Array.from(frequency.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(frequency.entries())
      .map(([letter, count]) => ({
        letter,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }
  
  /**
   * Estimate cache efficiency for given partitions
   */
  estimateCacheEfficiency(text: string, cachedPartitions: string[]): number {
    const frequency = this.getLetterFrequency(text);
    const totalLetters = Array.from(frequency.values()).reduce((sum, count) => sum + count, 0);
    
    let coveredLetters = 0;
    cachedPartitions.forEach(partition => {
      coveredLetters += frequency.get(partition) || 0;
    });
    
    return totalLetters > 0 ? (coveredLetters / totalLetters) * 100 : 0;
  }
}