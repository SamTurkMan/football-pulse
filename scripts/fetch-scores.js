// scripts/fetch-scores.js
const fs    = require('fs');
const path  = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// ==================== Конфиг ====================
const API_KEY    = process.env.APIFOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Error: APIFOOTBALL_API_KEY is not set');
  process.exit(1);
}
const BASE_URL   = 'https://apiv3.apifootball.com/';
const LEAGUE_IDS = [318, 319, 320, 321, 322, 323, 532]; // ваши ID лиг

// ==================== Утилита запроса ====================
async function apiGet(params) {
  const url = new URL(BASE_URL);
  // сначала APIkey
  url.searchParams.set('APIkey', API_KEY);
  // потом все ваши params
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  console.log(`→ GET ${url}`);
  const res  = await fetch(url);
  const body = await res.json();

  // Если APIfootball вернул объект ошибки — считаем, что матчей нет
  if (!Array.isArray(body)) {
    console.warn(`⚠️ APIfootball warning for action=${params.action} league_id=${params.league_id}:`, body);
    return [];
  }
  return body;
}

// ==================== Нормализация и сохранение ====================
function normalize(matches) {
  return matches.map(m => ({
    id:       m.match_id,
    status:   m.match_status,
    time:     m.match_time || m.match_date,
    league:   m.league_name,
    homeTeam: {
      id:    m.match_hometeam_id,
      name:  m.match_hometeam_name,
      logo:  m.home_team_logo || null,
      score: m.match_hometeam_score
    },
    awayTeam: {
      id:    m.match_awayteam_id,
      name:  m.match_awayteam_name,
      logo:  m.away_team_logo || null,
      score: m.match_awayteam_score
    }
  }));
}

function saveJSON(filename, arr) {
  const uniq = Array.from(new Map(arr.map(m => [m.match_id, m])).values());
  const file = path.join(process.cwd(), 'public', 'data', filename);
  fs.writeFileSync(file, JSON.stringify(normalize(uniq), null, 2));
  console.log(`✅ ${filename}: saved ${uniq.length} items`);
}

// ==================== Основной процесс ====================
(async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const next  = new Date();
    next.setDate(next.getDate() + 7);
    const to    = next.toISOString().split('T')[0];

    const liveAll     = [];
    const todayAll    = [];
    const upcomingAll = [];

    for (const league_id of LEAGUE_IDS) {
      // 1) live-матчи
      try {
        const live = await apiGet({ action: 'get_live_scores', league_id });
        liveAll.push(...live);
      } catch (err) {
        console.error(`Error fetching live_scores for league ${league_id}:`, err);
      }

      // 2) матчи сегодня
      try {
        const td = await apiGet({
          action:    'get_events',
          league_id,
          from:      today,
          to:        today
        });
        todayAll.push(...td);
      } catch (err) {
        console.error(`Error fetching today's events for league ${league_id}:`, err);
      }

      // 3) матчи на неделю вперёд
      try {
        const up = await apiGet({
          action:    'get_events',
          league_id,
          from:      today,
          to:        to
        });
        upcomingAll.push(...up);
      } catch (err) {
        console.error(`Error fetching upcoming events for league ${league_id}:`, err);
      }
    }

    // Убедимся, что директория есть
    const dir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    saveJSON('live-matches.json',     liveAll);
    saveJSON('today-matches.json',    todayAll);
    saveJSON('upcoming-matches.json', upcomingAll);

    console.log('⚽ All done!');
  } catch (fatal) {
    console.error('Fatal error in main():', fatal);
    process.exit(1);
  }
})();
