import { CircleGeometry, Group, type Material, Mesh, type Object3D } from 'three';
import { type WildMonster } from '../encounters/wildMonsters';
import { type TileMap } from '../world/tilemap';
import { groundY } from './ground';
import { monsterGeometry, SIZE_3D } from './monsters/monsterModel';

/**
 * The wandering monsters, in 3D. The game logic (wildMonsters.ts) decides where
 * they are; this just shows them there: popping in, hopping when they move,
 * turning the way they walk, and turning to look at Layne when he comes close.
 */
const POP_SECONDS = 0.35;
const HOP_HEIGHT = 0.16;
const LOOK_AT_LAYNE = 3.5; // tiles

interface Actor {
  root: Group;
  body: Mesh;
  heading: number;
  lastX: number;
  lastY: number;
}

export class MonsterActors {
  private actors = new Map<WildMonster, Actor>();
  private shadowGeo = new CircleGeometry(0.32, 10).rotateX(-Math.PI / 2);

  constructor(
    private parent: Object3D,
    private material: Material,
    private shadowMaterial: Material,
  ) {}

  /** Show these monsters (add new ones, drop ones that left) and animate them. */
  update(list: WildMonster[], map: TileMap, layneX: number, layneY: number, dt: number): void {
    for (const [w, a] of this.actors) if (!list.includes(w)) this.remove(w, a);
    for (const w of list) {
      const a = this.actors.get(w) ?? this.add(w);
      this.animate(w, a, map, layneX, layneY, dt);
    }
  }

  /** The monster whose model is under this ray hit, if any (for tapping). */
  owner(hit: Object3D): WildMonster | null {
    for (const [w, a] of this.actors) if (a.body === hit) return w;
    return null;
  }

  /** Every monster model (for tapping). */
  get meshes(): Mesh[] {
    return [...this.actors.values()].map((a) => a.body);
  }

  clear(): void {
    for (const [w, a] of this.actors) this.remove(w, a);
  }

  private add(w: WildMonster): Actor {
    const root = new Group();
    const body = new Mesh(monsterGeometry(w.monster), this.material);
    body.scale.setScalar(0.001); // grows in as it pops in
    const shadow = new Mesh(this.shadowGeo, this.shadowMaterial);
    shadow.position.y = 0.03;
    shadow.scale.setScalar(SIZE_3D[w.monster.size]);
    shadow.renderOrder = 1;
    root.add(shadow, body);
    this.parent.add(root);
    const a: Actor = { root, body, heading: w.facing > 0 ? Math.PI / 2 : -Math.PI / 2, lastX: w.x, lastY: w.y };
    this.actors.set(w, a);
    return a;
  }

  private remove(w: WildMonster, a: Actor): void {
    this.parent.remove(a.root); // the model itself is shared and kept (see monsterModel.ts)
    this.actors.delete(w);
  }

  private animate(w: WildMonster, a: Actor, map: TileMap, lx: number, ly: number, dt: number): void {
    const dx = w.x - a.lastX;
    const dy = w.y - a.lastY;
    a.lastX = w.x;
    a.lastY = w.y;
    // Which way to face: where it's walking, or at Layne when he's close and it's standing still.
    let want = a.heading;
    if (Math.hypot(dx, dy) > 0.0005) want = Math.atan2(dx, dy);
    else if (Math.hypot(lx - w.x, ly - w.y) < LOOK_AT_LAYNE) want = Math.atan2(lx - w.x, ly - w.y);
    a.heading += wrapAngle(want - a.heading) * (1 - Math.exp(-dt * 8));

    const size = SIZE_3D[w.monster.size];
    const pop = Math.min(1, w.age / POP_SECONDS);
    const grow = size * easeOutBack(pop);
    // Hop while moving, breathe while standing.
    const hop = w.moving ? Math.abs(Math.sin(w.age * 10)) : 0;
    const breathe = w.moving ? 0 : Math.sin(w.age * 3) * 0.03;
    a.body.scale.set(grow * (1 - breathe * 0.5), grow * (1 + breathe + hop * 0.06), grow * (1 - breathe * 0.5));
    a.body.position.y = hop * HOP_HEIGHT;
    a.body.rotation.y = a.heading;
    a.root.position.set(w.x, groundY(map, w.x, w.y), w.y);
  }
}

/** -PI..PI, so turning always goes the short way round. */
export function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/** Grows a little past full size, then settles: a bouncy "pop!". */
function easeOutBack(t: number): number {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}
