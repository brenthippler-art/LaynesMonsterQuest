import { PixelBuffer, rgba } from '../../render/pixels';
import { drawMonsterParts } from '../art/drawMonster';
import { type Monster } from '../monsterTypes';
import { paintPixels, pixelsToSvg, type SpriteMode } from './paint';
import { rasterize, type SpriteSize } from './rasterize';

/**
 * The finished pixel-art monster, in both modes. Building one takes a moment
 * (the browser has to draw the hidden picture), so results are cached.
 *   size 'large' = 84x70 (encounter screen, gallery, coloring pages)
 *   size 'small' = 42x35 (wandering in the world, same pixel size as Layne)
 */
export interface MonsterSprite {
  width: number;
  height: number;
  /** One color per pixel (null = see-through), row by row. */
  color: (string | null)[];
  outline: (string | null)[];
}

const cache = new Map<string, Promise<MonsterSprite>>();

export function monsterSprite(m: Monster, size: SpriteSize = 'large'): Promise<MonsterSprite> {
  const key = `${m.id}:${size}`;
  let sprite = cache.get(key);
  if (!sprite) {
    sprite = rasterize(drawMonsterParts(m), size).then((p) => ({
      width: p.width,
      height: p.height,
      color: paintPixels(p, 'color'),
      outline: paintPixels(p, 'outline'),
    }));
    cache.set(key, sprite);
  }
  return sprite;
}

/** SVG version (gallery, encounter screen, printable coloring pages). */
export async function monsterSvg(m: Monster, mode: SpriteMode, size: SpriteSize = 'large'): Promise<string> {
  const s = await monsterSprite(m, size);
  return pixelsToSvg(s[mode], s.width, s.height, m.name);
}

/** Canvas version (for drawing in the game world with drawImage). */
export async function monsterCanvas(m: Monster, mode: SpriteMode, size: SpriteSize = 'large'): Promise<HTMLCanvasElement> {
  const s = await monsterSprite(m, size);
  const buf = new PixelBuffer(s.width, s.height);
  s[mode].forEach((color, i) => {
    if (color) buf.data[i] = rgba(color);
  });
  return buf.toCanvas();
}
