// client/src/admin/pages/documentation/hooks/useDocumentationData.ts
import { useReducer, useEffect, useCallback } from 'react';
import { documentationApi } from '../../../../services/api/documentation';
import { menuApi } from '../../../../services/api/menu';
import { websocketService } from '../../../../services/websocket-service';
import { documentationReducer, initialState } from '../state/reducer';
import type { 
  DocumentationFormData,
  UseDocumentationDataReturn 
} from '../../../../ui-system/components/admin';

export const useDocumentationData = (): UseDocumentationDataReturn => {
  const [state, dispatch] = useReducer(documentationReducer, initialState);

  const fetchData = useCallback(async () => {
    dispatch({ type: 'DOCUMENTATION/FETCH_START' });
    
    try {
      console.log('Fetching documentation data...');
      
      // Clear any cached documentation data before fetching
      const { httpClient } = await import('../../../../services/cache/http-client');
      httpClient.clearCache();
      
      const [docsData, categoriesData] = await Promise.all([
        documentationApi.getAllDocumentation(),
        documentationApi.getCategories()
      ]);
      
      console.log('Documentation data:', docsData);
      console.log('Categories data:', categoriesData);
      
      dispatch({ 
        type: 'DOCUMENTATION/FETCH_SUCCESS', 
        payload: docsData || [], 
        categories: categoriesData || [] 
      });
    } catch (err) {
      console.error('Error fetching documentation data:', err);
      dispatch({ 
        type: 'DOCUMENTATION/FETCH_FAILURE', 
        error: 'Ошибка загрузки данных' 
      });
    }
  }, []);

  const createDocument = useCallback(async (data: DocumentationFormData): Promise<void> => {
    try {
      const newDocument = await documentationApi.createDocumentation(data);
      dispatch({ type: 'DOCUMENTATION/CREATE_SUCCESS', document: newDocument });
    } catch (err) {
      dispatch({ type: 'DOCUMENTATION/FETCH_FAILURE', error: 'Ошибка создания документа' });
      throw err;
    }
  }, []);

  const updateDocument = useCallback(async (id: number, data: DocumentationFormData): Promise<void> => {
    try {
      const updatedDocument = await documentationApi.updateDocumentation(id, { ...data, id });
      dispatch({ type: 'DOCUMENTATION/UPDATE_SUCCESS', document: updatedDocument });
    } catch (err) {
      dispatch({ type: 'DOCUMENTATION/FETCH_FAILURE', error: 'Ошибка обновления документа' });
      throw err;
    }
  }, []);

  const deleteDocument = useCallback(async (id: number): Promise<void> => {
    dispatch({ type: 'DOCUMENTATION/DELETE_START', id });
    
    try {
      // Get document info BEFORE deletion
      const doc = state.documents?.find(d => d?.id === id);
      
      // Delete document
      await documentationApi.deleteDocumentation(id);
      
      // Find and delete associated menu items by URL
      if (doc?.slug) {
        try {
          const allMenuItems = await menuApi.getAllMenuItems();
          const documentMenuItems = allMenuItems.filter(item => 
            item.type === 'documentation' && 
            item.url === `/documentation/${doc.slug}`
          );
          
          for (const menuItem of documentMenuItems) {
            await menuApi.deleteMenuItem(menuItem.id);
          }
        } catch (menuError) {
          console.warn('Menu deletion failed:', menuError);
        }
      }
      
      dispatch({ type: 'DOCUMENTATION/DELETE_SUCCESS', id });
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        dispatch({ type: 'DOCUMENTATION/DELETE_SUCCESS', id });
        return;
      }
      
      dispatch({ type: 'DOCUMENTATION/DELETE_FAILURE', error: 'Ошибка удаления документа' });
      throw err;
    }
  }, [state.documents]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // WebSocket event listeners for real-time updates
  useEffect(() => {
    console.log('Setting up WebSocket listeners for documentation updates');
    
    const handleDocumentationCreated = (data: any) => {
      console.log('✅ Documentation created via WebSocket:', data);
      if (data && data.id) {
        dispatch({ type: 'DOCUMENTATION/CREATE_SUCCESS', document: data });
      }
    };
    
    const handleDocumentationUpdated = (data: any) => {
      console.log('🔄 Documentation updated via WebSocket:', data);
      if (data && data.id) {
        dispatch({ type: 'DOCUMENTATION/UPDATE_SUCCESS', document: data });
      }
    };
    
    const handleDocumentationDeleted = (data: any) => {
      console.log('🗑️ Documentation deleted via WebSocket:', data);
      if (data && data.id) {
        dispatch({ type: 'DOCUMENTATION/DELETE_SUCCESS', id: data.id });
      }
    };
    
    websocketService.subscribe('documentation_created', handleDocumentationCreated);
    websocketService.subscribe('documentation_updated', handleDocumentationUpdated);
    websocketService.subscribe('documentation_deleted', handleDocumentationDeleted);
    
    console.log('WebSocket listeners registered for documentation events');
    
    return () => {
      console.log('Cleaning up WebSocket listeners for documentation events');
      websocketService.unsubscribe('documentation_created', handleDocumentationCreated);
      websocketService.unsubscribe('documentation_updated', handleDocumentationUpdated);
      websocketService.unsubscribe('documentation_deleted', handleDocumentationDeleted);
    };
  }, []);

  return {
    documentation: state.documents,
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    createDocument,
    updateDocument,
    deleteDocument
  };
};
