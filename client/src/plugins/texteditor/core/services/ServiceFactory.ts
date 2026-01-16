/**
 * Service Factory (Refactored with DI Container)
 * 
 * Clean, centralized service factory using dependency injection.
 */

import { DIContainer } from '../di/DIContainer';
import { ServiceRegistry } from '../di/ServiceRegistry';
import { LifecycleManager } from '../lifecycle/LifecycleManager';

// Interfaces
import {
  IUnifiedFormatService,
  IUnifiedSpellCheckService,
  IUnifiedTextAnalysisService,
  IHistoryService,
  IPerformanceService
} from './UnifiedServiceInterfaces';
import { IAutoSaveService } from './AutoSaveService';

// Legacy services (keep for backward compatibility)
import { FontFormatService } from './formatting/FontFormatService';
import { LayoutFormatService } from './formatting/LayoutFormatService';
import { ListService } from './ListService';
import { LinkService } from './media/LinkService';
import { MediaService } from './media/MediaService';
import { TextReplacementService } from './content/TextReplacementService';
import { DOMManipulationService } from './dom/DOMManipulationService';
import { SearchService } from './content/SearchService';

export class ServiceFactory {
  private static container: DIContainer | null = null;
  private static initialized = false;

  /**
   * Initialize the service factory with DI container
   */
  private static initialize(): void {
    if (this.initialized) return;

    this.container = new DIContainer();
    ServiceRegistry.registerServices(this.container);
    this.initialized = true;
  }

  /**
   * Get service from DI container
   */
  private static async getService<T>(name: string): Promise<T> {
    this.initialize();
    return this.container!.resolve<T>(name);
  }

  // ===== UNIFIED SERVICES (DI-managed) =====

  static async getUnifiedFormatService(): Promise<IUnifiedFormatService> {
    return this.getService<IUnifiedFormatService>('unifiedFormatService');
  }

  static async getUnifiedSpellCheckService(): Promise<IUnifiedSpellCheckService> {
    return this.getService<IUnifiedSpellCheckService>('unifiedSpellCheckService');
  }

  static async getUnifiedTextAnalysisService(): Promise<IUnifiedTextAnalysisService> {
    return this.getService<IUnifiedTextAnalysisService>('unifiedTextAnalysisService');
  }

  static async getHistoryService(): Promise<IHistoryService> {
    return this.getService<IHistoryService>('historyService');
  }

  static async getPerformanceService(): Promise<IPerformanceService> {
    return this.getService<IPerformanceService>('performanceService');
  }

  static async getAutoSaveService(): Promise<IAutoSaveService> {
    return this.getService<IAutoSaveService>('autoSaveService');
  }

  // ===== LEGACY SERVICES (Direct access for backward compatibility) =====

  static getTextFormatService(): Promise<IUnifiedFormatService> {
    return this.getUnifiedFormatService();
  }

  static async getSpellCheckService(): Promise<IUnifiedSpellCheckService> {
    return this.getUnifiedSpellCheckService();
  }

  static getFontFormatService() {
    return FontFormatService;
  }

  static getLayoutFormatService() {
    return LayoutFormatService;
  }

  static getListService() {
    return ListService;
  }

  static getLinkService() {
    return LinkService;
  }

  static getMediaService() {
    return MediaService;
  }

  static getTextReplacementService() {
    return TextReplacementService;
  }

  static getDOMManipulationService() {
    return DOMManipulationService;
  }

  static getSearchService() {
    return new SearchService();
  }

  // ===== LIFECYCLE MANAGEMENT =====

  /**
   * Clean up all services and dispose container
   */
  static async cleanup(): Promise<void> {
    // Dispose all lifecycle-managed resources
    const lifecycleManager = LifecycleManager.getInstance();
    await lifecycleManager.dispose();
    
    // Dispose DI container
    if (this.container) {
      await this.container.dispose();
      this.container = null;
      this.initialized = false;
    }
    
    // Reset lifecycle manager
    LifecycleManager.reset();
  }

  /**
   * Reset factory for testing
   */
  static reset(): void {
    this.container = null;
    this.initialized = false;
  }

  // ===== TESTING UTILITIES =====

  static setUnifiedFormatService(service: IUnifiedFormatService): void {
    this.initialize();
    this.container!.clearInstance('unifiedFormatService');
    
    // Re-register service (clear first if exists)
    if (this.container!.isRegistered('unifiedFormatService')) {
      // Create new container to avoid registration conflicts
      this.reset();
      this.initialize();
    }
    
    this.container!.register('unifiedFormatService', {
      factory: () => service,
      singleton: true
    });
  }

  static setUnifiedSpellCheckService(service: IUnifiedSpellCheckService): void {
    this.initialize();
    this.container!.clearInstance('unifiedSpellCheckService');
    this.container!.register('unifiedSpellCheckService', {
      factory: () => service,
      singleton: true
    });
  }

  static setUnifiedTextAnalysisService(service: IUnifiedTextAnalysisService): void {
    this.initialize();
    this.container!.clearInstance('unifiedTextAnalysisService');
    this.container!.register('unifiedTextAnalysisService', {
      factory: () => service,
      singleton: true
    });
  }

  // Legacy setters for backward compatibility
  static setTextFormatService(service: IUnifiedFormatService): void {
    this.setUnifiedFormatService(service);
  }

  static setSpellCheckService(service: IUnifiedSpellCheckService): void {
    this.setUnifiedSpellCheckService(service);
  }
}
