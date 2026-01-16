/**
 * SpellCheck Plugin
 * 
 * Converts existing SpellCheckManager component into a plugin.
 * Provides advanced spell checking with grammar support.
 */

import React from 'react';
import { ComponentPlugin, ComponentPluginConfig } from '../core/ComponentPlugin';
import { SpellCheckManager } from '../../core/components/spellcheck/SpellCheckManager';

export interface SpellCheckPluginConfig extends ComponentPluginConfig {
  readonly enabled?: boolean;
  readonly autoDetect?: boolean;
  readonly languages?: string[];
  readonly checkGrammar?: boolean;
}

export class SpellCheckPlugin extends ComponentPlugin {
  readonly name = 'spell-check';
  readonly version = '1.0.0';
  readonly description = 'Продвинутая проверка орфографии с поддержкой грамматики и определением языка';

  private editorRef?: React.RefObject<HTMLDivElement>;
  private spellCheckEnabled: boolean = true;

  protected config: SpellCheckPluginConfig = {
    enabled: true,
    autoDetect: true,
    languages: ['en', 'ru'],
    checkGrammar: false,
    mountPoint: '.editor-footer'
  };

  protected async onInitialize(): Promise<void> {
    this.mountPoint = this.config.mountPoint || '.editor-footer';
    this.spellCheckEnabled = this.config.enabled ?? true;
    
    // Create ref for editor element
    this.editorRef = {
      current: this.getEditorElement()
    };

    await this.renderComponent(SpellCheckManager, {
      editorRef: this.editorRef,
      content: this.getEditor().getContent(),
      enabled: this.spellCheckEnabled,
      onEnabledChange: this.handleEnabledChange.bind(this)
    });
  }

  onContentChange(content: string): void {
    if (this.isRendered() && this.editorRef) {
      this.updateComponent(SpellCheckManager, {
        editorRef: this.editorRef,
        content,
        enabled: this.spellCheckEnabled,
        onEnabledChange: this.handleEnabledChange.bind(this)
      });
    }
  }

  /**
   * Handle spell check enabled/disabled state change
   */
  private handleEnabledChange(enabled: boolean): void {
    this.spellCheckEnabled = enabled;
    
    // Update plugin settings
    this.config = { ...this.config, enabled };
  }

  /**
   * Get editor DOM element
   */
  private getEditorElement(): HTMLDivElement | null {
    const editor = this.getEditor();
    
    // Try to get element from editor instance
    if ('getElement' in editor && typeof editor.getElement === 'function') {
      return editor.getElement() as HTMLDivElement;
    }
    
    // Fallback: find editor content element
    return document.querySelector('.editor-content') as HTMLDivElement;
  }

  /**
   * Enable spell checking
   */
  enableSpellCheck(): void {
    this.handleEnabledChange(true);
    
    if (this.isRendered() && this.editorRef) {
      this.updateComponent(SpellCheckManager, {
        editorRef: this.editorRef,
        content: this.getEditor().getContent(),
        enabled: true,
        onEnabledChange: this.handleEnabledChange.bind(this)
      });
    }
  }

  /**
   * Disable spell checking
   */
  disableSpellCheck(): void {
    this.handleEnabledChange(false);
    
    if (this.isRendered() && this.editorRef) {
      this.updateComponent(SpellCheckManager, {
        editorRef: this.editorRef,
        content: this.getEditor().getContent(),
        enabled: false,
        onEnabledChange: this.handleEnabledChange.bind(this)
      });
    }
  }

  /**
   * Update plugin configuration
   */
  updateConfig(newConfig: Partial<SpellCheckPluginConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.enabled !== undefined) {
      this.spellCheckEnabled = newConfig.enabled;
    }
    
    if (this.isRendered() && this.editorRef) {
      this.updateComponent(SpellCheckManager, {
        editorRef: this.editorRef,
        content: this.getEditor().getContent(),
        enabled: this.spellCheckEnabled,
        onEnabledChange: this.handleEnabledChange.bind(this)
      });
    }
  }

  /**
   * Get current spell check status
   */
  isSpellCheckEnabled(): boolean {
    return this.spellCheckEnabled;
  }
}
