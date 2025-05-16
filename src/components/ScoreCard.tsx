import React from 'react';
import { User } from 'lucide-react';
import { Match } from '../types/Match';

interface ScoreCardProps {
  match: Match;
  darkMode: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ match, darkMode }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
        return 'text-red-500';
      case 'ft':
      case 'full time':
        return 'text-gray-500 dark:text-gray-400';
      case 'ht':
      case 'half time':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const formatTime = (timeString: string) => {
    if (match.status.toLowerCase() === 'live') {
      return (
        <div className="flex items-center space-x-1.5">
          <span>CANLI</span>
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      );
    }
    
    if (match.status.toLowerCase() === 'ht') {
      return 'D.ARASI';
    }
    
    if (match.status.toLowerCase() === 'ft') {
      return 'TAMAM';
    }
    
    // If it's a "minutes until match" format, return as is
    if (timeString.includes('dk sonra')) {
      return timeString;
    }
    
    // Otherwise format the time
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  const truncateTeamName = (name: string) => {
    const wordsToRemove = ['Football Club', 'FC', 'United', 'City', 'Athletic'];
    
    let shortened = name;
    wordsToRemove.forEach(word => {
      shortened = shortened.replace(new RegExp(word, 'gi'), '').trim();
    });
    
    if (shortened.length > 10) {
      shortened = shortened.split(' ')[0];
    }
    
    return shortened;
  };

  return (
    <div className={`flex-shrink-0 w-[260px] sm:w-[280px] rounded-lg ${
      darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
    } p-3 transition-all duration-300 transform hover:scale-[1.02] shadow-md`}>
      <div className="text-xs font-medium mb-2.5 flex justify-between items-center">
        <span className={`truncate max-w-[180px] ${darkMode ? 'text-accent-light' : 'text-primary'}`}>
          {match.league}
        </span>
        <span className={`${getStatusColor(match.status)} ml-2 flex-shrink-0 flex items-center`}>
          {formatTime(match.time)}
        </span>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center space-x-2 w-[100px] sm:w-[110px]">
          <User 
            size={18} 
            className={`flex-shrink-0 transition-opacity duration-300 ${
              darkMode ? 'text-white/80' : 'text-gray-600'
            }`}
          />
          <span 
            className={`font-medium text-sm truncate transition-all duration-300 hover:opacity-80 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
            title={match.homeTeam.name}
          >
            {truncateTeamName(match.homeTeam.name)}
          </span>
        </div>
        
        <div className="flex-shrink-0 w-[44px] text-center mx-2">
          {match.status.toLowerCase() === 'ns' ? (
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>vs</div>
          ) : (
            <div className={`text-sm font-bold tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {match.homeTeam.score}-{match.awayTeam.score}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 w-[100px] sm:w-[110px] justify-end">
          <span 
            className={`font-medium text-sm truncate text-right transition-all duration-300 hover:opacity-80 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
            title={match.awayTeam.name}
          >
            {truncateTeamName(match.awayTeam.name)}
          </span>
          <User 
            size={18} 
            className={`flex-shrink-0 transition-opacity duration-300 ${
              darkMode ? 'text-white/80' : 'text-gray-600'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;