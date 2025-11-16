import React, { useEffect, useState } from 'react';
import { useToast, ToastMessage } from '../contexts/ToastContext';
import { CheckCircleIcon, CloseIcon, InfoIcon, WarningIcon } from './icons';

const toastIcons: Record<ToastMessage['type'], React.ReactNode> = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-300" />,
  error: <WarningIcon className="w-6 h-6 text-red-300" />,
  info: <InfoIcon className="w-6 h-6 text-blue-300" />,
};

const toastGradients: Record<ToastMessage['type'], string> = {
    success: 'from-green-500/80 to-emerald-500/80',
    error: 'from-red-500/80 to-rose-500/80',
    info: 'from-blue-500/80 to-cyan-500/80',
};

const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => handleClose(), 5000);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
    };

    return (
        <div
            className={`
                w-full max-w-sm rounded-xl shadow-lg flex items-start space-x-3 overflow-hidden
                transition-all duration-300 ease-in-out bg-gray-800 backdrop-blur-sm
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            role="alert"
        >
          <div className={`p-4 bg-gradient-to-br ${toastGradients[toast.type]} flex items-center justify-center`}>
            {toastIcons[toast.type]}
          </div>
          <div className="flex-grow p-3 pr-2">
            <p className="text-sm text-gray-100 font-medium">{toast.message}</p>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors p-3">
              <CloseIcon className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
            <div className={`h-1 bg-gradient-to-r ${toastGradients[toast.type]} animate-toast-progress`}></div>
            <style>{`
              @keyframes toast-progress {
                from { width: 100%; }
                to { width: 0%; }
              }
              .animate-toast-progress {
                animation: toast-progress 5s linear forwards;
              }
            `}</style>
          </div>
        </div>
    );
};


const Toasts: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-5 right-5 z-[200] space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default Toasts;
