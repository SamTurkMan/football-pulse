// scripts/fetch-scores.js
const fs    = require('fs');
const path  = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

////////////////////////////////////////////////////////////////////////////////
// Конфиг
////////////////////////////////////////////////////////////////////////////////

const API_KEY    = process.env.APIFOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Error: APIFOOTBALL_API_KEY is not set');
  process.exit(1);
}

const BASE_URL   = 'https://apifootball.com/api/';
const LEAGUE_IDS = [318, 319, 320, 321, 322, 323, 532]; // 2.Lig,1.Lig,Cup,3.Lig,Süper Lig,Super Cup,3.Lig

////////////////////////////////////////////////////////////////////////////////
// Утилиты
////////////////////////////////////////////////////////////////////////////////

async function apiGet(params) {
  const url = new URL(BASE_URL);
  for (const [k, v] of Object.entries({ ...params, APIkey: API_KEY })) {
    url.searchParams.set(k, v);
  }
  console.log(`→ GET ${url}`);
  const res  = await fetch(url);
  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error(`APIfootball returned unexpected: ${JSON.stringify(json)}`);
  }
  return json;
}

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

// Сохраняем массив, убираем дубликаты по match_id
function saveJSON(filename, arr) {
  const uniq = Array.from(
    new Map(arr.map(m => [m.match_id, m])).values()
  );
  const file = path.join(process.cwd(), 'public', 'data', filename);
  fs.writeFileSync(file, JSON.stringify(normalize(uniq), null, 2));
  console.log(`✅ ${filename}: saved ${uniq.length} items`);
}

////////////////////////////////////////////////////////////////////////////////
// Основной процесс
////////////////////////////////////////////////////////////////////////////////

;(async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const next  = new Date();
    next.setDate(next.getDate() + 7);
    const to    = next.toISOString().split('T')[0];

    const liveAll     = [];
    const todayAll    = [];
    const upcomingAll = [];

    // Для каждой лиги собираем три набора
    for (const lid of LEAGUE_IDS) {
      // 1) Live
      const live = await apiGet({ action: 'get_live_scores', league_id: lid });
      liveAll.push(...live);

      // 2) Сегодня
      const todayMatches = await apiGet({
        action:    'get_events',
        league_id: lid,
        from:      today,
        to:        today
      });
      todayAll.push(...todayMatches);

      // 3) Ближайшая неделя
      const upc = await apiGet({
        action:    'get_events',
        league_id: lid,
        from:      today,
        to:        to
      });
      upcomingAll.push(...upc);
    }

    // Убедимся, что папка data существует
    const dir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Сохраняем три файла
    saveJSON('live-matches.json',      liveAll);
    saveJSON('today-matches.json',     todayAll);
    saveJSON('upcoming-matches.json',  upcomingAll);

    console.log('⚽ All done!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
