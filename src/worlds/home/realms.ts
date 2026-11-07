import { type RealmPlan } from '../building/types';

/**
 * Home Sweet Home's 9 realms, in Monster Book order. `zone` is the realm's
 * letter in layout.ts; `scatter` is what furniture is sprinkled around (and how much).
 */
export const HOME_REALMS: RealmPlan[] = [
  {
    id: 'kitchen', label: 'KITCHEN', zone: 'K', icon: 'stove', music: 'home',
    scatter: { fridge: 2, stove: 2, counter: 10, table: 3, chair: 8, fruitBowl: 3 },
    scene: { wall: 'wall', floor: 'kitchenFloor', decor: ['fridge', 'stove', 'counter'] },
    printDecor: ['fridge', 'stove', 'table', 'chair', 'fruitBowl'],
  },
  {
    id: 'living', label: 'LIVING', zone: 'V', icon: 'couch', music: 'home',
    scatter: { couch: 3, tv: 2, bookshelf: 4, lamp: 5, rug: 4, plant: 5 },
    scene: { wall: 'wall', floor: 'carpet', decor: ['lamp', 'couch', 'tv'] },
    printDecor: ['couch', 'tv', 'lamp', 'plant', 'bookshelf'],
  },
  {
    id: 'bath', label: 'BATH', zone: 'B', icon: 'toilet', music: 'home',
    scatter: { toilet: 3, tub: 2, sink: 3, bathMat: 4, duck: 6, bubbles: 6 },
    scene: { wall: 'wall', floor: 'bathTile', decor: ['sink', 'toilet', 'tub'] },
    printDecor: ['toilet', 'duck', 'tub', 'sink', 'bubbles'],
  },
  {
    id: 'bedroom', label: 'BEDROOM', zone: 'R', icon: 'bed', music: 'home',
    scatter: { bed: 2, toyChest: 3, nightlight: 3, rug: 2, teddy: 5, blocks: 6 },
    scene: { wall: 'wall', floor: 'bedroomCarpet', decor: ['nightlight', 'bed', 'toyChest'] },
    printDecor: ['bed', 'teddy', 'toyChest', 'blocks', 'nightlight'],
  },
  {
    id: 'laundry', label: 'LAUNDRY', zone: 'L', icon: 'washer', music: 'home',
    scatter: { washer: 3, dryer: 3, basket: 4, towels: 3, sock: 6 },
    scene: { wall: 'wall', floor: 'laundryFloor', decor: ['washer', 'dryer', 'basket'] },
    printDecor: ['washer', 'sock', 'basket', 'towels', 'dryer'],
  },
  {
    id: 'garage', label: 'GARAGE', zone: 'G', icon: 'toolbox', music: 'home',
    scatter: { bench: 5, bike: 3, boxes: 6, toolbox: 5 },
    scene: { wall: 'wall', floor: 'concrete', decor: ['bike', 'bench', 'boxes'] },
    printDecor: ['bike', 'toolbox', 'boxes', 'bench', 'carFront'],
  },
  {
    id: 'attic', label: 'ATTIC', zone: 'A', icon: 'trunk', music: 'home',
    scatter: { trunk: 6, boxes: 8, rockingHorse: 2, dustBunny: 10, oldLamp: 3 },
    scene: { wall: 'atticWall', floor: 'atticFloor', decor: ['oldLamp', 'trunk', 'rockingHorse'] },
    printDecor: ['trunk', 'rockingHorse', 'dustBunny', 'oldLamp', 'boxes'],
  },
  {
    id: 'basement', label: 'BASEMENT', zone: 'S', icon: 'furnace', music: 'home',
    scatter: { furnace: 2, jarShelf: 6, boxes: 4, beanbag: 5, lamp: 4 },
    scene: { wall: 'basementWall', floor: 'basementFloor', decor: ['furnace', 'jarShelf', 'beanbag'] },
    printDecor: ['furnace', 'jarShelf', 'beanbag', 'pingLeft', 'lamp'],
  },
  {
    id: 'yard', label: 'YARD', zone: 'Y', icon: 'tree', music: 'home',
    scatter: { tree: 20, bush: 18, flowers: 40, veggies: 20, swing: 1, birdbath: 3, bucket: 4 },
    scene: { wall: 'fence', floor: 'grass', decor: ['tree', 'swing', 'birdbath'] },
    printDecor: ['tree', 'flowers', 'swing', 'birdbath', 'bush'],
    labelAt: { map: 'main', x: 58, y: 13 }, // the yard wraps around the house, so put its icon in the backyard
  },
];
