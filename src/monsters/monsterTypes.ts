import { Biome, BIOME_INFO } from '../world/biomes';
import { type BodyShape } from './art/bodies';
import { type EyeStyle, type MouthStyle } from './art/face';
import { type ArmStyle, type FeetStyle, type TailStyle } from './art/limbs';
import { type PatternStyle } from './art/patterns';
import { type TopStyle } from './art/tops';

/** The shape of a monster's data. The monsters themselves live in monsters.ts. */

export type Habitat = 'grassland' | 'forest' | 'desert' | 'arctic' | 'mountain' | 'beach' | 'swamp' | 'volcano' | 'cave';
export type MonsterType = 'Leaf' | 'Frost' | 'Sand' | 'Stone' | 'Splash' | 'Ember' | 'Shadow' | 'Zap' | 'Fluff';
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
}

export interface Monster {
  /** Unique, lowercase, used in save files. Don't change it once the game ships! */
  id: string;
  name: string;
  habitat: Habitat;
  type: MonsterType;
  rarity: Rarity;
  size: Size;
  ability: { name: string; description: string };
  fact: string;
  colors: Palette;
  look: Look;
}

/** Each habitat and the world biome it lives in, in gallery order. */
const HABITAT_BIOMES: { id: Habitat; biome: Biome }[] = [
  { id: 'grassland', biome: Biome.Grassland },
  { id: 'forest', biome: Biome.Forest },
  { id: 'desert', biome: Biome.Desert },
  { id: 'arctic', biome: Biome.Arctic },
  { id: 'mountain', biome: Biome.Mountains },
  { id: 'beach', biome: Biome.Beach },
  { id: 'swamp', biome: Biome.Swamp },
  { id: 'volcano', biome: Biome.Volcano },
  { id: 'cave', biome: Biome.Cave },
];

/**
 * Habitats with their display name. The name comes from the world's corner sign
 * (BIOME_INFO), so the book always says the same word Layne saw while exploring.
 */
export const HABITATS: { id: Habitat; label: string; biome: Biome }[] = HABITAT_BIOMES.map((h) => ({
  ...h,
  label: BIOME_INFO[h.biome].label,
}));

/** How big each size is drawn (1 = medium). */
export const SIZE_SCALE: Record<Size, number> = { tiny: 0.8, small: 0.9, medium: 1, large: 1.08 };
