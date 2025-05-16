const fs   = require('fs');
const path = require('path');
const fetch= require('node-fetch');
require('dotenv').config();

const API_KEY = process.env.VITE_FOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Error: VITE_FOOTBALL_API_KEY is not set');
  process.exit(1);
}

const BASE_URL = 'https://v3.football.api-sports.io';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`
};

const dataDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Универсальная функция для запросов с логом
async function apiGet(pathname) {
  const url = `${BASE_URL}${pathname}`;
  console.log('→ GET', url);
  const res = await fetch(url, { headers });
  console.log(`← Status ${res.status} ${res.statusText}`);
  const body = await res.json();
  console.log('← Body keys:', Object.keys(body));
  if (!res.ok) throw new Error(`API error ${res.status}: ${JSON.stringify(body)}`);
  return body.response || [];
}

// Live Matches
async function fetchLiveMatches() {
  try {
    const items = await apiGet('/fixtures?live=all&league=39');
    return items.map(m => ({
      id:     m.fixture.id.toString(),
      status: m.fixture.status.short,
      time:   `${m.fixture.status.elapsed || 0}`,
      league: m.league.name,
      homeTeam: {
        id:    m.teams.home.id.toString(),
        name:  m.teams.home.name,
        logo:  m.teams.home.logo,
        score: m.goals.home || 0
      },
      awayTeam: {
        id:    m.teams.away.id.toString(),
        name:  m.teams.away.name,
        logo:  m.teams.away.logo,
        score: m.goals.away || 0
      }
    }));
  } catch (err) {
    console.error('Error fetching live matches:', err);
    return [];
  }
}

// Today's Matches
async function fetchTodayMatches() {
  try {
    const date = new Date().toISOString().split('T')[0];
    const items = await apiGet(`/fixtures?date=${date}&league=39`);
    return items.map(m => ({
      id:     m.fixture.id.toString(),
      status: m.fixture.status.short,
      time:   m.fixture.status.short === 'FT' ? 'Full Time' : m.fixture.date,
      league: m.league.name,
      homeTeam: { id: `${m.teams.home.id}`, name: m.teams.home.name, logo: m.teams.home.logo, score: m.goals.home || 0 },
      awayTeam: { id: `${m.teams.away.id}`, name: m.teams.away.name, logo: m.teams.away.logo, score: m.goals.away || 0 }
    }));
  } catch (err) {
    console.error('Error fetching today matches:', err);
    return [];
  }
}

// Upcoming Matches
async function fetchUpcomingMatches() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const next  = new Date(); next.setDate(next.getDate() + 7);
    const to    = next.toISOString().split('T')[0];
    const items = await apiGet(`/fixtures?from=${today}&to=${to}&status=NS&league=39`);
    return items.map(m => ({
      id:     m.fixture.id.toString(),
      status: 'Scheduled',
      time:   m.fixture.date,
      league: m.league.name,
      homeTeam: { id: `${m.teams.home.id}`, name: m.teams.home.name, logo: m.teams.home.logo, score: 0 },
      awayTeam: { id: `${m.teams.away.id}`, name: m.teams.away.name, logo: m.teams.away.logo, score: 0 }
    }));
  } catch (err) {
    console.error('Error fetching upcoming matches:', err);
    return [];
  }
}

// Сохраняем JSON-файлы
function saveMatches(live, today, upcoming) {
  try {
    fs.writeFileSync(path.join(dataDir, 'live-matches.json'),     JSON.stringify(live,     null, 2));
    fs.writeFileSync(path.join(dataDir, 'today-matches.json'),    JSON.stringify(today,    null, 2));
    fs.writeFileSync(path.join(dataDir, 'upcoming-matches.json'), JSON.stringify(upcoming, null, 2));
    console.log('✅ Matches saved:', live.length, today.length, upcoming.length);
  } catch (err) {
    console.error('Error saving match data:', err);
  }
}

(async () => {
  const live     = await fetchLiveMatches();
  const today    = await fetchTodayMatches();
  const upcoming = await fetchUpcomingMatches();
  saveMatches(live, today, upcoming);
})();
