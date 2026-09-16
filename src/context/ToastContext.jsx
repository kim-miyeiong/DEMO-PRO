import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} message={toast.message} type={toast.type} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ message, type }) {
  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-800';
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={`pointer-events-auto ${bgColor} text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[280px]`}
    >
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
