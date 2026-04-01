import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

export const Toast = ({ id, message, type, duration = 4000, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose(id);
      }, 300); // Duration of fadeOut animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-amber-800',
  }[type];

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-amber-600',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type];

  return (
    <div
      className={`${isExiting ? 'animate-fadeOut' : 'animate-slideUp'} border rounded-lg p-4 shadow-lg flex items-start gap-3 max-w-sm 
        ${bgColor} ${textColor} transition-all duration-300 hover:shadow-xl`}
    >
      <span className={`text-xl font-bold flex-shrink-0 ${iconColor}`}>
        {icon}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 hover:scale-110 active:scale-95 
          transition-transform duration-200 flex-shrink-0"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
};
