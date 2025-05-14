import React from 'react';
import { Calendar, Share2 } from 'lucide-react';
import { Article } from '../types/Article';

interface NewsCardProps {
  article: Article;
  darkMode: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, darkMode }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err));
    }
  };

  return (
    <article className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-md transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col`}>
      <div className="relative overflow-hidden h-48">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-3 py-1 text-sm font-medium">
          {article.category}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
          <Calendar size={16} className="mr-1" />
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
        
        <p className={`mb-4 line-clamp-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {article.summary}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <a 
            href={`/article/${article.id}`} 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
          >
            Read More
          </a>
          
          <button 
            onClick={shareArticle}
            aria-label="Share article"
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-colors duration-200`}
          >
            <Share2 size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;