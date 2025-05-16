import { Match } from '../types/Match';

const API_KEY = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';
const BASE_URL = 'https://apiv3.apifootball.com/';

const formatMatchTime = (date: string, time: string) => {
  const matchDateTime = new Date(`${date} ${time}`);
  const now = new Date();
  const diffInMinutes = Math.floor((matchDateTime.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffInMinutes > 0 && diffInMinutes <= 120) {
    return `${diffInMinutes} dk sonra`;
  }
  
  return time;
};

export const fetchFootballScores = async (type: 'live' | 'today' | 'upcoming'): Promise<Match[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let endpoint = '';

    switch (type) {
      case 'live':
        endpoint = `?action=get_events&match_live=1&APIkey=${API_KEY}`;
        break;
      case 'today':
        endpoint = `?action=get_events&from=${today}&to=${today}&APIkey=${API_KEY}`;
        break;
      case 'upcoming':
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const toDate = nextWeek.toISOString().split('T')[0];
        endpoint = `?action=get_events&from=${today}&to=${toDate}&APIkey=${API_KEY}`;
        break;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid API response');
    }

    const matches = data.map((match: any) => {
      const matchTime = formatMatchTime(match.match_date, match.match_time);
      
      return {
        id: match.match_id,
        status: match.match_status || 'NS',
        time: matchTime,
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
        },
        date: match.match_date,
        startsIn: match.match_status === '' ? matchTime : undefined
      };
    });

    // Sort matches by priority and limit to 10
    return matches
      .sort((a, b) => {
        // Live matches first
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
        if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;

        // Then matches starting soon
        if (a.startsIn?.includes('dk sonra') && !b.startsIn?.includes('dk sonra')) return -1;
        if (b.startsIn?.includes('dk sonra') && !a.startsIn?.includes('dk sonra')) return 1;

        // Then upcoming matches
        if (a.status === 'NS' && b.status === 'FT') return -1;
        if (b.status === 'NS' && a.status === 'FT') return 1;

        // Sort by time for same status
        const timeA = new Date(`${a.date} ${a.time}`).getTime();
        const timeB = new Date(`${b.date} ${b.time}`).getTime();
        return timeA - timeB;
      })
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching football scores:', error);
    return [];
  }
};