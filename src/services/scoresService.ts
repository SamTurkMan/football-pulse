// src/services/scoresService.ts

import { Match } from '../types/Match';

const API_KEY  = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';
const BASE_URL = 'https://apiv3.apifootball.com/';

async function apiGet(params: Record<string,string>): Promise<any[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('APIkey', API_KEY);
  for (const [k,v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  console.log(`→ GET ${url}`);
  const res  = await fetch(url.toString());
  const body = await res.json();
  if (!Array.isArray(body)) {
    console.warn('⚠️ APIfootball returned non-array:', body);
    return [];
  }
  return body;
}

async function getTurkeyCountryId(): Promise<string> {
  const countries = await apiGet({ action: 'get_countries' });
  const tr = countries.find(c => c.country_name.toLowerCase() === 'turkey');
  if (!tr) throw new Error('Country "Turkey" not found');
  return tr.country_id;
}

async function getLeagueIds(countryId: string): Promise<string[]> {
  const leagues = await apiGet({
    action:     'get_leagues',
    country_id: countryId
  });
  return leagues.map(l => l.league_id);
}

async function buildTeamLogoMap(leagueIds: string[]): Promise<Record<string,string>> {
  const map: Record<string,string> = {};
  for (const lid of leagueIds) {
    const teams = await apiGet({
      action:     'get_teams',
      league_id:  lid
    });
    teams.forEach(t => {
      if (t.team_id && t.team_logo) {
        map[t.team_id] = t.team_logo;
      }
    });
  }
  return map;
}

function normalizeEvent(m: any, logos: Record<string,string>): Match {
  const hid = m.match_hometeam_id.toString();
  const aid = m.match_awayteam_id.toString();
  return {
    id:     m.match_id.toString(),
    status: m.match_status,
    time:   m.match_time || m.match_date,
    league: m.league_name,
    homeTeam: {
      id:    hid,
      name:  m.match_hometeam_name,
      logo:  logos[hid] ?? null,
      score: m.match_hometeam_score
    },
    awayTeam: {
      id:    aid,
      name:  m.match_awayteam_name,
      logo:  logos[aid] ?? null,
      score: m.match_awayteam_score
    }
  };
}

export const fetchFootballScores = async (
  type: 'live' | 'today' | 'upcoming'
): Promise<Match[]> => {
  try {
    // 1) Получаем все лиги Турции
    const countryId = await getTurkeyCountryId();
    const leagues   = await getLeagueIds(countryId);

    // 2) Строим карту team_id → team_logo
    const logoMap = await buildTeamLogoMap(leagues);

    // 3) Определяем даты
    const today = new Date().toISOString().slice(0,10);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const to = nextWeek.toISOString().slice(0,10);

    // 4) Собираем матчи по всем лигам
    const results: Record<string,Match> = {};

    for (const lid of leagues) {
      let events: any[] = [];

      if (type === 'live') {
        events = await apiGet({ action: 'get_live_scores', league_id: lid });
      } else if (type === 'today') {
        events = await apiGet({ action: 'get_events', league_id: lid, from: today, to: today });
      } else { // upcoming
        events = await apiGet({ action: 'get_events', league_id: lid, from: today, to });
      }

      events.forEach(e => {
        const match = normalizeEvent(e, logoMap);
        results[match.id] = match; // убираем дубликаты
      });
    }

    return Object.values(results);
  } catch (err) {
    console.error('Error fetching football scores:', err);
    return [];
  }
};
