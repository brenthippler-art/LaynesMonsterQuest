import { DECOR_SPRITES } from '../../render/decorSprites';
import { CAVE_ENTRANCE, PEAK } from '../../render/tileSprites';
import { Biome } from '../../world/biomes';
import { Decor } from '../../world/decorations';
import { type RealmDef } from '../types';
import { FLOWER, FROG, SNOWFLAKE, SUN, VOLCANO } from './icons';

/** The island's 9 realms, in Monster Book order, and the biome each one is on the map. */
const D = (d: Decor) => DECOR_SPRITES[d]!;

export const ISLAND_REALMS: (RealmDef & { biome: Biome })[] = [
  {
    id: 'grassland', label: 'GRASS', biome: Biome.Grassland, icon: FLOWER, music: 'explore', encounterBg: 'dim',
    printDecor: [D(Decor.Flower), D(Decor.TallGrass), FLOWER, D(Decor.Bush), D(Decor.Tree)],
  },
  {
    id: 'forest', label: 'FOREST', biome: Biome.Forest, icon: D(Decor.Pine), music: 'explore', encounterBg: 'dim',
    printDecor: [D(Decor.Tree), D(Decor.Mushroom), D(Decor.Pine), D(Decor.Bush), D(Decor.Flower)],
  },
  {
    id: 'desert', label: 'DESERT', biome: Biome.Desert, icon: SUN, music: 'explore', encounterBg: 'dim',
    printDecor: [D(Decor.Cactus), SUN, D(Decor.Rock), D(Decor.Pebbles), D(Decor.Cactus)],
  },
  {
    id: 'arctic', label: 'SNOW', biome: Biome.Arctic, icon: SNOWFLAKE, music: 'explore', encounterBg: 'dim',
    printDecor: [SNOWFLAKE, D(Decor.SnowPine), D(Decor.SnowDrift), SNOWFLAKE, D(Decor.SnowPine)],
  },
  {
    id: 'mountain', label: 'HILLS', biome: Biome.Mountains, icon: PEAK, music: 'explore', encounterBg: 'dim',
    printDecor: [PEAK, D(Decor.Rock), D(Decor.Pine), D(Decor.Pebbles), PEAK],
  },
  {
    id: 'beach', label: 'BEACH', biome: Biome.Beach, icon: D(Decor.Palm), music: 'explore', encounterBg: 'dim',
    printDecor: [D(Decor.Palm), D(Decor.Shell), D(Decor.Palm), D(Decor.Pebbles), D(Decor.Shell)],
  },
  {
    id: 'swamp', label: 'SWAMP', biome: Biome.Swamp, icon: FROG, music: 'explore', encounterBg: 'dim',
    printDecor: [D(Decor.Reeds), FROG, D(Decor.Puddle), D(Decor.Mushroom), D(Decor.Reeds)],
  },
  {
    id: 'volcano', label: 'VOLCANO', biome: Biome.Volcano, icon: VOLCANO, music: 'explore', encounterBg: 'dim',
    printDecor: [VOLCANO, D(Decor.LavaCrack), D(Decor.Rock), D(Decor.Pebbles), D(Decor.LavaCrack)],
  },
  {
    id: 'cave', label: 'CAVE', biome: Biome.Cave, icon: CAVE_ENTRANCE, music: 'cave', encounterBg: 'dim',
    printDecor: [D(Decor.Crystal), D(Decor.Mushroom), D(Decor.Rock), D(Decor.Crystal), D(Decor.Pebbles)],
  },
];
