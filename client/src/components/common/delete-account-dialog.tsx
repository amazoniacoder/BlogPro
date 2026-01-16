
import { Button } from "@/ui-system/components/button";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteAccountDialog({ isOpen, onClose, onConfirm, loading }: DeleteAccountDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal__header">
          <h2 className="delete-modal__title">Delete Account</h2>
        </div>
        
        <div className="delete-modal__content">
          <div className="delete-dialog__warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          
          <p className="delete-dialog__message">
            Your account will be <strong>permanently deleted in 1 minute</strong>.
          </p>
          
          <p className="delete-dialog__details">
            This action will delete all your data including:
          </p>
          
          <ul className="delete-dialog__list">
            <li>Profile information</li>
            <li>Account settings</li>
            <li>All associated content</li>
          </ul>
          
          <p className="delete-dialog__final-warning">
            <strong>This action cannot be undone.</strong>
          </p>
          
          <div className="delete-modal__actions">
            <Button 
              onClick={onClose}
              className="delete-modal__button delete-modal__button--secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="delete-modal__button delete-modal__button--danger"
              disabled={loading}
            >
              {loading ? "..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
