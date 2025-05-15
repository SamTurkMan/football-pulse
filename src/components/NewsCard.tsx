import React from 'react';
import { Calendar, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Article } from '../types/Article';

interface NewsCardProps {
  article: Article;
  darkMode: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, darkMode }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
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
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link kopyalandı!'))
        .catch(err => console.error('Could not copy text: ', err));
    }
  };

  return (
    <article className="card group">
      <div className="relative overflow-hidden aspect-video">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <span className="inline-block bg-sunset text-white text-sm font-medium px-3 py-1 rounded-full">
            {article.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
          <Calendar size={16} className="mr-1" />
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </div>
        
        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-sky dark:group-hover:text-grass transition-colors duration-200">
          {article.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <Link 
            to={`/article/${article.id}`} 
            className="btn-primary text-sm"
          >
            Devamını Oku
          </Link>
          
          <button 
            onClick={shareArticle}
            aria-label="Haberi paylaş"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Share2 size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;