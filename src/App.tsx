import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import Header from './components/Header';
import NewsSection from './components/NewsSection';
import ScoresSection from './components/ScoresSection';
import Footer from './components/Footer';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleDarkMode} 
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800'} shadow-lg transition-all duration-300`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <NewsSection darkMode={darkMode} />
          </div>
          <div className="lg:col-span-1">
            <ScoresSection darkMode={darkMode} />
          </div>
        </div>
      </main>
      
      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;