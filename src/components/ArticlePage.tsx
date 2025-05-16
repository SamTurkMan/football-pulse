import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Share2 } from 'lucide-react';
import { Article } from '../types/Article';
import { fetchArticleById, fetchNewsArticles } from '../services/newsService';
import { setArticleMetaTags, setDefaultMetaTags } from '../utils/metaTags';
import NewsCardSkeleton from './NewsCardSkeleton';

interface ArticlePageProps {
  darkMode: boolean;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ darkMode }) => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      if (id) {
        setLoading(true);
        const [mainArticle, allArticles] = await Promise.all([
          fetchArticleById(id),
          fetchNewsArticles(1, 10) // Fetch 10 articles for related content
        ]);
        
        setArticle(mainArticle);
        
        if (mainArticle) {
          setArticleMetaTags(mainArticle);
          // Filter out the current article and get 3 related articles
          const filtered = allArticles
            .filter(a => a.id !== id)
            .slice(0, 3);
          setRelatedArticles(filtered);
        }
        
        setLoading(false);
      }
    };

    loadArticle();

    return () => {
      setDefaultMetaTags();
    };
  }, [id]);

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
        title: article?.title || '',
        text: article?.summary || '',
        url: window.location.href,
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link kopyalandı!'))
        .catch(err => console.error('Could not copy text: ', err));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 animate-pulse">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
          </div>
          <div className="lg:w-1/3 space-y-6">
            <NewsCardSkeleton darkMode={darkMode} />
            <NewsCardSkeleton darkMode={darkMode} />
            <NewsCardSkeleton darkMode={darkMode} />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Makale bulunamadı</h2>
        <Link to="/" className="text-accent hover:text-accent-dark transition-colors duration-200">
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Article */}
        <article className="lg:w-2/3">
          <Link 
            to="/" 
            className="inline-flex items-center mb-6 text-gray-600 dark:text-gray-300 hover:text-accent dark:hover:text-accent-light transition-colors duration-200"
          >
            <ChevronLeft size={20} className="mr-1" />
            Haberlere dön
          </Link>

          <div className="card">
            <div className="relative h-96">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                <div className="absolute bottom-0 p-6 text-white">
                  <div className="mb-2 flex items-center space-x-4">
                    <span className="bg-accent px-3 py-1 rounded-full text-sm font-medium">
                      {article.category}
                    </span>
                    <div className="flex items-center text-sm">
                      <Calendar size={16} className="mr-1" />
                      <time dateTime={article.publishedAt}>
                        {formatDate(article.publishedAt)}
                      </time>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold">{article.title}</h1>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Kaynak: {article.source}
                </div>
                <button
                  onClick={shareArticle}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Haberi paylaş"
                >
                  <Share2 size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <aside className="lg:w-1/3 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Benzer Haberler
          </h2>
          {relatedArticles.map(relatedArticle => (
            <Link 
              key={relatedArticle.id}
              to={`/article/${relatedArticle.id}`}
              className="block group"
            >
              <div className="card hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={relatedArticle.imageUrl} 
                    alt={relatedArticle.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-accent dark:group-hover:text-accent-light transition-colors duration-200">
                    {relatedArticle.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {relatedArticle.summary}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={14} className="mr-1" />
                    <time dateTime={relatedArticle.publishedAt}>
                      {formatDate(relatedArticle.publishedAt)}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default ArticlePage;