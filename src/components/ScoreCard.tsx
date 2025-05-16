import React from 'react';
import { User } from 'lucide-react';
import { Match } from '../types/Match';

interface ScoreCardProps {
  match: Match;
  darkMode: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ match, darkMode }) => {
  const isLive = match.status.toUpperCase() === 'LIVE';
  const isScheduled = match.status === 'NS';

  const shortenTeamName = (name: string) => {
    if (!name) return '';
    
    // Common Turkish team abbreviations
    const abbreviations: { [key: string]: string } = {
      'Galatasaray': 'GS',
      'Fenerbahçe': 'FB',
      'Beşiktaş': 'BJK',
      'Trabzonspor': 'TS',
      'Başakşehir': 'BAŞ',
      'Adana Demirspor': 'ADS',
      'Antalyaspor': 'ANT',
      'Kayserispor': 'KAY',
      'Konyaspor': 'KON',
      'Sivasspor': 'SİV',
      'Gaziantep': 'GAZ',
      'Kasımpaşa': 'KAS',
      'Alanyaspor': 'ALA',
      'Hatayspor': 'HAT',
      'Pendikspor': 'PEN',
      'İstanbulspor': 'İST',
      'Ankaragücü': 'ANK',
      'Rizespor': 'RİZ',
      'Samsunspor': 'SAM',
      'Fatih Karagümrük': 'KAR'
    };

    // Check if we have a predefined abbreviation
    if (abbreviations[name]) {
      return abbreviations[name];
    }

    // For other teams, use first 3 letters
    return name.substring(0, 3).toUpperCase();
  };

  return (
    <div className={`
      flex-shrink-0 w-[280px] rounded-lg p-3 transition-all duration-300 
      ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
      ${isLive ? 'border-l-4 border-red-500' : ''}
      shadow-md hover:shadow-lg
    `}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {match.date}
        </span>
        
        {isLive && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-red-500">CANLI</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
        
        {!isLive && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {match.time}
          </span>
        )}
      </div>

      <div className="text-xs font-medium mb-3 text-primary dark:text-accent-light">
        {match.league}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <User size={18} className={`flex-shrink-0 ${darkMode ? 'text-white/80' : 'text-gray-600'}`} />
          <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {shortenTeamName(match.homeTeam.name)}
          </span>
        </div>
        
        <div className="px-3 min-w-[60px] text-center">
          {isScheduled ? (
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              vs
            </span>
          ) : (
            <span className={`text-sm font-bold ${isLive ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
              {match.homeTeam.score}-{match.awayTeam.score}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <span className={`font-medium text-sm text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {shortenTeamName(match.awayTeam.name)}
          </span>
          <User size={18} className={`flex-shrink-0 ${darkMode ? 'text-white/80' : 'text-gray-600'}`} />
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;