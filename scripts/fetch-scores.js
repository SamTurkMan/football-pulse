// scripts/fetch-scores.js

const fs    = require('fs');
const path  = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

////////////////////////////////////////////////////////////////////////////////
// Конфиг
////////////////////////////////////////////////////////////////////////////////

// Ваш ключ из Secrets
const API_KEY    = process.env.APIFOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Error: APIFOOTBALL_API_KEY is not set');
  process.exit(1);
}

// Правильный базовый URL для v3
const BASE_URL   = 'https://apiv3.apifootball.com/';

// Лиги Турции, которые вы нашли на сайте
const LEAGUE_IDS = [318, 319, 320, 321, 322, 323, 532];

////////////////////////////////////////////////////////////////////////////////
// Утилиты
////////////////////////////////////////////////////////////////////////////////

async function apiGet(params) {
  // строим URL вида:
  // https://apiv3.apifootball.com/?action=...&league_id=...&APIkey=your_key
  const url = new URL(BASE_URL);
  // сначала общий параметр APIkey
  url.searchParams.set('APIkey', API_KEY);
  // потом все переданные вам параметры
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  console.log(`→ GET ${url}`);
  const res  = await fetch(url);
  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error(`APIfootball returned unexpected: ${JSON.stringify(json)}`);
  }
  return json;
}

////////////////////////////////////////////////////////////////////////////////
// Сбор и сохранение
////////////////////////////////////////////////////////////////////////////////

// Нормализуем ответ в ваш формат
function normalize(matches) {
  return matches.map(m => ({
    id:       m.match_id,
    status:   m.match_status,
    time:     m.match_time || m.match_date,
    league:   m.league_name,
    homeTeam: {
      id:    m.match_hometeam_id,
      name:  m.match_hometeam_name,
      logo:  m.home_team_logo || null,
      score: m.match_hometeam_score
    },
    awayTeam: {
      id:    m.match_awayteam_id,
      name:  m.match_awayteam_name,
      logo:  m.away_team_logo || null,
      score: m.match_awayteam_score
    }
  }));
}

// Дедупликация и запись в файл
function saveJSON(filename, arr) {
  const uniq = Array.from(new Map(arr.map(m => [m.match_id, m])).values());
  const file = path.join(process.cwd(), 'public', 'data', filename);
  fs.writeFileSync(file, JSON.stringify(normalize(uniq), null, 2));
  console.log(`✅ ${filename}: saved ${uniq.length} items`);
}

(async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const next  = new Date();
    next.setDate(next.getDate() + 7);
    const to    = next.toISOString().split('T')[0];

    const liveAll     = [];
    const todayAll    = [];
    const upcomingAll = [];

    for (const league_id of LEAGUE_IDS) {
      // 1) Live-матчи
      const live = await apiGet({
        action:    'get_live_scores',
        league_id: league_id
      });
      liveAll.push(...live);

      // 2) Сегодня
      const td = await apiGet({
        action:    'get_events',
        league_id: league_id,
        from:      today,
        to:        today
      });
      todayAll.push(...td);

      // 3) Следующая неделя
      const up = await apiGet({
        action:    'get_events',
        league_id: league_id,
        from:      today,
        to:        to
      });
      upcomingAll.push(...up);
    }

    // убедимся, что папка существует
    const dir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    saveJSON('live-matches.json',     liveAll);
    saveJSON('today-matches.json',    todayAll);
    saveJSON('upcoming-matches.json', upcomingAll);

    console.log('⚽ All done!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
