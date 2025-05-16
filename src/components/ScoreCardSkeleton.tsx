import React from 'react';

interface ScoreCardSkeletonProps {
  darkMode: boolean;
}

const ScoreCardSkeleton: React.FC<ScoreCardSkeletonProps> = ({ darkMode }) => {
  return (
    <div className={`flex-shrink-0 w-72 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 animate-pulse shadow-md`}>
      <div className="flex justify-between items-center mb-2">
        <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        
        <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        
        <div className="flex items-center space-x-2">
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCardSkeleton;