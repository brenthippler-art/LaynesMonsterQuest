import { type Monster, type Rarity } from '../monsters/monsterTypes';
import { monsterCanvas } from '../monsters/pixel/monsterSprite';
import { monstersIn } from '../monsters/worlds';
import { doorAt, isWalkable, type TileMap } from '../world/tilemap';
import { type World } from '../world/world';
import { type RealmDef } from '../worlds/types';

/**
 * Monsters you can SEE wandering around (no surprise battles).
 * We keep 2-3 near Layne: new ones pop in a few tiles away, wander around
 * their own little patch of their own realm, and drift off when Layne
 * walks far away. Only the current world's monsters whose habitat matches the
 * realm under the ground spawn there, so cave monsters only appear in caves.
 */
const MAX_NEARBY = 3;
const SPAWN_DIST = { min: 3.5, max: 7 }; // tiles from Layne: on screen, but not on top of him
const DESPAWN_DIST = 12;
const HOME_RADIUS = 3; // how far a monster wanders from where it appeared
const SPEED = 1.3; // tiles per second
const TOUCH_DIST = 0.9; // closer than this = Layne bumped into it (generous: side by side counts)
const SPAWN_GRACE = 0.6; // seconds before a new monster can be bumped (it's still popping in)

/** Rare monsters show up less often: out of every 15 picks, about 10 common, 4 uncommon, 1 rare. */
const RARITY_WEIGHT: Record<Rarity, number> = { common: 10, uncommon: 4, rare: 1 };

export interface WildMonster {
  monster: Monster;
  /** Feet position, in tiles. */
  x: number;
  y: number;
  home: { x: number; y: number; realm: RealmDef };
  target: { x: number; y: number };
  /** Seconds left to stand still before wandering again. */
  wait: number;
  facing: 1 | -1;
  moving: boolean;
  /** Seconds since it appeared (for the pop-in flicker and hop timing). */
  age: number;
  /** The small pixel sprite, once it's ready. */
  sprite: HTMLCanvasElement | null;
}

function pickMonster(list: Monster[]): Monster | null {
  const total = list.reduce((sum, m) => sum + RARITY_WEIGHT[m.rarity], 0);
  let roll = Math.random() * total;
  for (const m of list) {
    roll -= RARITY_WEIGHT[m.rarity];
    if (roll < 0) return m;
  }
  return list[0] ?? null;
}

export class WildMonsters {
  list: WildMonster[] = [];
  private mapId = '';
  private spawnTimer = 0.5;
  /** Who lives in each realm of this world (realm id → monsters). */
  private byRealm: Map<string, Monster[]>;

  constructor(private world: World) {
    this.byRealm = new Map(world.def.realms.map((r) => [r.id, monstersIn(world.def.id, r.id)]));
  }

  /** Move everyone, spawn/despawn as needed. Returns a monster Layne just bumped into, if any. */
  update(dt: number, map: TileMap, px: number, py: number): WildMonster | null {
    if (map.id !== this.mapId) {
      // New map (into or out of a cave): everyone from the old map stays behind.
      this.list = [];
      this.mapId = map.id;
      this.spawnTimer = 0.6;
    }
    this.list = this.list.filter((w) => Math.hypot(w.x - px, w.y - py) < DESPAWN_DIST);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      if (this.list.length < MAX_NEARBY) this.trySpawn(map, px, py);
      // Fill up quickly to 2, then add the 3rd (and replacements) more slowly.
      this.spawnTimer = this.list.length < 2 ? 0.5 : 2.5 + Math.random() * 2.5;
    }

    for (const w of this.list) {
      w.age += dt;
      this.wander(w, dt, map);
    }
    // Only monsters you can actually see (picture ready, done popping in) can be bumped.
    return this.list.find((w) => w.sprite && w.age > SPAWN_GRACE && Math.hypot(w.x - px, w.y - py) < TOUCH_DIST) ?? null;
  }

  remove(w: WildMonster): void {
    this.list = this.list.filter((other) => other !== w);
  }

  /**
   * The monster drawn at this world spot, if any. Monsters are drawn standing
   * on their feet, so the body reaches about a tile above (x, y) = feet.
   */
  monsterAt(x: number, y: number): WildMonster | null {
    return this.list.find((w) => w.sprite && Math.abs(x - w.x) < 0.75 && y > w.y - 1.3 && y < w.y + 0.4) ?? null;
  }

  /** "It noticed you!": stop wandering for a while, so Layne can walk right up to it. */
  holdStill(w: WildMonster, seconds = 6): void {
    w.target = { x: w.x, y: w.y };
    w.moving = false;
    w.wait = seconds;
  }

  private trySpawn(map: TileMap, px: number, py: number): void {
    for (let attempt = 0; attempt < 25; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = SPAWN_DIST.min + Math.random() * (SPAWN_DIST.max - SPAWN_DIST.min);
      const tx = Math.floor(px + Math.cos(angle) * dist);
      const ty = Math.floor(py + Math.sin(angle) * dist);
      if (!isWalkable(map, tx, ty) || doorAt(map, tx, ty)) continue;
      const realm = this.world.realmAt(map, tx, ty);
      if (!realm) continue; // e.g. open water: nobody lives there (yet!)
      if (this.list.some((w) => Math.hypot(w.x - tx - 0.5, w.y - ty - 0.5) < 2.5)) continue;
      const monster = pickMonster(this.byRealm.get(realm.id) ?? []);
      if (!monster) continue;

      const w: WildMonster = {
        monster,
        x: tx + 0.5,
        y: ty + 0.5,
        home: { x: tx + 0.5, y: ty + 0.5, realm },
        target: { x: tx + 0.5, y: ty + 0.5 },
        wait: 0.5 + Math.random(),
        facing: Math.random() < 0.5 ? 1 : -1,
        moving: false,
        age: 0,
        sprite: null,
      };
      this.list.push(w);
      void monsterCanvas(monster, 'color', 'small').then((canvas) => (w.sprite = canvas));
      return;
    }
  }

  /** Stand around for a bit, then hop to a nearby spot in its own realm. */
  private wander(w: WildMonster, dt: number, map: TileMap): void {
    if (w.wait > 0) {
      w.wait -= dt;
      w.moving = false;
      return;
    }
    const dx = w.target.x - w.x;
    const dy = w.target.y - w.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.05) {
      w.moving = false;
      w.wait = 0.8 + Math.random() * 2.2;
      this.pickTarget(w, map);
      return;
    }
    const step = Math.min(dist, SPEED * dt);
    w.x += (dx / dist) * step;
    w.y += (dy / dist) * step;
    if (Math.abs(dx) > 0.01) w.facing = dx < 0 ? -1 : 1;
    w.moving = true;
  }

  private pickTarget(w: WildMonster, map: TileMap): void {
    const ok = (x: number, y: number) =>
      isWalkable(map, Math.floor(x), Math.floor(y)) &&
      !doorAt(map, Math.floor(x), Math.floor(y)) &&
      this.world.realmAt(map, Math.floor(x), Math.floor(y)) === w.home.realm;
    for (let attempt = 0; attempt < 8; attempt++) {
      const tx = Math.floor(w.home.x + (Math.random() * 2 - 1) * HOME_RADIUS) + 0.5;
      const ty = Math.floor(w.home.y + (Math.random() * 2 - 1) * HOME_RADIUS) + 0.5;
      // Check the end AND the middle of the trip, so it doesn't wander through water.
      if (ok(tx, ty) && ok((tx + w.x) / 2, (ty + w.y) / 2)) {
        w.target = { x: tx, y: ty };
        return;
      }
    }
  }
}
