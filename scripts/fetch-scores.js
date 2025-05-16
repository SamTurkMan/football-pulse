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
const LEAGUE_IDS = [318, 319, 320, 321, 322, 323, 532]; // ID ваших лиг

// ==================== Утилита запроса ====================
async function apiGet(params) {
  const url = new URL(BASE_URL);
  url.searchParams.set('APIkey', API_KEY);
  for (const [k,v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  console.log(`→ GET ${url}`);
  const res  = await fetch(url);
  const body = await res.json();
  if (!Array.isArray(body)) {
    console.warn(`⚠️ Warning for ${params.action || ''}:`, body);
    return [];
  }
  return body;
}

// ==================== Собираем логотипы ====================
async function buildLogosMap() {
  const map = {};
  for (const lid of LEAGUE_IDS) {
    // тащим команды лиги
    const teams = await apiGet({ action:'get_teams', league_id: lid });
    teams.forEach(t => {
      // запоминаем логотип по id команды
      if (t.team_id && t.team_logo) {
        map[t.team_id] = t.team_logo;
      }
    });
  }
  return map;
}

// ==================== Нормализация матча ====================
function normalize(matches, logos) {
  return matches.map(m => {
    const hid = m.match_hometeam_id;
    const aid = m.match_awayteam_id;
    return {
      id:       m.match_id,
      status:   m.match_status,
      time:     m.match_time || m.match_date,
      league:   m.league_name,
      homeTeam: {
        id:    hid,
        name:  m.match_hometeam_name,
        logo:  logos[hid] || null,
        score: m.match_hometeam_score
      },
      awayTeam: {
        id:    aid,
        name:  m.match_awayteam_name,
        logo:  logos[aid] || null,
        score: m.match_awayteam_score
      }
    };
  });
}

// ==================== Запись файла ====================
function saveJSON(filename, arr, logos) {
  const uniq = Array.from(new Map(arr.map(m => [m.match_id, m])).values());
  const data = normalize(uniq, logos);
  const file = path.join(process.cwd(), 'public', 'data', filename);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`✅ ${filename}: saved ${data.length} items`);
}

// ==================== Основной процесс ====================
(async () => {
  try {
    // 1) Собираем карту team_id → team_logo
    const logosMap = await buildLogosMap();

    // 2) Даты
    const today = new Date().toISOString().slice(0,10);
    const next  = new Date();
    next.setDate(next.getDate()+7);
    const to    = next.toISOString().slice(0,10);

    // 3) Собираем «live», «today», «upcoming»
    const liveAll = [];
    const todayAll = [];
    const upcomingAll = [];

    for (const lid of LEAGUE_IDS) {
      // live
      liveAll.push(...await apiGet({ action:'get_live_scores', league_id: lid }));
      // today
      todayAll.push(
        ...await apiGet({ action:'get_events', league_id: lid, from: today, to: today })
      );
      // upcoming
      upcomingAll.push(
        ...await apiGet({ action:'get_events', league_id: lid, from: today, to })
      );
    }

    // 4) Убеждаемся, что папка есть
    const dir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // 5) Сохраняем
    saveJSON('live-matches.json',     liveAll,     logosMap);
    saveJSON('today-matches.json',    todayAll,    logosMap);
    saveJSON('upcoming-matches.json', upcomingAll, logosMap);

    console.log('⚽ All done!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
