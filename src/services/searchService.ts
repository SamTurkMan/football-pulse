import { Article } from '../types/Article';

export const searchArticles = async (query: string): Promise<Article[]> => {
  try {
    const response = await fetch('/data/articles.json');
    const articles: Article[] = await response.json();
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return articles.filter(article => {
      const content = `${article.title} ${article.content} ${article.summary}`.toLowerCase();
      return searchTerms.every(term => content.includes(term));
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    return [];
  }
};