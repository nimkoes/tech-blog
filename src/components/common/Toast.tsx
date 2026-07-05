import React from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 1200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--surface-inverse)',
      color: 'var(--text-inverse)',
      padding: '0.7rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontSize: '1rem',
    }}>
      {message}
    </div>
  );
};

export default Toast;
