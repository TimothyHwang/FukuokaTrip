#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, slugify, writeJson, ensureDir } = require('./lib/utils');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const start = html.indexOf('const days = [');
const end = html.indexOf('function renderItinerary', start);
const block = html.slice(start, end);

const chunks = block.split(/\/\/ DAY (\d+)/).slice(1);
const items = [];
const seen = new Set();

const cardRe = /\{\s*name:"((?:\\.|[^"\\])*)"(?:[^}]*?)img:(IMG\.\w+)(?:[^}]*?)maps:"((?:\\.|[^"\\])*)"(?:[^}]*?)(?:tags:\[([^\]]*)\])?[^}]*?\}/g;

function unesc(s) {
  return (s || '').replace(/\\"/g, '"');
}

function inferType(name, maps, tags) {
  const foodKw = /拉麵|うどん|烏龍|天婦羅|咖啡|漢堡|壽司|鍋|餃子|居酒屋|カフェ|ラーメン|うどん|焼肉|寿司|パンケーキ|トースト|明太子|もつ|水炊|弁当|駅弁|ハンバーガー|チョコ|スイーツ|デザート|ビール|酒場|食堂|レストラン|料理|グルメ|屋台|らーめん|カレー|とんかつ|お好み|たこ焼|串|焼き鳥|海鮮|牡蠣|茶房|茶屋|菓子|スイーツ|パン|ベーカリー|バー|Bar|BAR/i;
  const t = (tags || []).join(' ');
  if (t.includes('美食') || foodKw.test(name + maps)) return 'food';
  return 'spot';
}

function add(dayNum, type, o) {
  const slug = slugify(o.maps || o.name);
  let id = `d${String(dayNum).padStart(2, '0')}-${type}-${slug}`;
  let n = 1;
  while (seen.has(id)) id = `d${String(dayNum).padStart(2, '0')}-${type}-${slug}-${n++}`;
  seen.add(id);
  const folder = type === 'day-cover' ? 'days' : type === 'food' ? 'foods' : 'spots';
  items.push({
    id,
    day: dayNum,
    name: o.name,
    maps: o.maps || '',
    type,
    tags: o.tags || [],
    imgRaw: o.img || '',
    localPath: `images/${folder}/${id}.jpg`,
    source: null,
    sourceUrl: null,
    status: 'pending',
  });
}

for (let i = 0; i < chunks.length; i += 2) {
  const dayNum = parseInt(chunks[i], 10);
  const b = chunks[i + 1];
  const titleM = b.match(/title:\s*"([^"]+)"/);
  const imgM = b.match(/^\s*img:\s*(IMG\.\w+)/m);
  if (titleM && imgM) {
    add(dayNum, 'day-cover', { name: titleM[1], maps: titleM[1], img: imgM[1], tags: [] });
  }
  let m;
  while ((m = cardRe.exec(b)) !== null) {
    const name = unesc(m[1]);
    const img = m[2];
    const maps = unesc(m[3]);
    const tags = [...(m[4] || '').matchAll(/"([^"]+)"/g)].map(x => x[1]);
    const type = inferType(name, maps, tags);
    add(dayNum, type, { name, maps, img, tags });
  }
}

['images/days', 'images/spots', 'images/foods', 'data'].forEach(d => ensureDir(path.join(ROOT, d)));
const out = path.join(ROOT, 'data/image-manifest.json');
writeJson(out, { generatedAt: new Date().toISOString(), count: items.length, items });
console.log(`Extracted ${items.length} → ${out}`);
