import './gallery.css';
import { checkAllWorlds } from '../monsters/checkMonsters';
import { type Monster } from '../monsters/monsterTypes';
import { MONSTERS, monstersIn } from '../monsters/worlds';
import { monsterSvg } from '../monsters/pixel/monsterSprite';
import { typeIconSvg } from '../monsters/typeIcons';
import { WORLD_LIST } from '../worlds';
import { type WorldDef } from '../worlds/types';
import { renderPartsPage } from './partsPage';

/**
 * DEV-ONLY review page: every monster as pixel art, in color and as a
 * coloring page, side by side, grouped by world and realm, with data problems
 * listed at the top of each world. Open it with `npm run dev`, then go to /gallery.
 */
const gallery = document.getElementById('gallery')!;
// Two tabs: the monsters (with the data checks) and the parts (#parts).
gallery.innerHTML = `<div class="tabs"><a href="#monsters" data-tab="monsters">Monsters</a><a href="#parts" data-tab="parts">Parts</a></div><div id="page"></div>`;
const root = document.getElementById('page')!;

function esc(text: string): string {
  return text.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
}

function status(problems: string[], allGood: string): string {
  return problems.length
    ? `<div class="status bad"><b>${problems.length} problem(s):</b><ul>${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>`
    : `<div class="status good">${allGood}</div>`;
}

function card(m: Monster, index: number): string {
  return `
    <article class="card" id="${m.id}">
      <header>
        <span class="num">#${String(index + 1).padStart(3, '0')}</span>
        <h3>${esc(m.name)}</h3>
        <span class="rarity ${m.rarity}">${m.rarity}</span>
      </header>
      <div class="pics">
        <figure data-mode="color"><div class="pic"></div><figcaption>color</figcaption></figure>
        <figure class="outline" data-mode="outline"><div class="pic"></div><figcaption>coloring page</figcaption></figure>
      </div>
      <p class="meta">${typeIconSvg(m.type, 20)} <b>${m.type}</b> · ${m.size} · <code>${m.id}</code></p>
      <p><b>${esc(m.ability.name)}:</b> ${esc(m.ability.description)}</p>
      <p class="fact">${esc(m.fact)}</p>
    </article>`;
}

/** One world: its check results, a realm menu, and a section per realm. Numbering restarts per world. */
function worldSection(world: WorldDef, problems: string[]): string {
  const count = MONSTERS.filter((m) => m.world === world.id).length;
  const nav = world.realms.map((r) => `<a href="#${world.id}-${r.id}">${r.label}</a>`).join('');
  let index = 0;
  const sections = world.realms
    .map((r) => {
      const list = monstersIn(world.id, r.id);
      const cards = list.map((m) => card(m, index++)).join('');
      return `<section id="${world.id}-${r.id}"><h2>${r.label} <small>(${list.length})</small></h2><div class="grid">${cards}</div></section>`;
    })
    .join('');
  return `
    <h1 id="world-${world.id}">${esc(world.name)} <small>${world.id} · ${count} monsters · ${world.realms.length} realms</small></h1>
    ${status(problems, `All ${esc(world.name)} checks passed: 9 realms, 12 monsters each, rare rule, unique abilities, short facts.`)}
    <nav>${nav}</nav>
    ${sections}`;
}

function renderPage(): void {
  const report = checkAllWorlds(WORLD_LIST, MONSTERS);
  const worldNav = WORLD_LIST.map((w) => `<a href="#world-${w.id}">${esc(w.name)}</a>`).join('');
  root.innerHTML = `
    <h1>Monster Gallery <small>dev only · ${WORLD_LIST.length} world(s) · ${MONSTERS.length} monsters · pixel art</small></h1>
    ${status(report.across, `Across all worlds: ${MONSTERS.length} monsters, every id and name unique.`)}
    <nav>${worldNav}</nav>
    ${report.perWorld.map((r) => worldSection(r.world, r.problems)).join('')}`;
}

/** Sprites take a moment each, so fill the pictures in one monster at a time. */
async function fillPictures(): Promise<void> {
  for (const m of MONSTERS) {
    const cardEl = document.getElementById(m.id);
    if (!cardEl) return; // switched to the Parts tab
    for (const fig of cardEl.querySelectorAll<HTMLElement>('figure')) {
      const mode = fig.dataset.mode === 'outline' ? 'outline' : 'color';
      fig.querySelector('.pic')!.innerHTML = await monsterSvg(m, mode);
    }
  }
}

/** Show the tab the address asks for. In-page links (#island-forest, #parts-bodies) don't redraw the page. */
let shown = '';
function route(): void {
  const tab = location.hash.startsWith('#parts') ? 'parts' : 'monsters';
  if (tab === shown) return;
  shown = tab;
  for (const a of gallery.querySelectorAll<HTMLElement>('.tabs a')) a.classList.toggle('on', a.dataset.tab === tab);
  if (tab === 'parts') {
    renderPartsPage(root);
  } else {
    renderPage();
    void fillPictures();
  }
}
window.addEventListener('hashchange', route);
route();
