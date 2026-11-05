/**
 * Tools for drawing pixel art one pixel at a time.
 *
 * PixelBuffer is a tiny image in memory: one number per pixel. Setting
 * numbers in an array is much faster than thousands of canvas fillRect()
 * calls, and every pixel lands exactly where we put it (no blurry edges).
 */

const colorCache = new Map<string, number>();

/** "#RRGGBB" → a pixel number. (Pixels are stored as 0xAABBGGRR on all common devices.) */
export function rgba(hex: string): number {
  let value = colorCache.get(hex);
  if (value === undefined) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    value = ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
    colorCache.set(hex, value);
  }
  return value;
}

export class PixelBuffer {
  readonly data: Uint32Array<ArrayBuffer>;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint32Array(width * height); // starts fully see-through
  }

  set(x: number, y: number, color: number): void {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) this.data[y * this.width + x] = color;
  }

  fill(x: number, y: number, w: number, h: number, color: number): void {
    for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) this.set(px, py, color);
  }

  /** Copy into a real (hidden) canvas so it can be drawn with drawImage(). */
  toCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const image = new ImageData(new Uint8ClampedArray(this.data.buffer), this.width, this.height);
    canvas.getContext('2d')!.putImageData(image, 0, 0);
    return canvas;
  }
}

/** Says which color a grid character should be (undefined = skip that pixel). */
export type ColorOf = (ch: string, x: number, y: number) => number | undefined;

/** Make a ColorOf from a simple { letter: "#hex" } table. */
export function palette(table: Record<string, string>): ColorOf {
  const colors = new Map(Object.entries(table).map(([ch, hex]) => [ch, rgba(hex)]));
  return (ch) => colors.get(ch);
}

/**
 * Draw a text grid (like Layne's sprite rows) into the buffer with its
 * top-left at (ox, oy). '.' is see-through. flip = mirror left/right.
 */
export function stamp(
  buf: PixelBuffer,
  rows: readonly string[],
  colorOf: ColorOf,
  ox: number,
  oy: number,
  flip = false,
): void {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const color = colorOf(ch, x, y);
      if (color !== undefined) buf.set(ox + (flip ? row.length - 1 - x : x), oy + y, color);
    }
  });
}
