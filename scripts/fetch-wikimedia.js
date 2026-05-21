#!/usr/bin/env node
const { readJson, writeJson, sleep, ROOT } = require('./lib/utils');
const path = require('path');
const officialPages = require('./official-pages');
const foodPages = require('./food-pages');

const MANIFEST = path.join(ROOT, 'data/image-manifest.json');
const UA = 'FukuokaTrip/1.0 (local-real-images; contact: github.com/timothyhwang/FukuokaTrip)';

function matchOfficial(name, maps, type) {
  const text = `${name} ${maps}`;
  const tables = type === 'food' ? [...foodPages, ...officialPages] : [...officialPages, ...foodPages];
  for (const row of tables) {
    if (row.match.test(text)) return row.page;
  }
  return null;
}

async function fetchOgImage(pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    return m ? m[1].replace(/&amp;/g, '&') : null;
  } catch {
    return null;
  }
}

async function searchWikimedia(query, width) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '5',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: String(width),
    format: 'json',
    origin: '*',
  });
  const url = `https://commons.wikimedia.org/w/api.php?${params}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;
  for (const p of Object.values(pages)) {
    const info = p.imageinfo?.[0];
    if (info?.thumburl || info?.url) {
      return {
        url: info.thumburl || info.url,
        title: p.title,
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`,
      };
    }
  }
  return null;
}

async function resolveItem(item) {
  if (item.sourceUrl && item.status === 'ok') return item;

  const width = item.type === 'food' ? 300 : 400;
  const official = matchOfficial(item.name, item.maps, item.type);
  if (official) {
    const og = await fetchOgImage(official);
    if (og) {
      item.source = 'official-og';
      item.sourceUrl = og;
      item.officialPage = official;
      item.status = 'pending';
      return item;
    }
  }

  const queries = [item.maps, item.name, item.maps.split(/\s+/)[0]]
    .map(q => (q || '').trim())
    .filter(Boolean);
  const uniq = [...new Set(queries)];

  for (const q of uniq) {
    const hit = await searchWikimedia(q, width);
    if (hit) {
      item.source = 'wikimedia';
      item.sourceUrl = hit.url;
      item.wikimediaTitle = hit.title;
      item.wikimediaPage = hit.pageUrl;
      item.status = 'pending';
      return item;
    }
    await sleep(350);
  }

  item.status = 'fallback';
  item.source = 'fallback';
  return item;
}

async function main() {
  const manifest = readJson(MANIFEST, { items: [] });
  let done = 0;
  for (const item of manifest.items) {
    if (item.type === 'day-cover' || item.type === 'spot' || item.type === 'food') {
      await resolveItem(item);
      done++;
      if (done % 10 === 0) console.log(`Resolved ${done}/${manifest.items.length}...`);
      await sleep(200);
    }
  }
  manifest.generatedAt = new Date().toISOString();
  writeJson(MANIFEST, manifest);
  const ok = manifest.items.filter(i => i.sourceUrl).length;
  const fb = manifest.items.filter(i => i.status === 'fallback').length;
  console.log(`Done: ${ok} with URL, ${fb} fallback, ${manifest.items.length} total`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
