import React from 'react';
import { Component } from '../types';
import { CloseIcon } from './icons';

interface ComponentDetailsModalProps {
  component: Component | null;
  onClose: () => void;
}

const formatSpecKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

const ComponentDetailsModal: React.FC<ComponentDetailsModalProps> = ({ component, onClose }) => {
  if (!component) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-blue-500/20 shadow-lg animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-400">{component.type} Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
            <div className='flex flex-col sm:flex-row gap-6'>
                <img src={component.imageUrl} alt={component.name} className="w-full sm:w-48 h-48 object-cover rounded-lg border border-gray-700" />
                <div className='flex-grow'>
                    <h3 className="text-2xl font-bold">{component.name}</h3>
                    <p className="text-blue-400 font-bold text-3xl mt-2">₱{component.price.toLocaleString()}</p>
                </div>
            </div>
            
            {Object.keys(component.specs).length > 0 && (
                <div>
                    <h4 className="text-xl font-semibold mt-6 mb-3 border-b border-gray-600 pb-2">Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {Object.entries(component.specs).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b border-gray-700/50 py-2">
                                <span className="text-gray-400">{formatSpecKey(key)}:</span>
                                <span className="font-semibold text-right">{Array.isArray(value) ? value.join(', ') : value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailsModal;
