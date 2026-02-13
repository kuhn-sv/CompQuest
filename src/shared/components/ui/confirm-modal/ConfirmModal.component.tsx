import React, {useEffect, useRef} from 'react';
import './ConfirmModal.component.scss';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<Props> = ({
  title,
  message,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      className="confirm-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={handleOverlayClick}>
      <div className="confirm-modal__card">
        <h3 id="confirm-modal-title" className="confirm-modal__title">
          {title}
        </h3>
        <p className="confirm-modal__message">{message}</p>
        <div className="confirm-modal__actions">
          <button
            ref={cancelRef}
            className="confirm-modal__btn confirm-modal__btn--cancel"
            onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className="confirm-modal__btn confirm-modal__btn--confirm"
            onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
