/**
 * Does a monster's coloring-page line art print cleanly? Checks the black-and-white
 * pixels (the same ones the coloring page uses):
 *   - closed: no white pixel touches the outside edge-to-edge (a crayon can't escape)
 *   - specks: white pockets of only 1-2 pixels, too tiny to color in
 *   - slivers: white pixels squeezed between two black ones (a 1-pixel channel) —
 *     a few are normal along curves, lots of them look like noise when printed
 */
export interface LineArtReport {
  closed: boolean;
  specks: number;
  slivers: number;
}

const WHITE = '#FFFFFF';
const BLACK = '#000000';

export function checkLineArt(pixels: (string | null)[], width: number, height: number): LineArtReport {
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= width || y >= height ? null : pixels[y * width + x]);
  const sides = (x: number, y: number) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];

  let closed = true;
  let slivers = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (at(x, y) !== WHITE) continue;
      if (sides(x, y).some(([nx, ny]) => at(nx, ny) === null)) closed = false;
      const pinched = (at(x - 1, y) === BLACK && at(x + 1, y) === BLACK) || (at(x, y - 1) === BLACK && at(x, y + 1) === BLACK);
      if (pinched) slivers++;
    }
  }

  // White pockets: flood-fill each group of touching white pixels and measure it.
  const seen = new Uint8Array(width * height);
  let specks = 0;
  for (let start = 0; start < pixels.length; start++) {
    if (seen[start] || pixels[start] !== WHITE) continue;
    let size = 0;
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop()!;
      size++;
      for (const [nx, ny] of sides(i % width, Math.floor(i / width))) {
        const j = ny * width + nx;
        if (at(nx, ny) === WHITE && !seen[j]) {
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
    if (size <= 2) specks++;
  }
  return { closed, specks, slivers };
}
