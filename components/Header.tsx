import React, { useState } from 'react';
import { Page } from '../App';
import { UserIcon, LoginIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser, isSupabaseConfigured } from '../services/supabase';
import AuthModal from './AuthModal';

interface HeaderProps {
  onNavigate: (page: Page) => void;
}

const DemoModeBanner = () => {
  if (isSupabaseConfigured) return null;

  return (
    <div className="bg-yellow-500 text-yellow-900 text-center text-sm py-1 font-semibold">
      Demo Mode: Connect to a Supabase project to save builds online.
    </div>
  )
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
    setIsDropdownOpen(false);
    onNavigate('home');
  };

  const userPhoto = user?.user_metadata?.avatar_url;

  return (
    <>
      <header className="bg-gray-900/70 backdrop-blur-sm sticky top-0 z-50 border-b border-white/10 shadow-lg">
        <DemoModeBanner />
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 
            className="text-3xl font-extrabold text-white cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Mobo</span>Mojo
          </h1>
          <nav className="flex items-center space-x-4 sm:space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition duration-300 font-medium" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition duration-300 font-medium" onClick={(e) => { e.preventDefault(); onNavigate('builder'); }}>Builder</a>
            
            <div className="relative">
              {user ? (
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition duration-300"
                >
                  { userPhoto ? <img src={userPhoto} alt="User" className="w-7 h-7 rounded-full"/> : <UserIcon className="w-7 h-7" /> }
                </button>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-md">
                  <LoginIcon />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}

              {user && isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-2 z-50 border border-gray-700 animate-fade-in-up">
                   <div className="px-4 py-2 border-b border-gray-700">
                     <p className="text-sm text-gray-400">Signed in as</p>
                     <p className="text-sm font-medium text-white truncate">{user.email}</p>
                   </div>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">My Profile</a>
                  <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </>
  );
};

export default Header;