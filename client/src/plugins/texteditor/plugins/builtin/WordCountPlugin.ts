/**
 * WordCount Plugin
 * 
 * Converts existing WordCount component into a plugin.
 * Provides real-time word and character counting functionality.
 */

import { ComponentPlugin, ComponentPluginConfig } from '../core/ComponentPlugin';
import WordCount from '../../core/components/WordCount';

export interface WordCountPluginConfig extends ComponentPluginConfig {
  readonly compact?: boolean;
  readonly showWords?: boolean;
  readonly showCharacters?: boolean;
  readonly showReadingTime?: boolean;
  readonly showParagraphs?: boolean;
  readonly showSentences?: boolean;
  readonly readingSpeed?: number;
}

export class WordCountPlugin extends ComponentPlugin {
  readonly name = 'word-count';
  readonly version = '1.0.0';
  readonly description = 'Подсчёт слов и символов в реальном времени с оценкой времени чтения';

  protected config: WordCountPluginConfig = {
    compact: true,
    showWords: true,
    showCharacters: true,
    showReadingTime: true,
    showParagraphs: false,
    showSentences: false,
    readingSpeed: 200,
    mountPoint: '.editor-footer'
  };

  protected async onInitialize(): Promise<void> {
    this.mountPoint = this.config.mountPoint || '.editor-footer';
    
    await this.renderComponent(WordCount, {
      content: this.getEditor().getContent(),
      compact: this.config.compact,
      showWords: this.config.showWords,
      showCharacters: this.config.showCharacters,
      showReadingTime: this.config.showReadingTime,
      showParagraphs: this.config.showParagraphs,
      showSentences: this.config.showSentences,
      readingSpeed: this.config.readingSpeed,
      className: 'editor-word-count plugin-word-count'
    });
  }

  onContentChange(content: string): void {
    if (this.isRendered()) {
      this.updateComponent(WordCount, {
        content,
        compact: this.config.compact,
        showWords: this.config.showWords,
        showCharacters: this.config.showCharacters,
        showReadingTime: this.config.showReadingTime,
        showParagraphs: this.config.showParagraphs,
        showSentences: this.config.showSentences,
        readingSpeed: this.config.readingSpeed,
        className: 'editor-word-count plugin-word-count'
      });
    }
  }

  /**
   * Update plugin configuration
   */
  updateConfig(newConfig: Partial<WordCountPluginConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isRendered()) {
      this.updateComponent(WordCount, {
        content: this.getEditor().getContent(),
        compact: this.config.compact,
        showWords: this.config.showWords,
        showCharacters: this.config.showCharacters,
        showReadingTime: this.config.showReadingTime,
        showParagraphs: this.config.showParagraphs,
        showSentences: this.config.showSentences,
        readingSpeed: this.config.readingSpeed,
        className: 'editor-word-count plugin-word-count'
      });
    }
  }
}
