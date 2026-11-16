import { inBounds, indexOf, type TileMap } from '../../world/tilemap';
import { type WorldDef } from '../types';
import { generateWoods } from './generate';
import { addWoodsCaves } from './caves';
import { WOODS_REALMS } from './realms';
import { WOODS_SCENE } from './scene';
import { checkWoodsRoutes } from './validate';
import { woodsHeights } from './heights';
import { addSteppingStones, finishCreek } from './stones';
import { hilltopLookouts, walkableFrom } from '../../world/lookouts';

export const WOODS: WorldDef = {
  id: 'woods',
  name: 'The Woods',
  scene: WOODS_SCENE,
  seed: 7351,
  view: '3d',
  realms: WOODS_REALMS,
  build(seed) {
    const { map, spawn } = generateWoods(seed);
    const caves = addWoodsCaves(map, seed);
    const { stones, perches } = addSteppingStones(map); // before the hills, so the banks slope down to them too
    map.ground = woodsHeights(map, seed); // hills for the 3D view (the game itself stays flat tiles)
    finishCreek(map, stones);
    // A monster perches on top of each realm's highest hill, and on the stones out in the creek.
    const lives = (i: number) => WOODS_REALMS[map.biome[i]] !== undefined;
    map.lookouts = [...hilltopLookouts(map, walkableFrom(map, spawn), lives), ...perches];
    return {
      maps: [map, ...caves],
      problems: checkWoodsRoutes(map, caves, spawn),
      spawn: { map: map.id, x: spawn.x, y: spawn.y },
      realmAt: (m: TileMap, x: number, y: number) => {
        if (!inBounds(m, x, y)) return null;
        return WOODS_REALMS[m.biome[indexOf(m, x, y)]] ?? null;
      },
    };
  },
};
