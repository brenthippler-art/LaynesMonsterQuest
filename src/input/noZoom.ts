/**
 * Stop tablet browsers from zooming or scrolling the page during play.
 * (CSS `touch-action` and `overscroll-behavior` in style.css do most of the
 * work; these cover what iPad Safari ignores.)
 *
 * Scrollable panels (the book, the grown-ups area) still scroll with one finger.
 */
export function preventTabletZoom(): void {
  // Safari's own pinch events.
  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
  }
  // Two or more fingers moving = a pinch. One finger is left alone (taps, steering, scrolling the book).
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );
  // Double-tap to zoom (older Safari ignores touch-action for this).
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
  // Long-press "save image / copy" menus.
  document.addEventListener('contextmenu', (e) => {
    if (!(e.target as HTMLElement).closest('.parent__box')) e.preventDefault();
  });
}
