import { DECOR_SPRITES } from '../../render/decorSprites';
import { Decor } from '../../world/decorations';
import { type RealmDef } from '../types';

/** Woods-specific realm codes stored in TileMap.biome (independent of Island's Biome). */
export const WoodsBiome = {
  Glade: 0,
  Pines: 1,
  Mushroom: 2,
  Fern: 3,
  Creek: 4,
  Briar: 5,
  Ancient: 6,
  Mist: 7,
  Shadow: 8,
} as const;
export type WoodsBiome = (typeof WoodsBiome)[keyof typeof WoodsBiome];

const art = (d: Decor): readonly string[] => DECOR_SPRITES[d] ?? [];

/** Order is the order shown in the Monster Book and world picker. */
export const WOODS_REALMS: readonly RealmDef[] = [
  { id: 'sunny-glade', label: 'GLADE', icon: art(Decor.Flower), music: 'explore', encounterBg: 'dim', printDecor: [art(Decor.Flower), art(Decor.TallGrass)] },
  { id: 'pinewood', label: 'PINES', icon: art(Decor.Pine), music: 'explore', encounterBg: 'dim', printDecor: [art(Decor.Pine), art(Decor.Rock)] },
  { id: 'mushroom-grove', label: 'MUSHROOM', icon: art(Decor.Mushroom), music: 'explore', encounterBg: 'dim', printDecor: [art(Decor.Mushroom), art(Decor.Bush)] },
  { id: 'fern-hollow', label: 'FERN', icon: art(Decor.Bush), music: 'explore', encounterBg: 'dim', printDecor: [art(Decor.Bush), art(Decor.TallGrass)] },
  { id: 'creekside', label: 'CREEK', icon: art(Decor.Reeds), music: 'explore', encounterBg: 'dim', printDecor: [art(Decor.Reeds), art(Decor.Puddle)] },
  { id: 'briar-patch', label: 'BRIAR', icon: art(Decor.TallGrass), music: 'explore', encounterBg: 'dim', printDecor: [art(Decor.Bush), art(Decor.Flower)] },
  { id: 'ancient-woods', label: 'ANCIENT', icon: art(Decor.Tree), music: 'explore', encounterBg: 'dim', printDecor: [art(Decor.Tree), art(Decor.Rock)] },
  { id: 'misty-marsh', label: 'MIST', icon: art(Decor.Puddle), music: 'explore', encounterBg: 'dim', printDecor: [art(Decor.Reeds), art(Decor.Mushroom)] },
  { id: 'shadow-grove', label: 'SHADOW', icon: art(Decor.Crystal), music: 'cave', encounterBg: 'dim', printDecor: [art(Decor.Pine), art(Decor.Crystal)] },
];
