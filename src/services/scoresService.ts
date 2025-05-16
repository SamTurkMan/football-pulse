// src/services/scoresService.ts

import { Match } from '../types/Match';

const API_KEY  = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';
const BASE_URL = 'https://apiv3.apifootball.com/';

/** Универсальный GET → [] при ошибке или не-массиве */
async function apiGet(params: Record<string,string>): Promise<any[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('APIkey', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res  = await fetch(url.toString());
  const body = await res.json();
  return Array.isArray(body) ? body : [];
}

/** Парсит "YYYY-MM-DD HH:mm:ss" в UTC Date */
function parseMatchDate(str: string): Date {
  return new Date(str.replace(' ', 'T') + 'Z');
}

/** Форматирует Date → { date, time } для турецкой локали */
function formatDate(dt: Date): { date: string; time: string } {
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

/** Вычисляет "LIVE"/"Finished"/"in Xh Ym"/"Starting soon" */
function computeStartsIn(dt: Date, status: string): string {
  const now = new Date();
  if (status === 'LIVE') return 'LIVE';
  if (status === 'FT')   return 'Finished';

  const diffMs  = dt.getTime() - now.getTime();
  if (diffMs <= 0)        return 'Starting soon';

  const diffMin = Math.floor(diffMs / 60000);
  const h       = Math.floor(diffMin / 60);
  const m       = diffMin % 60;
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

/** Преобразует «сырое» событие API в объект Match */
function normalizeEvent(m: any): Match {
  const dt = parseMatchDate(m.match_date);
  const { date, time } = formatDate(dt);
  const startsIn       = computeStartsIn(dt, m.match_status);

  return {
    id:       m.match_id.toString(),
    status:   m.match_status,   // "NS" | "LIVE" | "FT"
    date,                       // "16 Mayıs 2025"
    time,                       // "15:30"
    startsIn,                   // "in 2h 5m" | "LIVE" | "Finished"
    league:   m.league_name,
    homeTeam: {
      id:    m.match_hometeam_id  .toString(),
      name:  m.match_hometeam_name,
      logo:  m.match_hometeam_logo ?? null,
      score: m.match_hometeam_score
    },
    awayTeam: {
      id:    m.match_awayteam_id  .toString(),
      name:  m.match_awayteam_name,
      logo:  m.match_awayteam_logo ?? null,
      score: m.match_awayteam_score
    }
  };
}

/**
 * Возвращает Match[] для:
 *  - 'live'     — только LIVE-матчи
 *  - 'today'    — матчи на сегодня (NS + LIVE)
 *  - 'upcoming' — до 10 ближайших NS-матчей
 */
export async function fetchFootballScores(
  type: 'live' | 'today' | 'upcoming'
): Promise<Match[]> {
  try {
    const today = new Date().toISOString().slice(0,10);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 7);
    const to = toDate.toISOString().slice(0,10);

    let params: Record<string,string>;

    if (type === 'live') {
      params = { action:'get_live_scores', live:'all' };
    } else if (type === 'today') {
      params = { action:'get_events', date: today };
    } else {
      params = { action:'get_events', from: today, to, status:'NS' };
    }

    let raw = await apiGet(params);

    if (type === 'live') {
      raw = raw.filter((m:any) => m.match_status === 'LIVE');
    }
    if (type === 'today') {
      raw = raw.filter((m:any) => ['NS','LIVE'].includes(m.match_status));
    }
    if (type === 'upcoming') {
      raw = raw
        .filter((m:any) => m.match_status === 'NS')
        .sort((a:any,b:any) =>
          parseMatchDate(a.match_date).getTime() -
          parseMatchDate(b.match_date).getTime()
        )
        .slice(0,10);
    }

    return raw.map(normalizeEvent);
  } catch (err) {
    console.error('Error fetching football scores:', err);
    return [];
  }
}
