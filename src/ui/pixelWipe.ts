/**
 * A quick NES-style screen change: big black squares fill the screen from
 * the top-left corner, something happens while it's all black (a world
 * loads), then the squares clear away from the same corner.
 *
 * The picture is a tiny canvas (one canvas pixel = one square) stretched
 * over the whole screen with crisp pixels. While it runs it also catches
 * every tap, so nothing can be pressed twice.
 */
const COLUMNS = 16;
const HALF_SECONDS = 0.3; // covering takes this long, and so does uncovering

export class PixelWipe {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;

  constructor(parent: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pixel-wipe';
    this.canvas.hidden = true;
    this.ctx = this.canvas.getContext('2d')!;
    parent.append(this.canvas);
  }

  get isRunning(): boolean {
    return this.running;
  }

  /** Cover the screen, call `whileCovered`, then uncover. Ignored if a wipe is already running. */
  run(whileCovered: () => void): void {
    if (this.running) return;
    this.running = true;
    const cols = COLUMNS;
    const rows = Math.max(1, Math.round((COLUMNS * innerHeight) / Math.max(1, innerWidth)));
    this.canvas.width = cols;
    this.canvas.height = rows;
    this.canvas.hidden = false;
    const last = cols + rows - 2; // the square furthest from the corner

    /** Draw the squares whose "distance from the corner" is <= reach (covering) or > reach (uncovering). */
    const draw = (reach: number, covering: boolean) => {
      this.ctx.clearRect(0, 0, cols, rows);
      this.ctx.fillStyle = '#000';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const near = x + y <= reach;
          if (near === covering) this.ctx.fillRect(x, y, 1, 1);
        }
      }
    };

    let start = performance.now();
    let covering = true;
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / 1000 / HALF_SECONDS);
      draw(Math.floor(t * (last + 1)) - (covering ? 0 : 1), covering);
      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }
      if (covering) {
        draw(last, true); // completely black
        whileCovered();
        covering = false;
        start = performance.now(); // (building a world can take a moment; start uncovering after it)
        requestAnimationFrame(frame);
        return;
      }
      this.canvas.hidden = true;
      this.running = false;
    };
    requestAnimationFrame(frame);
  }
}
