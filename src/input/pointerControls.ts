import { type Point } from '../player/player';

/**
 * Finger (and mouse) controls on the game screen:
 *   - TAP a spot           → onTap() is called (Layne walks there along a path)
 *   - PRESS AND HOLD / DRAG → Layne walks toward the finger and follows it
 * All positions are in CSS pixels relative to the element.
 */
const TAP_MAX_MOVE = 24; // a finger that moves further than this is dragging, not tapping
const HOLD_MS = 300; // a press held longer than this starts steering
const ARRIVED = 24; // Layne stops when he's this close to the finger

interface Press {
  id: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  time: number;
  steering: boolean;
}

export class PointerControls {
  private press: Press | null = null;

  constructor(
    private el: HTMLElement,
    onTap: (cssX: number, cssY: number) => void,
  ) {
    el.addEventListener('pointerdown', (e) => {
      if (!e.isPrimary || e.button !== 0) return; // ignore a second finger and right-clicks
      try {
        el.setPointerCapture(e.pointerId); // keep following the finger even if it slides off the canvas
      } catch {
        // Some unusual pointers can't be captured; the controls still work without it.
      }
      const p = this.local(e);
      this.press = { id: e.pointerId, startX: p.x, startY: p.y, x: p.x, y: p.y, time: performance.now(), steering: false };
    });

    el.addEventListener('pointermove', (e) => {
      const press = this.press;
      if (!press || e.pointerId !== press.id) return;
      const p = this.local(e);
      press.x = p.x;
      press.y = p.y;
      if (Math.hypot(p.x - press.startX, p.y - press.startY) > TAP_MAX_MOVE) press.steering = true;
    });

    el.addEventListener('pointerup', (e) => {
      const press = this.press;
      if (!press || e.pointerId !== press.id) return;
      this.press = null;
      if (!press.steering && performance.now() - press.time < HOLD_MS) onTap(press.x, press.y);
    });

    const cancel = (e: PointerEvent) => {
      if (this.press && e.pointerId === this.press.id) this.press = null;
    };
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('lostpointercapture', cancel);
    el.addEventListener('contextmenu', (e) => e.preventDefault()); // no long-press menu on tablets
  }

  /** Forget the current press (e.g. when an encounter screen opens on top of the game). */
  release(): void {
    this.press = null;
  }

  /** Where the finger is while it's steering Layne (held or dragging), otherwise null. */
  steerPoint(): Point | null {
    const press = this.press;
    if (!press) return null;
    if (!press.steering && performance.now() - press.time >= HOLD_MS) press.steering = true;
    return press.steering ? { x: press.x, y: press.y } : null;
  }

  /** Direction from `from` (Layne on screen, CSS px) toward the finger. Zero when not steering or already there. */
  direction(from: Point): Point {
    const p = this.steerPoint();
    if (!p) return { x: 0, y: 0 };
    const dx = p.x - from.x;
    const dy = p.y - from.y;
    const dist = Math.hypot(dx, dy);
    return dist < ARRIVED ? { x: 0, y: 0 } : { x: dx / dist, y: dy / dist };
  }

  private local(e: PointerEvent): Point {
    const rect = this.el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}
