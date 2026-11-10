import { type RealmPlan } from '../building/types';

/**
 * Big Blue Mart's 9 realms, in Monster Book order. `zone` is the realm's letter in
 * layout.ts; `scatter` is what gets sprinkled around (and how many). The cars, lamp
 * posts, cart corrals, checkouts, fountain, car lifts and freezer cases are placed by
 * hand in layout.ts instead.
 */
export const BIGBLUE_REALMS: RealmPlan[] = [
  {
    id: 'parking', label: 'PARKING', zone: 'P', icon: 'carBlue', music: 'bigblue',
    scatter: { cart: 14, puddle: 20 },
    scene: { wall: 'signWall', floor: 'lot', decor: ['lampPost', 'carRed', 'cart'] },
    printDecor: ['carBlue', 'lampPost', 'cart', 'cartCorral', 'puddle'],
  },
  {
    id: 'garden', label: 'GARDEN', zone: 'G', icon: 'flowerPot', music: 'bigblue',
    scatter: { flowerPot: 26, seedRack: 6, soilBags: 8, plantTable: 7 },
    scene: { wall: 'fence', floor: 'gardenFloor', decor: ['seedRack', 'fountain', 'flowerPot'] },
    printDecor: ['flowerPot', 'seedRack', 'soilBags', 'plantTable', 'fountain'],
  },
  {
    id: 'auto', label: 'AUTO', zone: 'A', icon: 'tireStack', music: 'bigblue',
    scatter: { tireStack: 14, oilCans: 10, toolbox: 8 },
    scene: { wall: 'wall', floor: 'garageFloor', decor: ['tireStack', 'carLift', 'toolbox'] },
    printDecor: ['tireStack', 'oilCans', 'toolbox', 'carLift', 'carRed'],
  },
  {
    id: 'produce', label: 'PRODUCE', zone: 'R', icon: 'fruitBin', music: 'bigblue',
    scatter: { fruitBin: 10, veggieBin: 10, mister: 5, scale: 4 },
    scene: { wall: 'shelf', floor: 'produceFloor', decor: ['mister', 'fruitBin', 'veggieBin'] },
    printDecor: ['fruitBin', 'veggieBin', 'mister', 'scale', 'cart'],
  },
  {
    id: 'bakery', label: 'BAKERY', zone: 'B', icon: 'donutCase', music: 'bigblue',
    scatter: { donutCase: 8, breadRack: 10, cakeCounter: 3 },
    scene: { wall: 'shelf', floor: 'bakeryFloor', decor: ['breadRack', 'cakeCounter', 'donutCase'] },
    printDecor: ['donutCase', 'breadRack', 'cakeCounter', 'cart', 'checkout'],
  },
  {
    id: 'frozen', label: 'FROZEN', zone: 'F', icon: 'iceBox', music: 'bigblue',
    scatter: { freezerChest: 5, iceBox: 5, frostPatch: 14 },
    scene: { wall: 'freezer', floor: 'frozenFloor', decor: ['iceBox', 'freezerChest', 'frostPatch'] },
    printDecor: ['freezerChest', 'iceBox', 'frostPatch', 'cart', 'checkout'],
  },
  {
    id: 'sports', label: 'SPORTS', zone: 'S', icon: 'ballBin', music: 'bigblue',
    scatter: { ballBin: 7, bike: 8, tent: 5, fishingPoles: 6, hoop: 3 },
    scene: { wall: 'shelf', floor: 'sportsFloor', decor: ['hoop', 'tent', 'bike'] },
    printDecor: ['ballBin', 'bike', 'tent', 'fishingPoles', 'hoop'],
  },
  {
    id: 'pets', label: 'PETS', zone: 'E', icon: 'fishTank', music: 'bigblue',
    scatter: { fishTank: 8, dogBed: 8, kibbleBag: 10, birdCage: 5 },
    scene: { wall: 'shelf', floor: 'petsFloor', decor: ['fishTank', 'dogBed', 'birdCage'] },
    printDecor: ['fishTank', 'dogBed', 'kibbleBag', 'birdCage', 'cart'],
  },
  {
    id: 'tools', label: 'TOOLS', zone: 'T', icon: 'hammerRack', music: 'bigblue',
    scatter: { hammerRack: 6, drillStand: 5, boltBins: 6, ladder: 5, paintCans: 10, toolbox: 4 },
    scene: { wall: 'shelf', floor: 'toolsFloor', decor: ['hammerRack', 'ladder', 'paintCans'] },
    printDecor: ['hammerRack', 'drillStand', 'boltBins', 'ladder', 'paintCans'],
  },
];
