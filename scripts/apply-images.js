#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, readJson, escapeRegex } = require('./lib/utils');

const MANIFEST = path.join(ROOT, 'data/image-manifest.json');
const htmlPath = path.join(ROOT, 'index.html');

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

    const titleM = line.match(/^\s*img:\s*(IMG\.day\d+)/);
    if (titleM && dayTitle) {
      const key = `${day}|${dayTitle}|${dayTitle}`;
      const it = lookup.get(key);
      if (it && fs.existsSync(path.join(ROOT, it.localPath))) {
        out.push(line.replace(titleM[0], `img: "${it.localPath}"`));
        continue;
      }
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
