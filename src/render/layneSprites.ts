/**
 * Layne as pixel art. Each string is one row of pixels; each character is
 * one pixel. You can edit him by retyping characters!
 *
 *   .  see-through        o  dark outline
 *   h  hair               H  hair highlight      d  hair shadow
 *   s  skin               S  skin shadow (ear)   c  rosy cheek    m  mouth
 *   e  blue eye           w  eye sparkle         L  glasses lens
 *   G  glasses frame (left side / main)          g  glasses frame (right side / arm)
 *   r  red stripe         W  white stripe
 *   b  backpack           B  backpack light      y  yellow buckle
 *   n  brown shorts       u  blue shoe           U  white sole
 *
 * Every row is exactly SPRITE_W characters. A full sprite is
 * head (15 rows) + body (7 rows) + legs (4 rows) = SPRITE_H rows.
 * Only the right-facing side view is drawn here; facing left is a mirror image.
 */
export const SPRITE_W = 20;
export const SPRITE_H = 26;

// ---------- Heads (15 rows) ----------
const FRONT_HEAD = [
  '....o....o....o.....',
  '...oho..oho..oho....',
  '..ohHhohHhhohHhho...',
  '..ohhHhhhHhhhhHhoho.',
  '.ohhhhhhhhhhhhhhhho.',
  '.ohhdhhhhdhhhhdhhho.',
  '.ohshhshhsshhshhsho.',
  '.ohssGGGssssgggssho.',
  '.ohsGLewGGggLewgsho.',
  '.ohsGLeLGssgLeLgsho.',
  '.ohssGGGssssgggssho.',
  '.ohscsssssssssscsho.',
  '..ohssssmssmssssho..',
  '...ohssssmmssssho...',
  '....oooooooooooo....',
];

const BACK_HEAD = [
  '....o....o....o.....',
  '...oho..oho..oho....',
  '..ohHhohHhhohHhho...',
  '..ohhHhhhHhhhhHhoho.',
  '.ohhhhhhhhhhhhhhhho.',
  '.ohhHhhhhhhhhHhhhho.',
  '.ohhhhdhhhhdhhhhhho.',
  'Gohhhhhhhhhhhhhhhhog',
  '.ohhdhhhhhhhhhhdhho.',
  '.ohhhhhhhhhhhhhhhho.',
  '..ohhhdhhhhhhdhhho..',
  '..ohhhhhhhhhhhhhho..',
  '...ohhhhhhhhhhhho...',
  '....osssssssssso....',
  '....oooooooooooo....',
];

const SIDE_HEAD = [
  '.....o...o...o......',
  '....oho.oho.oho.....',
  '...ohHhohHhhohHho...',
  '..ohhhHhhhHhhhHhho..',
  '.ohhhhhhhhhhhhhhhho.',
  '.ohhhHhhhhhhdhhhdho.',
  '.ohhhhhhhshhshsssso.',
  '.ohhhhhhsssssGGGsso.',
  '.ohhhhhhSgggGLewGso.',
  '.ohhhhhhSsssGLeLGso.',
  '.ohhhhhhsssssGGGsso.',
  '.ohhhhhhssssssscsso.',
  '..ohhhhhssssssmmso..',
  '...ohhhhsssssssso...',
  '....oooooooooooo....',
];

// ---------- Bodies (7 rows): striped shirt, backpack, shorts ----------
const FRONT_BODY = [
  '..orrrbrrrrrrbrrro..',
  '..oWWWbWWWWWWbWWWo..',
  '..osorbrrrrrrbroso..',
  '..osoWyWWWWWWyWoso..',
  '..osorbrrrrrrbroso..',
  '....onnnnnnnnnno....',
  '....onnnnoonnnno....',
];

const BACK_BODY = [
  '..orobbbbbbbbbboro..',
  '..oWobBBBBBBBBboWo..',
  '..osobByBBBByBboso..',
  '..osobBBBBBBBBboso..',
  '..osobbbbbbbbbboso..',
  '....onbbbbbbbbno....',
  '....onnnnoonnnno....',
];

const SIDE_BODY = [
  '.obbbbbobrrrro......',
  '.obBBBbobWWWWo......',
  '.obByBbobrsrro......',
  '.obBBBbobWsWWo......',
  '.obbbbbobrsrro......',
  '..obbbbonnnnno......',
  '.......onnnnno......',
];

// ---------- Legs (4 rows) ----------
const FRONT_LEGS_STAND = [
  '.....osso..osso.....',
  '....ouuuo..ouuuo....',
  '....oUUUo..oUUUo....',
  '.....ooo....ooo.....',
];

/** Left foot lifted. The right-foot step is this, mirrored. */
const FRONT_LEGS_STEP = [
  '....ouuuo..osso.....',
  '....oUUUo..ouuuo....',
  '.....ooo...oUUUo....',
  '............ooo.....',
];

const SIDE_LEGS_STAND = [
  '........osso........',
  '........ouuuuo......',
  '........oUUUUo......',
  '.........oooo.......',
];

const SIDE_LEGS_STRIDE = [
  '.......oso.oso......',
  '......ouuo.ouuuo....',
  '......oUUo.oUUUo....',
  '.......oo...ooo.....',
];

function mirror(rows: string[]): string[] {
  return rows.map((row) => [...row].reverse().join(''));
}

export type SpriteView = 'down' | 'up' | 'right';

/** The full picture for a view and walk frame (0..3; 1 and 3 are mid-step). */
export function spriteRows(view: SpriteView, frame: number): string[] {
  const midStep = frame % 2 === 1;
  if (view === 'right') {
    return [...SIDE_HEAD, ...SIDE_BODY, ...(midStep ? SIDE_LEGS_STRIDE : SIDE_LEGS_STAND)];
  }
  const legs = !midStep ? FRONT_LEGS_STAND : frame === 1 ? FRONT_LEGS_STEP : mirror(FRONT_LEGS_STEP);
  return view === 'down'
    ? [...FRONT_HEAD, ...FRONT_BODY, ...legs]
    : [...BACK_HEAD, ...BACK_BODY, ...legs];
}
