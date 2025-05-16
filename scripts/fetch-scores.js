// scripts/fetch-scores.js

const fs    = require('fs');
const path  = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// === Конфиг ===
const API_KEY = process.env.APIFOOTBALL_API_KEY;  // ваш ключ: 88eb6ed5d…
if (!API_KEY) {
  console.error('Error: APIFOOTBALL_API_KEY is not set');
  process.exit(1);
}
const BASE_URL = 'https://apifootball.com/api/';

// === Утилита GET-запросов ===
async function apiGet(params) {
  const url = new URL(BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  console.log(`→ GET ${url}`);
  const res  = await fetch(url);
  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error(`Unexpected APIfootball response: ${JSON.stringify(json)}`);
  }
  return json;
}

// === Шаг 1: узнать country_id для Turkey ===
async function fetchTurkeyCountryId() {
  const countries = await apiGet({ action: 'get_countries', APIkey: API_KEY });
  const tur = countries.find(c => c.country_name.toLowerCase() === 'turkey');
  if (!tur) throw new Error('Country "Turkey" not found in APIfootball response');
  console.log(`Turkey country_id = ${tur.country_id}`);
  return tur.country_id;
}

// === Шаг 2: live-матчи ===
async function fetchLiveMatches(country_id) {
  // метод get_live_scores возвращает все живые матчи
  return apiGet({
    action:     'get_live_scores',
    country_id: country_id,
    APIkey:     API_KEY
  });
}

// === Шаг 3: матчи за указанный период ===
async function fetchMatchesByDate(country_id, from, to) {
  // метод get_events — возвращает и прошедшие, и будущие матчи
  return apiGet({
    action:     'get_events',
    from:       from,
    to:         to,
    country_id: country_id,
    APIkey:     API_KEY
  });
}

// === Нормализация под ваш фронтенд ===
function normalize(matches) {
  return matches.map(m => ({
    id:       m.match_id,
    status:   m.match_status,                    // FT, NS, LIVE...
    time:     m.match_time || m.match_date,      // если live — в match_time; иначе дата
    league:   m.league_name,
    homeTeam: {
      id:    m.match_hometeam_id,
      name:  m.match_hometeam_name,
      logo:  m.home_team_logo,                   // если есть
      score: m.match_hometeam_score
    },
    awayTeam: {
      id:    m.match_awayteam_id,
      name:  m.match_awayteam_name,
      logo:  m.away_team_logo,                   // если есть
      score: m.match_awayteam_score
    }
  }));
}

// === Сохраняем в public/data/ ===
function saveMatches(live, today, upcoming) {
  const dir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    path.join(dir, 'live-matches.json'),
    JSON.stringify(normalize(live), null, 2)
  );
  fs.writeFileSync(
    path.join(dir, 'today-matches.json'),
    JSON.stringify(normalize(today), null, 2)
  );
  fs.writeFileSync(
    path.join(dir, 'upcoming-matches.json'),
    JSON.stringify(normalize(upcoming), null, 2)
  );
  console.log(`✅ Saved: live ${live.length}, today ${today.length}, upcoming ${upcoming.length}`);
}

// === Главная функция ===
(async () => {
  try {
    const country_id = await fetchTurkeyCountryId();

    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const toStr    = nextWeek.toISOString().split('T')[0];

    // параллельно грузим три набора
    const [live, today, upcoming] = await Promise.all([
      fetchLiveMatches(country_id),                                         // Livescore :contentReference[oaicite:0]{index=0}
      fetchMatchesByDate(country_id, todayStr, todayStr),                   // Сегодня
      fetchMatchesByDate(country_id, todayStr, toStr)                       // Следующие 7 дней :contentReference[oaicite:1]{index=1}
    ]);

    saveMatches(live, today, upcoming);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
