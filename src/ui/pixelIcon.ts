import { HABITATS, type Habitat } from '../monsters/monsterTypes';
import { SPRITE_COLORS } from '../render/decorArt';
import { NES } from '../render/nesPalette';
import { BIOME_ICONS } from './biomeIcons';

/** Turn a pixel grid (like the biome icons) into a crisp SVG for HTML menus. */
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

/** The pixel icon for a habitat (the same pictures as the corner sign). */
export function habitatIconSvg(habitat: Habitat): string {
  const biome = HABITATS.find((h) => h.id === habitat)!.biome;
  return gridSvg(BIOME_ICONS[biome], (ch) => (ch === 'f' ? NES.pink : ch === 'c' ? NES.skyLight : SPRITE_COLORS[ch]));
}
