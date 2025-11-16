import React, { useState } from 'react';
import { AiSuggestion, generateSuggestions } from '../services/geminiService';
import { Build } from '../types';
import { CloseIcon, AiIcon } from './icons';

interface AiAssistantProps {
  build: Build;
  totalPrice: number;
  onClose: () => void;
  onApplySuggestions: (suggestions: AiSuggestion[]) => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ build, totalPrice, onClose, onApplySuggestions }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [error, setError] = useState('');
  const [budget, setBudget] = useState('');
  const [hasFetched, setHasFetched] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError('');
    setHasFetched(true);
    try {
      const budgetNumber = budget ? parseInt(budget, 10) : undefined;
      const result = await generateSuggestions(build, totalPrice, budgetNumber);
      setExplanation(result.explanation);
      setSuggestions(result.suggestions || []);
    } catch (err) {
      setError('Failed to get suggestions from the AI assistant. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApplySuggestions(suggestions);
    onClose();
  };

  const isBuildEmpty = Object.keys(build).length === 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-purple-500/20 shadow-2xl animate-fade-in-up">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <AiIcon className="w-7 h-7 text-purple-400" />
            <h2 className="text-2xl font-bold">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </div>
        
        <div className="p-6 flex-shrink-0 bg-gray-900/30 border-b border-gray-700">
            <p className="text-gray-400 mb-2 text-sm">You can provide a budget to generate a full build, or get suggestions to complete a partial build.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₱</span>
                    <input
                        type="number"
                        placeholder="Optional: Enter your total budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-gray-700 p-3 pl-7 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                </div>
                <button 
                    onClick={fetchSuggestions}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-wait glow-on-hover"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            <span>Thinking...</span>
                        </>
                    ) : 'Get Suggestions'}
                </button>
            </div>
        </div>

        <div className="overflow-y-auto p-6 pt-4 space-y-4 flex-grow">
            {!hasFetched && !isLoading && (
                <div className="text-center text-gray-500 pt-8">
                    <AiIcon className="w-16 h-16 mx-auto text-gray-600" />
                    <p className="mt-4">
                        {isBuildEmpty ? 'Enter a budget and I can create a full build for you!' : 'Click "Get Suggestions" and I will analyze your current build.'}
                    </p>
                </div>
            )}
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                <p className="mt-4 text-gray-400">Analyzing your request...</p>
                </div>
            )}
            {hasFetched && !isLoading && (
                error ? (
                    <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>
                ) : (
                    <div 
                    className="prose prose-invert prose-p:text-gray-300 prose-h3:text-purple-400"
                    dangerouslySetInnerHTML={{ __html: explanation }}
                    />
                )
            )}
        </div>
         <div className="p-4 bg-gray-900/30 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
            <p className="text-xs text-gray-500">
                AI suggestions are for guidance only.
            </p>
            {suggestions.length > 0 && !isLoading && !error && (
                 <button 
                    onClick={handleApply}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 glow-on-hover"
                >
                    Apply Suggestions
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
