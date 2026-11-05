import { TILE_PIXELS } from '../config';
import { hash2 } from '../core/rng';
import { Tile, TILE_INFO } from '../world/tiles';
import { tileAt, type TileMap } from '../world/tilemap';
import { NES } from './nesPalette';
import { rgba, stamp, type PixelBuffer } from './pixels';
import { CAVE_ENTRANCE, CAVE_EXIT, PEAK, TILE_PALETTE } from './tileSprites';

/**
 * Paints one 16x16 ground tile into a PixelBuffer at (ox, oy):
 *   1. fill with the tile's base color
 *   2. add texture (grass tufts, waves, sand dots...)
 *   3. dither the neighbor's color along edges where the ground changes
 *   4. stamp a hand-drawn shape on top for peaks and cave doors
 */
const T = TILE_PIXELS;

/** Little shapes used as texture. '#' = a pixel. */
const TUFT = ['#.#', '#.#', '.#.'];
const WAVE = ['.##..', '#..##'];
const DUNE = ['..####..', '.#....#.', '#......#'];
const SHINE = ['...#', '..#.', '.#..', '#...'];
const BLOB = ['.##.', '####', '.##.'];

export function drawTile(buf: PixelBuffer, map: TileMap, x: number, y: number, ox: number, oy: number): void {
  const t = tileAt(map, x, y);
  buf.fill(ox, oy, T, T, rgba(TILE_INFO[t].color));
  drawTexture(buf, t, x, y, ox, oy);
  ditherEdges(buf, map, t, x, y, ox, oy);
  if (t === Tile.Peak) stamp(buf, PEAK, TILE_PALETTE, ox, oy, hash2(x, y, 13) < 0.5);
  if (t === Tile.CaveEntrance) stamp(buf, CAVE_ENTRANCE, TILE_PALETTE, ox, oy);
  if (t === Tile.CaveExit) stamp(buf, CAVE_EXIT, TILE_PALETTE, ox, oy);
}

/** Single pixels at spots that look random but are always the same for this tile. */
function sprinkle(buf: PixelBuffer, hex: string, count: number, x: number, y: number, ox: number, oy: number, salt: number) {
  const color = rgba(hex);
  for (let k = 0; k < count; k++) {
    const px = Math.floor(hash2(x * 31 + k, y, salt) * T);
    const py = Math.floor(hash2(x, y * 17 + k, salt + 1) * T);
    buf.set(ox + px, oy + py, color);
  }
}

/** A small shape (like TUFT) at a few random-looking spots inside the tile. */
function shapes(buf: PixelBuffer, shape: string[], hex: string, count: number, x: number, y: number, ox: number, oy: number, salt: number) {
  const color = rgba(hex);
  const w = shape[0].length;
  const h = shape.length;
  for (let k = 0; k < count; k++) {
    const sx = ox + 1 + Math.floor(hash2(x + k * 7, y, salt) * (T - w - 1));
    const sy = oy + 1 + Math.floor(hash2(x, y + k * 5, salt + 1) * (T - h - 1));
    shape.forEach((row, ry) => {
      for (let rx = 0; rx < w; rx++) if (row[rx] === '#') buf.set(sx + rx, sy + ry, color);
    });
  }
}

function drawTexture(buf: PixelBuffer, t: Tile, x: number, y: number, ox: number, oy: number) {
  switch (t) {
    case Tile.Grass:
      shapes(buf, TUFT, NES.green, 2, x, y, ox, oy, 1);
      return sprinkle(buf, NES.limeLight, 2, x, y, ox, oy, 2);
    case Tile.Savannah:
      return shapes(buf, TUFT, NES.ochre, 2, x, y, ox, oy, 3);
    case Tile.ForestFloor:
      sprinkle(buf, NES.greenForest, 10, x, y, ox, oy, 4);
      return sprinkle(buf, NES.greenBright, 3, x, y, ox, oy, 5);
    case Tile.DeepWater:
      return shapes(buf, WAVE, NES.sky, 1, x, y, ox, oy, 6);
    case Tile.ShallowWater:
      return shapes(buf, WAVE, NES.white, 2, x, y, ox, oy, 7);
    case Tile.Sand:
      sprinkle(buf, NES.orangeLight, 5, x, y, ox, oy, 8);
      return sprinkle(buf, NES.white, 2, x, y, ox, oy, 9);
    case Tile.Desert:
      if (hash2(x, y, 10) < 0.5) shapes(buf, DUNE, NES.orangeLight, 1, x, y, ox, oy, 11);
      return sprinkle(buf, NES.ochre, 3, x, y, ox, oy, 12);
    case Tile.Snow:
      sprinkle(buf, NES.skyLight, 5, x, y, ox, oy, 13);
      return sprinkle(buf, NES.grayLight, 1, x, y, ox, oy, 14);
    case Tile.Ice:
      shapes(buf, SHINE, NES.white, 2, x, y, ox, oy, 15);
      return sprinkle(buf, NES.sky, 3, x, y, ox, oy, 16);
    case Tile.Mountain:
    case Tile.Peak:
    case Tile.CaveEntrance:
      sprinkle(buf, NES.gray, 8, x, y, ox, oy, 17);
      return sprinkle(buf, NES.white, 3, x, y, ox, oy, 18);
    case Tile.Swamp:
      sprinkle(buf, NES.greenDark, 10, x, y, ox, oy, 19);
      sprinkle(buf, NES.brownDark, 5, x, y, ox, oy, 20);
      return sprinkle(buf, NES.teal, 3, x, y, ox, oy, 21);
    case Tile.Ash:
      sprinkle(buf, NES.grayLight, 6, x, y, ox, oy, 22);
      return sprinkle(buf, NES.black, 4, x, y, ox, oy, 23);
    case Tile.VolcanoRock:
      sprinkle(buf, NES.brownDark, 10, x, y, ox, oy, 24);
      return sprinkle(buf, NES.red, 4, x, y, ox, oy, 25);
    case Tile.Lava:
      shapes(buf, BLOB, NES.gold, 2, x, y, ox, oy, 26);
      return sprinkle(buf, NES.yellowLight, 4, x, y, ox, oy, 27);
    case Tile.CaveFloor:
    case Tile.CaveExit:
      sprinkle(buf, NES.brownRed, 8, x, y, ox, oy, 28);
      return sprinkle(buf, NES.ochre, 3, x, y, ox, oy, 29);
    case Tile.CaveWall:
      return drawBricks(buf, x, y, ox, oy);
  }
}

/** Stone blocks with black gaps between them, like a classic NES dungeon wall. */
function drawBricks(buf: PixelBuffer, x: number, y: number, ox: number, oy: number) {
  const mortar = rgba(NES.black);
  const light = rgba(NES.grayLight);
  for (let i = 0; i < T; i++) {
    buf.set(ox + i, oy + 7, mortar);
    buf.set(ox + i, oy + 15, mortar);
  }
  for (let j = 0; j < 7; j++) {
    buf.set(ox + 7, oy + j, mortar);
    buf.set(ox + 15, oy + 8 + j, mortar);
  }
  // Light top edge on each block so they look raised.
  for (let i = 0; i < 6; i++) {
    buf.set(ox + i, oy, light);
    buf.set(ox + 8 + i, oy + 8, light);
  }
  sprinkle(buf, NES.grayLight, 2, x, y, ox, oy, 30);
}

/**
 * Where two kinds of ground meet, the neighbor's color "leaks" in as a
 * pixel pattern that fades out: lots of pixels at the edge, fewer further in.
 * That's how NES-era games faked smooth transitions with few colors.
 */
const SIDES = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;
const DITHER = [0.55, 0.3, 0.12];

function ditherEdges(buf: PixelBuffer, map: TileMap, t: Tile, x: number, y: number, ox: number, oy: number) {
  for (let s = 0; s < 4; s++) {
    const [dx, dy] = SIDES[s];
    const n = tileAt(map, x + dx, y + dy);
    if (n === t || TILE_INFO[n].color === TILE_INFO[t].color) continue;
    const color = rgba(TILE_INFO[n].color);
    for (let along = 0; along < T; along++) {
      for (let depth = 0; depth < DITHER.length; depth++) {
        if (hash2(x * T + along, y * T + depth, 50 + s) >= DITHER[depth]) continue;
        const px = dx === 0 ? along : dx > 0 ? T - 1 - depth : depth;
        const py = dy === 0 ? along : dy > 0 ? T - 1 - depth : depth;
        buf.set(ox + px, oy + py, color);
      }
    }
  }
}
