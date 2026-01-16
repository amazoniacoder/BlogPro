// client/src/services/documentationService.ts
import { documentationApi } from './api/documentation';

export const documentationService = {
  // Re-export all API methods
  ...documentationApi,
  
  // Convenience methods with better naming
  syncAllToMenu: documentationApi.syncAllToMenu,
  cleanupMenu: documentationApi.cleanupMenu
};
