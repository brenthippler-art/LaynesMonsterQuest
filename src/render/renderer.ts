import { CHUNK_TILES, TILE_PIXELS } from '../config';
import { type WildMonster } from '../encounters/wildMonsters';
import { type GlassesStyle } from '../player/glasses';
import { type Player, type Point } from '../player/player';
import { TILE_INFO } from '../world/tiles';
import { type TileMap } from '../world/tilemap';
import { type Camera } from './camera';
import { ChunkCache } from './chunkCache';
import { NES } from './nesPalette';
import { drawLayne } from './playerArt';
import { drawWildMonster } from './wildArt';

export interface Scene {
  map: TileMap;
  camera: Camera;
  player: Player;
  /** This visit's glasses look. */
  glasses: GlassesStyle;
  /** Monsters wandering nearby. */
  wild: WildMonster[];
  /** Where a tap-to-walk is heading (or null). */
  target: Point | null;
  /** 0..1: how dark the screen is during a door transition. */
  fade: number;
  /** Seconds since start, for little animations. */
  time: number;
}

/** Four corner brackets around the tapped tile (16x16 art pixels). */
const TARGET_CORNERS = [
  [0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [0, 2], [0, 3],
] as const;

/** Draws one frame: ground chunks → tap target → Layne → door fade. */
export class Renderer {
  readonly chunks = new ChunkCache();
  /** Where the camera was last frame (to know which way Layne is walking). */
  private lastCamera = { x: 0, y: 0 };

  constructor(private ctx: CanvasRenderingContext2D) {}

  /** Forget every map picture (called when leaving a world). */
  forgetMaps(): void {
    this.chunks.clear();
  }

  /** Just black (title screen and world picker, where no world is loaded). */
  clear(width: number, height: number): void {
    this.ctx.fillStyle = NES.black;
    this.ctx.fillRect(0, 0, width, height);
  }

  draw(s: Scene): void {
    const { ctx } = this;
    const { camera, map } = s;
    const ox = camera.originX;
    const oy = camera.originY;
    ctx.imageSmoothingEnabled = false; // big crisp pixels, never blurry

    // Anything past the map edge: plain ocean (or rock in caves).
    ctx.fillStyle = map.look ? map.look.color(map.outside) : TILE_INFO[map.outside].color;
    ctx.fillRect(0, 0, camera.viewW, camera.viewH);

    // Only the chunks that are on screen.
    const chunkPx = CHUNK_TILES * camera.tilePx;
    const firstCx = Math.max(0, Math.floor(-ox / chunkPx));
    const firstCy = Math.max(0, Math.floor(-oy / chunkPx));
    const lastCx = Math.min(Math.ceil(map.width / CHUNK_TILES) - 1, Math.floor((camera.viewW - ox) / chunkPx));
    const lastCy = Math.min(Math.ceil(map.height / CHUNK_TILES) - 1, Math.floor((camera.viewH - oy) / chunkPx));
    for (let cy = firstCy; cy <= lastCy; cy++) {
      for (let cx = firstCx; cx <= lastCx; cx++) {
        ctx.drawImage(this.chunks.get(map, cx, cy), ox + cx * chunkPx, oy + cy * chunkPx, chunkPx, chunkPx);
      }
    }
    // Paint a bit of a chunk just off-screen, ready for later (spreads the work out: no stutter at edges).
    const maxCx = Math.ceil(map.width / CHUNK_TILES) - 1;
    const maxCy = Math.ceil(map.height / CHUNK_TILES) - 1;
    const ring: [number, number][] = [];
    for (let cy = firstCy - 1; cy <= lastCy + 1; cy++) {
      for (let cx = firstCx - 1; cx <= lastCx + 1; cx++) {
        const onScreen = cx >= firstCx && cx <= lastCx && cy >= firstCy && cy <= lastCy;
        if (!onScreen && cx >= 0 && cy >= 0 && cx <= maxCx && cy <= maxCy) ring.push([cx, cy]);
      }
    }
    // Paint the chunks Layne is walking TOWARD first.
    const dirX = camera.x - this.lastCamera.x;
    const dirY = camera.y - this.lastCamera.y;
    this.lastCamera = { x: camera.x, y: camera.y };
    const ahead = ([cx, cy]: [number, number]) => ((cx + 0.5) * CHUNK_TILES - camera.x) * dirX + ((cy + 0.5) * CHUNK_TILES - camera.y) * dirY;
    ring.sort((a, b) => ahead(b) - ahead(a));
    this.chunks.warmStep(map, ring);

    if (map.rides) this.drawRides(map, camera, s.time);
    if (s.target) this.drawTarget(s.target, camera, s.time);

    // Layne and the monsters, back to front: whoever is lower on screen is in front.
    const things = [
      { y: s.player.y, draw: () => this.drawPlayer(s) },
      ...s.wild.map((w) => ({ y: w.y, draw: () => drawWildMonster(ctx, camera, w, s.time) })),
    ];
    things.sort((a, b) => a.y - b.y);
    for (const thing of things) thing.draw();

    // NES games faded in a few hard steps (by swapping palettes), not smoothly.
    if (s.fade > 0) {
      const step = Math.ceil(s.fade * 4) / 4;
      ctx.fillStyle = `rgba(0, 0, 0, ${step})`;
      ctx.fillRect(0, 0, camera.viewW, camera.viewH);
    }
  }

  /** Rides and other moving things: only the ones on screen (each is a few small pictures, so this is cheap). */
  private drawRides(map: TileMap, camera: Camera, time: number) {
    const t = camera.tilePx;
    for (const ride of map.rides!) {
      const sx = camera.originX + ride.x * t;
      const sy = camera.originY + ride.y * t;
      if (sx >= camera.viewW || sy >= camera.viewH || sx + ride.w * t <= 0 || sy + ride.h * t <= 0) continue;
      ride.draw(this.ctx, sx, sy, camera.pixelPx, time);
    }
  }

  private drawPlayer(s: Scene) {
    const feet = s.camera.toScreen(s.player.x, s.player.y);
    drawLayne(this.ctx, feet.x, feet.y, s.camera.pixelPx, s.player.facing, s.player.walkFrame, s.glasses);
  }

  /** Blinking corner brackets around the tile Layne is walking to. */
  private drawTarget(t: Point, camera: Camera, time: number) {
    const { ctx } = this;
    const p = camera.pixelPx;
    const top = camera.toScreen(t.x, t.y);
    ctx.fillStyle = Math.floor(time * 6) % 2 ? NES.white : NES.gold;
    const last = TILE_PIXELS - 1;
    for (const [cx, cy] of TARGET_CORNERS) {
      // Same L-shape mirrored into all four corners.
      for (const [mx, my] of [[cx, cy], [last - cx, cy], [cx, last - cy], [last - cx, last - cy]]) {
        ctx.fillRect(top.x + mx * p, top.y + my * p, p, p);
      }
    }
  }
}
