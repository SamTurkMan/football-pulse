// fetch-news.js
const fs       = require('fs');
const path     = require('path');
const { v4: uuidv4 } = require('uuid');
const fetch    = require('node-fetch');
const Parser   = require('rss-parser');
require('dotenv').config();

// ==== Настройки через .env ====
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const NEWS_SOURCE_URL   = process.env.VITE_NEWS_SOURCE_URL || 'https://www.cnnturk.com/feed/rss/spor/futbol';
// Сколько статей максимум за запуск (по умолчанию 5)
const DAILY_LIMIT       = parseInt(process.env.DAILY_LIMIT, 10) || 5;
// Задержка между вызовами OpenAI в мс (по умолчанию 120000 = 2 мин)
const THROTTLE_MS       = parseInt(process.env.THROTTLE_MS, 10) || 120000;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set');
  process.exit(1);
}

console.log('Using feed URL:', NEWS_SOURCE_URL);
console.log(`Daily limit: ${DAILY_LIMIT} articles, throttle: ${THROTTLE_MS} ms`);

// Утилита-пауза
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Настройка RSS-парсера с полями для картинок
const parser = new Parser({
  customFields: {
    item: [
      ['enclosure',       'enclosure',       { keepArray: false }],
      ['media:content',   'media:content',   { keepArray: false }],
      ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
      ['content:encoded', 'content:encoded'],
      ['image',           'rssImage',        { keepArray: false }]
    ]
  }
});

const dataDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Загрузка и фильтрация статей
async function fetchArticlesFromSource() {
  try {
    const feed = await parser.parseURL(NEWS_SOURCE_URL);
    console.log(`Fetched ${feed.items.length} items from RSS`);

    // Фильтрация: берем только футбол
    const footballItems = feed.items.filter(item => {
      // 1. Ссылка содержит футбольный путь
      if (item.link && /\/spor\/futbol/.test(item.link)) return true;
      // 2. Категория содержит 'futbol'
      const cats = item.categories || (item.category ? [item.category] : []);
      if (cats.some(c => /futbol/i.test(c))) return true;
      // 3. Заголовок содержит 'futbol'
      if (item.title && /futbol/i.test(item.title)) return true;
      return false;
    });

    console.log(`Filtered ${footballItems.length} football articles`);
    return footballItems.map(item => {
      // Выбираем картинку из доступных полей
      let imageUrl = 
           item.rssImage
        || item.enclosure?.url
        || item['media:thumbnail']?.url
        || item['media:content']?.url;

      if (!imageUrl) {
        const html = item['content:encoded'] || item.content || '';
        const m = html.match(/<img[^>]+src="([^"]+)"/i);
        imageUrl = m ? m[1] : null;
      }

      return {
        title:       item.title,
        content:     item.contentSnippet || item['content:encoded'] || item.content,
        imageUrl,
        publishedAt: item.pubDate || new Date().toISOString(),
        source:      'CNN Türk',
        category:    'Football News',
        url:         item.link
      };
    });
  } catch (err) {
    console.error('Error fetching/parsing RSS:', err);
    return [];
  }
}

// Переписывание одной статьи через OpenAI
async function rewriteArticle(article) {
  console.log(`Rewriting article: ${article.title}`);
  const prompt = 
    `Sen bir spor muhabirisin. Aşağıdaki futbol haberini detaylı, akıcı ve özgün bir şekilde yeniden yaz. ` +
    `Bilgileri koru, ama ifadeleri değiştir. Giriş cümlesi dikkat çekici olsun. Uzunluk en az 3 paragraf olsun. ` +
    `JSON formatında yalnızca iki alan dön: {"title": "...", "content": "..."} — при этом внутри контента ` +
    `используй \\n для переноса абзацев и не вставляй лишние пробельные символы.\n\n` +
    `Başlık: ${article.title}\n` +
    `İçerik: ${article.content}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!res.ok) {
      console.error(`OpenAI API error: ${res.status} ${res.statusText}`);
      console.error(await res.text());
      return article;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      console.error('Empty GPT response:', JSON.stringify(data));
      return article;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse GPT JSON:', e);
      console.error('Raw response:', text);
      return article;
    }

    return {
      ...article,
      title:   parsed.title,
      content: parsed.content,
      summary: parsed.content.slice(0, 150) + '...'
    };
  } catch (err) {
    console.error('Error in rewriteArticle():', err);
    return article;
  }
}

// Сохраняем результат в public/data/articles.json
function saveArticlesToFile(articles) {
  const filePath = path.join(dataDir, 'articles.json');
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const withIds = articles.map(a => ({ id: uuidv4(), ...a }));
    fs.writeFileSync(filePath, JSON.stringify(withIds, null, 2));
    console.log(`Saved ${withIds.length} articles to ${filePath}`);
  } catch (err) {
    console.error('Error saving articles:', err);
  }
}

// Главная функция
(async function main() {
  const all = await fetchArticlesFromSource();
  if (!all.length) {
    console.log('No football articles found — exiting.');
    return;
  }

  // Берём самые свежие
  all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const batch = all.slice(0, DAILY_LIMIT);
  console.log(`Processing ${batch.length}/${all.length} articles (limit ${DAILY_LIMIT})`);

  const rewritten = [];
  for (let i = 0; i < batch.length; i++) {
    const art = await rewriteArticle(batch[i]);
    rewritten.push(art);
    if (i < batch.length - 1) {
      console.log(`Waiting ${THROTTLE_MS/1000}s before next OpenAI call…`);
      await sleep(THROTTLE_MS);
    }
  }

  saveArticlesToFile(rewritten);
  console.log('Done.');
})();
