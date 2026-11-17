import { type RealmPlan } from '../building/types';

/**
 * The Zoo's 9 realms, in Monster Book order. `zone` is the realm's letter in layout.ts;
 * `scatter` is what gets sprinkled around (and how many). The ticket hut, turnstiles,
 * zoo map, lamp posts, benches and the barn are placed by hand in layout.ts instead.
 */
export const ZOO_REALMS: RealmPlan[] = [
  {
    id: 'gate', label: 'GATE', zone: 'G', icon: 'zooArch', music: 'zoo',
    scatter: { stroller: 3, tree: 4, picnicTable: 2, parkBin: 2 },
    scene: { wall: 'gateWall', floor: 'gatePlaza', decor: ['zooArch', 'ticketHut', 'stroller'] },
    printDecor: ['zooArch', 'ticketHut', 'zooMap', 'stroller', 'turnstile'],
  },
  {
    id: 'safari', label: 'SAFARI', zone: 'S', icon: 'safariJeep', music: 'zoo',
    scatter: { acacia: 7, tallGrass: 16, termiteMound: 4, safariJeep: 2 },
    scene: { wall: 'fence', floor: 'savannaGrass', decor: ['acacia', 'safariJeep', 'termiteMound'] },
    printDecor: ['acacia', 'safariJeep', 'termiteMound', 'tallGrass', 'zooMap'],
  },
  {
    id: 'jungle', label: 'JUNGLE', zone: 'J', icon: 'palm', music: 'zoo',
    scatter: { palm: 8, fern: 14, jungleFlower: 12, bananas: 3 },
    scene: { wall: 'hedge', floor: 'jungleFloor', decor: ['palm', 'bananas', 'jungleFlower'] },
    printDecor: ['palm', 'bananas', 'jungleFlower', 'fern', 'tree'],
  },
  {
    id: 'polar', label: 'POLAR', zone: 'P', icon: 'igloo', music: 'zoo',
    scatter: { igloo: 3, iceBlock: 6, snowPile: 12, fishBucket: 3 },
    scene: { wall: 'ice', floor: 'snow', decor: ['igloo', 'fishBucket', 'iceBlock'] },
    printDecor: ['igloo', 'fishBucket', 'iceBlock', 'snowPile', 'bench'],
  },
  {
    id: 'desert', label: 'DESERT', zone: 'D', icon: 'cactus', music: 'zoo',
    scatter: { cactus: 8, desertRock: 6, tumbleweed: 10 },
    scene: { wall: 'mesa', floor: 'sand', decor: ['cactus', 'desertRock', 'tumbleweed'] },
    printDecor: ['cactus', 'desertRock', 'tumbleweed', 'waterTrough', 'lampPost'],
  },
  {
    id: 'farm', label: 'FARM', zone: 'F', icon: 'barn', music: 'zoo',
    scatter: { hayBale: 6, pumpkin: 10, milkCan: 4, waterTrough: 3 },
    scene: { wall: 'fence', floor: 'farmGrass', decor: ['barn', 'hayBale', 'pumpkin'] },
    printDecor: ['barn', 'hayBale', 'pumpkin', 'milkCan', 'waterTrough'],
  },
  {
    id: 'birds', label: 'BIRDS', zone: 'B', icon: 'birdhouse', music: 'zoo',
    scatter: { birdhouse: 4, nest: 8, perch: 5, seedFeeder: 4, tree: 3 },
    scene: { wall: 'netFence', floor: 'aviaryGrass', decor: ['birdhouse', 'perch', 'nest'] },
    printDecor: ['birdhouse', 'perch', 'nest', 'seedFeeder', 'tree'],
  },
  {
    id: 'reptiles', label: 'REPTILES', zone: 'R', icon: 'terrarium', music: 'zoo',
    scatter: { terrarium: 2, heatLamp: 4, logPile: 4, eggClutch: 4 },
    scene: { wall: 'reptileWall', floor: 'reptileFloor', decor: ['terrarium', 'heatLamp', 'eggClutch'] },
    printDecor: ['terrarium', 'heatLamp', 'eggClutch', 'logPile', 'cactus'],
  },
  {
    id: 'aquarium', label: 'AQUARIUM', zone: 'A', icon: 'fishTank', music: 'zoo',
    scatter: { fishTank: 4, coral: 8, kelp: 6, bubbles: 10, beachBall: 4, bench: 3 },
    scene: { wall: 'bigTank', floor: 'aquaFloor', decor: ['fishTank', 'coral', 'kelp'] },
    printDecor: ['fishTank', 'coral', 'kelp', 'bubbles', 'beachBall'],
    labelAt: { map: 'main', x: 75, y: 5 }, // on the aquarium's roof, so its icon shows on the corner map
  },
];
