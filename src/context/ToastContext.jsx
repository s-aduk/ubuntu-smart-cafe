'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(undefined);

let idCounter = 0;

/**
 * Wraps the app once, in the root layout, so any component can call
 * useToast().showToast(...) — used in particular to surface the
 * "AWS backend offline" notice from src/utils/api.js without blocking
 * the rest of the UI.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, { variant = 'info', duration = 5000 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      timers.current[id] = setTimeout(() => dismissToast(id), duration);
      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 inset-x-0 z-[100] flex flex-col items-center gap-3 px-4 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto w-full max-w-sm rounded-xl border px-5 py-4 shadow-glass backdrop-blur-xl font-body text-sm animate-toast-in ${
              toast.variant === 'warning'
                ? 'bg-charcoal/95 dark:bg-charcoal/95 border-gold/30 text-ivory'
                : 'bg-charcoal/95 dark:bg-charcoal/95 border-emerald-light/30 text-ivory'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  toast.variant === 'warning' ? 'bg-gold' : 'bg-emerald-light'
                }`}
                aria-hidden="true"
              />
              <p className="flex-1 leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-ivory/40 hover:text-ivory transition-colors duration-200"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return ctx;
}
