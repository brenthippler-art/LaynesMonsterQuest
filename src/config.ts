/** Change this number to get a whole new world. Same number = same world, every visit. */
export const WORLD_SEED = 20261105;

/** The overworld is WORLD_SIZE x WORLD_SIZE tiles. */
export const WORLD_SIZE = 200;

/** Every tile is 16x16 pixels, like on the NES. */
export const TILE_PIXELS = 16;

/** The map is pre-drawn in square chunks of this many tiles (faster than drawing every tile every frame). */
export const CHUNK_TILES = 8;

/** About how many tiles fit across the SHORT side of the screen (bigger number = zoomed out). */
export const TILES_ACROSS_SHORT_SIDE = 12;

/**
 * Each art pixel becomes a square of this many screen pixels. It's always a
 * whole number so every pixel is the same size (that's what keeps pixel art crisp).
 */
export const MIN_PIXEL_SCALE = 2;
export const MAX_PIXEL_SCALE = 12;

/** Layne's walking speed, in tiles per second. */
export const PLAYER_SPEED = 4;

/** Sharper than 2x isn't noticeable, but costs a lot of memory. */
export const MAX_DPR = 2;
