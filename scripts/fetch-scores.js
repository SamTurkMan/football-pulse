// fetch-scores.js

const fs    = require('fs');
const path  = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// ------------------- Конфиг -------------------

const API_KEY = process.env.VITE_FOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Error: VITE_FOOTBALL_API_KEY is not set');
  process.exit(1);
}

const BASE_URL = 'https://v3.football.api-sports.io';
const headers = {
  'Content-Type':     'application/json',
  'x-apisports-key':  API_KEY,
  'x-rapidapi-host':  'v3.football.api-sports.io'
};

// Теперь просто текущий год
const season = new Date().getFullYear().toString();
console.log(`Using season=${season}`);

// ------------------- Утилиты -------------------

async function apiGet(pathname) {
  const url = `${BASE_URL}${pathname}`;
  console.log(`→ GET ${url}`);
  const res = await fetch(url, { headers });
  console.log(`← ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (!res.ok) throw new Error(`API error ${res.status}: ${JSON.stringify(json)}`);
  return json.response || [];
}

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

// ------------------- Основной процесс -------------------

(async () => {
  try {
    // 1) Получаем все лиги Турции
    const leaguesData = await apiGet('/leagues?country=Turkey');
    const leagueIds   = leaguesData.map(l => l.league.id);
    console.log(`Found ${leagueIds.length} Turkish leagues:`, leagueIds);

    // 2) Сбор матчей: live, today, upcoming
    const [live, today, upcoming] = await Promise.all([
      apiGet(`/fixtures?league=${leagueIds.join(',')}&season=${season}&live=all`),
      apiGet(`/fixtures?league=${leagueIds.join(',')}&season=${season}&date=${new Date().toISOString().split('T')[0]}`),
      apiGet(`/fixtures?league=${leagueIds.join(',')}&season=${season}&from=${new Date().toISOString().split('T')[0]}&to=${(() => { 
        const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().split('T')[0];
      })()}&status=NS`)
    ]);

    saveMatches(live, today, upcoming);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
