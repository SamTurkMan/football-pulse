import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const API_KEY = process.env.VITE_FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

const headers = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': 'v3.football.api-sports.io'
};

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function fetchLiveMatches() {
  try {
    console.log('Fetching live matches...');
    const response = await fetch(`${BASE_URL}/fixtures?live=all`, { headers });
    const data = await response.json();

    if (!data.response) {
      throw new Error('Invalid API response');
    }

    return data.response.map(match => ({
      id: match.fixture.id.toString(),
      status: match.fixture.status.short,
      time: `${match.fixture.status.elapsed}'`,
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
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

async function fetchTodayMatches() {
  try {
    console.log('Fetching today\'s matches...');
    const date = new Date().toISOString().split('T')[0];
    const response = await fetch(`${BASE_URL}/fixtures?date=${date}`, { headers });
    const data = await response.json();

    if (!data.response) {
      throw new Error('Invalid API response');
    }

    return data.response.map(match => ({
      id: match.fixture.id.toString(),
      status: match.fixture.status.short,
      time: match.fixture.status.short === 'FT' ? 'Full Time' : match.fixture.date,
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
  } catch (error) {
    console.error('Error fetching today\'s matches:', error);
    return [];
  }
}

async function fetchUpcomingMatches() {
  try {
    console.log('Fetching upcoming matches...');
    const date = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const toDate = nextWeek.toISOString().split('T')[0];
    
    const response = await fetch(
      `${BASE_URL}/fixtures?from=${date}&to=${toDate}&status=NS`,
      { headers }
    );
    const data = await response.json();

    if (!data.response) {
      throw new Error('Invalid API response');
    }

    return data.response.map(match => ({
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
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }
}

function saveMatchesToFiles(liveMatches, todayMatches, upcomingMatches) {
  try {
    fs.writeFileSync(
      path.join(dataDir, 'live-matches.json'), 
      JSON.stringify(liveMatches, null, 2)
    );
    console.log(`Saved ${liveMatches.length} live matches`);
    
    fs.writeFileSync(
      path.join(dataDir, 'today-matches.json'), 
      JSON.stringify(todayMatches, null, 2)
    );
    console.log(`Saved ${todayMatches.length} today's matches`);
    
    fs.writeFileSync(
      path.join(dataDir, 'upcoming-matches.json'), 
      JSON.stringify(upcomingMatches, null, 2)
    );
    console.log(`Saved ${upcomingMatches.length} upcoming matches`);
  } catch (error) {
    console.error('Error saving matches to files:', error);
  }
}

async function main() {
  try {
    const liveMatches = await fetchLiveMatches();
    const todayMatches = await fetchTodayMatches();
    const upcomingMatches = await fetchUpcomingMatches();
    
    saveMatchesToFiles(liveMatches, todayMatches, upcomingMatches);
    console.log('Match data processing completed successfully.');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main();