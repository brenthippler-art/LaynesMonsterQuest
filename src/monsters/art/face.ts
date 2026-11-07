import { type Palette } from '../monsterTypes';
import { type Body, CENTER_X } from './bodies';
import { circle, ellipse, inkDot, line, n, type Pen, shape, shine, tube } from './pen';

export type EyeStyle =
  | 'dot' // small black ovals
  | 'round' // white eyes with pupils
  | 'big' // huge shiny eyes (cave monsters)
  | 'happy' // ^ ^ closed happy eyes
  | 'sleepy' // half-closed lids
  | 'cyclops' // one big eye
  | 'stalks'; // eyes on stalks (snails, crabs, frogs)

/** 'snout' = a dragon/horse muzzle with two nostril dots and a smile. */
export type MouthStyle = 'smile' | 'open' | 'fang' | 'beak' | 'cat' | 'o' | 'grin' | 'snout';

export interface Face {
  eyeY: number;
  /** How far each eye is from the middle. */
  eyeDX: number;
  mouthY: number;
}

const WHITE = '#FFFFFF';
const MOUTH = '#A81000';
const TONGUE = '#F87858';
const FLAT = { shade: false };

export function faceLayout(b: Body): Face {
  if (b.face) return b.face; // a body that puts its face somewhere special (a toilet, a toaster)
  const eyeY = b.cy - b.ry * 0.15;
  return { eyeY, eyeDX: Math.min(24, Math.max(15, b.rx * 0.38)), mouthY: eyeY + Math.max(19, b.ry * 0.4) };
}

/** A big shiny eye: white, colored iris, black pupil, white shine. */
function bigEye(pen: Pen, x: number, y: number, r: number, iris: string): string {
  return (
    circle(pen, x, y, r, WHITE, FLAT) +
    circle(pen, x, y + r * 0.08, r * 0.66, iris, { shade: false }) +
    inkDot(pen, x, y + r * 0.08, r * 0.34) +
    shine(pen, x + r * 0.3, y - r * 0.25, Math.max(3, r * 0.2))
  );
}

function roundEye(pen: Pen, x: number, y: number): string {
  return circle(pen, x, y, 11, WHITE, FLAT) + inkDot(pen, x + 1, y + 1.5, 6) + shine(pen, x + 3.5, y - 2.5, 3);
}

/** Eyes have a "back" layer (stalks, drawn behind the body) and a "front" layer. */
export function drawEyes(pen: Pen, b: Body, f: Face, style: EyeStyle, c: Palette): { back: string; front: string } {
  const y = f.eyeY;
  const xs = [CENTER_X - f.eyeDX, CENTER_X + f.eyeDX];
  const iris = c.eye ?? c.accent;
  switch (style) {
    case 'dot':
      return { back: '', front: xs.map((x) => inkDot(pen, x, y, 6, 8) + shine(pen, x + 2, y - 3, 3)).join('') };
    case 'round':
      return { back: '', front: xs.map((x) => roundEye(pen, x, y)).join('') };
    case 'big': {
      const r = Math.min(17, f.eyeDX - 2);
      return { back: '', front: xs.map((x) => bigEye(pen, x, y, r, iris)).join('') };
    }
    case 'cyclops':
      return { back: '', front: bigEye(pen, CENTER_X, y, 22, iris) };
    case 'happy':
      return { back: '', front: xs.map((x) => line(pen, `M${n(x - 8)} ${n(y + 3)} Q${n(x)} ${n(y - 8)} ${n(x + 8)} ${n(y + 3)}`, 4.5)).join('') };
    case 'sleepy':
      return {
        back: '',
        front: xs
          .map(
            (x) =>
              circle(pen, x, y, 10, WHITE, FLAT) +
              inkDot(pen, x, y + 4, 5, 4) +
              shape(pen, `M${n(x - 10.5)} ${n(y + 0.5)} A10.5 10.5 0 0 1 ${n(x + 10.5)} ${n(y + 0.5)} Z`, c.main), // eyelid
          )
          .join(''),
      };
    case 'stalks': {
      let back = '';
      let front = '';
      for (const side of [-1, 1]) {
        const bx = CENTER_X + side * f.eyeDX * 1.1;
        const tipX = bx + side * 6;
        const tipY = b.top - 20;
        back += tube(pen, `M${n(bx)} ${n(b.topYAt(bx) + 10)} L${n(tipX)} ${n(tipY)}`, 8, c.main);
        front += roundEye(pen, tipX, tipY);
      }
      return { back, front };
    }
  }
}

export function drawMouth(pen: Pen, f: Face, style: MouthStyle, c: Palette): string {
  const x = CENTER_X;
  const y = f.mouthY;
  const smile = line(pen, `M${n(x - 9)} ${n(y)} Q${n(x)} ${n(y + 9)} ${n(x + 9)} ${n(y)}`);
  switch (style) {
    case 'smile':
      return smile;
    case 'fang': {
      // Two little teeth hanging from the smile, then the smile line over them.
      const tooth = (tx: number) => shape(pen, `M${n(tx - 3.5)} ${n(y + 2)} L${n(tx + 3.5)} ${n(y + 2)} L${n(tx)} ${n(y + 10)} Z`, WHITE, FLAT);
      return tooth(x - 5) + tooth(x + 5) + smile;
    }
    case 'open':
      return (
        shape(pen, `M${n(x - 11)} ${n(y)} Q${n(x)} ${n(y + 3)} ${n(x + 11)} ${n(y)} Q${n(x + 10)} ${n(y + 16)} ${n(x)} ${n(y + 16)} Q${n(x - 10)} ${n(y + 16)} ${n(x - 11)} ${n(y)} Z`, MOUTH, FLAT) +
        ellipse(pen, x, y + 11, 6, 4, TONGUE, 0, { outline: false, shade: false })
      );
    case 'grin':
      return shape(pen, `M${n(x - 15)} ${n(y)} Q${n(x)} ${n(y + 3)} ${n(x + 15)} ${n(y)} Q${n(x + 13)} ${n(y + 18)} ${n(x)} ${n(y + 18)} Q${n(x - 13)} ${n(y + 18)} ${n(x - 15)} ${n(y)} Z`, WHITE, FLAT);
    case 'beak':
      return shape(pen, `M${n(x - 11)} ${n(y - 5)} L${n(x + 11)} ${n(y - 5)} L${n(x)} ${n(y + 10)} Z`, c.feet ?? '#F8B800');
    case 'cat':
      return line(pen, `M${n(x - 10)} ${n(y - 2)} Q${n(x - 5)} ${n(y + 6)} ${n(x)} ${n(y - 1)} Q${n(x + 5)} ${n(y + 6)} ${n(x + 10)} ${n(y - 2)}`);
    case 'o':
      return ellipse(pen, x, y + 4, 5.5, 7, MOUTH, 0, FLAT);
    case 'snout':
      return (
        ellipse(pen, x, y + 1, 20, 13, c.belly) +
        inkDot(pen, x - 6.5, y - 3, 2.6, 2.2) +
        inkDot(pen, x + 6.5, y - 3, 2.6, 2.2) +
        line(pen, `M${n(x - 9)} ${n(y + 4)} Q${n(x)} ${n(y + 11)} ${n(x + 9)} ${n(y + 4)}`)
      );
  }
}

/** Pink cheeks: no outline, and they vanish on coloring pages. */
export function drawCheeks(pen: Pen, f: Face): string {
  return [-1, 1].map((s) => ellipse(pen, CENTER_X + s * (f.eyeDX + 11), f.eyeY + 13, 7, 4.5, '#F878F8', 0, { outline: false, shade: false })).join('');
}
