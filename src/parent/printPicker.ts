import { type Monster } from '../monsters/monsterTypes';
import { monstersIn, monstersOf } from '../monsters/worlds';
import { isPrintReady, preparePrint, printColoringPages } from '../print/printer';
import { type SaveData } from '../save/save';
import { realmIconSvg, worldSceneSvg } from '../ui/pixelIcon';
import { WORLD_LIST, WORLDS } from '../worlds';
import { DEFAULT_WORLD, isWorldId, type WorldId } from '../worlds/worldIds';

/**
 * The grown-ups area's "Coloring pages" section: pick a world (by its picture),
 * then print every monster found there, or just the ones from one realm.
 *
 * Tablets only open the print dialog straight from a tap, so the first tap gets
 * the pages ready (it can take a moment) and the button changes to "Ready! Print";
 * the next tap prints.
 */
export class PrintPicker {
  private world: WorldId;
  /** What's being got ready: 'world' or a realm id (null = nothing). */
  private scope: string | null = null;
  private preparing = false;

  constructor(
    private save: SaveData,
    /** Redraw the grown-ups area (after the pages are ready). */
    private redraw: () => void,
  ) {
    this.world = save.lastWorld ?? DEFAULT_WORLD;
  }

  /** Start on the world Layne was in last (called each time the grown-ups area opens). */
  showLastWorld(): void {
    this.world = this.save.lastWorld ?? DEFAULT_WORLD;
    this.scope = null;
  }

  html(): string {
    const def = WORLDS[this.world];
    const worlds = WORLD_LIST.map((w) => {
      const on = w.id === this.world;
      return `<button data-act="print-pick" data-world="${w.id}" class="parent__world${on ? ' on' : ''}" aria-pressed="${on}">${worldSceneSvg(w)}<span>${w.name}</span></button>`;
    }).join('');
    const realms = def.realms.map((r) => this.button(r.id, `<span class="parent__icon">${realmIconSvg(r)}</span>${r.label}`)).join('');
    return `
      <div class="parent__worlds">${worlds}</div>
      <div class="parent__row">${this.button('world', `All of ${def.name}`)}</div>
      <div class="parent__realms">${realms}</div>`;
  }

  /** Handles taps inside this section. Returns true if it was one of ours. */
  onClick(target: HTMLElement): boolean {
    const el = target.closest<HTMLElement>('[data-act]');
    if (el?.dataset.act === 'print-pick') {
      const id = el.dataset.world;
      if (isWorldId(id)) {
        this.world = id;
        this.scope = null;
        this.redraw();
      }
      return true;
    }
    if (el?.dataset.act === 'print-scope') {
      void this.print(el.dataset.scope!);
      return true;
    }
    return false;
  }

  /** Found monsters in a scope ('world' or a realm id), in book order. */
  private found(scope: string): Monster[] {
    const list = scope === 'world' ? monstersOf(this.world) : monstersIn(this.world, scope);
    return list.filter((m) => this.save.collection[m.id]);
  }

  private button(scope: string, label: string): string {
    const n = this.found(scope).length;
    const pages = `${n} ${n === 1 ? 'page' : 'pages'}`;
    if (n === 0) return `<button disabled>${label} (none found yet)</button>`;
    if (this.preparing && this.scope === scope) return `<button disabled>Getting ${pages} ready…</button>`;
    const ready = this.scope === scope && isPrintReady(this.found(scope));
    return `<button data-act="print-scope" data-scope="${scope}">${ready ? `Ready! Print ${pages}` : `${label} (${pages})`}</button>`;
  }

  private async print(scope: string): Promise<void> {
    const list = this.found(scope);
    if (!list.length || this.preparing) return;
    if (isPrintReady(list)) {
      printColoringPages(list); // straight from the tap, so tablets allow the print dialog
      return;
    }
    this.scope = scope;
    this.preparing = true;
    this.redraw();
    await preparePrint(list);
    this.preparing = false;
    this.redraw();
  }
}
