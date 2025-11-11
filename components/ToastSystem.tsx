import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(({ title, description, type }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-6 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Forward ref to fix the warning
const ToastItem = React.forwardRef<HTMLDivElement, { toast: Toast; onRemove: (id: string) => void }>(
  ({ toast, onRemove }, ref) => {
    const icons = {
      success: <CheckCircle className="text-green-500" size={20} />,
      error: <AlertCircle className="text-red-500" size={20} />,
      warning: <AlertTriangle className="text-amber-500" size={20} />,
      info: <Info className="text-blue-500" size={20} />,
    };

    const bgColors = {
      success: 'bg-green-50 border-green-100',
      error: 'bg-red-50 border-red-100',
      warning: 'bg-amber-50 border-amber-100',
      info: 'bg-blue-50 border-blue-100',
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md ${bgColors[toast.type]}`}
      >
        <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 mr-2">
          <h4 className="font-semibold text-gray-900 text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="text-gray-600 text-sm mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Close toast"
        >
          <X size={16} />
        </button>
      </motion.div>
    );
  }
);

// Add display name for better debugging
ToastItem.displayName = 'ToastItem';