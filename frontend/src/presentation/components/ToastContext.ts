import { createContext, useContext } from 'react';

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
