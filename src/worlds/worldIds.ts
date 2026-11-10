/**
 * Every world's id. These go into save files, so once a world ships its id
 * must NEVER change. Add a new world's id here first, then its WorldDef in
 * worlds/index.ts (TypeScript complains until both exist).
 *
 * This file has no other imports on purpose: the save code needs it, and the
 * save code shouldn't have to load whole worlds just to check an id.
 */
export const WORLD_IDS = ['island', 'home', 'woods', 'buntown', 'cherrymart', 'sunnyside', 'bigblue'] as const;
export type WorldId = (typeof WORLD_IDS)[number];

/** The world a brand-new game starts in. */
export const DEFAULT_WORLD: WorldId = 'island';

/** Is this (untrusted) value one of our world ids? */
export function isWorldId(v: unknown): v is WorldId {
  return typeof v === 'string' && (WORLD_IDS as readonly string[]).includes(v);
}
