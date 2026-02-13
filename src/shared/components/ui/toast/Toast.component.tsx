import React, {useEffect, useState} from 'react';
import './Toast.component.scss';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  text: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastProps {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
}

const VARIANT_ICONS: Record<ToastVariant, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const ToastItem: React.FC<{
  message: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({message, onDismiss}) => {
  const [exiting, setExiting] = useState(false);
  const duration = message.durationMs ?? 3500;
  const variant = message.variant ?? 'info';

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 300);
    const removeTimer = setTimeout(() => onDismiss(message.id), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, message.id, onDismiss]);

  return (
    <div
      className={`toast toast--${variant} ${exiting ? 'toast--exit' : ''}`}
      role="status"
      aria-live="polite">
      <span className="toast__icon">{VARIANT_ICONS[variant]}</span>
      <span className="toast__text">{message.text}</span>
      <button
        className="toast__close"
        onClick={() => onDismiss(message.id)}
        aria-label="Schließen">
        ✕
      </button>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({messages, onDismiss}) => {
  if (messages.length === 0) return null;

  return (
    <div className="toast-container">
      {messages.map(msg => (
        <ToastItem key={msg.id} message={msg} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default Toast;
