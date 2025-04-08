// src/components/Modal.tsx

import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <FocusTrap>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100]"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
        <div
          className="bg-mcCreme p-6 rounded-lg max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 text-mcBlack hover:text-mcRed"
            onClick={onClose}
            aria-label="Close Modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </FocusTrap>,
    document.body
  );
};

export default Modal;
