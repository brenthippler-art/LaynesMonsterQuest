import { type RealmPlan } from '../building/types';

/**
 * Bun Town Burgers' 9 realms, in Monster Book order. `zone` is the realm's
 * letter in layout.ts; `scatter` is what gets sprinkled around (and how much).
 */
export const BUNTOWN_REALMS: RealmPlan[] = [
  {
    id: 'counter', label: 'COUNTER', zone: 'C', icon: 'register', music: 'buntown',
    scatter: { register: 4, menuBoard: 4, trayStack: 5, napkins: 5 },
    scene: { wall: 'wall', floor: 'lobbyFloor', decor: ['menuBoard', 'register', 'trayStack'] },
    printDecor: ['register', 'menuBoard', 'trayStack', 'napkins', 'burger'],
  },
  {
    id: 'grill', label: 'GRILL', zone: 'G', icon: 'burger', music: 'buntown',
    scatter: { flatGrill: 4, bunRack: 3, warmLight: 3, spatula: 6, burger: 4 },
    scene: { wall: 'wall', floor: 'grillFloor', decor: ['warmLight', 'flatGrill', 'bunRack'] },
    printDecor: ['flatGrill', 'spatula', 'bunRack', 'warmLight', 'burger'],
  },
  {
    id: 'fries', label: 'FRIES', zone: 'F', icon: 'friesCup', music: 'buntown',
    scatter: { fryer: 4, fryBasket: 4, fryScoop: 5, saltShaker: 5, friesCup: 6 },
    scene: { wall: 'wall', floor: 'fryFloor', decor: ['saltShaker', 'fryer', 'friesCup'] },
    printDecor: ['fryer', 'fryBasket', 'fryScoop', 'saltShaker', 'friesCup'],
  },
  {
    id: 'soda', label: 'SODA', zone: 'S', icon: 'sodaCup', music: 'buntown',
    scatter: { sodaFountain: 3, iceMachine: 2, cupStack: 5, sodaCup: 4, straws: 4, lidStack: 4 },
    scene: { wall: 'wall', floor: 'sodaFloor', decor: ['cupStack', 'sodaFountain', 'iceMachine'] },
    printDecor: ['sodaFountain', 'iceMachine', 'sodaCup', 'straws', 'lidStack'],
  },
  {
    id: 'freezer', label: 'FREEZER', zone: 'Z', icon: 'iceCreamTub', music: 'buntown',
    scatter: { frostyShelf: 6, iceCreamTub: 5, pattyBoxes: 5, iceBlock: 5, coneStack: 3 },
    scene: { wall: 'freezerWall', floor: 'freezerFloor', decor: ['frostyShelf', 'iceCreamTub', 'pattyBoxes'] },
    printDecor: ['frostyShelf', 'iceCreamTub', 'pattyBoxes', 'iceBlock', 'coneStack'],
  },
  {
    id: 'dining', label: 'DINING', zone: 'D', icon: 'ketchup', music: 'buntown',
    scatter: { booth: 5, diningTable: 5, ketchup: 6, highChair: 3, trashBin: 3 },
    scene: { wall: 'window', floor: 'diningFloor', decor: ['ketchup', 'booth', 'diningTable'] },
    printDecor: ['booth', 'diningTable', 'ketchup', 'highChair', 'trashBin'],
  },
  {
    id: 'play', label: 'PLAY', zone: 'P', icon: 'ballPit', music: 'buntown',
    scatter: { tubeSlide: 3, ballPit: 3, climbNet: 3, bouncyBall: 10, softBlock: 6 },
    scene: { wall: 'wall', floor: 'playFloor', decor: ['ballPit', 'tubeSlide', 'climbNet'] },
    printDecor: ['tubeSlide', 'ballPit', 'climbNet', 'bouncyBall', 'softBlock'],
  },
  {
    id: 'drive', label: 'DRIVE', zone: 'R', icon: 'car', music: 'buntown',
    scatter: { car: 7, cone: 12, shrub: 12 },
    scene: { wall: 'driveWindow', floor: 'lane', decor: ['speakerBox', 'car', 'outdoorMenu'] },
    printDecor: ['car', 'speakerBox', 'cone', 'outdoorMenu', 'bunSign'],
    labelAt: { map: 'main', x: 86, y: 40 }, // the lane wraps around the building, so put its icon on the right-hand lane
  },
  {
    id: 'alley', label: 'ALLEY', zone: 'A', icon: 'dumpster', music: 'buntown',
    scatter: { dumpster: 4, recycleBin: 4, crates: 5, puddle: 4, mopBucket: 3 },
    scene: { wall: 'fence', floor: 'alley', decor: ['recycleBin', 'dumpster', 'puddle'] },
    printDecor: ['dumpster', 'recycleBin', 'crates', 'puddle', 'mopBucket'],
  },
];
