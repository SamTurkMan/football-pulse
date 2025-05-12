import React from 'react';
import { Percent as Soccer, Heart } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className={`py-8 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center mb-4">
            <Soccer size={24} className="mr-2 text-blue-600" />
            <h2 className="text-xl font-bold">FootballPulse</h2>
          </div>
          
          <p className="text-sm text-center mb-4">
            Automated football news and scores, updated every hour.
          </p>
          
          <div className="flex items-center text-sm">
            <span>Made with</span>
            <Heart size={16} className="mx-1 text-red-500" />
            <span>for football fans</span>
          </div>
          
          <div className="mt-6 text-xs">
            &copy; {new Date().getFullYear()} FootballPulse. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;