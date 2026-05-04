// Toast.jsx — shared toast notification system
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/* ── Icons ── */
const Icons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const STYLES = {
  success: { bar: '#22c55e', icon: 'text-green-500',  bg: 'bg-white', border: 'border-green-100' },
  error:   { bar: '#ef4444', icon: 'text-red-500',    bg: 'bg-white', border: 'border-red-100'   },
  info:    { bar: '#1d4ed8', icon: 'text-blue-600',   bg: 'bg-white', border: 'border-blue-100'  },
  warning: { bar: '#f59e0b', icon: 'text-yellow-500', bg: 'bg-white', border: 'border-yellow-100'},
};

/* ── Single Toast ── */
function Toast({ id, type = 'info', title, message, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const s = STYLES[type] || STYLES.info;

  useEffect(() => {
    // mount → slide in
    const t1 = setTimeout(() => setVisible(true), 10);
    // auto-dismiss after 4s
    const t2 = setTimeout(() => dismiss(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 320);
  }, [id, onRemove]);

  return (
    <>
      <style>{`
        @keyframes toastIn  { from{opacity:0;transform:translateX(110%)} to{opacity:1;transform:translateX(0)} }
        @keyframes toastOut { from{opacity:1;transform:translateX(0)}    to{opacity:0;transform:translateX(110%)} }
        @keyframes toastBar { from{width:100%} to{width:0%} }
      `}</style>
      <div
        style={{
          animation: leaving
            ? 'toastOut .32s cubic-bezier(.4,0,.2,1) both'
            : visible
            ? 'toastIn .35s cubic-bezier(.4,0,.2,1) both'
            : 'none',
          opacity: visible ? 1 : 0,
        }}
        className={`relative flex items-start gap-3 w-full max-w-[340px] sm:max-w-[360px]
          ${s.bg} border ${s.border} rounded-2xl px-4 py-3.5
          shadow-xl shadow-black/10 overflow-hidden cursor-pointer select-none`}
        onClick={dismiss}
        role="alert"
      >
        {/* Left color bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: s.bar }} />

        {/* Progress bar (auto-dismiss timer) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl opacity-25"
          style={{ background: s.bar, animation: 'toastBar 4.2s linear both' }}
        />

        {/* Icon */}
        <div className={`shrink-0 mt-0.5 ${s.icon}`}>{Icons[type]}</div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{title}</p>
          )}
          {message && (
            <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </>
  );
}

/* ── Toast Container ── */
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[999999] flex flex-col gap-2.5 items-end pointer-events-none"
      style={{ maxWidth: 'calc(100vw - 32px)' }}>
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full">
          <Toast {...t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

/* ── useToast hook ── */
let _id = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error:   (title, message) => addToast({ type: 'error',   title, message }),
    info:    (title, message) => addToast({ type: 'info',    title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  };

  return { toasts, removeToast, toast };
}