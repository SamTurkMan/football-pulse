import { Article } from '../types/Article';

export const fetchNewsArticles = async (page: number = 1, limit: number = 4): Promise<Article[]> => {
  try {
    const response = await fetch('/data/articles.json');
    const articles = await response.json();
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return articles.slice(start, end);
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }
};

export const fetchArticleById = async (id: string): Promise<Article | null> => {
  try {
    const response = await fetch('/data/articles.json');
    const articles = await response.json();
    return articles.find((article: Article) => article.id === id) || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};