import React, { forwardRef } from 'react';

interface IModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
  showCloseButton?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, IModalProps>(
  ({ title, children, onClose, isOpen, showCloseButton = true }, ref) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div
          ref={ref}
          className="relative w-11/12 max-w-lg z-[101] bg-base-200 border border-white/10 rounded-2xl p-6 shadow-2xl"
          role="dialog"
          aria-labelledby="modal-title"
        >
          <div className="font-bold text-center mb-6 text-2xl" id="modal-title">
            {title}
            <button
              className="btn btn-sm btn-circle absolute right-4 top-4 bg-white/10 hover:bg-white/20 border-none"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="py-2">{children}</div>
          {showCloseButton && (
            <div className="modal-action mt-6">
              <button
                className="btn bg-white/10 hover:bg-white/20 border-white/20"
                onClick={onClose}
                aria-label="Close modal"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
