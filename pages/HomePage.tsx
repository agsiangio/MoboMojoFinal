import React from 'react';

interface HomePageProps {
  onBuildNow: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onBuildNow }) => {
  return (
    <div className="text-center">
      <div 
        className="relative py-20 md:py-40 rounded-xl overflow-hidden bg-cover bg-center border border-white/10"
        style={{ backgroundImage: "url('https://picsum.photos/seed/pcbuildbg/1200/600')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/70 to-black/60"></div>
        <div className="relative z-10 px-4">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Build Your Dream PC with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Confidence</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            MoboMojo helps you select compatible parts, check real-time prices, and create the perfect build. No more guesswork.
          </p>
          <button 
            onClick={onBuildNow}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20 animate-fade-in-up glow-on-hover"
            style={{ animationDelay: '0.6s' }}
          >
            Start Building Now
          </button>
        </div>
      </div>

      <div className="mt-20">
        <h3 className="text-3xl font-bold mb-12">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10 transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-2">
            <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-3">1. Select a Component</h4>
            <p className="text-gray-400">Start with any part you like - CPU, GPU, or motherboard. Our system will guide you from there.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10 transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-2">
            <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-3">2. Get Smart Suggestions</h4>
            <p className="text-gray-400">We automatically filter parts to show you only what's compatible with your current selection.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10 transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-2">
            <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-3">3. Finalize & Save</h4>
            <p className="text-gray-400">See the total price, check for issues, and save your build to your profile for future reference.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
