import { NES } from '../render/nesPalette';
import { PixelBuffer, rgba } from '../render/pixels';
import { Tile, TILE_INFO } from '../world/tiles';
import { type MapLabel, type TileMap } from '../world/tilemap';
import { realmIconColor } from './pixelIcon';

/**
 * The little map in the top-right corner, NES style: a black box with a
 * white border, one map pixel per patch of ground, black dots for cave
 * doors, and a blinking dot for Layne. In a cave it shows that cave.
 * In a building world the walls outline the rooms, and each room shows its
 * realm icon (at half size).
 */
const FRAME = 3; // black edge + white line + black gap
const SIZE_OF_SCREEN = 0.26; // the map is about this fraction of the screen's short side

/** A few tiles get special map colors so they stand out. */
const MAP_COLORS: Partial<Record<Tile, string>> = {
  [Tile.Peak]: NES.gray,
  [Tile.Lava]: NES.redBright,
  [Tile.CaveEntrance]: NES.black,
  [Tile.CaveExit]: NES.gold,
};

export class WorldMap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  /** The map picture without Layne's dot, made once per map. */
  private pictures = new Map<string, HTMLCanvasElement>();
  private lastDrawn = '';

  constructor(parent: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'world-map';
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'Map');
    this.ctx = this.canvas.getContext('2d')!;
    parent.append(this.canvas);
  }

  /** Forget the map pictures (called when leaving a world). */
  forgetMaps(): void {
    this.pictures.clear();
    this.lastDrawn = '';
  }

  /** Call every frame. It only redraws when the dot moves or blinks. */
  update(map: TileMap, playerX: number, playerY: number, time: number): void {
    const step = map.width > 100 ? 2 : 1; // the big overworld: 1 map pixel = 2x2 tiles
    const picture = this.pictureOf(map, step);
    const dotX = FRAME + Math.floor(playerX / step);
    const dotY = FRAME + Math.floor(playerY / step);
    const blink = Math.floor(time * 3) % 2;
    const scale = Math.max(1, Math.round((Math.min(innerWidth, innerHeight) * SIZE_OF_SCREEN) / picture.width));

    const key = `${map.id}:${dotX}:${dotY}:${blink}:${scale}`;
    if (key === this.lastDrawn) return;
    this.lastDrawn = key;

    if (this.canvas.width !== picture.width || this.canvas.height !== picture.height) {
      this.canvas.width = picture.width;
      this.canvas.height = picture.height;
    }
    // Whole-number scaling keeps the map's pixels all the same size.
    this.canvas.style.width = `${picture.width * scale}px`;

    this.ctx.drawImage(picture, 0, 0);
    this.ctx.fillStyle = NES.black;
    this.ctx.fillRect(dotX - 2, dotY - 2, 5, 5);
    this.ctx.fillStyle = blink ? NES.white : NES.redBright;
    this.ctx.fillRect(dotX - 1, dotY - 1, 3, 3);
  }

  private pictureOf(map: TileMap, step: number): HTMLCanvasElement {
    let picture = this.pictures.get(map.id);
    if (picture) return picture;

    const w = Math.ceil(map.width / step);
    const h = Math.ceil(map.height / step);
    const buf = new PixelBuffer(w + FRAME * 2, h + FRAME * 2);
    buf.fill(0, 0, buf.width, buf.height, rgba(NES.black));
    const white = rgba(NES.white);
    buf.fill(1, 1, buf.width - 2, 1, white);
    buf.fill(1, buf.height - 2, buf.width - 2, 1, white);
    buf.fill(1, 1, 1, buf.height - 2, white);
    buf.fill(buf.width - 2, 1, 1, buf.height - 2, white);

    const colorOf = (t: Tile) => (map.look ? map.look.color(t) : (MAP_COLORS[t] ?? TILE_INFO[t].color));
    for (let my = 0; my < h; my++) {
      for (let mx = 0; mx < w; mx++) {
        const t = map.tiles[my * step * map.width + mx * step] as Tile;
        buf.set(FRAME + mx, FRAME + my, rgba(colorOf(t)));
      }
    }
    for (const label of map.labels ?? []) drawLabel(buf, label, step);
    // Doors are drawn on top (and bigger), so a door is never skipped when shrinking the map.
    for (const door of map.doors.values()) {
      const t = map.tiles[door.y * map.width + door.x] as Tile;
      const color = map.look ? NES.gold : (MAP_COLORS[t] ?? NES.black); // stairs and ladders: gold dots
      buf.fill(FRAME + Math.floor(door.x / step), FRAME + Math.floor(door.y / step), 2, 2, rgba(color));
    }

    picture = buf.toCanvas();
    this.pictures.set(map.id, picture);
    return picture;
  }
}

/** A room's realm icon at half size (every other pixel), centered on the label's spot. */
function drawLabel(buf: PixelBuffer, label: MapLabel, step: number): void {
  const rows = label.icon;
  const w = Math.ceil(rows[0].length / 2);
  const h = Math.ceil(rows.length / 2);
  const left = FRAME + Math.floor(label.x / step) - Math.floor(w / 2);
  const top = FRAME + Math.floor(label.y / step) - Math.floor(h / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Of each 2x2 block, use the first pixel that isn't see-through.
      const ch = [rows[y * 2]?.[x * 2], rows[y * 2]?.[x * 2 + 1], rows[y * 2 + 1]?.[x * 2], rows[y * 2 + 1]?.[x * 2 + 1]].find((c) => c && c !== '.');
      if (ch) buf.set(left + x, top + y, rgba(realmIconColor(ch)));
    }
  }
}
