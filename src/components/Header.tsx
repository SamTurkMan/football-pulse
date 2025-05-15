import React from 'react';
import { Flame, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className={`sticky top-0 ${darkMode ? 'bg-primary-dark' : 'bg-primary'} text-white shadow-lg z-40`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Flame 
                size={32} 
                className="text-accent-light transform group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-fast" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FootballPulse</h1>
          </Link>
          
          <nav className="flex items-center space-x-8">
            <Link 
              to="/#news" 
              className="text-accent-light hover:text-white transition-colors duration-200"
            >
              News
            </Link>
            <Link 
              to="/#scores" 
              className="text-accent-light hover:text-white transition-colors duration-200"
            >
              Scores
            </Link>
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200 active:scale-95"
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