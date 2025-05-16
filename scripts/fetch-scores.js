// fetch-scores.js
const fs    = require('fs');
const path  = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const API_KEY = process.env.VITE_FOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Error: VITE_FOOTBALL_API_KEY is not set');
  process.exit(1);
}

const BASE_URL = 'https://v3.football.api-sports.io';
// Правильные заголовки для API-Sports v3:
const headers = {
  'Content-Type':     'application/json',
  'x-apisports-key':  API_KEY,                         // обязательный заголовок :contentReference[oaicite:0]{index=0}
  'x-rapidapi-host':  'v3.football.api-sports.io'       // только если вы подключаетесь через RapidAPI
};

// Вспомогательная функция для GET-запросов с логированием
async function apiGet(pathname) {
  const url = `${BASE_URL}${pathname}`;
  console.log(`→ GET ${url}`);
  const res = await fetch(url, { headers });
  console.log(`← ${res.status} ${res.statusText}`);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${JSON.stringify(body)}`);
  }
  return body.response || [];
}

// Живые матчи по всей Турции
async function fetchLiveMatches() {
  return await apiGet('/fixtures?live=all&country=Turkey');
}

// Матчи сегодня по Турции
async function fetchTodayMatches() {
  const date = new Date().toISOString().split('T')[0];
  return await apiGet(`/fixtures?date=${date}&country=Turkey`);
}

// Предстоящие матчи (следующие 7 дней) по Турции
async function fetchUpcomingMatches() {
  const today = new Date().toISOString().split('T')[0];
  const next  = new Date(); next.setDate(next.getDate() + 7);
  const to    = next.toISOString().split('T')[0];
  return await apiGet(`/fixtures?from=${today}&to=${to}&status=NS&country=Turkey`);
}

// Приводим данные к нужному формату
function normalize(matches) {
  return matches.map(m => ({
    id:       `${m.fixture.id}`,
    status:   m.fixture.status.short,
    time:     m.fixture.status.short === 'FT'
               ? 'Full Time'
               : (m.fixture.status.elapsed != null
                  ? `${m.fixture.status.elapsed}'`
                  : m.fixture.date),
    league:   m.league.name,
    homeTeam: {
      id:    `${m.teams.home.id}`,
      name:  m.teams.home.name,
      logo:  m.teams.home.logo,
      score: m.goals.home || 0
    },
    awayTeam: {
      id:    `${m.teams.away.id}`,
      name:  m.teams.away.name,
      logo:  m.teams.away.logo,
      score: m.goals.away || 0
    }
  }));
}

// Сохраняем JSON-файлы в public/data/
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

  console.log(
    `✅ Saved: live ${live.length}, today ${today.length}, upcoming ${upcoming.length}`
  );
}

// Главная функция
(async () => {
  try {
    const live     = await fetchLiveMatches();
    const today    = await fetchTodayMatches();
    const upcoming = await fetchUpcomingMatches();
    saveMatches(live, today, upcoming);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
