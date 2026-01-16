/**
 * Component Plugin Base Class
 * 
 * Extends BasePlugin to support React component rendering within plugins.
 * Provides lifecycle management for React components in the plugin system.
 */

import React from 'react';
import { BasePlugin, PluginConfig, EditorInstance } from './PluginInterface';

export interface ComponentPluginConfig extends PluginConfig {
  readonly mountPoint?: string;
  readonly className?: string;
}

export abstract class ComponentPlugin extends BasePlugin {
  protected container?: HTMLElement;
  protected reactRoot?: any;
  protected mountPoint: string = 'body';
  
  protected config: ComponentPluginConfig = {};

  async initialize(editor: EditorInstance, config?: ComponentPluginConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    this.mountPoint = this.config.mountPoint || 'body';
    
    await super.initialize(editor, config);
  }

  /**
   * Render a React component within the plugin container
   */
  protected async renderComponent<T extends Record<string, any>>(
    Component: React.ComponentType<T>, 
    props: T
  ): Promise<void> {
    try {
      if (!this.container) {
        this.createContainer();
      }

      // Dynamic import to avoid bundling React DOM if not needed
      const { createRoot } = await import('react-dom/client');
      
      if (this.reactRoot) {
        this.reactRoot.unmount();
      }
      
      this.reactRoot = createRoot(this.container!);
      this.reactRoot.render(React.createElement(Component, props));
      
    } catch (error) {

      throw error;
    }
  }

  /**
   * Update component props without full re-render
   */
  protected updateComponent<T extends Record<string, any>>(
    Component: React.ComponentType<T>, 
    props: T
  ): void {
    if (this.reactRoot && this.container) {
      this.reactRoot.render(React.createElement(Component, props));
    }
  }

  /**
   * Create container element for the plugin
   */
  private createContainer(): void {
    // Clean up any existing container first
    this.cleanupExistingContainer();
    
    this.container = document.createElement('div');
    this.container.className = `plugin-${this.name} ${this.config.className || ''}`.trim();
    this.container.setAttribute('data-plugin', this.name);
    
    const mountElement = this.findMountPoint();
    if (mountElement) {
      // Insert at beginning to maintain order: plugins first, static elements last
      mountElement.insertBefore(this.container, mountElement.firstChild);
    } else {

      document.body.appendChild(this.container);
    }
  }
  
  /**
   * Clean up any existing container elements for this plugin
   */
  private cleanupExistingContainer(): void {
    const existingContainers = document.querySelectorAll(`[data-plugin="${this.name}"]`);
    existingContainers.forEach(container => container.remove());
  }

  /**
   * Find the mount point element
   */
  private findMountPoint(): Element | null {
    if (this.mountPoint === 'body') {
      return document.body;
    }
    
    return document.querySelector(this.mountPoint);
  }

  /**
   * Remove container and unmount React component
   */
  protected async onDestroy(): Promise<void> {
    try {
      if (this.reactRoot) {
        this.reactRoot.unmount();
        this.reactRoot = undefined;
      }
      
      if (this.container) {
        this.container.remove();
        this.container = undefined;
      }
      
      // Clean up any remaining containers
      this.cleanupExistingContainer();
    } catch (error) {

    }
  }

  /**
   * Get the plugin container element
   */
  protected getContainer(): HTMLElement | undefined {
    return this.container;
  }

  /**
   * Check if component is currently rendered
   */
  protected isRendered(): boolean {
    return !!(this.container && this.reactRoot);
  }
}
