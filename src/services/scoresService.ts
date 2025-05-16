// src/services/scoresService.ts

import { Match } from '../types/Match';

const API_KEY = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';  // ← замените на ваш API-ключ
const BASE_URL = 'https://apiv3.apifootball.com/';

async function getTurkeyCountryId(): Promise<string> {
  const url = `${BASE_URL}?action=get_countries&APIkey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`get_countries failed: ${res.status}`);
  const data: Array<{ country_id: string; country_name: string }> = await res.json();
  const turkey = data.find(c => c.country_name.toLowerCase() === 'turkey');
  if (!turkey) throw new Error('Country "Turkey" not found');
  return turkey.country_id;
}

async function getLeagueIds(countryId: string): Promise<string[]> {
  const url = `${BASE_URL}?action=get_leagues&country_id=${countryId}&APIkey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`get_leagues failed: ${res.status}`);
  const data: Array<{ league_id: string }> = await res.json();
  return data.map(l => l.league_id);
}

async function fetchLiveScores(leagueId: string) {
  const url = `${BASE_URL}?action=get_live_scores&league_id=${leagueId}&APIkey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`get_live_scores failed for league ${leagueId}: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchEvents(leagueId: string, from: string, to: string) {
  const url = `${BASE_URL}?action=get_events&league_id=${leagueId}&from=${from}&to=${to}&APIkey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`get_events failed for league ${leagueId}: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function normalizeApifootballEvent(m: any): Match {
  return {
    id:     m.match_id.toString(),
    status: m.match_status,
    time:   m.match_time || m.match_date,
    league: m.league_name,
    homeTeam: {
      id:    m.match_hometeam_id.toString(),
      name:  m.match_hometeam_name,
      logo:  m.home_team_logo || null,
      score: m.match_hometeam_score
    },
    awayTeam: {
      id:    m.match_awayteam_id.toString(),
      name:  m.match_awayteam_name,
      logo:  m.away_team_logo || null,
      score: m.match_awayteam_score
    }
  };
}

export const fetchFootballScores = async (
  type: 'live' | 'today' | 'upcoming'
): Promise<Match[]> => {
  try {
    const countryId = await getTurkeyCountryId();
    const leagues   = await getLeagueIds(countryId);

    const today = new Date().toISOString().split('T')[0];
    const next  = new Date();
    next.setDate(next.getDate() + 7);
    const to    = next.toISOString().split('T')[0];

    const resultsMap: Record<string, Match> = {};

    for (const leagueId of leagues) {
      let events: any[] = [];

      if (type === 'live' || type === 'today' || type === 'upcoming') {
        if (type === 'live') {
          events = await fetchLiveScores(leagueId);
        } else if (type === 'today') {
          events = await fetchEvents(leagueId, today, today);
        } else { // upcoming
          events = await fetchEvents(leagueId, today, to);
        }
      }

      for (const e of events) {
        const match = normalizeApifootballEvent(e);
        resultsMap[match.id] = match;  // dedupe by match_id
      }
    }

    return Object.values(resultsMap);
  } catch (err) {
    console.error('Error fetching football scores:', err);
    return [];
  }
};
