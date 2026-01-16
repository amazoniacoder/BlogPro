/**
 * Word Count Plugin - Example plugin implementation
 */

import { BasePlugin, PluginConfig } from '../core/PluginInterface';

interface WordCountConfig extends PluginConfig {
  showCharacters?: boolean;
  showParagraphs?: boolean;
  updateInterval?: number;
}

export class WordCountPlugin extends BasePlugin {
  readonly name = 'word-count';
  readonly version = '1.0.0';
  readonly description = 'Displays real-time word count statistics';

  private element?: HTMLElement;
  private updateTimer?: NodeJS.Timeout;
  protected config: WordCountConfig = {};

  protected async onInitialize(): Promise<void> {
    this.config = { 
      showCharacters: true, 
      showParagraphs: false, 
      updateInterval: 500,
      ...this.config 
    };
    
    this.createElement();
    this.attachEventListeners();
    this.updateStats();
  }

  protected async onDestroy(): Promise<void> {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    if (this.element) {
      this.element.remove();
    }
  }

  onContentChange(): void {
    this.updateStats();
  }

  private createElement(): void {
    this.element = document.createElement('div');
    this.element.className = 'word-count-plugin';
    this.element.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: #f0f0f0;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
    `;
    
    document.body.appendChild(this.element);
  }

  private attachEventListeners(): void {
    if (this.config.updateInterval) {
      this.updateTimer = setInterval(() => {
        this.updateStats();
      }, this.config.updateInterval);
    }
  }

  private updateStats(): void {
    if (!this.element) return;
    
    try {
      const editor = this.getEditor();
      const content = editor.getContent();
      const text = this.stripHtml(content);
      
      const words = this.countWords(text);
      let stats = `Words: ${words}`;
      
      if (this.config.showCharacters) {
        const chars = text.length;
        stats += ` | Chars: ${chars}`;
      }
      
      if (this.config.showParagraphs) {
        const paragraphs = this.countParagraphs(text);
        stats += ` | Paragraphs: ${paragraphs}`;
      }
      
      this.element.textContent = stats;
    } catch (error) {
      // Silently handle errors to prevent console spam
      if (this.element) {
        this.element.textContent = 'Words: 0';
      }
    }
  }

  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private countWords(text: string): number {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }

  private countParagraphs(text: string): number {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  }
}
