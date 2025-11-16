import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Toasts from './components/Toasts';
import { Build, SavedBuild } from './types';
import { components as allComponents } from './data/mockData';

export type Page = 'home' | 'builder' | 'profile';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentBuild, setCurrentBuild] = useState<Build>({});

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  }

  const handleStartNewBuild = () => {
    setCurrentBuild({});
    setCurrentPage('builder');
  };

  const handleLoadBuild = (savedBuild: SavedBuild) => {
    const loadedBuild: Build = {};
    for (const [type, componentId] of Object.entries(savedBuild.components)) {
      const component = allComponents.find(c => c.id === componentId);
      if (component) {
        loadedBuild[type as keyof Build] = component;
      }
    }
    setCurrentBuild(loadedBuild);
    setCurrentPage('builder');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onBuildNow={handleStartNewBuild} />;
      case 'builder':
        return <BuilderPage build={currentBuild} onBuildChange={setCurrentBuild} />;
      case 'profile':
        return <ProfilePage onLoadBuild={handleLoadBuild} />;
      default:
        return <HomePage onBuildNow={handleStartNewBuild} />;
    }
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-background-start text-white font-sans">
          <Header onNavigate={handleNavigate} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {renderPage()}
          </main>
          <Footer />
          <Toasts />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
