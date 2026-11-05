import { type Point } from '../player/player';

/** e.code → direction. Using e.code (physical key) means WASD works on any keyboard layout. */
const KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
};

export class Keyboard {
  private held = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.code in KEYS) {
        e.preventDefault(); // stop arrow keys from scrolling the page
        this.held.add(e.code);
      }
    });
    window.addEventListener('keyup', (e) => this.held.delete(e.code));
    // If the window loses focus while a key is down, we'd never hear the keyup. Forget everything.
    window.addEventListener('blur', () => this.held.clear());
  }

  /** Current direction, length 0 or 1 (so diagonals aren't faster). */
  direction(): Point {
    let x = 0;
    let y = 0;
    for (const code of this.held) {
      x += KEYS[code][0];
      y += KEYS[code][1];
    }
    x = Math.sign(x);
    y = Math.sign(y);
    const len = Math.hypot(x, y);
    return len ? { x: x / len, y: y / len } : { x: 0, y: 0 };
  }
}
