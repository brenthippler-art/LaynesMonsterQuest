import { CENTER_X, GROUND_Y } from '../art/bodies';
import { PART_VIEWBOX, type PartPicture } from '../art/drawMonster';
import { ID_BLUE, type Region } from '../art/pen';

/**
 * Step 2: shrink the hidden ID picture into a small pixel grid.
 *
 * Each sprite pixel covers a square of the picture (3x3 units for the big
 * sprite, 6x6 for the small one in the world). We draw the picture 4x bigger
 * than the sprite, so each sprite pixel gets 16 samples, and the pixel goes
 * to whichever part covers most of it. Lines and pupils ("ink") win if they
 * cover at least a quarter, so thin smiles don't vanish.
 */
export type SpriteSize = 'large' | 'small';
const UNITS_PER_PIXEL: Record<SpriteSize, number> = { large: 3, small: 6 };

/** Cell values that aren't a region number. */
export const EMPTY = -1;
export const INK = -2;

const SAMPLES = 4; // per side, so 16 per pixel
const INK_SHARE = 0.25;
const FILL_SHARE = 0.45;

export interface PixelMonster {
  width: number;
  height: number;
  /** One number per pixel: a region index, EMPTY or INK. Row by row. */
  cells: Int32Array;
  regions: Region[];
}

/** Sprite size in pixels: 84x70 (large) or 42x35 (small). */
export function spriteDims(size: SpriteSize): { width: number; height: number } {
  const u = UNITS_PER_PIXEL[size];
  return { width: Math.round(PART_VIEWBOX.w / u), height: Math.round(PART_VIEWBOX.h / u) };
}

/** The pixel where the monster's feet touch the ground (for placing it in the world). */
export function spriteFeet(size: SpriteSize): { x: number; y: number } {
  const u = UNITS_PER_PIXEL[size];
  return { x: Math.round((CENTER_X - PART_VIEWBOX.x) / u), y: Math.round((GROUND_Y - PART_VIEWBOX.y) / u) };
}

let scratch: HTMLCanvasElement | null = null;

async function loadSvg(svg: string): Promise<HTMLImageElement> {
  // A blob: URL is local to this page (allowed by our safety rules: img-src blob:).
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function rasterize(pic: PartPicture, size: SpriteSize = 'large'): Promise<PixelMonster> {
  const { width: W, height: H } = spriteDims(size);
  const big = { w: W * SAMPLES, h: H * SAMPLES };
  // Give the SVG an exact size so the browser draws it sharply at that size.
  const img = await loadSvg(pic.svg.replace('<svg ', `<svg width="${big.w}" height="${big.h}" `));

  scratch ??= document.createElement('canvas');
  scratch.width = big.w;
  scratch.height = big.h;
  const ctx = scratch.getContext('2d', { willReadFrequently: true })!;
  ctx.clearRect(0, 0, big.w, big.h);
  ctx.drawImage(img, 0, 0, big.w, big.h);
  const data = ctx.getImageData(0, 0, big.w, big.h).data;

  const cells = new Int32Array(W * H).fill(EMPTY);
  const counts = new Map<number, number>();
  const total = SAMPLES * SAMPLES;

  for (let cy = 0; cy < H; cy++) {
    for (let cx = 0; cx < W; cx++) {
      counts.clear();
      let ink = 0;
      let filled = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const i = ((cy * SAMPLES + sy) * big.w + cx * SAMPLES + sx) * 4;
          if (data[i + 3] < 128) continue;
          filled++;
          const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
          if (b === ID_BLUE) {
            const id = r + g * 256;
            if (id < pic.regions.length) counts.set(id, (counts.get(id) ?? 0) + 1);
          } else if (r === 255 && g === 255 && b === ID_BLUE + 1) {
            ink++;
          }
        }
      }
      let cell = EMPTY;
      if (ink >= total * INK_SHARE) {
        cell = INK;
      } else if (filled >= total * FILL_SHARE) {
        let best = 0;
        for (const [id, count] of counts) {
          if (count > best) {
            best = count;
            cell = id;
          }
        }
      }
      cells[cy * W + cx] = cell;
    }
  }
  return { width: W, height: H, cells, regions: pic.regions };
}
