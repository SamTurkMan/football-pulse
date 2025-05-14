import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NewsSection from './components/NewsSection';
import ScoresSection from './components/ScoresSection';
import Footer from './components/Footer';
import ArticlePage from './components/ArticlePage';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <NewsSection darkMode={darkMode} />
                </div>
                <div className="lg:col-span-1">
                  <ScoresSection darkMode={darkMode} />
                </div>
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

export default App;