const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const Parser = require('rss-parser');
const dotenv = require('dotenv');

dotenv.config();

// Поддерживаем несколько вариантов имени переменной для OPENAI API ключа
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in environment variables.');
  process.exit(1);
}
const NEWS_SOURCE_URL = process.env.VITE_NEWS_SOURCE_URL || 'https://www.cnnturk.com/feed/rss/spor/futbol';

console.log('Using feed URL:', NEWS_SOURCE_URL);

// Настройка парсера с дополнительными полями для картинок
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

async function fetchArticlesFromSource() {
  try {
    console.log(`Fetching articles from ${NEWS_SOURCE_URL}...`);
    const feed = await parser.parseURL(NEWS_SOURCE_URL);

    // Для отладки: посмотрите структуру первого элемента
    // console.log('Sample item:', feed.items[0]);

    return feed.items.map(item => {
      // Приоритет выбора картинки:
      let imageUrl =
        item.rssImage ||
        item.enclosure?.url ||
        item['media:thumbnail']?.url ||
        item['media:content']?.url;

      // Если всё ещё нет картинки, ищем <img> в HTML-контенте
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
            content: `Sen bir spor muhabirisin. Aşağıdaki futbol haberini detaylı, akıcı ve özgün bir şekilde yeniden yaz. Bilgileri koru ama ifadeleri değiştir. Giriş cümlesi dikkat çekici olsun. Uzunluk en az 3 paragraf olsun. Yanıta sadece JSON olarak dön: { \"title\": \"...\", \"content\": \"...\" }\n\nBaşlık: ${article.title}\nİçerik: ${article.content}`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Response body:', errorBody);
      return article;
    }

    const data = await response.json();
    if (!data.choices || !data.choices.length) {
      console.error('Unexpected OpenAI response format:', JSON.stringify(data));
      return article;
    }

    const content = data.choices[0].message?.content;
    if (!content) {
      console.error('No message.content in OpenAI response:', JSON.stringify(data));
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
    // Полностью перезаписываем файл, чтобы удалить старые записи
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const withIds = articles.map(a => ({ id: uuidv4(), ...a }));
    const limited = withIds.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                            .slice(0, 50);

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
