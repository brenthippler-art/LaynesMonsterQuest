/**
 * A tiny drawing pad for making ride pictures in code: a grid of decoration
 * letters ('.' = see-through) with a few pen tools. rows() gives the finished
 * picture, ready to use as a ride sprite.
 */
export class Sketch {
  private grid: string[][];

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.grid = Array.from({ length: h }, () => Array<string>(w).fill('.'));
  }

  dot(x: number, y: number, ch: string): void {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px >= 0 && py >= 0 && px < this.w && py < this.h) this.grid[py][px] = ch;
  }

  rect(x: number, y: number, w: number, h: number, ch: string): void {
    for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) this.dot(px, py, ch);
  }

  /** A straight line, `thick` pixels wide. */
  line(x0: number, y0: number, x1: number, y1: number, ch: string, thick = 1): void {
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps;
      const y = y0 + ((y1 - y0) * i) / steps;
      this.rect(Math.round(x - (thick - 1) / 2), Math.round(y - (thick - 1) / 2), thick, thick, ch);
    }
  }

  /** A ring: every pixel between radius r - width and r from (cx, cy). */
  ring(cx: number, cy: number, r: number, width: number, ch: string): void {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= r && d > r - width) this.dot(x, y, ch);
      }
    }
  }

  /** A filled circle. */
  disc(cx: number, cy: number, r: number, ch: string): void {
    this.ring(cx, cy, r, r + 1, ch);
  }

  /** Copy a picture (rows of letters) onto the pad, skipping its see-through pixels. */
  paste(rows: readonly string[], ox: number, oy: number): void {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) if (row[x] !== '.') this.dot(ox + x, oy + y, row[x]);
    });
  }

  rows(): string[] {
    return this.grid.map((row) => row.join(''));
  }
}

/** A picture mirrored left to right (a horse facing the other way). */
export const mirror = (rows: readonly string[]): string[] => rows.map((row) => [...row].reverse().join(''));

/** A picture turned a quarter turn (a coaster car going down instead of across). */
export const turn = (rows: readonly string[]): string[] =>
  Array.from({ length: rows[0].length }, (_, x) => rows.map((row) => row[x]).reverse().join(''));

/** The same picture in other colors: swap = { from letter: to letter }. */
export const recolor = (rows: readonly string[], swap: Record<string, string>): string[] =>
  rows.map((row) => [...row].map((ch) => swap[ch] ?? ch).join(''));

/** Wrap a number into 0..length (for things that go round and round). */
export const wrap = (value: number, length: number): number => ((value % length) + length) % length;
