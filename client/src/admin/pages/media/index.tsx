// client/src/admin/pages/media/index.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useMediaData } from "./hooks/useMediaData";
import MediaGrid from "./components/MediaGrid";
import MediaUploader from "./components/MediaUploader";
import MediaViewer from "./components/MediaViewer";
import { MediaControlBar, MediaTable, BulkActions } from "@/ui-system/components/admin/media";
import DeleteConfirmation from "@/components/common/delete-confirmation";
import { Pagination } from "@/ui-system/components/pagination";
import { ErrorDisplay } from "@/ui-system/components/feedback";
import { useWebSocket } from "../../../contexts/websocket-context";

const MediaPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { state, dispatch, deleteMedia, updateMedia, uploadMedia, fetchMedia } = useMediaData();
  const { lastMessage } = useWebSocket();
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');

  // Handle WebSocket media updates with enhanced logging and editor support
  React.useEffect(() => {
    if (lastMessage?.type === 'MEDIA_UPDATE') {
      console.log('MediaPage: WebSocket message received:', lastMessage);
      const { action, item } = lastMessage.data;
      
      if (action === 'uploaded') {
        console.log('MediaPage: Processing upload for item:', item);
        
        // Refresh media list to show new upload (ensures all components sync)
        fetchMedia();
        
        // Log for debugging editor uploads specifically
        if (item.source === 'editor') {
          console.log('MediaPage: Editor upload detected, refreshing media list');
        }
      } else if (action === 'deleted') {
        console.log('MediaPage: Processing deletion for item:', item);
        // Remove item from state using string ID to handle type mismatches
        dispatch({ type: 'DELETE_MEDIA_SUCCESS', itemId: String(item.id) });
      }
    }
  }, [lastMessage, fetchMedia, dispatch]);

  // Calculate pagination
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  const currentItems = state.filteredItems.slice(startIndex, endIndex);



  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">{t('admin:mediaLibrary', { defaultValue: 'Медиатека' })}</h2>
      </div>

      {state.error && (
        <ErrorDisplay 
          error={{ message: state.error, code: "MEDIA_ERROR" }} 
          onDismiss={() => dispatch({ type: "CLEAR_ERROR" })} 
        />
      )}

      <MediaControlBar
        activeTab={state.filters.category || 'images'}
        onTabChange={(category) => dispatch({ type: 'SET_FILTER', field: 'category', value: category })}
        searchValue={state.filters.search}
        onSearchChange={(value) => dispatch({ type: 'SET_FILTER', field: 'search', value })}
        itemsPerPage={state.itemsPerPage}
        onItemsPerPageChange={(count) => dispatch({ type: "SET_ITEMS_PER_PAGE", count })}
        onUploadClick={() => dispatch({ type: "SHOW_UPLOAD_MODAL" })}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="admin-table-container">

        <BulkActions
          selectedCount={state.selectedItems.length}
          totalCount={state.filteredItems.length}
          onSelectAll={() => dispatch({ type: 'SELECT_ALL_ITEMS', selected: true })}
          onDeselectAll={() => dispatch({ type: 'SELECT_ALL_ITEMS', selected: false })}
          onBulkDelete={() => {
            // Handle bulk delete - you'll need to implement this action
            console.log('Bulk delete:', state.selectedItems);
          }}
        />

        {viewMode === 'grid' ? (
          <MediaGrid
            items={currentItems}
            selectedItems={state.selectedItems}
            dispatch={dispatch}
          />
        ) : (
          <MediaTable
            items={currentItems}
            selectedItems={state.selectedItems}
            dispatch={dispatch}
          />
        )}
      </div>

      <Pagination
        currentPage={state.currentPage}
        totalPages={Math.ceil(state.totalItems / state.itemsPerPage)}
        onPageChange={(page) => dispatch({ type: "SET_PAGE", page })}
      />

      {state.uploadModalOpen && (
        <MediaUploader
          uploading={state.uploading}
          progress={state.uploadProgress}
          onUpload={uploadMedia}
          onClose={() => dispatch({ type: "HIDE_UPLOAD_MODAL" })}
        />
      )}

      {state.viewModalOpen && state.currentItem && (
        <MediaViewer
          item={state.currentItem}
          onSave={updateMedia}
          onDelete={(itemId) => {
            deleteMedia(itemId);
            dispatch({ type: "HIDE_VIEW_MODAL" });
          }}
          onClose={() => dispatch({ type: "HIDE_VIEW_MODAL" })}
        />
      )}

      {state.deleteModalOpen && (
        <DeleteConfirmation
          isOpen={state.deleteModalOpen}
          onConfirm={() => {
            if (state.itemToDelete) {
              deleteMedia(state.itemToDelete);
            }
            dispatch({ type: "HIDE_DELETE_MODAL" });
          }}
          onCancel={() => dispatch({ type: "HIDE_DELETE_MODAL" })}
        />
      )}
    </div>
  );
};

export default MediaPage;
