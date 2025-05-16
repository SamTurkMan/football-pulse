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

  if (loading) {
    return (
      <section className="space-y-8">
        <div className="h-[500px] bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NewsCardSkeleton darkMode={darkMode} />
          <NewsCardSkeleton darkMode={darkMode} />
          <NewsCardSkeleton darkMode={darkMode} />
        </div>
      </section>
    );
  }

  if (!articles.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Haber bulunamadı.</p>
      </div>
    );
  }

  const [featuredArticle, ...otherArticles] = articles;

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Son Futbol Haberleri</h2>
      
      {/* Featured Article */}
      <div className="card group overflow-hidden">
        <div className="relative h-[500px]">
          <img 
            src={featuredArticle.imageUrl} 
            alt={featuredArticle.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className="bg-accent px-4 py-1.5 rounded-full text-white font-medium">
                {featuredArticle.category}
              </span>
              <time className="text-gray-300" dateTime={featuredArticle.publishedAt}>
                {new Date(featuredArticle.publishedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 line-clamp-2">
              {featuredArticle.title}
            </h3>
            <p className="text-gray-200 line-clamp-3 mb-6 max-w-3xl">
              {featuredArticle.summary}
            </p>
            <button 
              onClick={() => window.location.href = `/article/${featuredArticle.id}`}
              className="btn-primary"
            >
              Devamını Oku
            </button>
          </div>
        </div>
      </div>

      {/* Other Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherArticles.map(article => (
          <NewsCard key={article.id} article={article} darkMode={darkMode} />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-8 text-center">
          <button 
            onClick={loadMore}
            className="btn-primary"
          >
            Daha Fazla
          </button>
        </div>
      )}
      
      {!hasMore && articles.length > 0 && (
        <p className="mt-8 text-center text-gray-500 dark:text-gray-400">
          Tüm haberleri gördünüz.
        </p>
      )}
    </section>
  );
};

export default NewsSection;