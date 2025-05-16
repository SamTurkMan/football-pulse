// src/services/scoresService.ts

import { Match } from '../types/Match';

const API_KEY  = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';
const BASE_URL = 'https://apiv3.apifootball.com/';

// Универсальная обёртка для GET-запроса
async function apiGet(params: Record<string,string>): Promise<any[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('APIkey', API_KEY);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const res  = await fetch(url.toString());
  const body = await res.json();
  if (!Array.isArray(body)) return [];
  return body;
}

// Парсим строку "YYYY-MM-DD HH:mm:ss" в JS-Date (UTC)
function parseMatchDate(str: string): Date {
  // Добавляем "Z", чтобы JS понял как UTC
  return new Date(str.replace(' ', 'T') + 'Z');
}

// Форматируем дату/время на выходе
function formatDate(dt: Date) {
  return {
    date: dt.toLocaleDateString('tr-TR', {
      day:   'numeric',
      month: 'long',
      year:  'numeric'
    }),
    time: dt.toLocaleTimeString('tr-TR', {
      hour:   '2-digit',
      minute: '2-digit'
    })
  };
}

// Вычисляем «через сколько» матч начнётся или идёт
function computeStartsIn(dt: Date, status: string): string {
  const now = new Date();
  if (status === 'LIVE')     return 'LIVE';
  if (status === 'FT')       return 'Finished';
  const diffMs = dt.getTime() - now.getTime();
  if (diffMs <= 0)           return 'Starting soon';
  const diffMin = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

// Нормализация одного события из APIfootball в Match
function normalizeEvent(m: any): Match {
  const matchDt = parseMatchDate(m.match_date);                     // JS Date
  const { date, time } = formatDate(matchDt);                      // formatted
  const startsIn = computeStartsIn(matchDt, m.match_status);       // relative

  return {
    id:       m.match_id.toString(),
    status:   m.match_status,   // e.g. 'NS', 'LIVE', 'FT'
    date,                       // "16 Mayıs 2025"
    time,                       // "15:30"
    startsIn,                   // "in 2h 15m" or "LIVE"/"Finished"
    league:   m.league_name,
    homeTeam: {
      id:     m.match_hometeam_id.toString(),
      name:   m.match_hometeam_name,
      logo:   m.home_team_logo || null,
      score:  m.match_hometeam_score
    },
    awayTeam: {
      id:     m.match_awayteam_id.toString(),
      name:   m.match_awayteam_name,
      logo:   m.match_awayteam_logo || null,
      score:  m.match_awayteam_score
    }
  };
}

export const fetchFootballScores = async (
  type: 'live' | 'today' | 'upcoming'
): Promise<Match[]> => {
  try {
    // Даты для «today»/«upcoming»
    const today = new Date().toISOString().slice(0,10);
    const next  = new Date(); next.setDate(next.getDate() + 7);
    const to    = next.toISOString().slice(0,10);

    // Строим запрос по type
    let params: Record<string,string>;
    switch (type) {
      case 'live':
        params = { action:'get_live_scores', live:'all' };
        break;
      case 'today':
        params = { action:'get_events', date: today };
        break;
      case 'upcoming':
        params = { action:'get_events', from: today, to, status:'NS' };
        break;
    }

    // Запрашиваем данные
    const raw: any[] = await apiGet(params);

    // Нормализуем всё в Match[] с точной датой/временем/startsIn
    const matches = raw.map(normalizeEvent);

    return matches;
  } catch (err) {
    console.error('Error fetching football scores:', err);
    return [];
  }
};
