/**
 * BlogPro Verification Modal Component
 * Modal for email verification and similar confirmations
 */

import React, { useEffect } from 'react';

export interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onAction?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  open,
  onClose,
  title = 'Verification Required',
  message = 'Please check your email for verification instructions.',
  buttonText = 'OK',
  onAction
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

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  return (
    <div className="confirm-dialog__overlay" onClick={onClose}>
      <div className="verification-modal__content" onClick={(e) => e.stopPropagation()}>
        <h3 className="verification-modal__title">{title}</h3>
        <p className="verification-modal__message">{message}</p>
        
        <button
          className="verification-modal__button"
          onClick={handleAction}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default VerificationModal;
