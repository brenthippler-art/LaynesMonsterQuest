import { type Monster } from '../monsters/monsterTypes';
import { type MonsterSprite } from '../monsters/pixel/monsterSprite';
import { bwPixelsSvg, HABITAT_DECOR, outlineGridSvg } from './outlineArt';

/**
 * One coloring page (US Letter), laid out in inches:
 *
 *   ┌──────────────────────────────┐
 *   │          H O P S Y           │  name in big bubble letters
 *   │ ✿                          ✿ │
 *   │ ✿        (monster)         ✿ │  habitat pictures down the sides
 *   │ ✿                          ✿ │
 *   │    ✿      ✿      ✿      ✿    │  ...and along the bottom
 *   │ Colored by: ________________ │
 *   └──────────────────────────────┘
 */
const DECOR_SPOTS: [number, number][] = [
  [0, 1.9], [0.05, 3.5], [0, 5.1], // left side
  [6.3, 1.9], [6.25, 3.5], [6.3, 5.1], // right side
  [0.6, 6.7], [2.4, 6.95], [4.1, 6.7], [5.8, 6.95], // along the bottom
];

/** The name as outlined "bubble" letters: white inside, thick black edge. */
function titleSvg(name: string): string {
  const text = name.toUpperCase();
  const fontSize = 140;
  // Squeeze long names so they always fit across the page.
  const fit = text.length * fontSize * 0.72 > 940 ? ' textLength="940" lengthAdjust="spacingAndGlyphs"' : '';
  return (
    `<svg class="cp-title" viewBox="0 0 1000 180" aria-hidden="true">` +
    `<text x="500" y="140" text-anchor="middle" font-size="${fontSize}"${fit} fill="#fff" stroke="#000" stroke-width="18" ` +
    `stroke-linejoin="round" paint-order="stroke">${text}</text></svg>`
  );
}

/**
 * Sprites have empty space around them (room for big wings on other monsters).
 * Trim it off, so this monster fills the page as big as it can.
 */
function cropToMonster(pixels: (string | null)[], width: number, height: number) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  pixels.forEach((p, i) => {
    if (!p) return;
    const x = i % width;
    const y = Math.floor(i / width);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out: (string | null)[] = [];
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) out.push(pixels[y * width + x]);
  return { pixels: out, width: w, height: h };
}

/** The monster's outline art, trimmed and centered in its space. */
function monsterArt(sprite: MonsterSprite): string {
  const c = cropToMonster(sprite.outline, sprite.width, sprite.height);
  return bwPixelsSvg(c.pixels, c.width, c.height).replace('xMidYMax', 'xMidYMid');
}

export function buildColoringPage(m: Monster, sprite: MonsterSprite): HTMLElement {
  const page = document.createElement('section');
  page.className = 'cp-page';
  page.setAttribute('aria-label', `Coloring page: ${m.name}`);

  const decor = HABITAT_DECOR[m.habitat];
  const pictures = DECOR_SPOTS.map(
    ([x, y], i) => `<div class="cp-decor" style="left:${x}in;top:${y}in">${outlineGridSvg(decor[i % decor.length])}</div>`,
  ).join('');

  page.innerHTML =
    titleSvg(m.name) +
    pictures +
    `<div class="cp-monster">${monsterArt(sprite)}</div>` +
    `<p class="cp-colored-by">Colored by: <span></span></p>`;
  // The monster's name as real text too, for screen readers / PDF search.
  page.querySelector('.cp-title')!.setAttribute('aria-label', m.name);
  return page;
}
