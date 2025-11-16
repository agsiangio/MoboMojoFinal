import React, { useState } from 'react';
import { CloseIcon } from './icons';
import { signUpWithEmail, signInWithEmail } from '../services/supabase';

interface AuthModalProps {
  onClose: () => void;
}

type AuthMode = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md flex flex-col border border-blue-500/20 shadow-lg relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><CloseIcon /></button>
        
        <div className="p-6 border-b border-gray-700">
            <div className="flex">
                <button 
                    onClick={() => { setMode('login'); setError(''); }} 
                    className={`flex-1 pb-2 text-center font-semibold transition-colors ${mode === 'login' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Login
                </button>
                <button 
                    onClick={() => { setMode('signup'); setError(''); }} 
                    className={`flex-1 pb-2 text-center font-semibold transition-colors ${mode === 'signup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Sign Up
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">{mode === 'login' ? 'Welcome Back!' : 'Create an Account'}</h2>
          
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {error && <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-lg">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed flex justify-center items-center shadow-lg glow-on-hover"
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (mode === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;