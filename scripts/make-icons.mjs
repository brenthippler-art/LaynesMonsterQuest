/**
 * Makes the app icons (for "Add to Home Screen") from Layne's own pixel art.
 * Everything happens on this computer: no downloads, no online tools.
 *
 *   npm run icons      → writes PNGs into public/icons/
 *
 * Run it again if you change Layne's sprite or colors.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { createServer } = await import(pathToFileURL(join(root, 'node_modules/vite/dist/node/index.js')).href);
const server = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const { spriteRows } = await server.ssrLoadModule('/src/render/layneSprites.ts');
const { LAYNE_PALETTE } = await server.ssrLoadModule('/src/render/playerArt.ts');
const { NES } = await server.ssrLoadModule('/src/render/nesPalette.ts');
await server.close();

// ---------- The icon picture: Layne (head + shirt) on NES blue, standing on grass ----------
const GRID = 32;
const rows = spriteRows('down', 0).slice(0, 22); // head + body, no legs
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function iconGrid() {
  const px = Array.from({ length: GRID * GRID }, () => hex(NES.blue));
  // Grass along the bottom, with a few darker tufts.
  for (let y = 27; y < GRID; y++) for (let x = 0; x < GRID; x++) px[y * GRID + x] = hex((x * 7 + y * 3) % 11 === 0 ? NES.green : NES.greenBright);
  // Layne, centered.
  const ox = (GRID - rows[0].length) / 2;
  const oy = 5;
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      const color = ch === 'G' || ch === 'g' ? NES.orange : LAYNE_PALETTE[ch];
      px[(oy + y) * GRID + ox + x] = hex(color);
    });
  });
  return px;
}

// ---------- A tiny PNG writer (PNG = a few labeled, compressed chunks) ----------
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
function png(size, colorAt) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // no filter
    for (let x = 0; x < size; x++) raw.set(colorAt(x, y), y * (size * 3 + 1) + 1 + x * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bits per channel
  ihdr[9] = 2; // RGB
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

/** Scale the 32x32 picture up to any size with crisp (nearest-neighbor) pixels. */
function render(size) {
  const grid = iconGrid();
  return png(size, (x, y) => grid[Math.floor((y * GRID) / size) * GRID + Math.floor((x * GRID) / size)]);
}

const outDir = join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });
const icons = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180, 'favicon-32.png': 32 };
for (const [name, size] of Object.entries(icons)) {
  writeFileSync(join(outDir, name), render(size));
  console.log('wrote public/icons/' + name);
}
