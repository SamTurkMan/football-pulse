import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NewsSection from './components/NewsSection';
import ScoresSection from './components/ScoresSection';
import Footer from './components/Footer';
import ArticlePage from './components/ArticlePage';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <ScoresSection darkMode={darkMode} />

        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="w-full">
                <NewsSection darkMode={darkMode} />
              </div>
            } />
            <Route path="/article/:id" element={<ArticlePage darkMode={darkMode} />} />
          </Routes>
        </main>
        
        <Footer darkMode={darkMode} />
      </div>
    </BrowserRouter>
  );
}

export default App