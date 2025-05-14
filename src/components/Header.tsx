import React from 'react';
import { Percent as Soccer } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Soccer size={32} className="mr-2 text-green-400" />
            <h1 className="text-2xl font-bold">FutbolNabız</h1>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="#news" className="hover:text-green-400 transition-colors duration-200 font-medium">
                  Haberler
                </a>
              </li>
              <li>
                <a href="#scores" className="hover:text-green-400 transition-colors duration-200 font-medium">
                  Puanlar
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;