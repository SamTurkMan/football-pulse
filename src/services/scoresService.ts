// src/services/scoresService.ts

import { Match } from '../types/Match';

const API_KEY  = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';
const BASE_URL = 'https://apiv3.apifootball.com/';

/**
 * Универсальный GET-запрос к APIfootball.com.
 * Если API вернул не-массив или ошибку — возвращает пустой массив.
 */
async function apiGet(params: Record<string,string>): Promise<any[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('APIkey', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res  = await fetch(url.toString());
  const body = await res.json();
  return Array.isArray(body) ? body : [];
}

/** Парсит строку "YYYY-MM-DD HH:mm:ss" в UTC-Date */
function parseMatchDate(str: string): Date {
  return new Date(str.replace(' ', 'T') + 'Z');
}

/** Форматирует дату и время для турецкой локали */
function formatDate(dt: Date) {
  return {
    date: dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  };
}

/** Вычисляет «in 2h 15m», «LIVE» или «Finished» */
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

/** Нормализует «сырое» событие API в объект Match */
function normalizeEvent(m: any): Match {
  const matchDt        = parseMatchDate(m.match_date);
  const { date, time } = formatDate(matchDt);
  const startsIn       = computeStartsIn(matchDt, m.match_status);

  return {
    id:       m.match_id.toString(),
    status:   m.match_status,   // NS | LIVE | FT
    date,                       // "16 Mayıs 2025"
    time,                       // "15:30"
    startsIn,                   // "in 2h 5m", "LIVE" или "Finished"
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
 * Возвращает:
 *  - при type='live'     — все LIVE-матчи;
 *  - при type='upcoming' — до 10 ближайших ближайших NS-матчей.
 */
export const fetchFootballScores = async (
  type: 'live' | 'upcoming'
): Promise<Match[]> => {
  try {
    // Параметры запроса
    let params: Record<string,string>;
    if (type === 'live') {
      params = { action: 'get_live_scores', live: 'all' };
    } else {
      // upcoming: берем только NS-матчи следующих 7 дней,
      // но отсечем список до 10 первых по дате
      const from = new Date().toISOString().slice(0,10);
      const toDt = new Date();
      toDt.setDate(toDt.getDate() + 7);
      const to = toDt.toISOString().slice(0,10);

      params = { action: 'get_events', from, to, status: 'NS' };
    }

    // Запрашиваем «сырые» данные
    let raw = await apiGet(params);

    // Фильтрация по LIVE (если нужно)
    if (type === 'live') {
      raw = raw.filter(m => m.match_status === 'LIVE');
    }

    // Сортируем и обрезаем до 10 для upcoming
    if (type === 'upcoming') {
      raw = raw
        .filter(m => m.match_status === 'NS')
        .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
        .slice(0, 10);
    }

    // Нормализуем и возвращаем Match[]
    return raw.map(normalizeEvent);
  } catch (err) {
    console.error('Error fetching football scores:', err);
    return [];
  }
};
