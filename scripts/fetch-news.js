const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const Parser = require('rss-parser');
const dotenv = require('dotenv');

dotenv.config();

// Поддержка API-ключа
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in environment variables.');
  process.exit(1);
}
const NEWS_SOURCE_URL = process.env.VITE_NEWS_SOURCE_URL || 'https://www.cnnturk.com/feed/rss/spor/futbol';

console.log('Using feed URL:', NEWS_SOURCE_URL);

// Инициализация RSS-парсера с полями для изображений
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
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Функция для задержек
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchArticlesFromSource() {
  try {
    console.log(`Fetching articles from ${NEWS_SOURCE_URL}...`);
    const feed = await parser.parseURL(NEWS_SOURCE_URL);

    // Фильтрация: только футбольные новости
    const items = feed.items.filter(item => {
      // Категории из RSS
      const cats = item.categories || (item.category ? [item.category] : []);
      if (cats.some(c => /futbol/i.test(c))) return true;
      // Ссылка содержит футбольный путь
      if (item.link && /\/spor\/futbol/.test(item.link)) return true;
      // Заголовок содержит слово futbol
      if (item.title && /futbol/i.test(item.title)) return true;
      return false;
    });

    console.log(`Filtered ${items.length} football articles.`);

    // Преобразуем элементы
    return items.map(item => {
      let imageUrl =
        item.rssImage ||
        item.enclosure?.url ||
        item['media:thumbnail']?.url ||
        item['media:content']?.url;

      // Если нет, ищем <img> в HTML
      if (!imageUrl) {
        const html = item['content:encoded'] || item.content || '';
        const match = html.match(/<img[^>]+src="([^"\\]+)"/i);
        imageUrl = match ? match[1] : null;
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
  } catch (error) {
    console.error('Error fetching articles from source:', error);
    return [];
  }
}

async function rewriteArticle(article) {
  try {
    console.log(`Rewriting article: ${article.title}`);

    const prompt = `Sen bir spor muhabirisin. Aşağıdaki futbol haberini detaylı, akıcı ve özgün bir şekilde yeniden yaz. Bilgileri koru ama ifadeleri değiştir. Giriş cümlesi dikkat çekici olsun. Uzunluk en az 3 paragraf olsun.\n` +
                   `Yanıta sadece JSON olarak dön ve content alanında gerçek yeni satır karakterleri kullanma; paragraf ayırma için \\n kullan.\n\n` +
                   `Başlık: ${article.title}\n` +
                   `İçerik: ${article.content}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      console.error('Response body:', await response.text());
      return article;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in GPT response:', JSON.stringify(data));
      return article;
    }

    let rewritten;
    try {
      rewritten = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON from GPT response:', content, parseError);
      return article;
    }

    return {
      ...article,
      title:   rewritten.title,
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
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const withIds = articles.map(a => ({ id: uuidv4(), ...a }));
    const limited = withIds
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 50);

    fs.writeFileSync(filePath, JSON.stringify(limited, null, 2));
    console.log(`Saved ${limited.length} articles to ${filePath}`);
  } catch (err) {
    console.error('Error saving articles:', err);
  }
}

(async function main() {
  const articles = await fetchArticlesFromSource();
  if (!articles.length) {
    console.log('No football articles found. Exiting.');
    return;
  }

  console.log(`Found ${articles.length} football articles. Rewriting...`);
  const rewritten = [];
  for (let i = 0; i < articles.length; i++) {
    rewritten.push(await rewriteArticle(articles[i]));
    if (i < articles.length - 1) await sleep(1000); // небольшая задержка
  }
  saveArticlesToFile(rewritten);
  console.log('Done.');
})();
