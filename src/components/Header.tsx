import React, { useState } from 'react';
import { Flame, Sun, Moon, Menu, X, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={`sticky top-0 ${darkMode ? 'bg-primary-dark' : 'bg-primary'} text-white shadow-lg z-40`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Flame 
                size={28} 
                className="text-accent-light transform group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse-fast" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">FootballPulse</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/#news" 
              className="text-accent-light hover:text-white transition-colors duration-200"
            >
              Haberler
            </Link>
            <Link 
              to="/#scores" 
              className="text-accent-light hover:text-white transition-colors duration-200"
            >
              Skorlar
            </Link>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3 border-l border-primary-light/20 pl-6">
              <button 
                className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200 group"
                aria-label="Facebook"
              >
                <Facebook size={18} className="text-accent-light group-hover:text-white transition-colors duration-200" />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200 group"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-accent-light group-hover:text-white transition-colors duration-200" />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200 group"
                aria-label="Telegram"
              >
                <MessageSquare size={18} className="text-accent-light group-hover:text-white transition-colors duration-200" />
              </button>
            </div>

            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200 active:scale-95"
              aria-label={darkMode ? "Açık temaya geç" : "Koyu temaya geç"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200"
              aria-label={darkMode ? "Açık temaya geç" : "Koyu temaya geç"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          md:hidden 
          transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}
        `}>
          <nav className="flex flex-col space-y-4 py-4 border-t border-primary-light/10">
            <Link 
              to="/#news" 
              className="text-accent-light hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Haberler
            </Link>
            <Link 
              to="/#scores" 
              className="text-accent-light hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Skorlar
            </Link>
            
            {/* Mobile Social Media Icons */}
            <div className="flex items-center space-x-4 pt-2">
              <button 
                className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200 group"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-accent-light group-hover:text-white transition-colors duration-200" />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200 group"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-accent-light group-hover:text-white transition-colors duration-200" />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-primary-light/10 transition-all duration-200 group"
                aria-label="Telegram"
              >
                <MessageSquare size={20} className="text-accent-light group-hover:text-white transition-colors duration-200" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;