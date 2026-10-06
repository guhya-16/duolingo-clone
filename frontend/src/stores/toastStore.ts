import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'streak' | 'achievement';
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (message, type = 'success', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().showToast(msg, 'success'),
  info: (msg: string) => useToastStore.getState().showToast(msg, 'info'),
  streak: (msg: string) => useToastStore.getState().showToast(msg, 'streak'),
  achievement: (msg: string) => useToastStore.getState().showToast(msg, 'achievement'),
};
