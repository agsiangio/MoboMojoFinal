import React from 'react';
import { CloseIcon, QuestionMarkIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md flex flex-col border border-gray-700 shadow-lg relative animate-fade-in-up">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center border-2 border-yellow-500/30 mb-4">
            <QuestionMarkIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-400 mt-2">{message}</p>
        </div>
        <div className="p-4 bg-gray-900/50 flex justify-end space-x-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
