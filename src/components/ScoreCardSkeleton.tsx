import React from 'react';

interface ScoreCardSkeletonProps {
  darkMode: boolean;
}

const ScoreCardSkeleton: React.FC<ScoreCardSkeletonProps> = ({ darkMode }) => {
  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 animate-pulse`}>
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        
        <div className="h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
        
        <div className="flex items-center space-x-3">
          <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCardSkeleton;