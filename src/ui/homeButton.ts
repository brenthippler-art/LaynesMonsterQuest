/** House icon on a 16x16 pixel grid: roof, walls, door. */
const HOUSE =
  '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">' +
  '<path d="M8 1l7 7h-2v7H3V8H1z" fill="#F83800"/>' +
  '<path d="M4 8h8v6H4z" fill="#FCE0A8"/>' +
  '<path d="M7 10h2v4H7z" fill="#881400"/></svg>';

/** The in-game "home" button (above the sound button): saves, then goes back to the title screen. */
export class HomeButton {
  private el: HTMLButtonElement;

  constructor(parent: HTMLElement, onPress: () => void) {
    this.el = document.createElement('button');
    this.el.className = 'home-button nes-box';
    this.el.setAttribute('aria-label', 'Home');
    this.el.innerHTML = HOUSE;
    this.el.addEventListener('click', onPress);
    parent.append(this.el);
  }
}
