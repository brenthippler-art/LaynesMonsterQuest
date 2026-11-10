import { type RealmPlan } from '../building/types';

/**
 * Sunnyside's 9 realms, in Monster Book order. `zone` is the realm's letter in
 * layout.ts; `scatter` is what gets sprinkled around (and how many).
 */
export const SUNNYSIDE_REALMS: RealmPlan[] = [
  {
    id: 'class', label: 'CLASS', zone: 'C', icon: 'chalkboard', music: 'sunnyside',
    scatter: { desk: 12, chalkboard: 2, abcPoster: 3, readingRug: 2, petTank: 1 },
    scene: { wall: 'window', floor: 'classFloor', decor: ['chalkboard', 'desk', 'petTank'] },
    printDecor: ['chalkboard', 'desk', 'abcPoster', 'readingRug', 'petTank'],
  },
  {
    id: 'library', label: 'LIBRARY', zone: 'L', icon: 'bookStack', music: 'sunnyside',
    scatter: { bookshelf: 8, beanbag: 5, storyChair: 1, globe: 2, bookStack: 6 },
    scene: { wall: 'wall', floor: 'libraryFloor', decor: ['bookshelf', 'beanbag', 'globe'] },
    printDecor: ['bookshelf', 'beanbag', 'storyChair', 'globe', 'bookStack'],
  },
  {
    id: 'lunch', label: 'LUNCH', zone: 'N', icon: 'milkCarton', music: 'sunnyside',
    scatter: { lunchTable: 8, tray: 6, milkCarton: 8, servingLine: 2 },
    scene: { wall: 'window', floor: 'lunchFloor', decor: ['servingLine', 'lunchTable', 'milkCarton'] },
    printDecor: ['lunchTable', 'tray', 'milkCarton', 'servingLine', 'bookStack'],
  },
  {
    id: 'gym', label: 'GYM', zone: 'G', icon: 'bigBall', music: 'sunnyside',
    scatter: { hoop: 4, climbRope: 3, bigBall: 8, gymMat: 4, cone: 6 },
    scene: { wall: 'wall', floor: 'gymFloor', decor: ['hoop', 'bigBall', 'climbRope'] },
    printDecor: ['hoop', 'climbRope', 'bigBall', 'gymMat', 'cone'],
  },
  {
    id: 'recess', label: 'RECESS', zone: 'R', icon: 'slide', music: 'sunnyside',
    scatter: { swings: 4, slide: 3, monkeyBars: 3, sandPail: 6, bigBall: 4 },
    scene: { wall: 'fence', floor: 'grass', decor: ['swings', 'slide', 'bigBall'] },
    printDecor: ['swings', 'slide', 'monkeyBars', 'sandPail', 'bigBall'],
  },
  {
    id: 'art', label: 'ART', zone: 'A', icon: 'crayonBucket', music: 'sunnyside',
    scatter: { easel: 6, paintSplat: 8, crayonBucket: 6, dryingRack: 3 },
    scene: { wall: 'artWall', floor: 'artFloor', decor: ['easel', 'crayonBucket', 'dryingRack'] },
    printDecor: ['easel', 'paintSplat', 'crayonBucket', 'dryingRack', 'abcPoster'],
  },
  {
    id: 'music', label: 'MUSIC', zone: 'M', icon: 'drum', music: 'sunnyside',
    scatter: { drum: 5, xylophone: 4, piano: 2, musicStand: 6 },
    scene: { wall: 'wall', floor: 'musicFloor', decor: ['piano', 'drum', 'xylophone'] },
    printDecor: ['drum', 'xylophone', 'piano', 'musicStand', 'bookStack'],
  },
  {
    id: 'science', label: 'SCIENCE', zone: 'S', icon: 'rocketModel', music: 'sunnyside',
    scatter: { beakerTable: 6, volcano: 2, magnet: 6, rocketModel: 2, plantLight: 4 },
    scene: { wall: 'window', floor: 'scienceFloor', decor: ['beakerTable', 'volcano', 'rocketModel'] },
    printDecor: ['beakerTable', 'volcano', 'magnet', 'rocketModel', 'plantLight'],
  },
  {
    id: 'bus', label: 'BUS', zone: 'U', icon: 'schoolBus', music: 'sunnyside',
    scatter: { bench: 5, cone: 6, stopSign: 2 },
    scene: { wall: 'sunSign', floor: 'road', decor: ['stopSign', 'schoolBus', 'flagpole'] },
    printDecor: ['schoolBus', 'stopSign', 'flagpole', 'bench', 'cone'],
  },
];
