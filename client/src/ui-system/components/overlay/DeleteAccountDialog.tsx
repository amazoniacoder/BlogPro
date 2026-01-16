/**
 * BlogPro Delete Account Dialog Component
 * Specialized dialog for account deletion confirmation
 */

import React, { useEffect } from 'react';
import { Icon } from '../../icons/components';

export interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onClose,
  onConfirm,
  username = 'your account'
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirm-dialog__overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal__header">
          <h3 className="delete-modal__title">Delete Account</h3>
        </div>
        
        <div className="delete-modal__content">
          <div className="delete-dialog__warning">
            <Icon name="warning" size={24} />
          </div>
          
          <p className="delete-dialog__message">
            Are you sure you want to delete {username}? This action cannot be undone.
          </p>
          
          <p className="delete-dialog__details">
            Deleting your account will permanently remove:
          </p>
          
          <ul className="delete-dialog__list">
            <li>All your blog posts and content</li>
            <li>Your profile information</li>
            <li>All comments and interactions</li>
            <li>Account settings and preferences</li>
          </ul>
          
          <div className="delete-dialog__final-warning">
            This action is permanent and cannot be reversed!
          </div>
          
          <div className="delete-modal__actions">
            <button
              className="delete-modal__button delete-modal__button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="delete-modal__button delete-modal__button--danger"
              onClick={handleConfirm}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountDialog;
