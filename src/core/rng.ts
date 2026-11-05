/**
 * Seeded random numbers. Math.random() is different every time; these are
 * the same every time for the same seed, which is how the world stays identical.
 */

/** Returns a function that gives a new number in [0, 1) each call ("mulberry32"). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A number in [0, 1) that depends only on (x, y, salt). Handy for
 * "should THIS tile have a tree?" without storing any random state.
 */
export function hash2(x: number, y: number, salt = 0): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(salt, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
