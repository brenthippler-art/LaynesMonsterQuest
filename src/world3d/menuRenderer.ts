import { type Camera, type Scene, WebGLRenderer } from 'three';

/**
 * One small 3D drawing surface shared by the title screen and the world picker
 * (they're never open at the same time). It's never on the screen itself: each
 * picture is drawn here, then copied onto a plain canvas on the page. That way one
 * surface can fill many canvases (one per world card), and a phone only has to
 * keep one extra 3D surface going.
 *
 * Returns null if this device can't draw 3D: the screens then keep their 2D pictures.
 */
let shared: WebGLRenderer | null | undefined;

export function menuRenderer(): WebGLRenderer | null {
  if (shared === undefined) {
    try {
      // alpha: the screen's own background (sky, card picture) shows through around the 3D.
      shared = new WebGLRenderer({ antialias: false, alpha: true });
      shared.setPixelRatio(1);
    } catch {
      shared = null;
    }
  }
  return shared;
}

/** Draw `scene` at `out`'s size, then copy it onto `out` (a plain 2D canvas on the page). */
export function drawInto(renderer: WebGLRenderer, scene: Scene, camera: Camera, out: HTMLCanvasElement): void {
  const size = renderer.domElement;
  if (size.width !== out.width || size.height !== out.height) renderer.setSize(out.width, out.height, false);
  renderer.render(scene, camera);
  const ctx = out.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, out.width, out.height);
  // Copy straight away, before the browser gets a chance to clear the 3D surface.
  ctx.drawImage(size, 0, 0);
}
