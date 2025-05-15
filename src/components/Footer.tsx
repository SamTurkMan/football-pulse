import React from 'react';
import { Flame, Heart, Facebook, Instagram, MessageSquare } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className="py-12 bg-primary dark:bg-primary-dark text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-8">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-3">
              <div className="relative">
                <Flame size={24} className="text-accent-light mr-2" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse-fast" />
              </div>
              <h2 className="text-xl font-bold">FootballPulse</h2>
            </div>
            <p className="text-sm text-center md:text-left text-accent-light">
              Her saat başı güncellenen futbol haberleri ve skorlar.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center space-y-2">
            <h3 className="text-lg font-semibold mb-2">Hızlı Bağlantılar</h3>
            <a href="#news" className="text-accent-light hover:text-white transition-colors duration-200">
              Haberler
            </a>
            <a href="#scores" className="text-accent-light hover:text-white transition-colors duration-200">
              Skorlar
            </a>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold mb-4">Bizi Takip Edin</h3>
            <div className="flex items-center space-x-4">
              <button 
                className="p-2.5 rounded-full bg-primary-light/10 hover:bg-primary-light/20 transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-accent-light hover:text-white transition-colors duration-200" />
              </button>
              <button 
                className="p-2.5 rounded-full bg-primary-light/10 hover:bg-primary-light/20 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-accent-light hover:text-white transition-colors duration-200" />
              </button>
              <button 
                className="p-2.5 rounded-full bg-primary-light/10 hover:bg-primary-light/20 transition-all duration-200"
                aria-label="Telegram"
              >
                <MessageSquare size={20} className="text-accent-light hover:text-white transition-colors duration-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-primary-light/10 flex flex-col items-center space-y-4">
          <div className="flex items-center text-sm text-accent-light">
            <span>Futbol severler için</span>
            <Heart size={16} className="mx-1.5 text-red-500" />
            <span>hazırlandı</span>
          </div>
          
          <div className="text-xs text-accent-light/80">
            &copy; {new Date().getFullYear()} FootballPulse. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;