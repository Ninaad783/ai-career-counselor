import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  const getToastStyle = (type) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
          icon: <FaCheckCircle className="text-emerald-400 text-lg flex-shrink-0" />,
          progress: "bg-gradient-to-r from-emerald-500 to-teal-400",
        };
      case "error":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]",
          icon: <FaExclamationCircle className="text-rose-400 text-lg flex-shrink-0" />,
          progress: "bg-gradient-to-r from-rose-500 to-pink-500",
        };
      case "warning":
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
          icon: <FaExclamationTriangle className="text-amber-400 text-lg flex-shrink-0" />,
          progress: "bg-gradient-to-r from-amber-500 to-yellow-400",
        };
      case "info":
      default:
        return {
          bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]",
          icon: <FaInfoCircle className="text-indigo-400 text-lg flex-shrink-0" />,
          progress: "bg-gradient-to-r from-indigo-500 to-purple-400",
        };
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = getToastStyle(t.type);
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden relative ${style.bg}`}
              >
                <div className="flex items-center gap-3">
                  {style.icon}
                  <p className="text-sm font-medium tracking-wide">{t.message}</p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-gray-400 hover:text-white transition-colors duration-150 p-1 flex-shrink-0 cursor-pointer"
                >
                  <FaTimes size={12} />
                </button>
                {/* Animated progress bar indicator */}
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3.5, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-[2px] ${style.progress}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
