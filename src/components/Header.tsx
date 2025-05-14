import React from 'react';
import { Percent as Soccer, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Soccer size={32} className="mr-2 text-green-400" />
            <h1 className="text-2xl font-bold">FootballPulse</h1>
          </div>
          
          <nav className="flex items-center space-x-6">
            <a href="#news" className="hover:text-green-400 transition-colors duration-200 font-medium">
              Haberler
            </a>
            <a href="#scores" className="hover:text-green-400 transition-colors duration-200 font-medium">
              Puanlar
            </a>
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;