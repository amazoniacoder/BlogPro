import React from "react";
import { useTranslation } from "react-i18next";
import { UsersControlBar, UsersTable, UsersForm, UsersActions } from "@/ui-system/components/admin/users";
import { useNotifications } from "@/ui-system/components/feedback";

import { useUsersData } from "./hooks/useUsersData";
import DeleteConfirmationModal from "@/components/common/delete-confirmation";
import { ErrorDisplay } from "@/ui-system/components/feedback";


const UsersPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const {
    state,
    dispatch,
    deleteUser,
    updateUserStatus,
    createUser,
    updateUser,
    verifyEmail,
  } = useUsersData();
  const { showToastSuccess, showToastError, showModalError } = useNotifications();

  // Initialize editor based on state
  if (!state.editor.isOpen && state.editor.mode === 'create') {
    // Auto-initialize for new user creation if needed
  }

  const handleDeleteClick = (userId: string) => {
    dispatch({ type: "USERS/SHOW_DELETE_MODAL", userId });
  };

  const handleDeleteConfirm = async () => {
    if (state.userToDelete) {
      try {
        const result = await deleteUser(state.userToDelete);
        if (result.success) {
          showToastSuccess(t('admin:userDeleted', { defaultValue: 'Пользователь успешно удален' }));
          // No need for manual refresh - WebSocket and immediate state update handle this
        } else {
          showModalError(result.error || "Failed to delete user", 'Delete Failed');
        }
      } catch (error) {
        console.error('Delete operation failed:', error);
        if (error instanceof Error && error.message.includes('500')) {
          showModalError('Cannot delete user: Server error (500). User may have associated data.', 'Server Error');
        } else {
          showModalError('Failed to delete user: ' + (error instanceof Error ? error.message : 'Unknown error'), 'Delete Failed');
        }
      }
      dispatch({ type: "USERS/HIDE_DELETE_MODAL" });
    }
  };

  const handleDeleteCancel = () => {
    dispatch({ type: "USERS/HIDE_DELETE_MODAL" });
  };

  const handleAddNewClick = () => {
    dispatch({ type: "EDITOR/OPEN", mode: 'create' });
  };

  const handleEditClick = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      console.log('Editing user data:', user);
      console.log('User firstName:', user.firstName);
      console.log('User lastName:', user.lastName);
      dispatch({ type: "EDITOR/OPEN", user, mode: 'edit' });
    } else {
      showToastError("User not found");
    }
  };

  const handleFormCancel = () => {
    dispatch({ type: "EDITOR/CLOSE" });
  };

  const handleFormSubmit = async (userData: any) => {
    try {
      const apiData = {
        ...userData,
        isBlocked: !userData.isActive
      };
      
      if (state.editor.mode === 'create') {
        await createUser(apiData);
        showToastSuccess(t('admin:userCreated', { defaultValue: 'Пользователь успешно создан' }));
      } else if (state.editor.mode === 'edit' && state.editor.currentUser) {
        await updateUser(state.editor.currentUser.id, apiData);
        showToastSuccess(t('admin:userUpdated', { defaultValue: 'Пользователь успешно обновлен' }));
      }
      
      dispatch({ type: "EDITOR/CLOSE" });
    } catch (error) {
      console.error("Error saving user:", error);
      showModalError(`Failed to ${state.editor.mode === 'create' ? 'create' : 'update'} user`, 'Save Failed');
    }
  };

  const handleBulkDelete = async (userIds: string[]) => {
    try {
      for (const userId of userIds) {
        await deleteUser(userId);
      }
      showToastSuccess(t('admin:usersDeleted', { count: userIds.length, defaultValue: 'Пользователи удалены ({{count}})' }));
      dispatch({ type: 'USERS/CLEAR_SELECTION' });
    } catch (error) {
      showModalError('Failed to delete users', 'Bulk Delete Failed');
    }
  };

  const handleBulkStatusChange = async (userIds: string[], status: 'active' | 'inactive' | 'banned') => {
    try {
      for (const userId of userIds) {
        await updateUserStatus(userId, status);
      }
      showToastSuccess(t('admin:usersStatusUpdated', { count: userIds.length, defaultValue: 'Статус пользователей обновлен ({{count}})' }));
      dispatch({ type: 'USERS/CLEAR_SELECTION' });
    } catch (error) {
      showModalError('Failed to update user status', 'Status Update Failed');
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h1 className="admin-section__title">{t('admin:userManagement', { defaultValue: 'Управление пользователями' })}</h1>
      </div>

      {state.error && (
        <ErrorDisplay
          error={{ message: state.error, code: "USER_ERROR" }}
          onDismiss={() => dispatch({ type: "USERS/CLEAR_ERROR" })}
        />
      )}

      <div className="admin-section__content">
        {state.editor.isOpen ? (
          <UsersForm 
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={state.editor.formData}
            isEditing={state.editor.mode === 'edit'}
            onVerifyEmail={async (userId) => {
              try {
                await verifyEmail(userId);
                showToastSuccess('Email verified successfully');
              } catch (error) {
                showToastError('Failed to verify email');
              }
            }}
          />
        ) : (
          <>
            <UsersControlBar
              filters={state.filters}
              dispatch={dispatch}
              onAddUserClick={handleAddNewClick}
            />

            <UsersActions
              selectedUsers={state.selectedUsers}
              dispatch={dispatch}
              onBulkDelete={handleBulkDelete}
              onBulkStatusChange={handleBulkStatusChange}
            />

            {state.loading ? (
              <div className="admin-section__loading">{t('common:loading')}</div>
            ) : state.error ? (
              <div className="admin-section__error">{state.error}</div>
            ) : (
              <>
                <UsersTable
                  users={state.filteredUsers}
                  sortField={state.sortField}
                  sortDirection={state.sortDirection}
                  selectedUsers={state.selectedUsers}
                  dispatch={dispatch}
                  onDeleteClick={handleDeleteClick}
                  onEditClick={handleEditClick}
                />

                <div className="admin-users__table-controls">
                  <div className="admin-users__entries-info">
                    {t('admin:showingUsers', { count: state.filteredUsers.length, total: state.totalItems, defaultValue: 'Показано {{count}} из {{total}} пользователей' })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {state.deleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={state.deleteModalOpen}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title={t('admin:deleteUser', { defaultValue: 'Удалить пользователя' })}
          message={t('admin:confirmDeleteUser', { defaultValue: 'Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.' })}
        />
      )}
    </div>
  );
};

export default UsersPage;
