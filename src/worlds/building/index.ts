import { inBounds, indexOf, type MapLabel, type MapLook, type TileMap } from '../../world/tilemap';
import { type RealmDef, type WorldDef } from '../types';
import { stampDecor } from './decorPaint';
import { unreachableSquares } from './reach';
import { attachRides } from './rides';
import { scatterDecor } from './scatter';
import { paintRoomScene } from './scene';
import { parseMaps } from './template';
import { type BuildingPlan, type TileCtx } from './types';

/**
 * The building-world engine: turn a BuildingPlan (ASCII templates + tiles +
 * decorations + realms) into an ordinary WorldDef, so the rest of the game
 * (spawning, badge, map, book, saving) treats it like any other world.
 *
 * Tile and decoration ids are just their position in the plan's lists
 * (decorations start at 1, because 0 means "nothing here").
 */
export function makeBuildingWorld(plan: BuildingPlan): WorldDef {
  checkNames(plan);
  const tileNames = Object.keys(plan.tiles);
  const tileIds = new Map(tileNames.map((name, i) => [name, i]));
  const decorNames = Object.keys(plan.decor);
  const decorIds = new Map(decorNames.map((name, i) => [name, i + 1]));
  const tileKind = (t: number) => plan.tiles[tileNames[t]];

  const look: MapLook = {
    walkable: (t) => tileKind(t)?.walkable ?? false,
    color: (t) => tileKind(t)?.color ?? '#000000',
    drawTile(buf, map, x, y, ox, oy) {
      const nameAt = (tx: number, ty: number) => tileNames[inBounds(map, tx, ty) ? map.tiles[indexOf(map, tx, ty)] : map.outside];
      const ctx: TileCtx = { buf, x, y, ox, oy, near: (dx, dy) => nameAt(x + dx, y + dy) };
      tileKind(inBounds(map, x, y) ? map.tiles[indexOf(map, x, y)] : map.outside)?.draw(ctx);
    },
    drawDecor(buf, d, _x, _y, ox, oy) {
      if (d) stampDecor(buf, plan.decor[decorNames[d - 1]].sprite, ox, oy);
    },
  };

  const realms: RealmDef[] = plan.realms.map((r) => {
    let scene: HTMLCanvasElement | null = null; // painted the first time an encounter happens here
    return {
      id: r.id,
      label: r.label,
      icon: plan.decor[r.icon].sprite,
      music: r.music,
      encounterBg: {
        scene: () => (scene ??= paintRoomScene(look, tileIds.get(r.scene.wall)!, tileIds.get(r.scene.floor)!, r.scene.decor.map((d) => plan.decor[d].sprite))),
      },
      printDecor: r.printDecor.map((d) => plan.decor[d].sprite),
    };
  });

  return {
    id: plan.id,
    name: plan.name,
    scene: plan.scene,
    seed: plan.seed,
    realms,
    build(seed) {
      const { maps, spawn, entries } = parseMaps(plan, look, tileIds, decorIds);
      scatterDecor({ ...plan, seed }, maps, entries, decorIds, tileNames);
      for (const map of maps) map.labels = labelsFor(plan, map, realms);
      const rideProblems = attachRides(plan, maps);
      return {
        maps,
        spawn,
        realmAt: (map: TileMap, x: number, y: number) => (inBounds(map, x, y) ? (realms[map.biome[indexOf(map, x, y)] - 1] ?? null) : null),
        problems: [...unreachableSquares(maps, spawn), ...rideProblems],
      };
    },
  };
}

/** One icon per realm on this map: at the plan's spot, or the realm square closest to the middle of the realm. */
function labelsFor(plan: BuildingPlan, map: TileMap, realms: RealmDef[]): MapLabel[] {
  const mapName = map.id.slice(plan.id.length + 1);
  return plan.realms.flatMap((r, i) => {
    if (r.labelAt) return r.labelAt.map === mapName ? [{ x: r.labelAt.x, y: r.labelAt.y, icon: realms[i].icon }] : [];
    const squares: { x: number; y: number }[] = [];
    for (let k = 0; k < map.biome.length; k++) if (map.biome[k] === i + 1) squares.push({ x: k % map.width, y: Math.floor(k / map.width) });
    if (!squares.length) return [];
    const mx = squares.reduce((s, q) => s + q.x, 0) / squares.length;
    const my = squares.reduce((s, q) => s + q.y, 0) / squares.length;
    const best = squares.reduce((a, q) => (Math.hypot(q.x - mx, q.y - my) < Math.hypot(a.x - mx, a.y - my) ? q : a));
    return [{ x: best.x, y: best.y, icon: realms[i].icon }];
  });
}

/** Catch typos early: every decoration and tile a realm mentions must exist. */
function checkNames(plan: BuildingPlan): void {
  const fail = (why: string) => {
    throw new Error(`World "${plan.id}": ${why}`);
  };
  for (const r of plan.realms) {
    const decor = [r.icon, ...Object.keys(r.scatter), ...r.scene.decor, ...r.printDecor];
    for (const d of decor) if (!plan.decor[d]) fail(`realm "${r.id}" uses decoration "${d}", which isn't in the decor list.`);
    for (const t of [r.scene.wall, r.scene.floor]) if (!plan.tiles[t]) fail(`realm "${r.id}" uses tile "${t}", which isn't in the tile list.`);
  }
  for (const [name, d] of Object.entries(plan.decor)) {
    for (const t of d.on ?? []) if (!plan.tiles[t]) fail(`decoration "${name}" stands on tile "${t}", which isn't in the tile list.`);
  }
}
