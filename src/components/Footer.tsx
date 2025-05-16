import React from 'react';
import { Flame, Heart } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className="py-6 bg-primary dark:bg-primary-dark text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Description */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Flame size={20} className="text-accent-light" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-fast" />
            </div>
            <span className="text-lg font-semibold">FutbolNabzı</span>
          </div>

          {/* Copyright */}
          <div className="flex items-center text-sm text-accent-light/80">
            <span>© {new Date().getFullYear()} FutbolNabzı.</span>
            <Heart size={14} className="mx-1.5 text-red-500" />
            <span>Tüm hakları saklıdır.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;