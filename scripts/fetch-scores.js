const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const API_KEY = process.env.VITE_FOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Error: VITE_FOOTBALL_API_KEY is not set');
  process.exit(1);
}

const BASE_URL = 'https://v3.football.api-sports.io';
const headers = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': 'v3.football.api-sports.io'
};

const dataDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Live Matches
async function fetchLiveMatches() {
  try {
    console.log('Fetching live matches in Turkey...');
    const res = await fetch(
      `${BASE_URL}/fixtures?live=all&league=39`, // league=39 — Турция, Суперлига
      { headers }
    );
    const json = await res.json();
    if (!json.response) throw new Error('Invalid API response for live');

    return json.response.map(match => ({
      id: match.fixture.id.toString(),
      status: match.fixture.status.short,
      time: `${match.fixture.status.elapsed || 0}`,
      league: match.league.name,
      homeTeam: {
        id: match.teams.home.id.toString(),
        name: match.teams.home.name,
        logo: match.teams.home.logo,
        score: match.goals.home || 0
      },
      awayTeam: {
        id: match.teams.away.id.toString(),
        name: match.teams.away.name,
        logo: match.teams.away.logo,
        score: match.goals.away || 0
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
    console.log('Fetching today\'s matches in Turkey...');
    const date = new Date().toISOString().split('T')[0];
    const res = await fetch(
      `${BASE_URL}/fixtures?date=${date}&league=39`,
      { headers }
    );
    const json = await res.json();
    if (!json.response) throw new Error('Invalid API response for today');

    return json.response.map(match => ({
      id: match.fixture.id.toString(),
      status: match.fixture.status.short,
      time: match.fixture.status.short === 'FT'
        ? 'Full Time'
        : match.fixture.date,
      league: match.league.name,
      homeTeam: {
        id: match.teams.home.id.toString(),
        name: match.teams.home.name,
        logo: match.teams.home.logo,
        score: match.goals.home || 0
      },
      awayTeam: {
        id: match.teams.away.id.toString(),
        name: match.teams.away.name,
        logo: match.teams.away.logo,
        score: match.goals.away || 0
      }
    }));
  } catch (err) {
    console.error('Error fetching today matches:', err);
    return [];
  }
}

// Upcoming Matches (next 7 days)
async function fetchUpcomingMatches() {
  try {
    console.log('Fetching upcoming matches in Turkey...');
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const toDate = nextWeek.toISOString().split('T')[0];

    const res = await fetch(
      `${BASE_URL}/fixtures?from=${today}&to=${toDate}&status=NS&league=39`,
      { headers }
    );
    const json = await res.json();
    if (!json.response) throw new Error('Invalid API response for upcoming');

    return json.response.map(match => ({
      id: match.fixture.id.toString(),
      status: 'Scheduled',
      time: match.fixture.date,
      league: match.league.name,
      homeTeam: {
        id: match.teams.home.id.toString(),
        name: match.teams.home.name,
        logo: match.teams.home.logo,
        score: 0
      },
      awayTeam: {
        id: match.teams.away.id.toString(),
        name: match.teams.away.name,
        logo: match.teams.away.logo,
        score: 0
      }
    }));
  } catch (err) {
    console.error('Error fetching upcoming matches:', err);
    return [];
  }
}

// Save to files
function saveMatchesToFiles(live, today, upcoming) {
  try {
    fs.writeFileSync(
      path.join(dataDir, 'live-matches.json'),
      JSON.stringify(live, null, 2)
    );
    console.log(`✅ Saved ${live.length} live matches`);

    fs.writeFileSync(
      path.join(dataDir, 'today-matches.json'),
      JSON.stringify(today, null, 2)
    );
    console.log(`✅ Saved ${today.length} today's matches`);

    fs.writeFileSync(
      path.join(dataDir, 'upcoming-matches.json'),
      JSON.stringify(upcoming, null, 2)
    );
    console.log(`✅ Saved ${upcoming.length} upcoming matches`);
  } catch (err) {
    console.error('❌ Error saving match data:', err);
  }
}

(async function main() {
  const live = await fetchLiveMatches();
  const today = await fetchTodayMatches();
  const upcoming = await fetchUpcomingMatches();
  saveMatchesToFiles(live, today, upcoming);
  console.log('✅ All Turkish match data updated successfully.');
})();
