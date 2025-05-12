import React from 'react';
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
    if (match.status.toLowerCase() === 'live' || match.status.toLowerCase() === 'ht' || match.status.toLowerCase() === 'half time') {
      return match.status;
    }
    
    if (match.status.toLowerCase() === 'ft' || match.status.toLowerCase() === 'full time') {
      return 'FT';
    }
    
    // Format upcoming match time
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} p-4 transition-colors duration-200`}>
      <div className="text-sm font-medium mb-2 flex justify-between items-center">
        <span>{match.league}</span>
        <span className={`${getStatusColor(match.status)}`}>
          {formatTime(match.time)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex-shrink-0">
            <img 
              src={match.homeTeam.logo} 
              alt={match.homeTeam.name} 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-medium truncate max-w-[120px]">{match.homeTeam.name}</span>
        </div>
        
        {match.status.toLowerCase() === 'scheduled' ? (
          <div className="text-lg font-bold">vs</div>
        ) : (
          <div className="text-lg font-bold">
            {match.homeTeam.score} - {match.awayTeam.score}
          </div>
        )}
        
        <div className="flex items-center space-x-3">
          <span className="font-medium truncate max-w-[120px]">{match.awayTeam.name}</span>
          <div className="w-8 h-8 flex-shrink-0">
            <img 
              src={match.awayTeam.logo} 
              alt={match.awayTeam.name} 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;