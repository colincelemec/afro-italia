#!/usr/bin/env node
/* ============================================
   check-i18n — controllo delle traduzioni
   Verifica che ogni chiave esista in tutte le lingue (en/fr/it)
   e che le chiavi usate nel codice con t('…') esistano davvero.

   Uso:  npm run check:i18n
   ============================================ */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const LANGS = ['en', 'fr', 'it'];

// ── Carica l'oggetto translations senza eseguire React ──
function loadTranslations() {
  const file = path.join(SRC, 'locales', 'translations.js');
  let code = fs.readFileSync(file, 'utf8');
  code = code
    .replace(/^\s*export\s+const\s+translations\s*=/m, 'const translations =')
    .replace(/^\s*export\s+const/gm, 'const')
    .replace(/^\s*export\s+default[\s\S]*$/m, '');
  // eslint-disable-next-line no-new-func
  return new Function(`${code}; return translations;`)();
}

// ── Percorre l'albero e raccoglie le foglie (nodi con en/fr/it) ──
function collectLeaves(obj, prefix = '', out = { leaves: {}, malformed: [] }) {
  for (const [key, value] of Object.entries(obj || {})) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const keys = Object.keys(value);
      const looksLikeLeaf = keys.some(k => LANGS.includes(k));
      if (looksLikeLeaf) {
        out.leaves[full] = value;
        // Una foglia può contenere sotto-oggetti (es. testimonials.t1)
        const nested = keys.filter(k => !LANGS.includes(k));
        for (const n of nested) {
          if (value[n] && typeof value[n] === 'object') {
            collectLeaves({ [n]: value[n] }, full, out);
          }
        }
      } else {
        collectLeaves(value, full, out);
      }
    }
  }
  return out;
}

// ── Elenca i file sorgente ──
function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else if (/\.(js|jsx)$/.test(entry.name) && !p.includes('locales')) files.push(p);
  }
  return files;
}

const translations = loadTranslations();
const { leaves } = collectLeaves(translations);

let errors = 0;
let warnings = 0;

// ── 1. Ogni chiave deve esistere nelle 3 lingue ──
console.log(`\n🌍 Chiavi di traduzione trovate: ${Object.keys(leaves).length}\n`);

const incomplete = [];
for (const [key, value] of Object.entries(leaves)) {
  const missing = LANGS.filter(l => typeof value[l] !== 'string' && typeof value[l] !== 'function');
  if (missing.length > 0) incomplete.push({ key, missing });
}

if (incomplete.length === 0) {
  console.log('✅ Tutte le chiavi sono tradotte in en / fr / it');
} else {
  errors += incomplete.length;
  console.log(`❌ ${incomplete.length} chiavi incomplete:`);
  incomplete.slice(0, 30).forEach(({ key, missing }) =>
    console.log(`   ${key} → manca: ${missing.join(', ')}`)
  );
}

// ── 2. Le chiavi usate nel codice devono esistere ──
const usedKeys = new Set();
const files = walk(SRC);
const KEY_RE = /\bt\(\s*['"`]([\w.]+)['"`]\s*\)/g;
const GET_RE = /getTranslation\(\s*['"`]([\w.]+)['"`]/g;

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = KEY_RE.exec(code))) usedKeys.add(m[1]);
  while ((m = GET_RE.exec(code))) usedKeys.add(m[1]);
}

const unknown = [...usedKeys].filter(k => !leaves[k] && k.includes('.'));
if (unknown.length === 0) {
  console.log(`✅ Le ${usedKeys.size} chiavi usate nel codice esistono tutte`);
} else {
  errors += unknown.length;
  console.log(`\n❌ ${unknown.length} chiavi usate ma non definite:`);
  unknown.forEach(k => console.log(`   ${k}`));
}

// ── 3. Chiavi definite ma mai usate (solo informativo) ──
const unused = Object.keys(leaves).filter(k => !usedKeys.has(k));
if (unused.length > 0) {
  warnings += unused.length;
  console.log(`\n⚠️  ${unused.length} chiavi definite ma non usate (informativo)`);
}

console.log(
  errors === 0
    ? `\n✅ Controllo i18n superato${warnings ? ` (${warnings} avvisi)` : ''}\n`
    : `\n❌ Controllo i18n fallito: ${errors} problemi\n`
);
process.exit(errors === 0 ? 0 : 1);
