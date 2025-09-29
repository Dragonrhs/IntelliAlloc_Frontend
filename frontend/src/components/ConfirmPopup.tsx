import React from 'react';
import './ConfirmPopup.css';

interface ConfirmPopupProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-popup-overlay">
      <div className={`confirm-popup ${type}`}>
        <div className="confirm-popup-header">
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-popup-content">
          <p>{message}</p>
        </div>
        
        <div className="confirm-popup-actions">
          <button 
            className="confirm-popup-button cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-popup-button confirm ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;




