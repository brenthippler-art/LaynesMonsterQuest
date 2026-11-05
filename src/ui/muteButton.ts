import { engine } from '../audio/engine';
import { sfx } from '../audio/sfx';

/** Speaker icon, with sound waves (on) or an X (off). Drawn on a 16x16 pixel grid. */
const SPEAKER = 'M2 6h3l4-4v12l-4-4H2z';
const WAVES = '<path d="M11 5c1 1 1 5 0 6M13 3c2 2 2 8 0 10" fill="none" stroke="#fcfcfc" stroke-width="1.5"/>';
const CROSS = '<path d="M11 5l4 6M15 5l-4 6" fill="none" stroke="#f83800" stroke-width="2"/>';

/** The sound on/off button (bottom-right): turns off music AND sound effects. */
export class MuteButton {
  private el: HTMLButtonElement;

  constructor(parent: HTMLElement, muted: boolean, onChange: (muted: boolean) => void) {
    this.el = document.createElement('button');
    this.el.className = 'mute-button nes-box';
    this.el.addEventListener('click', () => {
      engine.unlock();
      engine.setMuted(!engine.muted);
      sfx.click();
      this.draw();
      onChange(engine.muted);
    });
    parent.append(this.el);
    engine.setMuted(muted);
    this.draw();
  }

  private draw(): void {
    const on = !engine.muted;
    this.el.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    this.el.setAttribute('aria-pressed', String(!on));
    this.el.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path d="${SPEAKER}" fill="#fcfcfc"/>${on ? WAVES : CROSS}</svg>`;
  }
}
