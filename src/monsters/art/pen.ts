/**
 * The "pen" every monster part draws with.
 *
 * Monsters become pixel art in three steps:
 *   1. The parts (body, eyes, ears...) draw a hidden vector picture where every
 *      part is filled with its own unique "ID color" (this file).
 *   2. pixel/rasterize.ts shrinks it to a small grid: each pixel remembers which
 *      part it belongs to.
 *   3. pixel/paint.ts adds outlines and 16-bit shading, in color or as a
 *      coloring page.
 *
 * Each filled shape is a "region" with its real color and a couple of options.
 */
export interface Region {
  color: string;
  /** Draw an outline where this part sits in front of something? (false for blush, eye shine) */
  outline: boolean;
  /** Add 16-bit highlight/shadow? (false for eye whites, teeth, small flat bits) */
  shade: boolean;
  /** Stacking order: a bigger depth is in front. Filled in once the whole picture is laid out. */
  depth: number;
}

export interface Pen {
  regions: Region[];
  /** Unique prefix for ids, so many monsters can share one page. */
  uid: string;
}

export interface RegionOptions {
  outline?: boolean;
  shade?: boolean;
}

/** Lines and pupils are drawn in this special color; they always become black pixels. */
export const INK_ID = '#ffff4e';
/** Every region's ID color has this blue value, so stray blended pixels can be ignored. */
export const ID_BLUE = 0x4d;

let counter = 0;

export function makePen(): Pen {
  counter++;
  return { regions: [], uid: `mon${counter}` };
}

const hex2 = (v: number) => v.toString(16).padStart(2, '0');

/** Register a part and get its ID color (region number stored in the red and green channels). */
export function region(pen: Pen, color: string, options: RegionOptions = {}): string {
  const i = pen.regions.length;
  pen.regions.push({ color, outline: options.outline ?? true, shade: options.shade ?? true, depth: -1 });
  return `#${hex2(i & 255)}${hex2(i >> 8)}${hex2(ID_BLUE)}`;
}

/** Round to 1 decimal so the SVG text stays short. */
export const n = (v: number): string => (Math.round(v * 10) / 10).toString();

/** A filled shape (one part). */
export function shape(pen: Pen, d: string, color: string, options?: RegionOptions): string {
  return `<path d="${d}" fill="${region(pen, color, options)}"/>`;
}

export function circle(pen: Pen, cx: number, cy: number, r: number, color: string, options?: RegionOptions): string {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${region(pen, color, options)}"/>`;
}

export function ellipse(pen: Pen, cx: number, cy: number, rx: number, ry: number, color: string, angle = 0, options?: RegionOptions): string {
  const turn = angle ? ` transform="rotate(${n(angle)} ${n(cx)} ${n(cy)})"` : '';
  return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${region(pen, color, options)}"${turn}/>`;
}

/** A black line (a smile, a leaf vein). */
export function line(_pen: Pen, d: string, width = 3.5): string {
  return `<path d="${d}" fill="none" stroke="${INK_ID}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A bendy noodle (tails, stalks, antennae). At least 6 wide so it survives shrinking to pixels. */
export function tube(pen: Pen, d: string, width: number, color: string): string {
  return `<path d="${d}" fill="none" stroke="${region(pen, color)}" stroke-width="${Math.max(width, 6)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A solid black dot (pupils). */
export function inkDot(_pen: Pen, cx: number, cy: number, rx: number, ry = rx): string {
  return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${INK_ID}"/>`;
}

/** A white sparkle in an eye: no outline, no shading. */
export function shine(pen: Pen, cx: number, cy: number, r: number): string {
  return circle(pen, cx, cy, r, '#FFFFFF', { outline: false, shade: false });
}

/** Several overlapping circles that count as ONE part (one fluffy shape, no lines inside). */
export function fluff(pen: Pen, circles: [number, number, number][], color: string): string {
  const id = region(pen, color);
  return circles.map(([x, y, r]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${id}"/>`).join('');
}

/** Build an SVG path from a list of points, mirrored left/right when side = -1. */
export function pts(x0: number, y0: number, side: number, points: [number, number][]): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x0 + side * x)} ${n(y0 + y)}`).join(' ') + ' Z';
}
