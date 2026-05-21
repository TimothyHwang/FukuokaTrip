#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, readJson, writeJson, ensureDir, sleep } = require('./lib/utils');

const MANIFEST = path.join(ROOT, 'data/image-manifest.json');
const UA = 'FukuokaTrip/1.0 (local-real-images)';
const IMG_BLOCK = /const IMG = \{[\s\S]*?\};\s*\n/;

function loadImgFallbacks() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/const IMG = \{([\s\S]*?)\};/);
  if (!m) return {};
  const map = {};
  const re = /(\w+):\s*(U|UF)\('([^']+)'\)/g;
  let hit;
  while ((hit = re.exec(m[1])) !== null) {
    const w = hit[2] === 'UF' ? 300 : 400;
    map[`IMG.${hit[1]}`] = `https://images.unsplash.com/photo-${hit[3]}?w=${w}&q=80&fit=crop`;
  }
  return map;
}

function resolveUrl(url, base) {
  if (!url) return null;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/') && base) {
    try {
      const u = new URL(base);
      return `${u.origin}${url}`;
    } catch {
      return null;
    }
  }
  return null;
}

async function downloadUrl(url, dest, base) {
  url = resolveUrl(url, base);
  if (!url) throw new Error('bad url');
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error('too small');
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const fallbacks = loadImgFallbacks();
  const manifest = readJson(MANIFEST, { items: [] });
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const item of manifest.items) {
    const dest = path.join(ROOT, item.localPath);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      item.status = 'ok';
      skip++;
      continue;
    }

    let url = item.sourceUrl;
    if (!url && item.status === 'fallback' && item.imgRaw && fallbacks[item.imgRaw]) {
      url = fallbacks[item.imgRaw];
      item.source = 'unsplash-fallback';
    }
    if (!url) {
      fail++;
      continue;
    }

    try {
      const bytes = await downloadUrl(url, dest, item.officialPage);
      item.status = 'ok';
      item.bytes = bytes;
      ok++;
      console.log(`OK ${item.id} (${bytes} bytes)`);
    } catch (e) {
      console.warn(`FAIL ${item.id}: ${e.message}`);
      if (item.imgRaw && fallbacks[item.imgRaw]) {
        try {
          const bytes = await downloadUrl(fallbacks[item.imgRaw], dest);
          item.status = 'fallback';
          item.source = 'unsplash-fallback';
          item.sourceUrl = fallbacks[item.imgRaw];
          item.bytes = bytes;
          ok++;
          console.log(`  fallback OK ${item.id}`);
        } catch {
          fail++;
        }
      } else fail++;
    }
    await sleep(150);
  }

  // second pass: any item still without file → Unsplash theme fallback
  for (const item of manifest.items) {
    const dest = path.join(ROOT, item.localPath);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) continue;
    if (!item.imgRaw || !fallbacks[item.imgRaw]) {
      fail++;
      continue;
    }
    try {
      const bytes = await downloadUrl(fallbacks[item.imgRaw], dest);
      item.status = 'fallback';
      item.source = 'unsplash-fallback';
      item.sourceUrl = fallbacks[item.imgRaw];
      item.bytes = bytes;
      ok++;
      console.log(`2nd-pass fallback ${item.id}`);
      await sleep(100);
    } catch {
      fail++;
    }
  }

  manifest.generatedAt = new Date().toISOString();
  writeJson(MANIFEST, manifest);
  const onDisk = manifest.items.filter(i => fs.existsSync(path.join(ROOT, i.localPath))).length;
  console.log(`Download: ${ok} saved, ${skip} cached, ${fail} failed, ${onDisk}/${manifest.items.length} on disk`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
