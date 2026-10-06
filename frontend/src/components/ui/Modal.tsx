'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl border-2 border-duo-border shadow-2xl max-w-md w-full p-6 relative flex flex-col gap-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          {title ? (
            <h3 className="text-xl font-black text-duo-charcoal">{title}</h3>
          ) : (
            <div />
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-duo-muted hover:text-duo-charcoal p-1 rounded-xl transition"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>
          )}
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
