#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, readJson, escapeRegex } = require('./lib/utils');

const MANIFEST = path.join(ROOT, 'data/image-manifest.json');
const htmlPath = path.join(ROOT, 'index.html');

/** 每日封面維持原本 Unsplash 主題圖，不套用本地 images/days/ */
const DAY_COVERS = {
  1: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&q=80&fit=crop',
  2: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80&fit=crop',
  3: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&q=80&fit=crop',
  4: 'images/spots/d04-spot-item-5.jpg',
  5: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&q=80&fit=crop',
  6: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80&fit=crop',
  7: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80&fit=crop',
  8: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&q=80&fit=crop',
  9: 'images/days/d09-day-cover-item.jpg',
  10: 'images/spots/d10-spot-item-2.jpg',
};

function buildLookup(items) {
  const byKey = new Map();
  for (const it of items) {
    const key = `${it.day}|${it.name}|${it.maps}`;
    byKey.set(key, it);
  }
  return byKey;
}

function main() {
  const manifest = readJson(MANIFEST, { items: [] });
  const lookup = buildLookup(manifest.items);
  let html = fs.readFileSync(htmlPath, 'utf8');

  const cardRe =
    /(\{\s*name:"((?:\\.|[^"\\])*)"(?:[^}]*?)img:)(IMG\.\w+)((?:[^}]*?)maps:"((?:\\.|[^"\\])*)")/g;

  const start = html.indexOf('const days = [');
  const end = html.indexOf('function renderItinerary', start);
  const before = html.slice(0, start);
  let block = html.slice(start, end);
  const after = html.slice(end);

  let day = 1;
  let dayTitle = '';
  const lines = block.split('\n');
  const out = [];
  for (const line of lines) {
    const dm = line.match(/\/\/ DAY (\d+)/);
    if (dm) day = parseInt(dm[1], 10);

    const t = line.match(/^\s*title:\s*"([^"]+)"/);
    if (t) dayTitle = t[1];

    const dayImgM = line.match(/^\s*img:\s*("([^"]+)"|IMG\.day\d+)/);
    if (dayImgM && dayTitle && DAY_COVERS[day]) {
      out.push(line.replace(dayImgM[0], `img: "${DAY_COVERS[day]}"`));
      continue;
    }

    const replaced = line.replace(cardRe, (full, pre, nameRaw, imgKey, post, mapsRaw) => {
      const name = nameRaw.replace(/\\"/g, '"');
      const maps = mapsRaw.replace(/\\"/g, '"');
      const key = `${day}|${name}|${maps}`;
      const it = lookup.get(key);
      if (it && (it.status === 'ok' || it.status === 'fallback') && fs.existsSync(path.join(ROOT, it.localPath))) {
        return `${pre}"${it.localPath}"${post}`;
      }
      return full;
    });
    out.push(replaced);
  }
  block = out.join('\n');

  const imgBlockRe = /\/\/ ─── PHOTO LIBRARY[\s\S]*?const IMG = \{[\s\S]*?\};\s*\n/;
  if (imgBlockRe.test(before + block)) {
    // only strip from full html later
  }

  html = before + block + after;
  html = html.replace(
    /\/\/ ─── PHOTO LIBRARY（每張圖片唯一，依主題分類）───\s*\nconst U = id =>[\s\S]*?const IMG = \{[\s\S]*?\};\s*\n/,
    '// ─── PHOTO LIBRARY：已本地化至 images/，見 data/image-manifest.json\n'
  );

  fs.writeFileSync(htmlPath, html, 'utf8');

  const localCount = (html.match(/images\/(days|spots|foods)\//g) || []).length;
  const imgLeft = (html.match(/img:IMG\./g) || []).length;
  console.log(`Applied: ${localCount} local paths, ${imgLeft} IMG refs remain`);
}

main();
