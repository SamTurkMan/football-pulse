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
const headers = {
  'Content-Type':     'application/json',
  'x-apisports-key':  API_KEY,
  'x-rapidapi-host':  'v3.football.api-sports.io'
};

// Утилита для GET-запросов с логированием
async function apiGet(pathname) {
  const url = `${BASE_URL}${pathname}`;
  console.log(`→ GET ${url}`);
  const res = await fetch(url, { headers });
  console.log(`← ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${JSON.stringify(json)}`);
  }
  return json.response || [];
}

// 1) Получаем список всех лиг Турции
async function fetchLeaguesForCountry(country = 'Turkey') {
  try {
    const data = await apiGet(`/leagues?country=${encodeURIComponent(country)}`);
    const ids  = data.map(item => item.league.id);
    console.log(`Found ${ids.length} leagues in ${country}:`, ids);
    return ids;
  } catch (err) {
    console.error('Error fetching leagues:', err);
    return [];
  }
}

// 2) Универсальная функция: для списка leagueIds запрашиваем указанный endpointTemplate
//    endpointTemplate — строка с {league}, например '/fixtures?live=all&league={league}'
async function fetchFixturesByLeagues(endpointTemplate, leagueIds) {
  const all = [];
  for (const id of leagueIds) {
    try {
      const path = endpointTemplate.replace('{league}', id);
      const fixtures = await apiGet(path);
      console.log(` → League ${id} returned ${fixtures.length} items`);
      all.push(...fixtures);
    } catch (err) {
      console.error(`Error fetching fixtures for league ${id}:`, err);
    }
  }
  return all;
}

// 3) Собираем живые матчи
async function fetchLiveMatches(leagueIds) {
  return fetchFixturesByLeagues('/fixtures?live=all&league={league}', leagueIds);
}

// 4) Собираем матчи за сегодня
async function fetchTodayMatches(leagueIds) {
  const date = new Date().toISOString().split('T')[0];
  return fetchFixturesByLeagues(`/fixtures?date=${date}&league={league}`, leagueIds);
}

// 5) Собираем предстоящие матчи на следующую неделю
async function fetchUpcomingMatches(leagueIds) {
  const today = new Date().toISOString().split('T')[0];
  const next  = new Date(); next.setDate(next.getDate() + 7);
  const to    = next.toISOString().split('T')[0];
  return fetchFixturesByLeagues(
    `/fixtures?from=${today}&to=${to}&status=NS&league={league}`,
    leagueIds
  );
}

// 6) Приводим каждый match к чистому JSON
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

// 7) Сохраняем всё в public/data/
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

// Запускаем весь процесс
(async () => {
  try {
    const leagueIds = await fetchLeaguesForCountry('Turkey');
    if (!leagueIds.length) {
      console.log('No Turkish leagues found — exiting.');
      return;
    }

    const [live, today, upcoming] = await Promise.all([
      fetchLiveMatches(leagueIds),
      fetchTodayMatches(leagueIds),
      fetchUpcomingMatches(leagueIds)
    ]);

    saveMatches(live, today, upcoming);
  } catch (err) {
    console.error('Fatal error in main():', err);
    process.exit(1);
  }
})();
