import { type WorldId } from '../worlds/worldIds';
import { type BodyShape } from './art/bodies';
import { type EyeStyle, type MouthStyle } from './art/face';
import { type ArmStyle, type FeetStyle, type TailStyle } from './art/limbs';
import { type PatternStyle } from './art/patterns';
import { type TopStyle } from './art/tops';

/** The shape of a monster's data. The monsters themselves live in worlds/ (one file per world). */

export type MonsterType =
  | 'Leaf' | 'Frost' | 'Sand' | 'Stone' | 'Splash' | 'Ember' | 'Shadow' | 'Zap' | 'Fluff'
  // Added for the newer worlds:
  | 'Snack' // food
  | 'Bubble' // soap, water, cleaning
  | 'Toy' // toys, games, rides
  | 'Sparkle' // glitter, lights, magic
  | 'Gear'; // machines, tools, vehicles
export type Rarity = 'common' | 'uncommon' | 'rare';
export type Size = 'tiny' | 'small' | 'medium' | 'large';

export interface Palette {
  /** Body color. */
  main: string;
  /** Ears, horns, spots, fins, flames... */
  accent: string;
  /** Tummy patch, inner flame, tail tip. */
  belly: string;
  /** Iris color for big eyes (defaults to accent). */
  eye?: string;
  /** Feet and beak color (defaults to main for feet, gold for beaks). */
  feet?: string;
  /** Wing color (defaults to accent). */
  wing?: string;
}

/** Which part to use for each piece of the drawing (see the files in art/). */
export interface Look {
  body: BodyShape;
  eyes: EyeStyle;
  mouth: MouthStyle;
  top: TopStyle;
  tail: TailStyle;
  feet: FeetStyle;
  arms: ArmStyle;
  pattern: PatternStyle;
  /** A lighter tummy patch. */
  belly?: boolean;
  /** Pink blush (color mode only). */
  cheeks?: boolean;
  /** A second top, drawn behind `top` (a unicorn's mane behind its horn). Only on bodies with a separate head or extra heads. */
  extraTop?: TopStyle;
  /** How many heads (default 1). 2 or 3 adds smaller copies of the head on short necks: hydras, chimeras. */
  heads?: 1 | 2 | 3;
}

export interface Monster {
  /** Unique, lowercase, used in save files. Don't change it once the game ships! */
  id: string;
  name: string;
  /** Which world it lives in. */
  world: WorldId;
  /** Which realm inside that world (a RealmDef id, e.g. 'forest'). */
  habitat: string;
  type: MonsterType;
  rarity: Rarity;
  size: Size;
  ability: { name: string; description: string };
  fact: string;
  colors: Palette;
  look: Look;
  /** Shows up this many times more often than others of the same rarity (default 1). */
  spawnBoost?: number;
}

/** A monster as written in a world's file: the same, minus `world` (worldMonsters() adds it). */
export type MonsterData = Omit<Monster, 'world'>;

/** Stamp every monster in a world's list with that world's id. */
export function worldMonsters(world: WorldId, list: MonsterData[]): Monster[] {
  return list.map((m) => ({ ...m, world }));
}

/** How big each size is drawn (1 = medium). */
export const SIZE_SCALE: Record<Size, number> = { tiny: 0.8, small: 0.9, medium: 1, large: 1.08 };
