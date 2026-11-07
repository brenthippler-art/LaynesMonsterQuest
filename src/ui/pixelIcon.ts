import { SPRITE_COLORS } from '../render/decorArt';
import { NES } from '../render/nesPalette';
import { type RealmDef } from '../worlds/types';

/** Turn a pixel grid (like the realm icons) into a crisp SVG for HTML menus. */
export function gridSvg(rows: readonly string[], colorOf: (ch: string) => string | undefined): string {
  const w = rows[0].length;
  const h = rows.length;
  let rects = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const color = row[x] === '.' ? undefined : colorOf(row[x]);
      if (color) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
    }
  });
  return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

/** Fixed colors for the "changes per flower/crystal" letters, so a realm icon always looks the same. */
export const realmIconColor = (ch: string): string => (ch === 'f' ? NES.pink : ch === 'c' ? NES.skyLight : SPRITE_COLORS[ch]);

/** The pixel icon for a realm (the same picture as the corner sign). */
export function realmIconSvg(realm: RealmDef): string {
  return gridSvg(realm.icon, realmIconColor);
}
