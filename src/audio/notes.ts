/** Note names → frequencies. "A4" = 440 Hz; "C#5", "Bb3" work too. */
const SEMITONES: Record<string, number> = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };

const cache = new Map<string, number>();

export function noteFreq(name: string): number {
  let f = cache.get(name);
  if (f === undefined) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(name);
    if (!m) throw new Error(`Unknown note "${name}"`);
    const semis = SEMITONES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12;
    f = 440 * 2 ** (semis / 12);
    cache.set(name, f);
  }
  return f;
}
