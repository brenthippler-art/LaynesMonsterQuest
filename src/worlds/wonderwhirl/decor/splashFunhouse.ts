import { type DecorKind } from '../../building/types';

/**
 * Water-park and funhouse things (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts (listed in parkGate.ts).
 */
export const SPLASH_FUNHOUSE: Record<string, DecorKind> = {
  // A striped beach chair, leaning back.
  beachChair: {
    solid: true,
    on: ['poolDeck'],
    sprite: [
      '..........kk....',
      '.........kuuk...',
      '........kuwwk...',
      '.......kuuuk....',
      '......kwwwk.....',
      '.....kuuuk......',
      '....kwwwk.......',
      '..kkuuukkkkkkk..',
      '.kuuwwwuuuwwwuk.',
      '.kkkkkkkkkkkkkk.',
      '..kak.......kak.',
      '..kak.......kak.',
      '..kkk.......kkk.',
    ],
  },
  // A big beach umbrella with pink and white stripes.
  umbrella: {
    solid: true,
    on: ['poolDeck'],
    sprite: [
      '.....kkkkkk.....',
      '...kkPwPwPwkk...',
      '..kPwPwPwPwPwk..',
      '.kPwPwPwPwPwPwk.',
      'kPwPwPwPwPwPwPwk',
      'kkkkkkkkkkkkkkkk',
      '.......kk.......',
      '.......ka.......',
      '.......ka.......',
      '.......ka.......',
      '.......ka.......',
      '.......ka.......',
      '.......ka.......',
      '......kaak......',
      '....kkkkkkkk....',
    ],
  },
  // A floaty inner tube lying on the deck (you can walk past it).
  innerTube: {
    solid: false,
    on: ['poolDeck'],
    sprite: [
      '...kkkkkkkk...',
      '.kkYYwYYYwYYk.',
      'kYYYkkkkkkYYYk',
      'kYwk......kwYk',
      'kYYYkkkkkkYYYk',
      '.kkYYYwYYYYkk.',
      '...kkkkkkkk...',
    ],
  },
  // A little kiddie water slide: steps up one side, a blue slide down the other.
  waterSlide: {
    solid: true,
    place: 'open',
    on: ['poolDeck'],
    sprite: [
      '...kkkk.........',
      '..kYYYYk........',
      '..kYkkYkk.......',
      '..kYk.kuuk......',
      '..kYkkkuUuk.....',
      '..kYYYkkuUuk....',
      '..kYk...kuUuk...',
      '..kYkkk..kuUuk..',
      '..kYYYk...kuUuk.',
      '..kYk......kuUk.',
      '..kYkkk.....kuuk',
      '..kYYYk......kuk',
      '..kYk.........kk',
      '..kYk...kk...kuk',
      '.kkkkk.kuUk.kuUk',
      '.kkkkk.kkkkkkkkk',
    ],
  },
  // A wavy funhouse mirror in a gold frame (it makes you look super tall and silly).
  wavyMirror: {
    solid: true,
    place: 'wall',
    on: ['funFloor'],
    sprite: [
      '....kkkkkkkk....',
      '...kYYYYYYYYk...',
      '..kYkkkkkkkkYk..',
      '..kYkUUUwUUkYk..',
      '..kYkUUUUwUkYk..',
      '..kYkUUUwUUkYk..',
      '..kYkUUwUUUkYk..',
      '..kYkUwUUUUkYk..',
      '..kYkUUwUUUkYk..',
      '..kYkUUUwUUkYk..',
      '..kYkUUUUwUkYk..',
      '..kYkkkkkkkkYk..',
      '...kYYYYYYYYk...',
      '....kkkkkkkk....',
      '.....kNk.kNk....',
      '.....kkk.kkk....',
    ],
  },
  // A bouncy spot on the floor: boing! (You can walk on it.)
  bouncePad: {
    solid: false,
    place: 'open',
    on: ['funFloor'],
    sprite: [
      '....kkkkkkkk....',
      '..kkPPPPPPPPkk..',
      '.kPPPwwPPPPPPPk.',
      'kPPPPPPPPPPPPPPk',
      'kePPPPPPPPPPPPek',
      '.keeeeeeeeeeeek.',
      '..kkkkkkkkkkkk..',
    ],
  },
  // A little spinning barrel you can't go inside, painted with a swirl.
  spinTunnel: {
    solid: true,
    place: 'open',
    on: ['funFloor'],
    sprite: [
      '....kkkkkkkk....',
      '..kkvLvLvLvLkk..',
      '.kLvLvLvLvLvLvk.',
      'kvLvkkkkkkkkvLvk',
      'kLvk.kkkkkk.kvLk',
      'kvLk.kLLLLk.kLvk',
      'kLvk.kLkkLk.kvLk',
      'kvLk.kLkkLk.kLvk',
      'kLvk.kLLLLk.kvLk',
      'kvLk.kkkkkk.kLvk',
      'kLvLkkkkkkkkLvLk',
      '.kLvLvLvLvLvLvk.',
      '..kkvLvLvLvLkk..',
      '....kkkkkkkk....',
    ],
  },
};
