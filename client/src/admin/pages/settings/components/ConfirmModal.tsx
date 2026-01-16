

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmButtonClass?: string;
}

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Delete",
  confirmButtonClass = "admin-button--danger"
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal__header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-modal__body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal__actions">
          <button 
            className={`admin-button ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            className="admin-button admin-button--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
