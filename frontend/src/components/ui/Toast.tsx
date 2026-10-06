'use client';
import React, { useEffect } from 'react';
import { useToastStore, ToastItem } from '@/stores/toastStore';

export interface ToastProps {
  toast: ToastItem;
}

const typeStyles: Record<string, string> = {
  success: 'bg-duo-green text-white shadow-[0_4px_0_#46A302]',
  info: 'bg-duo-blue text-white shadow-[0_4px_0_#1899D6]',
  streak: 'bg-duo-gold text-yellow-950 shadow-[0_4px_0_#E5A500]',
  achievement: 'bg-purple-600 text-white shadow-[0_4px_0_#7E22CE]',
};

export const SingleToast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToastStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, removeToast]);

  return (
    <div
      className={`px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center gap-3 animate-fade-in transition-all duration-300 ${
        typeStyles[toast.type || 'info']
      }`}
    >
      <span>{toast.message}</span>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <SingleToast key={t.id} toast={t} />
      ))}
    </div>
  );
};

export default ToastContainer;
