import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import Parser from 'rss-parser';

// Загрузка ключей и URL из .env либо использование значения по умолчанию
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const NEWS_SOURCE_URL =
  process.env.VITE_NEWS_SOURCE_URL ||
  'https://www.caughtoffside.com/feed/';

console.log('Using feed URL:', NEWS_SOURCE_URL);

const parser = new Parser();

const dataDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function fetchArticlesFromSource() {
  try {
    console.log(`Fetching articles from ${NEWS_SOURCE_URL}...`);
    const feed = await parser.parseURL(NEWS_SOURCE_URL);

    return feed.items.map(item => {
      const imageMatch = item.content?.match(/<img[^>]+src="([^"]+)"/);
      const imageUrl =
        imageMatch?.[1] ||
        'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg';

      return {
        title: item.title,
        content: item.contentSnippet || item.content,
        imageUrl: imageUrl,
        publishedAt: item.pubDate || new Date().toISOString(),
        source: 'CaughtOffside',
        category: 'Football News',
        url: item.link
      };
    });
  } catch (error) {
    console.error('Error fetching articles from source:', error);
    return [];
  }
}

async function rewriteArticle(article) {
  try {
    console.log(`Rewriting article: ${article.title}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Rewrite this football article in a unique way, maintaining all facts but using different wording. Make it engaging and professional:\n\nTitle: ${article.title}\n\nContent: ${article.content}\n\nReturn the response in JSON format with 'title' and 'content' fields.`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const rewrittenContent = JSON.parse(data.choices[0].message.content);

    return {
      ...article,
      title: rewrittenContent.title,
      content: rewrittenContent.content,
      summary: rewrittenContent.content.substring(0, 150) + '...'
    };
  } catch (error) {
    console.error('Error rewriting article:', error);
    return article;
  }
}

function saveArticlesToFile(articles) {
  try {
    const filePath = path.join(dataDir, 'articles.json');

    let existingArticles = [];
    if (fs.existsSync(filePath)) {
      existingArticles = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const articlesWithIds = articles.map(article => ({
      id: uuidv4(),
      ...article
    }));

    const allArticles = [...articlesWithIds, ...existingArticles];

    const uniqueArticles = Array.from(
      new Map(allArticles.map(a => [a.title, a])).values()
    );

    uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const limitedArticles = uniqueArticles.slice(0, 50);

    fs.writeFileSync(filePath, JSON.stringify(limitedArticles, null, 2));
    console.log(`Saved ${limitedArticles.length} articles to ${filePath}`);
  } catch (error) {
    console.error('Error saving articles to file:', error);
  }
}

async function main() {
  try {
    const articles = await fetchArticlesFromSource();

    if (articles.length === 0) {
      console.log('No articles found. Exiting.');
      return;
    }

    console.log(`Found ${articles.length} articles. Processing...`);

    const rewrittenArticles = [];
    for (const article of articles) {
      const rewrittenArticle = await rewriteArticle(article);
      rewrittenArticles.push(rewrittenArticle);
    }

    saveArticlesToFile(rewrittenArticles);
    console.log('Article processing completed successfully.');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main();