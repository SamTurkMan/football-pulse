import { Article } from '../types/Article';

export const fetchNewsArticles = async (page: number = 1): Promise<Article[]> => {
  try {
    const response = await fetch('/data/articles.json');
    const articles = await response.json();
    
    const articlesPerPage = 4;
    const start = (page - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    
    return articles.slice(start, end);
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }
};