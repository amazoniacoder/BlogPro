// client/src/admin/pages/blog/index.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useBlogData } from "./hooks/useBlogData";
import BlogTable from "./components/BlogTable";
import BlogFilters from "./components/BlogFilters";
import BlogEditor from "./components/BlogEditor";
import DeleteConfirmation from "@/components/common/delete-confirmation";
import { Pagination } from "@/ui-system/components/pagination";
import { ErrorDisplay } from "@/ui-system/components/feedback";
import { useToast } from "@/ui-system/components/feedback";

import { AdminRoutes } from "../../utils/routePatterns";

const BlogPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const {
    state,
    dispatch,
    deleteBlogPost,
    fetchBlogPosts,
    changePage,
    changeItemsPerPage,
  } = useBlogData();
  const { showSuccess, showError } = useToast();
  const [, navigate] = useLocation();
  const [showEditPage, setShowEditPage] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>(
    undefined
  );



  // Use filtered posts directly from state
  const currentPosts = state.filteredPosts;

  const handleCreatePost = () => {
    setEditingPostId(undefined);
    setShowEditPage(true);
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setShowEditPage(true);
  };

  const handleSaveComplete = async () => {
    // Go back to first page to see new posts
    dispatch({ type: "BLOG/SET_PAGE", page: 1 });
    setShowEditPage(false);
    setEditingPostId(undefined);
  };

  const handleCancel = () => {
    setShowEditPage(false);
    setEditingPostId(undefined);
  };

  const handlePageChange = (page: number) => {
    changePage(page);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    changeItemsPerPage(newItemsPerPage);
  };



  if (showEditPage) {
    return (
      <BlogEditor
        postId={editingPostId}
        onSave={handleSaveComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="admin-section">
      {state.error && (
        <ErrorDisplay
          error={{ message: state.error, code: "BLOG_ERROR" }}
          onDismiss={() => dispatch({ type: "BLOG/CLEAR_ERROR" })}
        />
      )}

      <div className="admin-section__header">
        <h2 className="admin-section__title">{t('admin:blogPosts')}</h2>
      </div>

      <BlogFilters 
        filters={state.filters} 
        dispatch={dispatch}
        onCreatePost={handleCreatePost}
        onManageCategories={() => navigate(AdminRoutes.CATEGORIES)}
      />

      <div className="admin-table-controls">
        <div className="admin-table-controls__per-page">
          <label htmlFor="itemsPerPage">{t('admin:show', { defaultValue: 'Показать' })}:</label>
          <select
            id="itemsPerPage"
            value={state.itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="admin-form__select-table"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="admin-table-controls__info">
          {t('admin:showingEntries', {
            start: currentPosts.length > 0 ? (state.currentPage - 1) * state.itemsPerPage + 1 : 0,
            end: Math.min(state.currentPage * state.itemsPerPage, state.totalItems),
            total: state.totalItems,
            defaultValue: 'Показано с {{start}} по {{end}} из {{total}} записей'
          })}
        </div>
      </div>

      <BlogTable
        posts={currentPosts}
        sortField={state.sortField}
        sortDirection={state.sortDirection}
        dispatch={dispatch}
        onEditPost={handleEditPost}
      />

      <Pagination
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        onPageChange={handlePageChange}
      />

      {state.deleteModalOpen && (
        <DeleteConfirmation
          isOpen={state.deleteModalOpen}
          onConfirm={async () => {
            if (state.postToDelete) {
              try {
                // Delete from the server first
                await deleteBlogPost(state.postToDelete);
                
                // Show success message
                showSuccess("Blog post deleted successfully");
                
                // Immediately refresh the entire list to get fresh data
                await fetchBlogPosts(state.currentPage, state.itemsPerPage);
              } catch (error) {
                // Only show error if it's not a 404 (which we handle as success)
                if (
                  !(error instanceof Error && error.message.includes("404"))
                ) {
                  showError(
                    `Failed to delete blog post: ${
                      error instanceof Error ? error.message : "Unknown error"
                    }`
                  );
                } else {
                  // Even for 404, refresh the list
                  showSuccess("Blog post deleted successfully");
                  await fetchBlogPosts(state.currentPage, state.itemsPerPage);
                }
              }
            }
            dispatch({ type: "BLOG/HIDE_DELETE_MODAL" });
          }}
          onCancel={() => dispatch({ type: "BLOG/HIDE_DELETE_MODAL" })}
        />
      )}
    </div>
  );
};

export default BlogPage;
