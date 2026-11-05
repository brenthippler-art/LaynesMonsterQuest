/**
 * Calls update(dt) then render() once per screen refresh.
 * dt = seconds since last frame, capped so a hiccup (or a hidden tab)
 * doesn't make Layne teleport.
 */
export function startLoop(update: (dt: number) => void, render: () => void): void {
  let last = performance.now();
  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
