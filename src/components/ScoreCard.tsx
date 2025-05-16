import React from 'react';
import { Wallpaper as SoccerBall } from 'lucide-react';
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
    
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex-shrink-0 w-[280px] rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-3 transition-colors duration-200 shadow-md`}>
      <div className="text-xs font-medium mb-2.5 flex justify-between items-center">
        <span className="text-accent-light truncate max-w-[180px]">{match.league}</span>
        <span className={`${getStatusColor(match.status)} ml-2 flex-shrink-0`}>
          {formatTime(match.time)}
        </span>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center space-x-2 w-[110px]">
          <SoccerBall size={20} className="text-white flex-shrink-0" />
          <span className="font-medium text-sm truncate">
            {match.homeTeam.name}
          </span>
        </div>
        
        <div className="flex-shrink-0 w-[44px] text-center mx-2">
          {match.status.toLowerCase() === 'scheduled' ? (
            <div className="text-sm font-bold">vs</div>
          ) : (
            <div className="text-sm font-bold tabular-nums">
              {match.homeTeam.score}-{match.awayTeam.score}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 w-[110px] justify-end">
          <span className="font-medium text-sm truncate">
            {match.awayTeam.name}
          </span>
          <SoccerBall size={20} className="text-white flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;