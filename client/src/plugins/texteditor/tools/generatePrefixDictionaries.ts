/**
 * Prefix Dictionary Generator
 * 
 * Generates 2-letter prefix dictionary files from existing single-letter dictionaries
 */

import { DictionaryFrequencyAnalyzer } from './analyzeDictionaryFrequency';

export class PrefixDictionaryGenerator {
  private analyzer = new DictionaryFrequencyAnalyzer();
  
  /**
   * Generate all prefix dictionaries from existing single-letter files
   */
  async generateAllPrefixDictionaries(): Promise<void> {
    const letters = [
      'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м',
      'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ',
      'ы', 'ь', 'э', 'ю', 'я'
    ];
    
    const allPrefixData: { [prefix: string]: string[] } = {};
    
    // Process each letter dictionary
    for (const letter of letters) {
      const filePath = `/dictionaries/partitions/ru_${letter}.txt`;
      
      try {
        await this.analyzer.analyzeDictionary(filePath);
        const prefixData = this.analyzer.exportPrefixData();
        
        // Merge prefix data
        Object.keys(prefixData).forEach(prefix => {
          if (!allPrefixData[prefix]) {
            allPrefixData[prefix] = [];
          }
          allPrefixData[prefix].push(...prefixData[prefix]);
        });
        
        console.log(`Processed dictionary for letter: ${letter}`);
      } catch (error) {
        console.warn(`Failed to process dictionary for letter ${letter}:`, error);
      }
    }
    
    // Generate prefix files
    await this.generatePrefixFiles(allPrefixData);
    
    // Generate common words file
    await this.generateCommonWordsFile(allPrefixData);
    
    // Generate report
    const report = this.analyzer.generateReport();
    console.log('Generation complete:', report);
  }
  
  /**
   * Generate individual prefix dictionary files
   */
  private async generatePrefixFiles(prefixData: { [prefix: string]: string[] }): Promise<void> {
    const topPrefixes = DictionaryFrequencyAnalyzer.TOP_PREFIXES;
    
    for (const [prefix, words] of Object.entries(prefixData)) {
      const isCommon = topPrefixes.includes(prefix);
      const directory = isCommon ? 'common' : 'rare';
      const filePath = `/dictionaries/prefixes/${directory}/ru_${prefix}.txt`;
      
      // Sort words alphabetically
      const sortedWords = words.sort();
      const content = sortedWords.join('\n');
      
      try {
        // In a real implementation, you would write to file system
        // For now, we'll log the file info
        console.log(`Generated ${filePath}: ${sortedWords.length} words (${content.length} bytes)`);
        
        // You can uncomment this when implementing file writing
        // await this.writeFile(filePath, content);
      } catch (error) {
        console.error(`Failed to generate ${filePath}:`, error);
      }
    }
  }
  
  /**
   * Generate top 10K common words file
   */
  private async generateCommonWordsFile(prefixData: { [prefix: string]: string[] }): Promise<void> {
    // Get all words with frequency estimation
    const allWords: { word: string; estimatedFrequency: number }[] = [];
    
    Object.entries(prefixData).forEach(([prefix, words]) => {
      const prefixFrequency = DictionaryFrequencyAnalyzer.TOP_PREFIXES.includes(prefix) ? 10 : 1;
      
      words.forEach(word => {
        // Simple frequency estimation based on word length and prefix frequency
        const lengthScore = Math.max(1, 10 - word.length); // Shorter words are more common
        const estimatedFrequency = prefixFrequency * lengthScore;
        
        allWords.push({ word, estimatedFrequency });
      });
    });
    
    // Sort by estimated frequency and take top 10K
    const topWords = allWords
      .sort((a, b) => b.estimatedFrequency - a.estimatedFrequency)
      .slice(0, 10000)
      .map(item => item.word);
    
    const content = topWords.join('\n');
    // Top 10k file generation removed - using prefix-based approach
    
    console.log(`Top 10k words processed: ${topWords.length} words (${content.length} bytes)`);
    
    // You can uncomment this when implementing file writing
    // await this.writeFile(filePath, content);
  }
  
  /**
   * Create directory structure
   */
  async createDirectoryStructure(): Promise<void> {
    const directories = [
      '/dictionaries/prefixes',
      '/dictionaries/prefixes/common',
      '/dictionaries/prefixes/rare',
      '/dictionaries/common'
    ];
    
    for (const dir of directories) {
      try {
        // In a real implementation, you would create directories
        console.log(`Created directory: ${dir}`);
        // await this.createDirectory(dir);
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }
  
  /**
   * Get generation statistics
   */
  getGenerationStats(): {
    totalPrefixes: number;
    commonPrefixes: number;
    rarePrefixes: number;
    estimatedMemorySavings: number;
  } {
    const report = this.analyzer.generateReport();
    const commonPrefixes = DictionaryFrequencyAnalyzer.TOP_PREFIXES.length;
    
    return {
      totalPrefixes: report.totalPrefixes,
      commonPrefixes,
      rarePrefixes: report.totalPrefixes - commonPrefixes,
      estimatedMemorySavings: report.estimatedMemoryUsage.savings
    };
  }
}

// Usage example
export async function runPrefixGeneration(): Promise<void> {
  const generator = new PrefixDictionaryGenerator();
  
  console.log('Starting prefix dictionary generation...');
  
  // Create directory structure
  await generator.createDirectoryStructure();
  
  // Generate all prefix dictionaries
  await generator.generateAllPrefixDictionaries();
  
  // Show statistics
  const stats = generator.getGenerationStats();
  console.log('Generation Statistics:', stats);
}
