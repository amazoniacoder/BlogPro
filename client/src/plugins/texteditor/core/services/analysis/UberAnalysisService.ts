/**
 * UberAnalysisService - Consolidated text analysis service
 * Combines all text analysis functionality
 */

import { IUnifiedTextAnalysisService } from '../UnifiedServiceInterfaces';

export class UberAnalysisService implements IUnifiedTextAnalysisService {
  private cache = new Map<string, any>();
  private maxCacheSize = 100;

  analyzeText(content: string, options?: any): any {
    const cacheKey = `analyze_${content}_${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const analysis = {
      wordCount: this.getWordCount(content),
      characterCount: this.getCharacterCount(content, true, false),
      paragraphCount: this.getParagraphCount(content),
      sentenceCount: this.getSentenceCount(content),
      readingTime: this.getReadingTime(content)
    };

    this.setCache(cacheKey, analysis);
    return analysis;
  }

  getWordCount(content: string, _options?: any): number {
    const text = this.stripHtml(content);
    if (!text.trim()) return 0;
    
    // Unicode-aware word counting
    const words = text.match(/[\w\u00C0-\u024F\u1E00-\u1EFF\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]+/g);
    return words ? words.length : 0;
  }

  getCharacterCount(content: string, includeSpaces = true, includeHtml = false): number {
    const text = includeHtml ? content : this.stripHtml(content);
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
  }

  getReadingTime(content: string, readingSpeed = 200): number {
    const wordCount = this.getWordCount(content);
    return Math.ceil(wordCount / readingSpeed);
  }

  getParagraphCount(content: string, includeHtml = false): number {
    const text = includeHtml ? content : this.stripHtml(content);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return paragraphs.length;
  }

  getSentenceCount(content: string, _options?: any): number {
    const text = this.stripHtml(content);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
  }

  parseSentence(sentence: string): any {
    return {
      text: sentence,
      wordCount: this.getWordCount(sentence),
      characterCount: sentence.length
    };
  }

  checkSyntax(text: string): any[] {
    // Basic syntax checking - can be enhanced
    const errors = [];
    if (text.includes('  ')) {
      errors.push({ type: 'spacing', message: 'Double spaces detected' });
    }
    return errors;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }

  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private setCache(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  destroy(): void {
    this.clearCache();
  }
}
