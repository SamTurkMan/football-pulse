import { Article } from '../types/Article';

export const updateMetaTags = (
  title: string,
  description: string,
  image: string = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg'
) => {
  // Update basic meta tags
  document.title = title;
  document.querySelector('meta[name="title"]')?.setAttribute('content', title);
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);

  // Update Open Graph meta tags
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);

  // Update Twitter meta tags
  document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="twitter:image"]')?.setAttribute('content', image);
};

export const setArticleMetaTags = (article: Article) => {
  updateMetaTags(
    article.title,
    article.summary || article.content.substring(0, 160),
    article.imageUrl
  );
};

export const setDefaultMetaTags = () => {
  updateMetaTags(
    'FootballPulse - Canlı Futbol Haberleri ve Skorlar',
    'Türk futbolundan en güncel haberler, canlı maç skorları ve istatistikler. Her saat başı güncellenen futbol haberleri.',
    'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg'
  );
};