/**
 * Extra controls for 3D worlds:
 *   JUMP          the big button (bottom right), or Space
 *   TURN CAMERA   the two curved arrows (above the book), or Q / E
 * Walking is the same as always: arrow keys / WASD, or a finger.
 * The buttons are only shown in 3D worlds; the keys only work while walking around.
 */
const JUMP_ICON =
  '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">' +
  '<path d="M8 1l6 6h-4v5H6V7H2z" fill="#F8B800"/><path d="M2 14h12v1H2z" fill="#FCFCFC"/></svg>';
/** A curved arrow. The right one is the same picture, flipped. */
const TURN_ICON =
  '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">' +
  '<path d="M6 3h5v1h1v1h1v6h-1v1h-1v1H8v-2h2V5H6v2L2 4l4-3z" fill="#FCFCFC"/></svg>';

export interface Controls3DActions {
  jump(): void;
  turn(steps: number): void;
  /** Can Layne act right now? (In a 3D world, with nothing open on top.) */
  canAct(): boolean;
}

export class Controls3D {
  private root: HTMLDivElement;

  constructor(parent: HTMLElement, actions: Controls3DActions) {
    this.root = document.createElement('div');
    this.root.className = 'controls3d';
    this.root.hidden = true;
    this.root.innerHTML = `
      <button class="nes-box controls3d__turn controls3d__turn--left" aria-label="Turn left">${TURN_ICON}</button>
      <button class="nes-box controls3d__turn controls3d__turn--right" aria-label="Turn right">${TURN_ICON}</button>
      <button class="nes-box controls3d__jump" aria-label="Jump">${JUMP_ICON}</button>`;
    parent.append(this.root);

    const on = (sel: string, run: () => void) =>
      // pointerdown, not click: a jump should happen the moment the button is touched.
      this.root.querySelector(sel)!.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (actions.canAct()) run();
      });
    on('.controls3d__jump', () => actions.jump());
    on('.controls3d__turn--left', () => actions.turn(-1));
    on('.controls3d__turn--right', () => actions.turn(1));

    window.addEventListener('keydown', (e) => {
      if (this.root.hidden || e.repeat || !actions.canAct()) return;
      if (e.code === 'Space') actions.jump();
      else if (e.code === 'KeyQ') actions.turn(-1);
      else if (e.code === 'KeyE') actions.turn(1);
      else return;
      e.preventDefault(); // Space would otherwise scroll or press a focused button
    });
  }

  setVisible(on: boolean): void {
    this.root.hidden = !on;
  }
}
