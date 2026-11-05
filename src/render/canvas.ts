import { MAX_DPR } from '../config';

export interface Viewport {
  /** Size in CSS pixels (what your layout code thinks in). */
  cssW: number;
  cssH: number;
  /** Device pixels per CSS pixel (2 on most tablets/phones, 1 on many monitors). */
  dpr: number;
  /** Real pixel size of the canvas backing store. */
  devW: number;
  devH: number;
}

/**
 * Keep the canvas sharp on high-DPI ("retina") screens: its internal pixel size
 * must be its CSS size times devicePixelRatio. Re-run whenever the size changes
 * (window resize, tablet rotation, browser zoom).
 */
export function setupCanvas(canvas: HTMLCanvasElement, onResize: (vp: Viewport) => void): void {
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const devW = Math.max(1, Math.round(cssW * dpr));
    const devH = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== devW) canvas.width = devW;
    if (canvas.height !== devH) canvas.height = devH;
    onResize({ cssW, cssH, dpr, devW, devH });
  }

  new ResizeObserver(resize).observe(canvas);
  // Browser zoom changes devicePixelRatio without changing CSS size; 'resize' catches that.
  window.addEventListener('resize', resize);
  // Some tablets report the new size a moment after rotating.
  window.addEventListener('orientationchange', () => setTimeout(resize, 150));
  resize();
}
