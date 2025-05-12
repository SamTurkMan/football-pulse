import React from 'react';

interface NewsCardSkeletonProps {
  darkMode: boolean;
}

const NewsCardSkeleton: React.FC<NewsCardSkeletonProps> = ({ darkMode }) => {
  return (
    <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md h-full animate-pulse`}>
      <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
      
      <div className="p-5">
        <div className="flex items-center mb-3">
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-3 w-3/4"></div>
        
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default NewsCardSkeleton;