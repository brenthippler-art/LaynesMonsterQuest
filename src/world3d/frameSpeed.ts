/**
 * The tablet speed check. Watches how long each 3D frame takes, and if this
 * device can't keep up (frames slower than SLOW_MS for WATCH_SECONDS in a row),
 * says to draw the 3D picture with fewer pixels: 360 rows, then 300, then 240.
 * Fewer pixels = less work for the graphics chip, and it still looks chunky
 * on purpose. It only ever steps down (never back up), so the picture doesn't
 * keep flickering between sharp and blocky.
 */
export const ROW_STEPS = [360, 300, 240];
const SLOW_MS = 24; // slower than about 40 frames a second
const WATCH_SECONDS = 2;

export class FrameSpeed {
  private step = 0;
  /** A running average of how long a frame takes, in milliseconds. */
  private average = 16;
  private slowFor = 0;

  /** About how many pixels tall to draw the 3D picture. */
  get rows(): number {
    return ROW_STEPS[this.step];
  }

  /** Call once per frame with its length in seconds. Returns true when `rows` just changed. */
  frame(dt: number): boolean {
    if (dt <= 0) return false;
    // Each frame moves the average a tenth of the way, so one slow frame (a new world loading) barely counts.
    this.average += (dt * 1000 - this.average) * 0.1;
    this.slowFor = this.average > SLOW_MS ? this.slowFor + dt : 0;
    if (this.slowFor < WATCH_SECONDS || this.step === ROW_STEPS.length - 1) return false;
    this.step++;
    this.slowFor = 0;
    this.average = 16; // give the smaller picture a fair chance
    return true;
  }
}
