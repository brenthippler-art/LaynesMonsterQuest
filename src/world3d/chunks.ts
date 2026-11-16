import { type BufferGeometry, type Material, Mesh, type Object3D, Vector3 } from 'three';
import { hash2 } from '../core/rng';
import { inBounds, type TileMap } from '../world/tilemap';
import { blockHeight, cornerAt, tileColor, tileGlows, tileTop } from './ground';
import { MeshBuilder, rgb, shade } from './meshBuilder';
import { addProps } from './props';

/**
 * The world is cut into square CHUNKS of 16x16 tiles. Only the chunks near Layne
 * are built (and the fog hides the rest), and chunks far behind him are thrown
 * away again, so even the 200x200 island stays light on a tablet.
 *
 * Each chunk has up to three meshes:
 *   ground  the tiles (hills, floors, walls)
 *   props   trees, rocks, flowers... (lit, like the ground)
 *   glow    lava, crystals, cave lights (always bright, even in a dark cave)
 */
export const CHUNK = 16;
/** Chunks this far from Layne's chunk are built (2 = a 5x5 block of chunks around him). */
const NEAR = 2;
/** ...and kept until they're this far away (a bit more, so walking back and forth doesn't rebuild them). */
const KEEP = NEAR + 1;
/** Building takes a moment, so while walking only this many new chunks are built per frame. */
const BUILDS_PER_FRAME = 2;

/** Materials are made once in view3d.ts. */
export interface ChunkMaterials {
  lit: Material;
  glow: Material;
}

interface Chunk {
  meshes: Mesh[];
}

const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const d = new Vector3();

export class Chunks {
  private map: TileMap | null = null;
  private built = new Map<string, Chunk>();

  constructor(
    private parent: Object3D,
    private materials: ChunkMaterials,
  ) {}

  /**
   * Make sure the chunks around (x, y) exist. `all` = build every missing one now
   * (when arriving somewhere), otherwise just a couple per frame.
   */
  update(map: TileMap, x: number, y: number, all = false): void {
    if (map !== this.map) {
      this.clear();
      this.map = map;
    }
    const cx = Math.floor(x / CHUNK);
    const cy = Math.floor(y / CHUNK);
    for (const [key, chunk] of this.built) {
      const [kx, ky] = key.split(',').map(Number);
      if (Math.abs(kx - cx) > KEEP || Math.abs(ky - cy) > KEEP) this.drop(key, chunk);
    }
    // Nearest first, so the ground under Layne is always there.
    const wanted: [number, number, number][] = [];
    for (let oy = -NEAR; oy <= NEAR; oy++) {
      for (let ox = -NEAR; ox <= NEAR; ox++) {
        const kx = cx + ox;
        const ky = cy + oy;
        if (kx < 0 || ky < 0 || kx * CHUNK >= map.width || ky * CHUNK >= map.height) continue;
        if (!this.built.has(`${kx},${ky}`)) wanted.push([kx, ky, Math.hypot(ox, oy)]);
      }
    }
    wanted.sort((p, q) => p[2] - q[2]);
    for (const [kx, ky] of all ? wanted : wanted.slice(0, BUILDS_PER_FRAME)) this.build(map, kx, ky);
  }

  /** Throw everything away (leaving the map, or the world). */
  clear(): void {
    for (const [key, chunk] of this.built) this.drop(key, chunk);
    this.map = null;
  }

  private drop(key: string, chunk: Chunk): void {
    for (const m of chunk.meshes) {
      this.parent.remove(m);
      m.geometry.dispose(); // free the graphics memory too
    }
    this.built.delete(key);
  }

  private build(map: TileMap, kx: number, ky: number): void {
    const ground = new MeshBuilder();
    const props = new MeshBuilder();
    const glow = new MeshBuilder();
    const x1 = Math.min(map.width, (kx + 1) * CHUNK);
    const y1 = Math.min(map.height, (ky + 1) * CHUNK);
    for (let y = ky * CHUNK; y < y1; y++) {
      for (let x = kx * CHUNK; x < x1; x++) {
        if (map.ground) smoothTile(map, x, y, ground, glow);
        else blockTile(map, x, y, ground, glow);
        addProps(map, x, y, props, glow);
      }
    }
    const meshes: Mesh[] = [];
    const add = (geo: BufferGeometry | null, mat: Material, name: string) => {
      if (!geo) return;
      const mesh = new Mesh(geo, mat);
      mesh.name = name;
      mesh.matrixAutoUpdate = false; // chunks never move
      this.parent.add(mesh);
      meshes.push(mesh);
    };
    add(ground.build(), this.materials.lit, 'ground');
    add(props.build(), this.materials.lit, 'props');
    add(glow.build(), this.materials.glow, 'glow');
    this.built.set(`${kx},${ky}`, { meshes });
  }
}

/** Every tile is a little lighter or darker than the next, like the checkered ground in old 3D games. */
function tileShade(map: TileMap, x: number, y: number) {
  const t = map.tiles[y * map.width + x];
  const base = rgb(tileColor(map, t));
  return shade(base, (hash2(x, y, 99) - 0.5) * 0.12);
}

/** A hill tile: two triangles between its four corner heights. Lava goes in the glowing mesh. */
function smoothTile(map: TileMap, x: number, y: number, ground: MeshBuilder, glow: MeshBuilder): void {
  a.set(x, cornerAt(map, x, y), y);
  b.set(x + 1, cornerAt(map, x + 1, y), y);
  c.set(x, cornerAt(map, x, y + 1), y + 1);
  d.set(x + 1, cornerAt(map, x + 1, y + 1), y + 1);
  const target = tileGlows(map, map.tiles[y * map.width + x]) ? glow : ground;
  const color = tileShade(map, x, y);
  // Same split as groundY(): triangles (a, c, d) and (a, d, b).
  target.tri(a, c, d, color).tri(a, d, b, color);
}

/** A block tile: a flat top, plus a wall down to any lower neighbor. */
function blockTile(map: TileMap, x: number, y: number, ground: MeshBuilder, glow: MeshBuilder): void {
  const h = tileTop(map, x, y);
  const color = tileShade(map, x, y);
  const target = tileGlows(map, map.tiles[y * map.width + x]) ? glow : ground;
  a.set(x, h, y);
  b.set(x + 1, h, y);
  c.set(x, h, y + 1);
  d.set(x + 1, h, y + 1);
  target.tri(a, c, d, color).tri(a, d, b, color);

  const side = shade(color, -0.3);
  // Each side: the neighbor, and the edge's two corners (going counter-clockwise seen from outside).
  const sides: [number, number, number, number, number, number][] = [
    [0, -1, x + 1, y, x, y], // north
    [0, 1, x, y + 1, x + 1, y + 1], // south
    [-1, 0, x, y, x, y + 1], // west
    [1, 0, x + 1, y + 1, x + 1, y], // east
  ];
  for (const [dx, dy, ex, ey, fx, fy] of sides) {
    const nh = inBounds(map, x + dx, y + dy) ? tileTop(map, x + dx, y + dy) : blockHeight(map, map.outside);
    if (nh >= h) continue;
    a.set(ex, h, ey);
    b.set(fx, h, fy);
    c.set(fx, nh, fy);
    d.set(ex, nh, ey);
    ground.quad(a, d, c, b, side);
  }
}
