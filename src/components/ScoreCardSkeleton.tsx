import React from 'react';

interface ScoreCardSkeletonProps {
  darkMode: boolean;
}

const ScoreCardSkeleton: React.FC<ScoreCardSkeletonProps> = ({ darkMode }) => {
  return (
    <div className={`flex-shrink-0 w-[280px] rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 animate-pulse shadow-md`}>
      <div className="flex justify-between items-center mb-2.5">
        <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center space-x-2 w-[110px]">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="h-4 flex-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        
        <div className="w-[44px] mx-2 flex-shrink-0">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        
        <div className="flex items-center space-x-2 w-[110px] justify-end">
          <div className="h-4 flex-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCardSkeleton;