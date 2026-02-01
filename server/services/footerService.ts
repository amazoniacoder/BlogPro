import { db } from '../db/db.js';
import { footerConfigs, footerHistory } from '../../shared/types/schema.js';
import { eq, desc } from 'drizzle-orm';
import { broadcastFooterUpdate } from '../websocket.js';
import type { FooterConfig, FooterHistory } from '../../shared/types/footer.js';

export class FooterService {
  async getActiveConfig(): Promise<FooterConfig | null> {
    try {
      const result = await db
        .select()
        .from(footerConfigs)
        .where(eq(footerConfigs.isActive, true))
        .limit(1);

      return result[0] ? this.mapDbToConfig(result[0]) : null;
    } catch (error) {
      console.error('Error getting active footer config:', error);
      throw new Error('Failed to get active footer configuration');
    }
  }

  async getAllConfigs(): Promise<FooterConfig[]> {
    try {
      const result = await db
        .select()
        .from(footerConfigs)
        .orderBy(desc(footerConfigs.createdAt));

      return result.map(this.mapDbToConfig);
    } catch (error) {
      console.error('Error getting footer configs:', error);
      throw new Error('Failed to get footer configurations');
    }
  }

  async createConfig(config: Omit<FooterConfig, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<FooterConfig> {
    try {
      if (config.isActive) {
        await this.deactivateAllConfigs();
      }

      const result = await db
        .insert(footerConfigs)
        .values({
          config: config as any,
          isActive: config.isActive,
          version: config.version,
          createdBy: userId
        })
        .returning();

      const newConfig = this.mapDbToConfig(result[0]);
      await this.addToHistory(newConfig.id!, newConfig, 'Configuration created', userId);
      
      // Broadcast WebSocket update
      broadcastFooterUpdate('config_updated', newConfig);
      
      return newConfig;
    } catch (error) {
      console.error('Error creating footer config:', error);
      throw new Error('Failed to create footer configuration');
    }
  }

  async updateConfig(id: number, updates: Partial<FooterConfig>, userId: string): Promise<FooterConfig> {
    try {
      if (updates.isActive) {
        await this.deactivateAllConfigs();
      }

      const result = await db
        .update(footerConfigs)
        .set({
          config: updates as any,
          isActive: updates.isActive,
          version: updates.version,
          updatedAt: new Date()
        })
        .where(eq(footerConfigs.id, id))
        .returning();

      if (!result[0]) {
        throw new Error('Footer configuration not found');
      }

      const updatedConfig = this.mapDbToConfig(result[0]);
      await this.addToHistory(id, updatedConfig, 'Configuration updated', userId);
      
      // Broadcast WebSocket update
      broadcastFooterUpdate('config_updated', updatedConfig);
      
      return updatedConfig;
    } catch (error) {
      console.error('Error updating footer config:', error);
      throw new Error('Failed to update footer configuration');
    }
  }

  async deleteConfig(id: number): Promise<void> {
    try {
      const result = await db
        .delete(footerConfigs)
        .where(eq(footerConfigs.id, id))
        .returning();

      if (!result[0]) {
        throw new Error('Footer configuration not found');
      }
    } catch (error) {
      console.error('Error deleting footer config:', error);
      throw new Error('Failed to delete footer configuration');
    }
  }

  async activateConfig(id: number, userId: string): Promise<FooterConfig> {
    try {
      await this.deactivateAllConfigs();

      const result = await db
        .update(footerConfigs)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(footerConfigs.id, id))
        .returning();

      if (!result[0]) {
        throw new Error('Footer configuration not found');
      }

      const activatedConfig = this.mapDbToConfig(result[0]);
      await this.addToHistory(id, activatedConfig, 'Configuration activated', userId);
      
      // Broadcast WebSocket update
      broadcastFooterUpdate('config_updated', activatedConfig);
      
      return activatedConfig;
    } catch (error) {
      console.error('Error activating footer config:', error);
      throw new Error('Failed to activate footer configuration');
    }
  }

  async getHistory(configId: number): Promise<FooterHistory[]> {
    try {
      const result = await db
        .select()
        .from(footerHistory)
        .where(eq(footerHistory.footerConfigId, configId))
        .orderBy(desc(footerHistory.createdAt));

      return result.map((row: any) => ({
        id: row.id,
        footerConfigId: row.footerConfigId,
        config: row.config as FooterConfig,
        changeDescription: row.changeDescription || '',
        createdAt: row.createdAt?.toISOString() || '',
        createdBy: row.createdBy || ''
      }));
    } catch (error) {
      console.error('Error getting footer history:', error);
      throw new Error('Failed to get footer configuration history');
    }
  }

  private async deactivateAllConfigs(): Promise<void> {
    await db
      .update(footerConfigs)
      .set({ isActive: false })
      .where(eq(footerConfigs.isActive, true));
  }

  private async addToHistory(configId: number, config: FooterConfig, description: string, userId: string): Promise<void> {
    await db
      .insert(footerHistory)
      .values({
        footerConfigId: configId,
        config: config as any,
        changeDescription: description,
        createdBy: userId
      });
  }

  private mapDbToConfig(row: any): FooterConfig {
    return {
      id: row.id,
      version: row.version,
      isActive: row.isActive,
      createdAt: row.createdAt?.toISOString(),
      updatedAt: row.updatedAt?.toISOString(),
      createdBy: row.createdBy,
      ...row.config
    };
  }
}

export const footerService = new FooterService();