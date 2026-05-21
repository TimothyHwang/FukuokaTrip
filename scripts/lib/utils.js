const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');

function slugify(text) {
  return (text || 'item')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 40) || 'item';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { ROOT, slugify, sleep, escapeRegex, ensureDir, readJson, writeJson };
