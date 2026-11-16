import { type BufferGeometry, type Material, Mesh, MeshLambertMaterial, type Object3D, Vector3 } from 'three';
import { hash2 } from '../core/rng';
import { inBounds, type TileMap } from '../world/tilemap';
import { Decor } from '../world/decorations';
import { blockHeight, cornerAt, EDGE, forestEdge, groundY, tileColor, tileGlows, tileTop } from './ground';
import { MeshBuilder, place, rgb, shade } from './meshBuilder';
import { addProps } from './props';
import { addIslandDecor } from './props/islandDecor';
import { standeeAt } from './standees';
import { chunkPicture, texturedTile } from './textured';

/**
 * The world is cut into square CHUNKS of 16x16 tiles. Only the chunks near Layne
 * are built (and the fog hides the rest), and chunks far behind him are thrown
 * away again, so even the 200x200 island stays light on a tablet.
 *
 * Each chunk has up to four meshes:
 *   ground    the tiles (hills, floors, walls). Building worlds: with the tiles' own
 *             pixel-art pictures on them (textured.ts)
 *   props     trees, rocks, flowers... (lit, like the ground)
 *   glow      lava, crystals, cave lights (always bright, even in a dark cave)
 *   standees  building-world furniture made from pixel art (standees.ts). They face
 *             the camera, so they're rebuilt (a few per frame) when the camera turns.
 */
export const CHUNK = 16;
/** Chunks this far from Layne's chunk are built (2 = a 5x5 block of chunks around him). */
const NEAR = 2;
/** ...and kept until they're this far away (a bit more, so walking back and forth doesn't rebuild them). */
const KEEP = NEAR + 1;
/** Building takes a moment, so while walking only this many new chunks are built per frame. */
const BUILDS_PER_FRAME = 2;
/** Turning the camera re-faces this many chunks' furniture per frame. */
const TURNS_PER_FRAME = 4;

/** Materials are made once in view3d.ts. */
export interface ChunkMaterials {
  lit: Material;
  glow: Material;
}

interface Chunk {
  kx: number;
  ky: number;
  meshes: Mesh[];
  /** Building worlds: the chunk's own material with its picture of the tiles (freed with the chunk). */
  material: MeshLambertMaterial | null;
  standees: Mesh | null;
  /** Which way the standees face (the camera's turn when they were built). */
  facing: number;
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
  update(map: TileMap, x: number, y: number, facing: number, all = false): void {
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
    // A forest's ring of trees past the edge lives in the chunks just outside the map.
    const pad = forestEdge(map) ? EDGE : 0;
    for (let oy = -NEAR; oy <= NEAR; oy++) {
      for (let ox = -NEAR; ox <= NEAR; ox++) {
        const kx = cx + ox;
        const ky = cy + oy;
        if ((kx + 1) * CHUNK <= -pad || (ky + 1) * CHUNK <= -pad || kx * CHUNK >= map.width + pad || ky * CHUNK >= map.height + pad) continue;
        if (!this.built.has(`${kx},${ky}`)) wanted.push([kx, ky, Math.hypot(ox, oy)]);
      }
    }
    wanted.sort((p, q) => p[2] - q[2]);
    for (const [kx, ky] of all ? wanted : wanted.slice(0, BUILDS_PER_FRAME)) this.build(map, kx, ky, facing);

    // The camera turned? Turn the furniture to face it again, nearest chunks first.
    if (!map.look) return;
    const turned = [...this.built.values()].filter((ch) => ch.facing !== facing);
    turned.sort((p, q) => Math.hypot(p.kx - cx, p.ky - cy) - Math.hypot(q.kx - cx, q.ky - cy));
    for (const chunk of all ? turned : turned.slice(0, TURNS_PER_FRAME)) this.buildStandees(map, chunk, facing);
  }

  /** Throw everything away (leaving the map, or the world). */
  clear(): void {
    for (const [key, chunk] of this.built) this.drop(key, chunk);
    this.map = null;
  }

  private drop(key: string, chunk: Chunk): void {
    for (const m of [...chunk.meshes, ...(chunk.standees ? [chunk.standees] : [])]) {
      this.parent.remove(m);
      m.geometry.dispose(); // free the graphics memory too
    }
    if (chunk.material) {
      chunk.material.map?.dispose();
      chunk.material.dispose();
    }
    this.built.delete(key);
  }

  private build(map: TileMap, kx: number, ky: number, facing: number): void {
    const ground = new MeshBuilder();
    const props = new MeshBuilder();
    const glow = new MeshBuilder();
    const edge = forestEdge(map);
    for (let y = ky * CHUNK; y < (ky + 1) * CHUNK; y++) {
      for (let x = kx * CHUNK; x < (kx + 1) * CHUNK; x++) {
        if (!inBounds(map, x, y)) {
          if (edge) edgeTile(map, x, y, ground, props, glow);
          continue;
        }
        if (map.ground) smoothTile(map, x, y, ground, glow);
        else if (map.look) texturedTile(map, x, y, kx, ky, ground);
        else blockTile(map, x, y, ground, glow);
        addProps(map, x, y, props, glow);
      }
    }
    // Building worlds: the ground wears a picture of this chunk's tiles, so it needs its own material.
    const material = map.look ? new MeshLambertMaterial({ map: chunkPicture(map, kx, ky), vertexColors: true }) : null;
    const meshes: Mesh[] = [];
    const add = (geo: BufferGeometry | null, mat: Material, name: string) => {
      if (!geo) return;
      meshes.push(this.addMesh(geo, mat, name));
    };
    add(ground.build(), material ?? this.materials.lit, 'ground');
    add(props.build(), this.materials.lit, 'props');
    add(glow.build(), this.materials.glow, 'glow');
    const chunk: Chunk = { kx, ky, meshes, material, standees: null, facing };
    if (map.look) this.buildStandees(map, chunk, facing);
    this.built.set(`${kx},${ky}`, chunk);
  }

  /** (Re)build a chunk's furniture, facing the camera. */
  private buildStandees(map: TileMap, chunk: Chunk, facing: number): void {
    chunk.facing = facing;
    if (chunk.standees) {
      this.parent.remove(chunk.standees);
      chunk.standees.geometry.dispose();
      chunk.standees = null;
    }
    const out = new MeshBuilder();
    const x1 = Math.min(map.width, (chunk.kx + 1) * CHUNK);
    const y1 = Math.min(map.height, (chunk.ky + 1) * CHUNK);
    for (let y = chunk.ky * CHUNK; y < y1; y++) {
      for (let x = chunk.kx * CHUNK; x < x1; x++) {
        const s = standeeAt(map, y * map.width + x);
        if (!s) continue;
        const gy = groundY(map, x + 0.5, y + 0.5);
        // Flat ones lie on the floor with the top of the picture to the north, like the 2D map.
        if (s.flat) out.addPainted(s.geometry, place(x + 0.5, gy + 0.01, y + 1, 1, 1, 1, -Math.PI / 2));
        else out.addPainted(s.geometry, place(x + 0.5, gy, y + 0.5, 1, 1, 1, 0, facing));
      }
    }
    const geo = out.build();
    if (geo) chunk.standees = this.addMesh(geo, this.materials.lit, 'standees');
  }

  private addMesh(geo: BufferGeometry, mat: Material, name: string): Mesh {
    const mesh = new Mesh(geo, mat);
    mesh.name = name;
    mesh.matrixAutoUpdate = false; // chunks never move
    this.parent.add(mesh);
    return mesh;
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

/**
 * Past a forest's edge (The Woods): the forest goes on, too thick to walk into. The ground
 * carries on flat from the edge (cornerAt keeps to the map's edge), a little darker, with a
 * tree on every square, so the world never just stops. The creek runs on out under the trees.
 */
function edgeTile(map: TileMap, x: number, y: number, ground: MeshBuilder, props: MeshBuilder, glow: MeshBuilder): void {
  const out = Math.max(-x - 1, x - map.width, -y - 1, y - map.height); // 0 = right next to the map
  if (out >= EDGE) return;
  a.set(x, cornerAt(map, x, y), y);
  b.set(x + 1, cornerAt(map, x + 1, y), y);
  c.set(x, cornerAt(map, x, y + 1), y + 1);
  d.set(x + 1, cornerAt(map, x + 1, y + 1), y + 1);
  const color = shade(rgb(tileColor(map, map.outside)), -0.12 + (hash2(x, y, 99) - 0.5) * 0.12);
  ground.tri(a, c, d, color).tri(a, d, b, color);
  const top = (a.y + b.y + c.y + d.y) / 4;
  if (top < 0) return; // no trees standing in the creek
  if (out > 0 && hash2(x, y, 37) < 0.2) return; // a few gaps further in, so it is not a solid wall
  const r1 = hash2(x, y, 11);
  const r2 = hash2(x, y, 23);
  const decor = r1 < 0.5 ? Decor.Pine : Decor.Tree;
  addIslandDecor(decor, { x: x + 0.5 + (r1 - 0.5) * 0.3, y: top, z: y + 0.5 + (r2 - 0.5) * 0.3, r1, r2 }, props, glow);
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
