import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Share2 } from 'lucide-react';
import { Article } from '../types/Article';
import { fetchArticleById } from '../services/newsService';

interface ArticlePageProps {
  darkMode: boolean;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ darkMode }) => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      if (id) {
        setLoading(true);
        const data = await fetchArticleById(id);
        setArticle(data);
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err));
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
        <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Article not found</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <Link 
        to="/" 
        className={`inline-flex items-center mb-6 ${
          darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to news
      </Link>

      <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="relative h-96">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-white">
              <div className="mb-2 flex items-center space-x-4">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {article.category}
                </span>
                <div className="flex items-center text-sm">
                  <Calendar size={16} className="mr-1" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold">{article.title}</h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Source: {article.source}
            </div>
            <button
              onClick={shareArticle}
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } transition-colors duration-200`}
              aria-label="Share article"
            >
              <Share2 size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div 
            className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.url && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full transition-colors duration-200"
              >
                Read original article
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default ArticlePage;