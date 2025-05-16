import React, { useState, useRef, useEffect } from 'react';
import { Flame, Sun, Moon, Menu, X, Search, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { searchArticles } from '../services/searchService';
import { Article } from '../types/Article';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!location.pathname.includes('/search')) {
      setSearchQuery('');
      setSuggestions([]);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        const results = await searchArticles(searchQuery);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

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
            
            {/* Desktop Search Bar */}
            <div ref={searchRef} className="relative group">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                  }}
                  placeholder="Haberlerde ara..."
                  className={`
                    py-2 pl-4 pr-10 rounded-full
                    bg-primary-light/10 border border-primary-light/20
                    text-white placeholder-accent-light/70
                    focus:outline-none focus:ring-2 focus:ring-accent-light/50
                    transition-all duration-300
                    ${isSearchFocused ? 'w-[400px]' : 'w-[300px]'}
                  `}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-light hover:text-white transition-colors duration-200"
                >
                  <Search size={18} />
                </button>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {suggestions.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.id}`}
                      className="block hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="p-3 flex items-start space-x-3">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-1 mt-1">
                            {article.summary}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
          ${isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}
        `}>
          <nav className="flex flex-col space-y-4 py-4 border-t border-primary-light/10">
            {/* Mobile Search Bar */}
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Haberlerde ara..."
                  className="w-full py-2 pl-4 pr-10 rounded-full
                           bg-primary-light/10 border border-primary-light/20
                           text-white placeholder-accent-light/70
                           focus:outline-none focus:ring-2 focus:ring-accent-light/50"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-light"
                >
                  <Search size={18} />
                </button>
              </form>

              {/* Mobile Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-50">
                  {suggestions.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.id}`}
                      className="block hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery('');
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="p-3 flex items-start space-x-3">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-1 mt-1">
                            {article.summary}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link 
              to="/#news" 
              className="text-accent-light hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Haberler
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