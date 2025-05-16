import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Article } from '../types/Article';
import { searchArticles } from '../services/searchService';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';

interface SearchResultsProps {
  darkMode: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ darkMode }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      const searchResults = await searchArticles(query);
      setResults(searchResults);
      setLoading(false);
    };

    performSearch();
  }, [query]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NewsCardSkeleton darkMode={darkMode} />
        <NewsCardSkeleton darkMode={darkMode} />
        <NewsCardSkeleton darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {results.length > 0 
            ? `"${query}" için ${results.length} sonuç bulundu`
            : `"${query}" için sonuç bulunamadı`}
        </h2>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map(article => (
            <NewsCard key={article.id} article={article} darkMode={darkMode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Farklı anahtar kelimeler kullanarak tekrar arama yapabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults