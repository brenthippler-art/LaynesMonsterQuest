import { CHUNK_TILES, TILE_PIXELS } from '../config';
import { type Decor } from '../world/decorations';
import { inBounds, type TileMap } from '../world/tilemap';
import { drawDecor } from './decorArt';
import { PixelBuffer } from './pixels';
import { drawTile } from './tileArt';

/**
 * Drawing thousands of tiles every frame would be slow on a tablet. Instead we
 * paint each 8x8 block of tiles ONCE into a tiny hidden image ("chunk") at
 * true NES size (16 pixels per tile), keep it, and just scale the visible
 * chunks up onto the screen each frame. A chunk is only 128x128 pixels,
 * so we can afford to keep lots of them.
 *
 * Chunks just off-screen are painted ahead of time, a couple of rows per
 * frame, so walking into a new area never makes the game stutter.
 */
const ROWS_PER_STEP = 2; // how much ahead-of-time painting to do each frame

/** A chunk being painted a few rows at a time. Steps 0-7 = ground rows, 8-15 = decoration rows. */
interface Build {
  key: string;
  map: TileMap;
  cx: number;
  cy: number;
  buf: PixelBuffer;
  step: number;
}

export class ChunkCache {
  private chunks = new Map<string, HTMLCanvasElement>();
  private building: Build | null = null;

  /** maxChunks limits memory: when full, the chunk unused for the longest is thrown away. */
  constructor(private maxChunks = 256) {}

  /** The chunk's picture. If it isn't ready, it's painted right now (only happens on a first look or after a door). */
  get(map: TileMap, cx: number, cy: number): HTMLCanvasElement {
    const key = `${map.id}:${cx}:${cy}`;
    let canvas = this.chunks.get(key);
    if (canvas) {
      this.chunks.delete(key); // re-added below = "most recently used"
    } else {
      const build = this.building?.key === key ? this.building : startBuild(key, map, cx, cy);
      while (build.step < CHUNK_TILES * 2) paintStep(build);
      if (this.building === build) this.building = null;
      canvas = build.buf.toCanvas();
    }
    this.store(key, canvas);
    return canvas;
  }

  /**
   * Paint a little more of a chunk that's just off-screen (call once per frame).
   * `candidates` are the chunks around the screen's edges.
   */
  warmStep(map: TileMap, candidates: [number, number][]): void {
    if (!this.building || this.building.map !== map) {
      const next = candidates.find(([cx, cy]) => !this.chunks.has(`${map.id}:${cx}:${cy}`));
      if (!next) return;
      this.building = startBuild(`${map.id}:${next[0]}:${next[1]}`, map, next[0], next[1]);
    }
    const build = this.building;
    for (let i = 0; i < ROWS_PER_STEP && build.step < CHUNK_TILES * 2; i++) paintStep(build);
    if (build.step >= CHUNK_TILES * 2) {
      this.store(build.key, build.buf.toCanvas());
      this.building = null;
    }
  }

  private store(key: string, canvas: HTMLCanvasElement): void {
    if (!this.chunks.has(key) && this.chunks.size >= this.maxChunks) {
      const oldest = this.chunks.keys().next().value;
      if (oldest !== undefined) this.chunks.delete(oldest);
    }
    this.chunks.set(key, canvas);
  }
}

function startBuild(key: string, map: TileMap, cx: number, cy: number): Build {
  const size = CHUNK_TILES * TILE_PIXELS;
  return { key, map, cx, cy, buf: new PixelBuffer(size, size), step: 0 };
}

/** Paint one row of the chunk: first all the ground rows, then the decoration rows on top. */
function paintStep(b: Build): void {
  const ty = b.step % CHUNK_TILES;
  const decorPass = b.step >= CHUNK_TILES;
  const y = b.cy * CHUNK_TILES + ty;
  for (let tx = 0; tx < CHUNK_TILES; tx++) {
    const x = b.cx * CHUNK_TILES + tx;
    if (!decorPass) drawTile(b.buf, b.map, x, y, tx * TILE_PIXELS, ty * TILE_PIXELS);
    else if (inBounds(b.map, x, y)) drawDecor(b.buf, b.map.decor[y * b.map.width + x] as Decor, x, y, tx * TILE_PIXELS, ty * TILE_PIXELS);
  }
  b.step++;
}
