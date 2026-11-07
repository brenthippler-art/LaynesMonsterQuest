import './parent.css';
import { MONSTERS } from '../monsters/worlds';
import { isPrintReady, preparePrint, printColoringPages } from '../print/printer';
import { type AutoSave } from '../save/autosave';
import { backupSave, clearSave, currentSaveText, readBackup, type SaveData, writeSave } from '../save/save';
import { downloadSave, downloadText, readSaveFile } from '../save/transfer';

/**
 * The grown-ups area, hidden behind a gear you must HOLD for 3 seconds
 * (a quick tap does nothing, so little fingers won't open it by accident).
 *   - download the save as a file / load a save file (to move between devices)
 *   - reset the game (asks first, and keeps a backup copy)
 */
const HOLD_SECONDS = 3;
const GEAR_ICON =
  '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M7 1h2v2h2v2h2v2h2v2h-2v2h-2v2H9v2H7v-2H5v-2H3V9H1V7h2V5h2V3h2z" fill="#BCBCBC"/><rect x="6" y="6" width="4" height="4" fill="#000"/></svg>';

type View = 'main' | 'confirm-reset' | 'confirm-import';

/** True when running as an app added to an iPhone/iPad Home Screen (Safari sets navigator.standalone). */
function isIosHomeScreenApp(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export class ParentArea {
  private gear: HTMLButtonElement;
  private root: HTMLDivElement;
  private box: HTMLElement;
  private holdStart: number | null = null;
  private pendingImport: SaveData | null = null;
  private message = '';
  /** "Print all": idle → getting pages ready → ready to print (a second tap opens the print dialog). */
  private printing: 'idle' | 'preparing' = 'idle';
  isOpen = false;

  constructor(
    parent: HTMLElement,
    private save: SaveData,
    private autosave: AutoSave,
    /** True if a damaged save was found at startup. */
    private recovered: boolean,
    /** Opens the picture "how to play" again. */
    private showHowToPlay: () => void,
  ) {
    this.gear = document.createElement('button');
    this.gear.className = 'gear-button nes-box';
    this.gear.setAttribute('aria-label', 'Grown-ups: hold for 3 seconds');
    this.gear.innerHTML = `${GEAR_ICON}<span class="gear-fill"></span>`;
    const start = (e: PointerEvent) => {
      e.preventDefault();
      this.holdStart = performance.now();
    };
    const cancel = () => {
      this.holdStart = null;
      this.gear.style.setProperty('--hold', '0');
    };
    this.gear.addEventListener('pointerdown', start);
    this.gear.addEventListener('pointerup', cancel);
    this.gear.addEventListener('pointerleave', cancel);
    this.gear.addEventListener('pointercancel', cancel);
    this.gear.addEventListener('contextmenu', (e) => e.preventDefault());
    parent.append(this.gear);

    this.root = document.createElement('div');
    this.root.className = 'parent';
    this.root.hidden = true;
    this.root.innerHTML = `<div class="parent__box" role="dialog" aria-modal="true" aria-label="Grown-ups"></div>
      <input type="file" accept=".json,application/json" hidden />`;
    this.box = this.root.querySelector('.parent__box')!;
    parent.append(this.root);

    this.root.querySelector('input')!.addEventListener('change', (e) => this.onFileChosen(e.target as HTMLInputElement));
    this.root.addEventListener('click', (e) => this.onClick(e));
    window.addEventListener('keydown', (e) => {
      if (this.isOpen && e.code === 'Escape') this.close();
    });
  }

  /** Call every frame: fills the gear while it's held, opens at 3 seconds. */
  update(): void {
    if (this.holdStart === null) return;
    const held = (performance.now() - this.holdStart) / 1000;
    this.gear.style.setProperty('--hold', String(Math.min(1, held / HOLD_SECONDS)));
    if (held >= HOLD_SECONDS) {
      this.holdStart = null;
      this.gear.style.setProperty('--hold', '0');
      this.open();
    }
  }

  private open(): void {
    this.isOpen = true;
    this.root.hidden = false;
    this.message = '';
    this.render('main');
  }

  private close(): void {
    this.isOpen = false;
    this.root.hidden = true;
  }

  private render(view: View): void {
    const found = Object.keys(this.save.collection).length;
    const backup = readBackup();
    if (view === 'confirm-reset') {
      this.box.innerHTML = `
        <h2>Start over?</h2>
        <p>This erases Layne's progress on this device: <b>${found} of ${MONSTERS.length}</b> monsters found, and where he is in the world.</p>
        <p>A backup copy of the current save is kept, just in case.</p>
        <div class="parent__row">
          <button data-act="reset-yes" class="danger">Yes, start over</button>
          <button data-act="back">Cancel</button>
        </div>`;
      return;
    }
    if (view === 'confirm-import') {
      const incoming = Object.keys(this.pendingImport?.collection ?? {}).length;
      this.box.innerHTML = `
        <h2>Load this save?</h2>
        <p>The file has <b>${incoming} of ${MONSTERS.length}</b> monsters found. It will replace the progress on this device (<b>${found}</b> found).</p>
        <p>A backup copy of the current save is kept, just in case.</p>
        <div class="parent__row">
          <button data-act="import-yes">Yes, load it</button>
          <button data-act="back">Cancel</button>
        </div>`;
      return;
    }
    this.box.innerHTML = `
      <header><h2>Grown-ups</h2><button data-act="close" aria-label="Close">✕</button></header>
      ${this.recovered ? `<p class="parent__note">A damaged save was found when the game started, so a new game began. A copy of the damaged save was kept (download it below).</p>` : ''}
      ${this.message ? `<p class="parent__note">${this.message}</p>` : ''}
      <p>Monsters found: <b>${found} / ${MONSTERS.length}</b></p>

      <h3>Move progress between devices</h3>
      <p>Download a save file here, then load it on the other device (tablet ↔ computer). Nothing is sent over the internet.</p>
      <div class="parent__row">
        <button data-act="export">Download save file</button>
        <button data-act="import">Load save file…</button>
      </div>

      <h3>How to play</h3>
      <div class="parent__row"><button data-act="howto">Show the how-to-play pictures again</button></div>

      <h3>Coloring pages</h3>
      <p>One page per monster found, ready to print on US Letter paper.</p>
      ${isIosHomeScreenApp() ? `<p class="parent__note">On iPad, printing doesn't always work from the Home Screen app. If nothing happens, open the game in Safari and print from there.</p>` : ''}
      <div class="parent__row">${this.printButton()}</div>

      <h3>Start over</h3>
      <div class="parent__row"><button data-act="reset" class="danger">Reset game…</button></div>

      ${backup ? `<h3>Backup</h3><p>Saved ${new Date(backup.savedAt).toLocaleString()} (${backup.reason.replace(/-/g, ' ')}).</p>
        <div class="parent__row"><button data-act="download-backup">Download backup</button></div>` : ''}`;
  }

  /** Monsters Layne has found, in book order. */
  private caught() {
    return MONSTERS.filter((m) => this.save.collection[m.id]);
  }

  private printButton(): string {
    const n = this.caught().length;
    const pages = `${n} ${n === 1 ? 'page' : 'pages'}`;
    if (n === 0) return `<button disabled>Print all caught monsters (none found yet)</button>`;
    if (this.printing === 'preparing') return `<button disabled>Getting ${pages} ready…</button>`;
    if (isPrintReady(this.caught())) return `<button data-act="print-all">Ready! Print ${pages}</button>`;
    return `<button data-act="print-all">Print all caught monsters (${pages})</button>`;
  }

  private async printAll(): Promise<void> {
    const list = this.caught();
    if (isPrintReady(list)) {
      printColoringPages(list); // straight from the tap, so tablets allow the print dialog
      return;
    }
    // First tap: build the pages (can take a moment), then ask for a second tap to print.
    this.printing = 'preparing';
    this.render('main');
    await preparePrint(list);
    this.printing = 'idle';
    if (this.isOpen) this.render('main');
  }

  private onClick(e: MouseEvent): void {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    switch (act) {
      case 'close':
        return this.close();
      case 'back':
        return this.render('main');
      case 'print-all':
        void this.printAll();
        return;
      case 'howto':
        this.close();
        this.showHowToPlay();
        return;
      case 'export':
        this.autosave.now(); // make sure the file has the very latest progress
        downloadSave(this.save);
        return;
      case 'import':
        this.root.querySelector('input')!.click();
        return;
      case 'import-yes':
        if (!this.pendingImport) return;
        this.replaceSave(this.pendingImport, 'before-import');
        return;
      case 'reset':
        return this.render('confirm-reset');
      case 'reset-yes':
        this.replaceSave(null, 'before-reset');
        return;
      case 'download-backup': {
        const backup = readBackup();
        if (backup) downloadText(backup.text, `laynes-monster-quest-backup-${backup.savedAt.slice(0, 10)}.json`);
        return;
      }
    }
  }

  private async onFileChosen(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = ''; // so choosing the same file again still works
    if (!file) return;
    const data = readSaveFile(await file.text());
    if (!data) {
      this.message = "That file isn't a Layne's Monster Quest save, so nothing was changed.";
      this.render('main');
      return;
    }
    this.pendingImport = data;
    this.render('confirm-import');
  }

  /** Keep a backup, swap the save (null = brand new game), and restart the page. */
  private replaceSave(next: SaveData | null, reason: 'before-reset' | 'before-import'): void {
    this.autosave.now();
    const current = currentSaveText();
    if (current) backupSave(current, reason);
    this.autosave.stop(); // don't let the page-closing auto-save write the old game back
    if (next) writeSave(next);
    else clearSave();
    location.reload();
  }
}
