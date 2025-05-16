// src/services/scoresService.ts

import { Match } from '../types/Match';

const API_KEY  = '88eb6ed5d5aa074ac758f707e5a42e152e401d052f03bd95caf03e41e05a1872';
const BASE_URL = 'https://apiv3.apifootball.com/';

/** Универсальная обёртка для GET → [] при ошибке или не-массиве */
async function apiGet(params: Record<string,string>): Promise<any[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('APIkey', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res  = await fetch(url.toString());
  const body = await res.json();
  return Array.isArray(body) ? body : [];
}

/** Парсит строку "YYYY-MM-DD HH:mm:ss" в UTC-Date */
function parseMatchDate(str: string): Date {
  return new Date(str.replace(' ', 'T') + 'Z');
}

/** Форматирует дату/время для турецкой локали */
function formatDate(dt: Date) {
  return {
    date: dt.toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' }),
    time: dt.toLocaleTimeString(  'tr-TR', { hour:'2-digit', minute:'2-digit' })
  };
}

/** Вычисляет “in 2h 15m” или “LIVE”/“Finished” */
function computeStartsIn(dt: Date, status: string): string {
  const now = new Date();
  if (status === 'LIVE') return 'LIVE';
  if (status === 'FT')   return 'Finished';
  const diff = dt.getTime() - now.getTime();
  if (diff <= 0)          return 'Starting soon';
  const mins = Math.floor(diff/60000);
  const h    = Math.floor(mins/60);
  const m    = mins % 60;
  return h>0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

/** Нормализуем “сырой” объект из API в Match */
function normalizeEvent(m: any): Match {
  // 1) Сначала парсим дату матча
  const matchDt = parseMatchDate(m.match_date);

  // 2) Форматируем её в date/time
  const { date, time } = formatDate(matchDt);

  // 3) Вычисляем, через сколько начнётся или текущий статус
  const startsIn = computeStartsIn(matchDt, m.match_status);

  // 4) Возвращаем объект Match
  return {
    id:       m.match_id.toString(),
    status:   m.match_status,  // ‘NS’ | ‘LIVE’ | ‘FT’
    date,                      // e.g. “16 Mayıs 2025”
    time,                      // e.g. “15:30”
    startsIn,                  // e.g. “in 2h 5m” | “LIVE” | “Finished”
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
 * Функция для получения матчей:
 * - 'live'     — только LIVE-матчи
 * - 'upcoming' — до 10 ближайших NS-матчей
 */
export const fetchFootballScores = async (
  type: 'live' | 'upcoming'
): Promise<Match[]> => {
  try {
    let params: Record<string,string>;

    if (type === 'live') {
      params = { action:'get_live_scores', live:'all' };
    } else {
      // upcoming: NS-матчи на ближайшие 7 дней, берём первые 10
      const from = new Date().toISOString().slice(0,10);
      const toDt = new Date(); toDt.setDate(toDt.getDate()+7);
      const to = toDt.toISOString().slice(0,10);
      params = { action:'get_events', from, to, status:'NS' };
    }

    // 1) Получаем сырые данные
    let raw = await apiGet(params);

    // 2) Фильтрация/сортировка
    if (type === 'live') {
      raw = raw.filter((m:any) => m.match_status === 'LIVE');
    } else {
      raw = raw
        .filter((m:any) => m.match_status === 'NS')
        .sort((a:any,b:any) => 
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
        )
        .slice(0, 10);
    }

    // 3) Нормализация
    return raw.map(normalizeEvent);
  } catch (e) {
    console.error('Error fetching football scores:', e);
    return [];
  }
};
