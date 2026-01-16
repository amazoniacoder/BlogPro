/**
 * Dictionary Frequency Analyzer
 * 
 * Analyzes Russian dictionary to determine most frequent 2-letter prefixes
 */

interface PrefixStats {
  prefix: string;
  count: number;
  words: string[];
  estimatedSize: number; // in bytes
}

export class DictionaryFrequencyAnalyzer {
  private prefixStats = new Map<string, PrefixStats>();
  
  // Top 20 most frequent Russian 2-letter prefixes (based on linguistic analysis)
  static readonly TOP_PREFIXES = [
    'ко', 'на', 'по', 'пр', 'от', 'за', 'не', 'во', 'до', 'об',
    'со', 'то', 'но', 'го', 'ро', 'мо', 'ло', 'бо', 'хо', 'фо'
  ];
  
  /**
   * Analyze dictionary file and extract prefix statistics
   */
  async analyzeDictionary(filePath: string): Promise<Map<string, PrefixStats>> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.status}`);
      }
      
      const content = await response.text();
      const words = content.split('\n')
        .map(word => word.trim().toLowerCase())
        .filter(word => word.length >= 2);
      
      // Analyze each word
      words.forEach(word => {
        const prefix = word.substring(0, 2);
        
        if (!this.prefixStats.has(prefix)) {
          this.prefixStats.set(prefix, {
            prefix,
            count: 0,
            words: [],
            estimatedSize: 0
          });
        }
        
        const stats = this.prefixStats.get(prefix)!;
        stats.count++;
        stats.words.push(word);
        stats.estimatedSize += word.length + 1; // +1 for newline
      });
      
      return this.prefixStats;
    } catch (error) {
      console.error('Dictionary analysis failed:', error);
      return new Map();
    }
  }
  
  /**
   * Get top N prefixes by frequency
   */
  getTopPrefixes(n: number = 20): PrefixStats[] {
    return Array.from(this.prefixStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }
  
  /**
   * Get statistics for specific prefixes
   */
  getPrefixStats(prefixes: string[]): PrefixStats[] {
    return prefixes
      .map(prefix => this.prefixStats.get(prefix))
      .filter(stats => stats !== undefined) as PrefixStats[];
  }
  
  /**
   * Generate report
   */
  generateReport(): {
    totalWords: number;
    totalPrefixes: number;
    topPrefixes: PrefixStats[];
    recommendedForPreload: PrefixStats[];
    estimatedMemoryUsage: {
      current: number;
      optimized: number;
      savings: number;
    };
  } {
    const totalWords = Array.from(this.prefixStats.values())
      .reduce((sum, stats) => sum + stats.count, 0);
    
    const topPrefixes = this.getTopPrefixes(20);
    const recommendedForPreload = this.getPrefixStats(DictionaryFrequencyAnalyzer.TOP_PREFIXES);
    
    const currentMemoryUsage = totalWords * 20; // ~20 bytes per word average
    const optimizedMemoryUsage = recommendedForPreload
      .reduce((sum, stats) => sum + stats.estimatedSize, 0);
    
    return {
      totalWords,
      totalPrefixes: this.prefixStats.size,
      topPrefixes,
      recommendedForPreload,
      estimatedMemoryUsage: {
        current: currentMemoryUsage,
        optimized: optimizedMemoryUsage,
        savings: ((currentMemoryUsage - optimizedMemoryUsage) / currentMemoryUsage) * 100
      }
    };
  }
  
  /**
   * Export prefix data for dictionary generation
   */
  exportPrefixData(): { [prefix: string]: string[] } {
    const result: { [prefix: string]: string[] } = {};
    
    this.prefixStats.forEach((stats, prefix) => {
      result[prefix] = stats.words;
    });
    
    return result;
  }
}
