import { inBounds, indexOf, type TileMap } from '../../world/tilemap';
import { type WorldDef } from '../types';
import { generateWoods } from './generate';
import { addWoodsCaves } from './caves';
import { WOODS_REALMS } from './realms';
import { WOODS_SCENE } from './scene';
import { checkWoodsRoutes } from './validate';

export const WOODS: WorldDef = {
  id: 'woods',
  name: 'The Woods',
  scene: WOODS_SCENE,
  seed: 7351,
  realms: WOODS_REALMS,
  build(seed) {
    const { map, spawn } = generateWoods(seed);
    const caves = addWoodsCaves(map, seed);
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
