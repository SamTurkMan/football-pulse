import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';
import { fetchNewsArticles } from '../services/newsService';
import { Article } from '../types/Article';

interface NewsSectionProps {
  darkMode: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({ darkMode }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchNewsArticles(page);
        
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setArticles(prev => page === 1 ? data : [...prev, ...data]);
        }
      } catch (error) {
        console.error('Failed to fetch news articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <section id="news" className={`mb-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-300 dark:border-gray-700">
        Son Futbol Haberleri
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map(article => (
          <NewsCard key={article.id} article={article} darkMode={darkMode} />
        ))}
        
        {loading && (
          <>
            <NewsCardSkeleton darkMode={darkMode} />
            <NewsCardSkeleton darkMode={darkMode} />
          </>
        )}
      </div>
      
      {!loading && hasMore && (
        <div className="mt-8 text-center">
          <button 
            onClick={loadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full shadow transition-colors duration-200"
          >
            Daha Fazlasını Yükle
          </button>
        </div>
      )}
      
      {!hasMore && articles.length > 0 && (
        <p className="mt-8 text-center text-gray-500 dark:text-gray-400">
          You've reached the end of the news feed.
        </p>
      )}
    </section>
  );
};

export default NewsSection;