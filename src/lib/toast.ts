import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  open: boolean;
  type: ToastType;
  title: string;
  description?: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    type: 'info',
    title: '',
    description: '',
  });

  const showToast = useCallback((type: ToastType, title: string, description?: string) => {
    setToast({
      open: true,
      type,
      title,
      description,
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast.open) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.open, dismissToast]);

  return {
    toast,
    showToast,
    dismissToast,
  };
}