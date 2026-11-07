/**
 * Black-and-white line-art versions of pixel pictures, for coloring pages.
 */

/** One row of same-colored pixels as an SVG path piece. A tiny overlap hides hairline gaps when printed. */
function run(x: number, y: number, len: number): string {
  return `M${x} ${y}h${len}v1.04h-${len}z`;
}

/** Pixels (null = empty) → SVG. Only black and white, so it's ready to color. */
export function bwPixelsSvg(pixels: (string | null)[], width: number, height: number): string {
  const black: string[] = [];
  const white: string[] = [];
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      const c = pixels[y * width + x];
      if (!c) {
        x++;
        continue;
      }
      let len = 1;
      while (x + len < width && pixels[y * width + x + len] === c) len++;
      (c === '#000000' ? black : white).push(run(x, y, len));
      x += len;
    }
  }
  return (
    `<svg viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMax meet" aria-hidden="true">` +
    `<path fill="#FFFFFF" d="${white.join('')}"/><path fill="#000000" d="${black.join('')}"/></svg>`
  );
}

/**
 * A decoration grid (tree, cactus...) as line art: its black outline stays
 * black, its colors become white, and any edge without an outline gets one,
 * so every shape is closed and colorable.
 */
export function outlineGridSvg(rows: readonly string[]): string {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? '.' : (rows[y][x] ?? '.'));
  const pixels: (string | null)[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = at(x, y);
      if (ch === '.') {
        pixels.push(null);
        continue;
      }
      const onEdge = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].includes('.');
      pixels.push(ch === 'k' || onEdge ? '#000000' : '#FFFFFF');
    }
  }
  return bwPixelsSvg(pixels, w, h);
}
