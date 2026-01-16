/**
 * Screen Reader Service
 * Manages ARIA live regions and screen reader announcements
 */

import { AriaLiveRegion } from '../../types/AccessibilityTypes';

export class ScreenReaderService {
  private static instance: ScreenReaderService;
  private liveRegions = new Map<string, AriaLiveRegion>();
  private announcementQueue: string[] = [];
  private isProcessing = false;

  private constructor() {
    this.createDefaultLiveRegions();
  }

  static getInstance(): ScreenReaderService {
    if (!this.instance) {
      this.instance = new ScreenReaderService();
    }
    return this.instance;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!message.trim()) return;

    const region = this.liveRegions.get(priority);
    if (region) {
      this.announcementQueue.push(message);
      this.processQueue(priority);
    }
  }

  announceFormatChange(formatType: string, isActive: boolean): void {
    const action = isActive ? 'applied' : 'removed';
    this.announce(`${formatType} formatting ${action}`, 'polite');
  }

  announceSelectionChange(selectedText: string): void {
    if (selectedText.length > 0) {
      const wordCount = selectedText.split(/\s+/).length;
      this.announce(`Selected ${wordCount} word${wordCount !== 1 ? 's' : ''}`, 'polite');
    }
  }

  announceContentChange(changeType: 'insert' | 'delete' | 'replace', content?: string): void {
    switch (changeType) {
      case 'insert':
        if (content && content.length < 50) {
          this.announce(`Inserted: ${content}`, 'polite');
        } else {
          this.announce('Content inserted', 'polite');
        }
        break;
      case 'delete':
        this.announce('Content deleted', 'polite');
        break;
      case 'replace':
        this.announce('Content replaced', 'polite');
        break;
    }
  }

  announceError(error: string): void {
    this.announce(`Error: ${error}`, 'assertive');
  }

  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  setAriaLabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label);
  }

  setAriaDescribedBy(element: HTMLElement, descriptionId: string): void {
    element.setAttribute('aria-describedby', descriptionId);
  }

  setRole(element: HTMLElement, role: string): void {
    element.setAttribute('role', role);
  }

  setAriaExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  }

  setAriaPressed(element: HTMLElement, pressed: boolean): void {
    element.setAttribute('aria-pressed', pressed.toString());
  }

  private createDefaultLiveRegions(): void {
    // Polite announcements
    const politeRegion = this.createLiveRegion('polite', false);
    this.liveRegions.set('polite', {
      element: politeRegion,
      politeness: 'polite',
      atomic: false
    });

    // Assertive announcements
    const assertiveRegion = this.createLiveRegion('assertive', true);
    this.liveRegions.set('assertive', {
      element: assertiveRegion,
      politeness: 'assertive',
      atomic: true
    });
  }

  private createLiveRegion(politeness: 'polite' | 'assertive', atomic: boolean): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', atomic.toString());
    region.setAttribute('aria-relevant', 'additions text');
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';
    
    document.body.appendChild(region);
    return region;
  }

  private async processQueue(priority: 'polite' | 'assertive'): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const region = this.liveRegions.get(priority);
    
    while (this.announcementQueue.length > 0) {
      const message = this.announcementQueue.shift();
      if (message && region) {
        region.element.textContent = message;
        await this.delay(100); // Brief pause between announcements
      }
    }
    
    this.isProcessing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy(): void {
    this.liveRegions.forEach(region => {
      if (region.element.parentNode) {
        region.element.parentNode.removeChild(region.element);
      }
    });
    this.liveRegions.clear();
    this.announcementQueue = [];
  }
}
