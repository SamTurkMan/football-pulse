import { Match } from '../types/Match';

const API_KEY = '218e4acb828df0cd78122b1e83678aa4';
const BASE_URL = 'https://v3.football.api-sports.io';

const headers = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': 'v3.football.api-sports.io'
};

export const fetchFootballScores = async (type: 'live' | 'today' | 'upcoming'): Promise<Match[]> => {
  try {
    let endpoint = '';
    const date = new Date().toISOString().split('T')[0];

    switch (type) {
      case 'live':
        endpoint = '/fixtures?live=all';
        break;
      case 'today':
        endpoint = `/fixtures?date=${date}`;
        break;
      case 'upcoming':
        // Get matches for next 7 days
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const toDate = nextWeek.toISOString().split('T')[0];
        endpoint = `/fixtures?from=${date}&to=${toDate}&status=NS`;
        break;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    const data = await response.json();

    if (!data.response) {
      throw new Error('Invalid API response');
    }

    return data.response.map((match: any) => ({
      id: match.fixture.id.toString(),
      status: match.fixture.status.short,
      time: match.fixture.status.elapsed ? `${match.fixture.status.elapsed}'` : match.fixture.date,
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
    console.error('Error fetching football scores:', error);
    return [];
  }
};