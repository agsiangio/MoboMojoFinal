import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/50 border-t border-t-blue-500/20 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} MoboMojo. All rights reserved.</p>
        <p className="text-sm mt-2">Your ultimate PC building companion. Prices based on pcx.com.ph listings.</p>
      </div>
    </footer>
  );
};

export default Footer;
