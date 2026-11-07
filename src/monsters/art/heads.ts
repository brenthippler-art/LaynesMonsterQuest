import { type Look, type Palette } from '../monsterTypes';
import { makeBody } from './bodies';
import { type Body, CENTER_X, type Pt } from './bodyKit';
import { drawCheeks, drawEyes, drawMouth, faceLayout } from './face';
import { n, type Pen, region, tube } from './pen';
import { drawTop } from './tops';

/**
 * Heads that are separate from the body: the main head of a dragon, serpent,
 * beast or bird, and the extra heads of a 2- or 3-headed monster.
 *
 * The trick: every head is drawn as if it were a plain ROUND monster (face, top
 * and all), then shrunk and moved into place with an SVG transform. So every
 * eye, mouth and top works on a head without knowing anything about heads.
 */
const REF = makeBody('round', 1);
const REF_FACE = faceLayout(REF);

export interface HeadPlace {
  x: number;
  y: number;
  scale: number;
}

/** One head: the top's back layer, the head itself, then the top's front layer, eyes, mouth, cheeks. */
export function drawHead(pen: Pen, look: Look, c: Palette, at: HeadPlace): string {
  const under = look.extraTop ? drawTop(pen, REF, REF_FACE, look.extraTop, c) : { back: '', front: '' };
  const top = drawTop(pen, REF, REF_FACE, look.top, c);
  const eyes = drawEyes(pen, REF, REF_FACE, look.eyes, c);
  const ball = `<path d="${REF.d}" fill="${region(pen, c.main)}"/>`;
  const mouth = drawMouth(pen, REF_FACE, look.mouth, c);
  const cheeks = look.cheeks ? drawCheeks(pen, REF_FACE) : '';
  const inside = under.back + top.back + eyes.back + ball + under.front + top.front + eyes.front + mouth + cheeks;
  return `<g transform="translate(${n(at.x)} ${n(at.y)}) scale(${at.scale.toFixed(3)}) translate(${-REF.cx} ${-REF.cy})">${inside}</g>`;
}

/**
 * The extra heads (look.heads = 2 or 3), each on a short neck, fanned out beside
 * and above the main head. Bodies without a separate head count the body itself
 * as the main head, so the extra heads sit above its shoulders.
 */
export function drawExtraHeads(pen: Pen, b: Body, look: Look, c: Palette): string {
  const extra = (look.heads ?? 1) - 1;
  if (extra < 1) return '';
  const main = b.head ? { x: b.head.x, y: b.head.y, r: REF.rx * b.head.scale } : { x: CENTER_X, y: b.cy, r: b.rx };
  const scale = b.head ? b.head.scale * 0.82 : 0.5;
  const r = REF.rx * scale;
  const sides = extra === 1 ? [1] : [-1, 1];
  let out = '';
  for (const s of sides) {
    // Beside the main head, but never so far out that a wide top (a frill, a mane) leaves the picture.
    const x = Math.max(CENTER_X - 72, Math.min(CENTER_X + 66, main.x + s * (main.r * 0.9 + r * 0.6)));
    const y = b.head ? main.y + main.r * 0.08 : b.top - r * 0.15;
    const from: Pt = b.head ? b.head.neck : { x: CENTER_X + s * b.rx * 0.45, y: b.topYAt(CENTER_X + s * b.rx * 0.45) + 10 };
    out += tube(pen, `M${n(from.x)} ${n(from.y)} Q${n((from.x + x) / 2)} ${n(from.y - 4)} ${n(x)} ${n(y)}`, r * 0.7, c.main);
    out += drawHead(pen, look, c, { x, y, scale });
  }
  return out;
}
