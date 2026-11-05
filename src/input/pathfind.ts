import { type Point } from '../player/player';
import { doorAt, inBounds, isWalkable, type TileMap } from '../world/tilemap';

/**
 * A* pathfinding: finds the shortest walkable route between two squares,
 * going around water and mountains. Returns the squares to walk through
 * (not including the start), or null if there's no way there.
 */
const STEPS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
] as const;

export function findPath(map: TileMap, start: Point, goal: Point, maxSearch = 60000): Point[] | null {
  if (start.x === goal.x && start.y === goal.y) return [];
  const W = map.width;
  const n = W * map.height;
  const cost = new Float32Array(n).fill(Infinity); // best known cost to reach each square
  const cameFrom = new Int32Array(n).fill(-1);
  const done = new Uint8Array(n);
  const open = new MinHeap();

  // Doors only count as walkable if they ARE the goal (so a path never wanders into a cave by accident).
  const passable = (x: number, y: number) =>
    isWalkable(map, x, y) && (!doorAt(map, x, y) || (x === goal.x && y === goal.y));
  // "Octile" distance: a good guess of remaining cost when diagonal moves are allowed.
  const guess = (x: number, y: number) => {
    const dx = Math.abs(x - goal.x);
    const dy = Math.abs(y - goal.y);
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  };

  const startI = start.y * W + start.x;
  const goalI = goal.y * W + goal.x;
  cost[startI] = 0;
  open.push(startI, guess(start.x, start.y));

  let searched = 0;
  while (open.size && searched++ < maxSearch) {
    const cur = open.pop();
    if (done[cur]) continue;
    done[cur] = 1;
    if (cur === goalI) return rebuild(cameFrom, goalI, startI, W);
    const cx = cur % W;
    const cy = (cur - cx) / W;

    for (const [dx, dy, stepCost] of STEPS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (!inBounds(map, nx, ny) || !passable(nx, ny)) continue;
      // No cutting corners: both side squares must be open for a diagonal step.
      if (dx && dy && (!passable(cx + dx, cy) || !passable(cx, cy + dy))) continue;
      const ni = ny * W + nx;
      const newCost = cost[cur] + stepCost;
      if (newCost < cost[ni]) {
        cost[ni] = newCost;
        cameFrom[ni] = cur;
        open.push(ni, newCost + guess(nx, ny));
      }
    }
  }
  return null;
}

/** If the tapped square is water or rock, pick the closest square Layne can stand on. */
export function nearestWalkable(map: TileMap, p: Point, maxRadius = 10): Point | null {
  if (inBounds(map, p.x, p.y) && isWalkable(map, p.x, p.y)) return p;
  let best: Point | null = null;
  let bestDist = Infinity;
  for (let r = 1; r <= maxRadius && !best; r++) {
    for (let y = p.y - r; y <= p.y + r; y++) {
      for (let x = p.x - r; x <= p.x + r; x++) {
        if (!inBounds(map, x, y) || !isWalkable(map, x, y)) continue;
        const d = Math.hypot(x - p.x, y - p.y);
        if (d < bestDist) {
          bestDist = d;
          best = { x, y };
        }
      }
    }
  }
  return best;
}

function rebuild(cameFrom: Int32Array, goalI: number, startI: number, W: number): Point[] {
  const path: Point[] = [];
  for (let i = goalI; i !== startI; i = cameFrom[i]) path.push({ x: i % W, y: Math.floor(i / W) });
  return path.reverse();
}

/** A tiny priority queue: always hands back the item with the smallest priority. */
class MinHeap {
  private items: number[] = [];
  private prio: number[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: number, priority: number): void {
    const { items, prio } = this;
    let i = items.length;
    items.push(item);
    prio.push(priority);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (prio[parent] <= prio[i]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop(): number {
    const { items, prio } = this;
    const top = items[0];
    const lastItem = items.pop()!;
    const lastPrio = prio.pop()!;
    if (items.length) {
      items[0] = lastItem;
      prio[0] = lastPrio;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < items.length && prio[l] < prio[m]) m = l;
        if (r < items.length && prio[r] < prio[m]) m = r;
        if (m === i) break;
        this.swap(i, m);
        i = m;
      }
    }
    return top;
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
    [this.prio[a], this.prio[b]] = [this.prio[b], this.prio[a]];
  }
}
