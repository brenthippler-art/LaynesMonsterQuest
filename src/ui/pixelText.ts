import { textRows } from './pixelFont';
import { gridSvg } from './pixelIcon';

/**
 * Words in the game's pixel font as a crisp SVG picture: colored letters with
 * a 1-pixel black outline and, optionally, a drop shadow. SVG stays sharp at
 * any size, so CSS can make it as big as it likes.
 * Several lines are centered under each other.
 */
export function pixelTextSvg(lines: string[], fill: string, shadow?: string): string {
  // 1. Each line as '#'/'.' rows, padded to the same width and centered.
  const blocks = lines.map(textRows);
  const width = Math.max(...blocks.map((b) => b[0].length));
  const ink: string[] = [];
  blocks.forEach((rows, i) => {
    if (i > 0) ink.push('.'.repeat(width), '.'.repeat(width), '.'.repeat(width)); // gap between lines
    const left = Math.floor((width - rows[0].length) / 2);
    for (const row of rows) ink.push('.'.repeat(left) + row + '.'.repeat(width - left - row.length));
  });

  // 2. A bigger grid with room for the outline (1 px all round) and the shadow (1 more px right/down).
  const W = width + 3;
  const H = ink.length + 3;
  const at = (x: number, y: number) => ink[y - 1]?.[x - 1] === '#';
  const grid: string[][] = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (at(x, y) ? '#' : '.')));
  // Outline: any empty square touching a letter square (including corners) turns black.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] !== '.') continue;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) if (at(x + ox, y + oy)) grid[y][x] = 'k';
    }
  }
  // Shadow: the outlined shape again, one pixel down and right, behind everything.
  if (shadow) {
    for (let y = H - 1; y > 0; y--) for (let x = W - 1; x > 0; x--) if (grid[y][x] === '.' && grid[y - 1][x - 1] !== '.' && grid[y - 1][x - 1] !== 's') grid[y][x] = 's';
  }

  const colors: Record<string, string> = { '#': fill, k: '#000000', s: shadow ?? '#000000' };
  return gridSvg(
    grid.map((row) => row.join('')),
    (ch) => colors[ch],
  );
}
