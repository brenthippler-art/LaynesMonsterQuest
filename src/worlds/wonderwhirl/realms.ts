import { type RealmPlan } from '../building/types';

/**
 * Wonderwhirl Park's 9 realms, in Monster Book order. `zone` is the realm's letter in
 * layout.ts; `scatter` is what gets sprinkled around (and how many). The ticket booths,
 * turnstiles, carts, queue rails, organ, telescopes and scoreboards are placed by hand
 * in layout.ts instead, and the rides themselves are in rides/.
 */
export const WONDERWHIRL_REALMS: RealmPlan[] = [
  {
    id: 'gate', label: 'GATE', zone: 'G', icon: 'ticketBooth', music: 'wonderwhirl',
    scatter: { balloonPost: 6, bench: 4 },
    scene: { wall: 'gateWall', floor: 'gatePlaza', decor: ['ticketBooth', 'balloonCart', 'mapBoard'] },
    printDecor: ['ticketBooth', 'turnstile', 'balloonCart', 'mapBoard', 'balloonPost'],
  },
  {
    id: 'coaster', label: 'COASTER', zone: 'C', icon: 'coasterCar', music: 'wonderwhirl',
    scatter: { heightSign: 4, coasterCar: 2, bench: 3 },
    scene: { wall: 'track', floor: 'queuePlaza', decor: ['coasterCar', 'loopHill', 'heightSign'] },
    printDecor: ['coasterCar', 'loopHill', 'queueRail', 'heightSign', 'bench'],
  },
  {
    id: 'carousel', label: 'CAROUSEL', zone: 'K', icon: 'carouselHorse', music: 'wonderwhirl',
    scatter: { carouselHorse: 5, stripedTent: 4, musicNotes: 10, bench: 3 },
    scene: { wall: 'fence', floor: 'carouselBoards', decor: ['carouselHorse', 'organ', 'stripedTent'] },
    printDecor: ['carouselHorse', 'organ', 'stripedTent', 'musicNotes', 'balloonPost'],
  },
  {
    id: 'splash', label: 'SPLASH', zone: 'P', icon: 'waterSlide', music: 'wonderwhirl',
    scatter: { beachChair: 8, umbrella: 6, innerTube: 8, waterSlide: 2 },
    scene: { wall: 'river', floor: 'poolDeck', decor: ['waterSlide', 'umbrella', 'beachChair'] },
    printDecor: ['waterSlide', 'umbrella', 'beachChair', 'innerTube', 'bench'],
  },
  {
    id: 'funhouse', label: 'FUNHOUSE', zone: 'F', icon: 'spinTunnel', music: 'wonderwhirl',
    scatter: { wavyMirror: 10, bouncePad: 12, spinTunnel: 4 },
    scene: { wall: 'mirrorWall', floor: 'funFloor', decor: ['wavyMirror', 'spinTunnel', 'bouncePad'] },
    printDecor: ['wavyMirror', 'spinTunnel', 'bouncePad', 'balloonPost', 'musicNotes'],
    labelAt: { map: 'main', x: 37, y: 28 }, // the funhouse is its own little map, so show its icon on the building outside
  },
  {
    id: 'wheel', label: 'WHEEL', zone: 'W', icon: 'ferrisIcon', music: 'wonderwhirl',
    scatter: { cloudPuff: 12, hillFlag: 3, tree: 4, bench: 3 },
    scene: { wall: 'daySky', floor: 'hillGrass', decor: ['ferrisIcon', 'telescope', 'cloudPuff'] },
    printDecor: ['ferrisIcon', 'telescope', 'cloudPuff', 'hillFlag', 'tree'],
  },
  {
    id: 'snacks', label: 'SNACKS', zone: 'N', icon: 'popcornCart', music: 'wonderwhirl',
    scatter: { picnicTable: 8, parkBin: 4, bench: 2 },
    scene: { wall: 'shopRoof', floor: 'snackPlaza', decor: ['cottonCandyCart', 'popcornCart', 'cornDogStand'] },
    printDecor: ['cottonCandyCart', 'popcornCart', 'cornDogStand', 'picnicTable', 'parkBin'],
  },
  {
    id: 'bumper', label: 'BUMPER', zone: 'B', icon: 'bumperCar', music: 'wonderwhirl',
    scatter: { cone: 10, sparkPole: 4, bumperCar: 3 },
    scene: { wall: 'bumperRail', floor: 'bumperDeck', decor: ['bumperCar', 'scoreboard', 'sparkPole'] },
    printDecor: ['bumperCar', 'scoreboard', 'sparkPole', 'cone', 'lampPost'],
  },
  {
    id: 'fireworks', label: 'FIREWORKS', zone: 'X', icon: 'rocket', music: 'wonderwhirl',
    scatter: { lantern: 8, rocket: 4, speaker: 2, bench: 4 },
    scene: { wall: 'nightSky', floor: 'showPlaza', decor: ['rocket', 'lantern', 'speaker'] },
    printDecor: ['rocket', 'lantern', 'speaker', 'bench', 'balloonPost'],
  },
];
