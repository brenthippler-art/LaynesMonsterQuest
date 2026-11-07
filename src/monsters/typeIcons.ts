import { NES } from '../render/nesPalette';
import { type MonsterType } from './monsterTypes';

/**
 * A little icon for each monster type, so a kid can tell types apart
 * without reading. Drawn on a 24x24 grid: one filled shape with a black edge,
 * plus optional black detail lines ("vein").
 */

/** A cog: 8 square teeth around a ring, with a hole in the middle (drawn the other way round, so it stays empty). */
function gearPath(): string {
  const pts: string[] = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const r = i % 4 < 2 ? 10 : 7.5;
    pts.push(`${i ? 'L' : 'M'}${(12 + Math.cos(a) * r).toFixed(1)} ${(12 + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ') + ' Z M12 9 A3 3 0 1 0 12.01 9 Z';
}

const ICONS: Record<MonsterType, { color: string; d: string; vein?: string }> = {
  Leaf: { color: NES.green, d: 'M4 20 C4 9 11 4 20 4 C20 14 14 20 4 20 Z', vein: 'M4 20 L14 10' },
  Frost: { color: NES.sky, d: 'M12 2 L14 9 L21 7 L16 12 L21 17 L14 15 L12 22 L10 15 L3 17 L8 12 L3 7 L10 9 Z' },
  Sand: { color: NES.orangeLight, d: 'M2 19 Q7 10 12 15 Q16 11 22 15 L22 21 L2 21 Z' },
  Stone: { color: NES.grayLight, d: 'M3 19 L5 9 L12 4 L19 7 L21 18 Z' },
  Splash: { color: NES.blueMid, d: 'M12 2 C12 2 5 11 5 15 A7 7 0 0 0 19 15 C19 11 12 2 12 2 Z' },
  Ember: { color: NES.redBright, d: 'M12 2 C14 7 19 9 18 15 A6 6 0 0 1 6 15 C6 11 9 10 9 6 C11 8 11 10 12 11 C13 8 12 5 12 2 Z' },
  Shadow: { color: NES.purple, d: 'M15 3 A9 9 0 1 0 21 15 A7 7 0 1 1 15 3 Z' },
  Zap: { color: NES.gold, d: 'M14 2 L5 14 L11 14 L9 22 L19 9 L13 9 Z' },
  Fluff: { color: NES.pinkLight, d: 'M7 19 A4 4 0 0 1 6 11 A5 5 0 0 1 15 8 A4.5 4.5 0 0 1 19 16 A3 3 0 0 1 17 19 Z' },
  // A donut with sprinkles.
  Snack: { color: NES.rose, d: 'M12 3 A9 9 0 1 1 11.99 3 Z M12 9 A3 3 0 1 0 12.01 9 Z', vein: 'M7 8 L8.5 9 M15.5 6.5 L16.5 8 M17.5 14 L18.5 15.5 M6 14.5 L7.5 15.5 M11 17.5 L12.5 18' },
  // Three soap bubbles, the big one with a shine.
  Bubble: { color: NES.skyLight, d: 'M10 5 A7 7 0 1 1 9.99 5 Z M18.5 13 A3.5 3.5 0 1 1 18.49 13 Z M17 3 A2.5 2.5 0 1 1 16.99 3 Z', vein: 'M6.5 10.5 Q7 8 9.5 7.5' },
  // A spinning top.
  Toy: { color: NES.orange, d: 'M12 4 Q19 6 20.5 11 Q19 16 12 21 Q5 16 3.5 11 Q5 6 12 4 Z', vein: 'M3.5 11 L20.5 11 M12 1.5 L12 4' },
  // A twinkle: a big four-point star and a small one.
  Sparkle: { color: NES.lavender, d: 'M10 3 Q11 10 18 11 Q11 12 10 20 Q9 12 2 11 Q9 10 10 3 Z M18 2 Q18.5 5 21.5 5.5 Q18.5 6 18 9 Q17.5 6 14.5 5.5 Q17.5 5 18 2 Z' },
  // A cog.
  Gear: { color: NES.teal, d: gearPath() },
};

export function typeColor(type: MonsterType): string {
  return ICONS[type].color;
}

/** An <svg> icon for a type, `size` pixels square. */
export function typeIconSvg(type: MonsterType, size = 24): string {
  const icon = ICONS[type];
  const vein = icon.vein ? `<path d="${icon.vein}" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>` : '';
  return (
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">` +
    `<path d="${icon.d}" fill="${icon.color}" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/>${vein}</svg>`
  );
}
