#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, readJson, writeJson, ensureDir } = require('./lib/utils');

const MANIFEST = path.join(ROOT, 'data/image-manifest.json');

// minimal 1x1 gray JPEG
const PLACEHOLDER = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'base64'
);

function main() {
  const manifest = readJson(MANIFEST, { items: [] });
  const byRaw = new Map();
  for (const item of manifest.items) {
    const p = path.join(ROOT, item.localPath);
    if (fs.existsSync(p) && fs.statSync(p).size > 500) {
      if (!byRaw.has(item.imgRaw)) byRaw.set(item.imgRaw, p);
    }
  }
  let filled = 0;
  for (const item of manifest.items) {
    const dest = path.join(ROOT, item.localPath);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) continue;
    const src = byRaw.get(item.imgRaw);
    ensureDir(path.dirname(dest));
    if (src) {
      fs.copyFileSync(src, dest);
      item.status = 'fallback';
      item.source = 'cloned-img-key';
      item.clonedFrom = src;
    } else {
      fs.writeFileSync(dest, PLACEHOLDER);
      item.status = 'fallback';
      item.source = 'placeholder';
    }
    filled++;
    console.log(`Filled ${item.id} from ${item.source}`);
  }
  writeJson(MANIFEST, manifest);
  console.log(`Filled ${filled} files`);
}

main();
