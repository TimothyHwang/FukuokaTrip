#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, readJson, writeJson, sleep } = require('./lib/utils');

const MANIFEST = path.join(ROOT, 'data/image-manifest.json');
const UA = 'FukuokaTrip/1.0';

function loadImgFallbacks() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/const IMG = \{([\s\S]*?)\};/);
  const map = {};
  const re = /(\w+):\s*(U|UF)\('([^']+)'\)/g;
  let hit;
  while ((hit = re.exec(m[1])) !== null) {
    const w = hit[2] === 'UF' ? 300 : 400;
    map[`IMG.${hit[1]}`] = `https://images.unsplash.com/photo-${hit[3]}?w=${w}&q=80&fit=crop`;
  }
  return map;
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(String(res.status));
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const fallbacks = loadImgFallbacks();
  const manifest = readJson(MANIFEST, { items: [] });
  const missing = manifest.items.filter(i => {
    const p = path.join(ROOT, i.localPath);
    return !fs.existsSync(p) || fs.statSync(p).size < 500;
  });
  console.log(`Missing ${missing.length}, retrying Unsplash fallbacks...`);
  let ok = 0;
  for (const item of missing) {
    const url = fallbacks[item.imgRaw];
    if (!url) continue;
    const dest = path.join(ROOT, item.localPath);
    try {
      const bytes = await download(url, dest);
      item.status = 'fallback';
      item.source = 'unsplash-fallback';
      item.sourceUrl = url;
      item.bytes = bytes;
      ok++;
      console.log(`OK ${item.id} ${bytes}b`);
    } catch (e) {
      console.warn(`FAIL ${item.id}: ${e.message}`);
    }
    await sleep(800);
  }
  writeJson(MANIFEST, manifest);
  const left = manifest.items.filter(i => !fs.existsSync(path.join(ROOT, i.localPath))).length;
  console.log(`Done ${ok}, still missing ${left}`);
}

main();
