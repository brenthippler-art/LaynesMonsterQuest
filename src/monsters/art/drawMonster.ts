import { type Monster, SIZE_SCALE } from '../monsterTypes';
import { makeBody } from './bodies';
import { drawCheeks, drawEyes, drawMouth, faceLayout } from './face';
import { drawArms, drawFeet, drawTail } from './limbs';
import { makePen, region, type Region } from './pen';
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
 */
export function drawMonsterParts(m: Monster): PartPicture {
  const pen = makePen();
  const { look, colors } = m;
  const b = makeBody(look.body, SIZE_SCALE[m.size]);
  const f = faceLayout(b);
  const clipId = `${pen.uid}-body`;

  // Order matters: each call registers its regions, and later regions are "in front".
  const tail = drawTail(pen, b, look.tail, colors);
  const top = drawTop(pen, b, f, look.top, colors);
  const arms = drawArms(pen, b, look.arms, colors);
  const eyes = drawEyes(pen, b, f, look.eyes, colors);
  const feet = drawFeet(pen, b, look.feet, colors);
  const body = `<path d="${b.d}" fill="${region(pen, colors.main)}"/>`;
  const markings = drawPattern(pen, b, look.pattern, colors) + (look.belly ? drawBelly(pen, b, colors) : '');
  const armsFront = arms.front;
  const topFront = top.front;
  const eyesFront = eyes.front;
  const mouth = drawMouth(pen, f, look.mouth, colors);
  const cheeks = look.cheeks ? drawCheeks(pen, f) : '';

  const layers = [
    tail,
    top.back,
    arms.back,
    eyes.back,
    feet,
    `<clipPath id="${clipId}"><path d="${b.d}"/></clipPath>`,
    body,
    `<g clip-path="url(#${clipId})">${markings}</g>`,
    armsFront,
    topFront,
    eyesFront,
    mouth,
    cheeks,
  ];

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
