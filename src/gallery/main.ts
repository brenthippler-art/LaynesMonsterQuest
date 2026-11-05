import './gallery.css';
import { checkMonsters } from '../monsters/checkMonsters';
import { HABITATS, type Monster } from '../monsters/monsterTypes';
import { MONSTERS } from '../monsters/monsters';
import { monsterSvg } from '../monsters/pixel/monsterSprite';
import { typeIconSvg } from '../monsters/typeIcons';

/**
 * DEV-ONLY review page: every monster as pixel art, in color and as a
 * coloring page, side by side, grouped by habitat, with data problems
 * listed at the top. Open it with `npm run dev`, then go to /gallery.
 */
const root = document.getElementById('gallery')!;

function esc(text: string): string {
  return text.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
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

function renderPage(): void {
  const problems = checkMonsters(MONSTERS);
  const status = problems.length
    ? `<div class="status bad"><b>${problems.length} problem(s):</b><ul>${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>`
    : `<div class="status good">All checks passed: ${MONSTERS.length} monsters, 12 per habitat, max 2 rare each, unique ids and names.</div>`;

  const nav = HABITATS.map((h) => `<a href="#h-${h.id}">${h.label}</a>`).join('');
  let index = 0;
  const sections = HABITATS.map((h) => {
    const list = MONSTERS.filter((m) => m.habitat === h.id);
    const cards = list.map((m) => card(m, index++)).join('');
    return `<section id="h-${h.id}"><h2>${h.label} <small>(${list.length})</small></h2><div class="grid">${cards}</div></section>`;
  }).join('');

  root.innerHTML = `
    <h1>Monster Gallery <small>dev only · ${MONSTERS.length} monsters · pixel art</small></h1>
    ${status}
    <nav>${nav}</nav>
    ${sections}`;
}

/** Sprites take a moment each, so fill the pictures in one monster at a time. */
async function fillPictures(): Promise<void> {
  for (const m of MONSTERS) {
    const cardEl = document.getElementById(m.id)!;
    for (const fig of cardEl.querySelectorAll<HTMLElement>('figure')) {
      const mode = fig.dataset.mode === 'outline' ? 'outline' : 'color';
      fig.querySelector('.pic')!.innerHTML = await monsterSvg(m, mode);
    }
  }
}

renderPage();
void fillPictures();
