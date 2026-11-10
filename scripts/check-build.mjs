// Safety and size check for the finished game. Run `npm run build` first, then `npm run check:build`.
//
// It reads the files in dist/ (the exact files that go online) and checks that:
//   1. index.html still has the strict Content-Security-Policy from CLAUDE.md, word for word
//   2. the game's code has nothing that can talk to the network or open other sites
//   3. index.html and the app manifest only point at the game's own files
//   4. the service worker keeps a copy of EVERY built file (so every world works offline)
// and prints how big each file is (plain and zipped, which is what actually gets downloaded).
//
// This is plain JavaScript (no TypeScript), so Node runs it directly.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const CSP =
  "default-src 'self'; connect-src 'none'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; frame-src 'none'; form-action 'none'";

/** Things in the game's code that could reach the internet or another site. */
const NETWORK_WORDS = ['fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon', 'navigator.share', 'window.open', 'import(', 'new Worker', 'RTCPeerConnection'];
/** Web addresses that are allowed in the code: SVG's name tag, which is a label, not a request. */
const ALLOWED_ADDRESSES = ['http://www.w3.org/2000/svg', 'http://www.w3.org/1999/xhtml'];

const problems = [];
const read = (file) => readFileSync(join(DIST, file), 'utf8');

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

let files;
try {
  files = listFiles(DIST).map((f) => relative(DIST, f).split(sep).join('/'));
} catch {
  console.error('No dist/ folder. Run `npm run build` first.');
  process.exit(1);
}

// 1. The safety rule in index.html, exactly as in CLAUDE.md.
const html = read('index.html');
if (!html.includes(`content="${CSP}"`)) problems.push('index.html: the Content-Security-Policy meta tag is missing or was changed.');

// 2. Nothing in the game's code can talk to the network.
for (const file of files.filter((f) => f.endsWith('.js') && f !== 'sw.js')) {
  const code = read(file);
  for (const word of NETWORK_WORDS) if (code.includes(word)) problems.push(`${file}: contains "${word}".`);
  for (const address of code.match(/https?:\/\/[^\s"'`)<>]+/g) ?? []) {
    if (!ALLOWED_ADDRESSES.includes(address)) problems.push(`${file}: contains the web address ${address}`);
  }
}

// 3. index.html and the manifest only point at our own files ("/..."), never at another site.
for (const [, , url] of html.matchAll(/(href|src)="([^"]*)"/g)) {
  if (!url.startsWith('/') || url.startsWith('//')) problems.push(`index.html: points at "${url}", which isn't one of the game's own files.`);
}
if (/https?:\/\//.test(read('manifest.webmanifest'))) problems.push('manifest.webmanifest: contains a web address.');

// 4. The service worker: only our own site, and a copy of every file.
const sw = read('sw.js');
if (!sw.includes('url.origin !== self.location.origin')) problems.push('sw.js: the "only our own site" line is missing.');
const cached = JSON.parse(sw.match(/const FILES = (\[.*?\]);/s)?.[1] ?? '[]');
for (const file of files.filter((f) => f !== 'index.html' && f !== 'sw.js')) {
  if (!cached.includes('/' + file)) problems.push(`sw.js: doesn't keep a copy of ${file} for offline play.`);
}

// Sizes.
const kb = (bytes) => `${(bytes / 1000).toFixed(1)} kB`; // kB = 1000 bytes, like `npm run build` shows
let total = 0;
let totalZipped = 0;
console.log('Built files (plain / zipped):');
for (const file of files.filter((f) => /\.(js|css|html)$/.test(f))) {
  const data = readFileSync(join(DIST, file));
  const zipped = gzipSync(data).length;
  total += data.length;
  totalZipped += zipped;
  console.log(`  ${file.padEnd(34)} ${kb(data.length).padStart(10)} / ${kb(zipped).padStart(9)}`);
}
console.log(`  ${'total'.padEnd(34)} ${kb(total).padStart(10)} / ${kb(totalZipped).padStart(9)}\n`);

if (problems.length) {
  console.error(`${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`All good: strict safety rule in place, no network code, only our own files, ${cached.length} files kept for offline play.`);
