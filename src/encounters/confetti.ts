import { NES } from '../render/nesPalette';

/** Square pixel confetti that rains down when a monster is found. */
const COLORS = [NES.redBright, NES.gold, NES.greenBright, NES.sky, NES.pink, NES.white, NES.purple];
const COUNT = 140;
const LIFETIME = 3; // seconds

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  wobble: number;
}

export class Confetti {
  private bits: Bit[] = [];
  private age = LIFETIME;

  constructor(private canvas: HTMLCanvasElement) {}

  start(): void {
    const w = this.canvas.clientWidth;
    this.bits = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 80,
      vy: 80 + Math.random() * 120,
      size: 6 + Math.floor(Math.random() * 3) * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
    }));
    this.age = 0;
  }

  stop(): void {
    this.age = LIFETIME;
    this.clear();
  }

  update(dt: number): void {
    if (this.age >= LIFETIME) return;
    this.age += dt;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (this.canvas.width !== Math.round(w * dpr)) this.canvas.width = Math.round(w * dpr);
    if (this.canvas.height !== Math.round(h * dpr)) this.canvas.height = Math.round(h * dpr);
    const ctx = this.canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (this.age >= LIFETIME) return;

    for (const b of this.bits) {
      b.wobble += dt * 6;
      b.x += (b.vx + Math.sin(b.wobble) * 40) * dt;
      b.y += b.vy * dt;
      ctx.fillStyle = b.color;
      ctx.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
    }
  }

  private clear(): void {
    this.canvas.getContext('2d')!.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
