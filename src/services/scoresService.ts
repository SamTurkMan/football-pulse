import { Match } from '../types/Match';

// Turkish leagues IDs
const TURKISH_LEAGUES = [
  '322', // Süper Lig
  '319', // 1. Lig
  '318', // 2. Lig
  '321', // 3. Lig
  '320', // Turkish Cup
  '323'  // Super Cup
];

const API_KEY = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';
const BASE_URL = 'https://apiv3.apifootball.com';

const formatMatchTime = (date: string, time: string) => {
  const matchDateTime = new Date(`${date} ${time}`);
  const now = new Date();
  
  // Format date
  const formattedDate = matchDateTime.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long'
  });
  
  // Format time
  const formattedTime = matchDateTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  return {
    date: formattedDate,
    time: formattedTime
  };
};

export const fetchFootballScores = async (type: 'live' | 'today' | 'upcoming'): Promise<Match[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let endpoint = '';

    switch (type) {
      case 'live':
        endpoint = `/?action=get_events&match_live=1&league_id=${TURKISH_LEAGUES.join(',')}&APIkey=${API_KEY}`;
        break;
      case 'today':
        endpoint = `/?action=get_events&from=${today}&to=${today}&league_id=${TURKISH_LEAGUES.join(',')}&APIkey=${API_KEY}`;
        break;
      case 'upcoming':
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const toDate = nextWeek.toISOString().split('T')[0];
        endpoint = `/?action=get_events&from=${today}&to=${toDate}&league_id=${TURKISH_LEAGUES.join(',')}&APIkey=${API_KEY}`;
        break;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.log('Invalid API response format');
      return [];
    }

    return data.map((match: any) => ({
      id: match.match_id,
      status: match.match_status === '' ? 'NS' : match.match_status,
      time: match.match_status === '' ? match.match_time : match.match_status,
      date: match.match_date,
      league: match.league_name,
      homeTeam: {
        id: match.match_hometeam_id,
        name: match.match_hometeam_name,
        logo: null,
        score: parseInt(match.match_hometeam_score) || 0
      },
      awayTeam: {
        id: match.match_awayteam_id,
        name: match.match_awayteam_name,
        logo: null,
        score: parseInt(match.match_awayteam_score) || 0
      }
    })).sort((a: Match, b: Match) => {
      // Live matches first
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
      return 0;
    });

  } catch (error) {
    console.error('Error fetching football scores:', error);
    return [];
  }
};