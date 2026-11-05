/**
 * Layne's glasses get a new look every visit: a frame color plus a pattern.
 * 10 colors x 4 patterns + 1 rainbow = 41 different pairs.
 */
export type GlassesPattern = 'solid' | 'dots' | 'stripes' | 'twoTone' | 'rainbow';

export interface GlassesStyle {
  /** Main frame color. */
  color: string;
  /** Second color for dots, stripes, or the other side of two-tone. */
  accent: string;
  pattern: GlassesPattern;
}

/** NES palette colors (see render/nesPalette.ts). */
const COLORS = [
  '#F83800', // red
  '#0078F8', // blue
  '#00A800', // green
  '#6844FC', // purple
  '#F878F8', // pink
  '#E45C10', // orange
  '#000000', // black
  '#008888', // teal
  '#F8B800', // yellow
  '#FCFCFC', // white
];

const PATTERNS = ['solid', 'dots', 'stripes', 'twoTone'] as const;

export const GLASSES_STYLES: GlassesStyle[] = [
  ...COLORS.flatMap((color, i) =>
    // Accent is a color a few steps along the list, so it always contrasts with the main color.
    PATTERNS.map((pattern) => ({ color, accent: COLORS[(i + 3) % COLORS.length], pattern })),
  ),
  { color: '#F83800', accent: '#0078F8', pattern: 'rainbow' },
];

/** Pick a random style that's different from last time. Returns its index in GLASSES_STYLES. */
export function pickNewGlasses(last: number | null): number {
  let i: number;
  do {
    i = Math.floor(Math.random() * GLASSES_STYLES.length);
  } while (i === last);
  return i;
}
