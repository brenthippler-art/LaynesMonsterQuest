import { type RealmPlan } from '../building/types';

/**
 * Cherry Mart's 9 realms (departments), in Monster Book order. `zone` is the
 * realm's letter in layout.ts; `scatter` is what gets sprinkled around (and how much).
 * The holiday aisle's seasonBit, seasonBig and seasonShelf change with the month (see season.ts).
 */
export const CHERRYMART_REALMS: RealmPlan[] = [
  {
    id: 'deals', label: 'DEALS', zone: 'D', icon: 'priceSign', music: 'cherrymart',
    scatter: { bargainBin: 6, priceSign: 5, basket: 8, cart: 6 },
    scene: { wall: 'window', floor: 'dealsFloor', decor: ['priceSign', 'bargainBin', 'cart'] },
    printDecor: ['priceSign', 'bargainBin', 'basket', 'cart', 'cherrySign'],
  },
  {
    id: 'toys', label: 'TOYS', zone: 'T', icon: 'blockTower', music: 'cherrymart',
    scatter: { blockTower: 5, trainTable: 2, plushie: 8, toyBall: 8, toyCar: 6 },
    scene: { wall: 'shelf', floor: 'toysFloor', decor: ['blockTower', 'trainTable', 'plushie'] },
    printDecor: ['blockTower', 'trainTable', 'plushie', 'toyBall', 'toyCar'],
  },
  {
    id: 'home', label: 'HOME', zone: 'H', icon: 'lamp', music: 'cherrymart',
    scatter: { lamp: 5, pictureFrame: 6, pillow: 6, rug: 4, candle: 6 },
    scene: { wall: 'shelf', floor: 'homeFloor', decor: ['lamp', 'pictureFrame', 'candle'] },
    printDecor: ['lamp', 'pillow', 'rug', 'candle', 'pictureFrame'],
  },
  {
    id: 'clothes', label: 'CLOTHES', zone: 'C', icon: 'hanger', music: 'cherrymart',
    scatter: { clothesRack: 7, fittingRoom: 3, mannequin: 4, hanger: 6 },
    scene: { wall: 'shelf', floor: 'clothesFloor', decor: ['mannequin', 'clothesRack', 'fittingRoom'] },
    printDecor: ['clothesRack', 'hanger', 'fittingRoom', 'mannequin', 'pillow'],
  },
  {
    id: 'tech', label: 'TECH', zone: 'E', icon: 'headphones', music: 'cherrymart',
    scatter: { tvWall: 7, gameConsole: 5, tablet: 6, headphones: 6 },
    scene: { wall: 'shelf', floor: 'techFloor', decor: ['headphones', 'tvWall', 'gameConsole'] },
    printDecor: ['tvWall', 'tablet', 'headphones', 'gameConsole', 'toyCar'],
  },
  {
    id: 'cafe', label: 'CAFE', zone: 'F', icon: 'cocoaMug', music: 'cherrymart',
    scatter: { cafeTable: 6, popcornMachine: 2, cocoaMug: 5, pretzel: 5 },
    scene: { wall: 'window', floor: 'cafeFloor', decor: ['cocoaMug', 'cafeTable', 'popcornMachine'] },
    printDecor: ['cafeTable', 'cocoaMug', 'popcornMachine', 'pretzel', 'cherrySign'],
  },
  {
    id: 'grocery', label: 'GROCERY', zone: 'G', icon: 'fruitBin', music: 'cherrymart',
    scatter: { cerealShelf: 6, fridge: 5, fruitBin: 5, cart: 3 },
    scene: { wall: 'shelf', floor: 'groceryFloor', decor: ['cerealShelf', 'fruitBin', 'fridge'] },
    printDecor: ['cerealShelf', 'fruitBin', 'fridge', 'cart', 'basket'],
  },
  {
    id: 'beauty', label: 'BEAUTY', zone: 'B', icon: 'perfume', music: 'cherrymart',
    scatter: { vanityMirror: 6, nailPolish: 6, bubbleBath: 6, perfume: 6 },
    scene: { wall: 'shelf', floor: 'beautyFloor', decor: ['perfume', 'vanityMirror', 'nailPolish'] },
    printDecor: ['vanityMirror', 'nailPolish', 'bubbleBath', 'perfume', 'candle'],
  },
  {
    id: 'holiday', label: 'HOLIDAY', zone: 'Y', icon: 'seasonBit', music: 'cherrymart',
    scatter: { seasonShelf: 6, seasonBig: 5, seasonBit: 12 },
    scene: { wall: 'shelf', floor: 'holidayFloor', decor: ['seasonBit', 'seasonBig', 'seasonShelf'] },
    printDecor: ['seasonBit', 'seasonBig', 'seasonShelf', 'cherrySign', 'basket'],
  },
];
