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
    if (match.status.toLowerCase() === 'live' || match.status.toLowerCase() === 'ht' || match.status.toLowerCase() === 'half time') {
      return match.status;
    }
    
    if (match.status.toLowerCase() === 'ft' || match.status.toLowerCase() === 'full time') {
      return 'FT';
    }
    
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
        <span className="text-accent-light truncate max-w-[180px]">{match.league}</span>
        <span className={`${getStatusColor(match.status)} ml-2 flex-shrink-0`}>
          {formatTime(match.time)}
        </span>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center space-x-2 w-[100px] sm:w-[110px]">
          <User 
            size={18} 
            className="text-white/80 flex-shrink-0 transition-opacity duration-300"
          />
          <span 
            className="font-medium text-sm truncate text-white transition-all duration-300 hover:opacity-80" 
            title={match.homeTeam.name}
          >
            {truncateTeamName(match.homeTeam.name)}
          </span>
        </div>
        
        <div className="flex-shrink-0 w-[44px] text-center mx-2">
          {match.status.toLowerCase() === 'scheduled' ? (
            <div className="text-sm font-bold text-white">vs</div>
          ) : (
            <div className="text-sm font-bold tabular-nums text-white">
              {match.homeTeam.score}-{match.awayTeam.score}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 w-[100px] sm:w-[110px] justify-end">
          <span 
            className="font-medium text-sm truncate text-right text-white transition-all duration-300 hover:opacity-80" 
            title={match.awayTeam.name}
          >
            {truncateTeamName(match.awayTeam.name)}
          </span>
          <User 
            size={18} 
            className="text-white/80 flex-shrink-0 transition-opacity duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;