const dotenv = require('dotenv');
dotenv.config();

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import Parser from 'rss-parser';

// Загрузка ключей и URL из .env
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const NEWS_SOURCE_URL =
  process.env.VITE_NEWS_SOURCE_URL ||
  'https://ajansspor.com/rss';

console.log('Using feed URL:', NEWS_SOURCE_URL);

// Инициализируем парсер с кастомными полями для медиа
const parser = new Parser({
  customFields: {
    item: [
      ['enclosure', 'enclosure', { keepArray: false }],
      ['media:content', 'media:content', { keepArray: false }],
    ]
  }
});

const dataDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function fetchArticlesFromSource() {
  try {
    console.log(`Fetching articles from ${NEWS_SOURCE_URL}...`);
    const feed = await parser.parseURL(NEWS_SOURCE_URL);

    return feed.items.map(item => {
      // 1) Пробуем enclosure.url
      let imageUrl = item.enclosure?.url;
      // 2) Если нет — media:content.url
      if (!imageUrl && item['media:content']?.url) {
        imageUrl = item['media:content'].url;
      }
      // 3) Если нет — ищем в HTML
      if (!imageUrl) {
        const imgMatch = item.content?.match(/<img[^>]+src="([^"]+)"/);
        imageUrl = imgMatch?.[1] || null;
      }

      return {
        title: item.title,
        content: item.contentSnippet || item.content,
        imageUrl,  // здесь уже либо реальная ссылка из RSS, либо null
        publishedAt: item.pubDate || new Date().toISOString(),
        source: 'AjansSpor',
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
            content: `Rewrite this football article in a unique way in Turkish, preserving all facts but using different wording. Return JSON with 'title' and 'content'.\n\nTitle: ${article.title}\nContent: ${article.content}`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const rewritten = JSON.parse(data.choices[0].message.content);

    return {
      ...article,
      title: rewritten.title,
      content: rewritten.content,
      summary: rewritten.content.slice(0, 150) + '...'
    };
  } catch (error) {
    console.error('Error rewriting article:', error);
    return article;
  }
}

function saveArticlesToFile(articles) {
  try {
    const filePath = path.join(dataDir, 'articles.json');
    const existing = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];

    const withIds = articles.map(a => ({ id: uuidv4(), ...a }));
    const all = [...withIds, ...existing];
    const unique = Array.from(new Map(all.map(a => [a.url, a])).values());

    unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    const limited = unique.slice(0, 50);

    fs.writeFileSync(filePath, JSON.stringify(limited, null, 2));
    console.log(`Saved ${limited.length} articles to ${filePath}`);
  } catch (err) {
    console.error('Error saving articles:', err);
  }
}

async function main() {
  const articles = await fetchArticlesFromSource();
  if (!articles.length) {
    console.log('No articles found. Exiting.');
    return;
  }

  console.log(`Found ${articles.length} articles. Rewriting...`);
  const rewritten = await Promise.all(articles.map(rewriteArticle));
  saveArticlesToFile(rewritten);
  console.log('Done.');
}

main();
