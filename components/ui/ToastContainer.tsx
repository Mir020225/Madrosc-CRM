import React, { useEffect } from 'react';
import { ToastMessage } from '../../types';

interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const ICONS = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const COLORS = { 
    success: 'bg-green-500 border-green-600', 
    error: 'bg-red-500 border-red-600', 
    info: 'bg-blue-500 border-blue-600'
  };

  return (
    <div
        className={`${COLORS[toast.type]} text-white p-4 rounded-lg shadow-lg mb-2 flex items-center animate-slide-in-right border-b-4`}
    >
        <i className={`fas ${ICONS[toast.type]} mr-3 text-xl`}></i>
        <span className="flex-grow">{toast.message}</span>
        <button onClick={() => onRemove(toast.id)} className="ml-4 text-lg font-semibold opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-5 right-5 z-[100] w-full max-w-xs">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
