import { type Look, type Monster, type Palette, SIZE_SCALE } from '../monsterTypes';
import { type Body, makeBody } from './bodies';
import { drawCheeks, drawEyes, drawMouth, faceLayout } from './face';
import { drawExtraHeads, drawHead } from './heads';
import { drawArms, drawFeet, drawTail } from './limbs';
import { makePen, type Pen, region, type Region } from './pen';
import { drawBelly, drawPattern } from './patterns';
import { drawTop } from './tops';

/**
 * The hidden picture the pixel sprite is made from. Its area (x -26..226,
 * y -15..195) has room for wings, tails and tall ears. 252 x 210 units
 * divided by 3 units per pixel = an 84 x 70 pixel sprite.
 */
export const PART_VIEWBOX = { x: -26, y: -15, w: 252, h: 210 };

export interface PartPicture {
  /** SVG where every part is filled with its own ID color. */
  svg: string;
  /** Real color + options for each part, in drawing order (later = in front). */
  regions: Region[];
}

/**
 * Lay out a monster's parts back-to-front like paper cut-outs:
 * tail → ears/wings/eye stalks → feet → body (+ markings) → arms → hat → face.
 *
 * Bodies with a separate head (dragon, serpent, beast, bird) and monsters with
 * extra heads use headedLayers(). Every other monster uses classicLayers(),
 * which is exactly how monsters were always drawn, so they look the same as ever.
 */
export function drawMonsterParts(m: Monster): PartPicture {
  const pen = makePen();
  const { look, colors } = m;
  const b = makeBody(look.body, SIZE_SCALE[m.size]);
  const layers = b.head || (look.heads ?? 1) > 1 ? headedLayers(pen, b, look, colors) : classicLayers(pen, b, look, colors);

  const content = layers.join('');
  const v = PART_VIEWBOX;
  return {
    // crispEdges = no blurry blending, so every pixel is exactly one part's ID color.
    // xmlns is required here because this SVG is loaded as an image. It's a name tag
    // for the SVG format, not a web address that's ever visited.
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" shape-rendering="crispEdges">${content}</svg>`,
    regions: withDepths(pen.regions, content),
  };
}

/** The body itself, its markings (clipped so they stay inside it), and any extra pieces it brings (a screen, a rim). */
function bodyLayers(pen: Pen, b: Body, look: Look, colors: Palette): string[] {
  const clipId = `${pen.uid}-body`;
  const body = `<path d="${b.d}" fill="${region(pen, colors.main)}"/>`;
  const markings = drawPattern(pen, b, look.pattern, colors) + (look.belly ? drawBelly(pen, b, colors) : '');
  const details = b.details ? b.details(pen, colors) : '';
  return [`<clipPath id="${clipId}"><path d="${b.d}"/></clipPath>`, body, `<g clip-path="url(#${clipId})">${markings}</g>`, details];
}

/** One body with the face on it (every island monster). */
function classicLayers(pen: Pen, b: Body, look: Look, colors: Palette): string[] {
  const f = faceLayout(b);
  // Order matters: each call registers its regions, and later regions are "in front".
  const tail = drawTail(pen, b, look.tail, colors);
  const top = drawTop(pen, b, f, look.top, colors);
  const arms = drawArms(pen, b, look.arms, colors);
  const eyes = drawEyes(pen, b, f, look.eyes, colors);
  const feet = drawFeet(pen, b, look.feet, colors);
  const body = bodyLayers(pen, b, look, colors);
  const mouth = drawMouth(pen, f, look.mouth, colors);
  const cheeks = look.cheeks ? drawCheeks(pen, f) : '';
  return [tail, top.back, arms.back, eyes.back, feet, ...body, arms.front, top.front, eyes.front, mouth, cheeks];
}

/**
 * A body with a separate head, and/or extra heads. The heads come after the body,
 * so a head and everything on it (horns, a mane) sits in front of the body.
 */
function headedLayers(pen: Pen, b: Body, look: Look, colors: Palette): string[] {
  const tail = drawTail(pen, b, look.tail, colors);
  const arms = drawArms(pen, b, look.arms, colors);
  const feet = drawFeet(pen, b, look.feet, colors);
  const body = bodyLayers(pen, b, look, colors);
  const extraHeads = drawExtraHeads(pen, b, look, colors);
  if (b.head) {
    const head = drawHead(pen, look, colors, b.head);
    return [tail, arms.back, feet, ...body, arms.front, extraHeads, head];
  }
  // No separate head: the face stays on the body, and the extra heads grow from its shoulders.
  const f = faceLayout(b);
  const top = drawTop(pen, b, f, look.top, colors);
  const eyes = drawEyes(pen, b, f, look.eyes, colors);
  const mouth = drawMouth(pen, f, look.mouth, colors);
  const cheeks = look.cheeks ? drawCheeks(pen, f) : '';
  return [tail, top.back, arms.back, eyes.back, feet, extraHeads, ...body, arms.front, top.front, eyes.front, mouth, cheeks];
}

/**
 * Which part is in front? The one that appears LATER in the SVG. Parts are
 * registered in a different order than they're layered (a hat is created
 * before the body but drawn after it), so read the order from the SVG itself.
 */
function withDepths(regions: Region[], svg: string): Region[] {
  let next = 0;
  for (const match of svg.matchAll(/#([0-9a-f]{2})([0-9a-f]{2})4d/g)) {
    const id = parseInt(match[1], 16) + parseInt(match[2], 16) * 256;
    if (regions[id] && regions[id].depth < 0) regions[id].depth = next++;
  }
  return regions;
}
