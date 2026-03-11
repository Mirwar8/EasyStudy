import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

export default function Toaster() {
  const toasts = useAppStore(state => state.toasts);
  const removeToast = useAppStore(state => state.removeToast);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-[320px] px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`
              pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-md border font-display
              ${toast.type === 'error' 
                ? 'bg-rose-500/90 border-rose-400 text-white' 
                : toast.type === 'success'
                  ? 'bg-emerald-500/90 border-emerald-400 text-white'
                  : 'bg-slate-900/90 border-slate-700 text-white'
              }
            `}
            onClick={() => removeToast(toast.id)}
          >
            <span className="material-symbols-outlined text-xl">
              {toast.type === 'error' ? 'error' : toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <p className="text-sm font-bold flex-1 leading-tight">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
