// src/services/scoresService.ts

import { Match } from '../types/Match';

const API_KEY  = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';
const BASE_URL = 'https://apiv3.apifootball.com/';

/** Универсальный GET → [] при ошибке */
async function apiGet(params: Record<string,string>): Promise<any[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('APIkey', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res  = await fetch(url.toString());
  const body = await res.json();
  return Array.isArray(body) ? body : [];
}

/** Парсинг "YYYY-MM-DD HH:mm:ss" → JS Date */
function parseMatchDate(str: string): Date {
  return new Date(str.replace(' ', 'T') + 'Z');
}

/** Локализация даты и времени для Турции */
function formatDate(dt: Date) {
  return {
    date: dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: dt.toLocaleTimeString(  'tr-TR', { hour: '2-digit', minute: '2-digit' })
  };
}

/** «Через сколько» или LIVE/Finished */
function computeStartsIn(dt: Date, status: string): string {
  const now = new Date();
  if (status === 'LIVE') return 'LIVE';
  if (status === 'FT')   return 'Finished';
  const diffMs  = dt.getTime() - now.getTime();
  if (diffMs <= 0)        return 'Starting soon';
  const diffMin = Math.floor(diffMs/60000);
  const h       = Math.floor(diffMin/60);
  const m       = diffMin % 60;
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

/** Нормализация одного объекта API → Match */
function normalizeEvent(m: any): Match {
  const matchDt      = parseMatchDate(m.match_date);
  const { date, time } = formatDate(matchDt);
  const startsIn     = computeStartsIn(matchDt, m.match_status);

  return {
    id:       m.match_id.toString(),
    status:   m.match_status,   // NS | LIVE | FT
    date,                       // например "16 Mayıs 2025"
    time,                       // например "15:30"
    startsIn,                   // например "in 2h 5m" | "LIVE" | "Finished"
    league:   m.league_name,
    homeTeam: {
      id:     m.match_hometeam_id  .toString(),
      name:   m.match_hometeam_name,
      logo:   m.match_hometeam_logo ?? null,
      score:  m.match_hometeam_score
    },
    awayTeam: {
      id:     m.match_awayteam_id  .toString(),
      name:   m.match_awayteam_name,
      logo:   m.match_awayteam_logo ?? null,
      score:  m.match_awayteam_score
    }
  };
}

/**
 * Возвращает массив сегодня или live-матчей.
 * - 'live'  — все живые игры
 * - 'today' — все матчи с date = сегодня (NS или LIVE)
 */
export const fetchFootballScores = async (
  type: 'live' | 'today'
): Promise<Match[]> => {
  try {
    // Текущая дата в формате YYYY-MM-DD
    const today = new Date().toISOString().slice(0,10);

    // Выбираем endpoint
    const params =
      type === 'live'
        ? { action: 'get_live_scores', live: 'all' }
        : { action: 'get_events',     date: today };

    // Запрос и нормализация
    const raw     = await apiGet(params);
    const matches = raw.map(normalizeEvent);

    return matches;
  } catch (err) {
    console.error('Error fetching football scores:', err);
    return [];
  }
};
