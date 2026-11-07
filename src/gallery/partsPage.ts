import { type BodyShape } from '../monsters/art/bodies';
import { type Look, type Monster, type Palette, type Size } from '../monsters/monsterTypes';
import { monsterSprite, monsterSvg } from '../monsters/pixel/monsterSprite';
import { pixelsToSvg } from '../monsters/pixel/paint';
import { MONSTERS } from '../monsters/worlds';
import { buildColoringPage } from '../print/coloringPage';
import { preparePrint, printColoringPages } from '../print/printer';
import { NES } from '../render/nesPalette';
import { checkLineArt, type LineArtReport } from './printCheck';
import { TEST_MONSTERS } from './testMonsters';

/**
 * DEV-ONLY "Parts" tab of /gallery:
 *   1. every body with plain default parts
 *   2. every newer part on a plain round body
 *   3. the 6 test monsters, with their coloring pages and a print check
 * Each part is shown at all 4 sizes, in color and as line art, plus how it looks wandering in the world.
 */
const SIZES: Size[] = ['tiny', 'small', 'medium', 'large'];
const PLAIN: Look = { body: 'round', eyes: 'round', mouth: 'smile', top: 'none', tail: 'none', feet: 'none', arms: 'none', pattern: 'none' };
const COLORS: Palette = { main: NES.greenBright, accent: NES.gold, belly: NES.sand, wing: NES.sky };

const BODIES: BodyShape[] = ['round', 'pear', 'tall', 'square', 'long', 'drop', 'cloud', 'spiky', 'blob', 'crystal', 'dragon', 'serpent', 'beast', 'bird', 'bowl', 'appliance', 'cart'];
const NEW_PARTS: [string, Partial<Look>][] = [
  ['top: dragonhorns', { top: 'dragonhorns' }],
  ['top: unihorn', { top: 'unihorn' }],
  ['top: crown', { top: 'crown' }],
  ['top: mane', { top: 'mane' }],
  ['top: lid', { top: 'lid' }],
  ['top: chefhat', { top: 'chefhat' }],
  ['top: frill', { top: 'frill' }],
  ['arms: dragonwings', { arms: 'dragonwings' }],
  ['arms: feathers', { arms: 'feathers' }],
  ['arms: claws', { arms: 'claws' }],
  ['feet: claws', { feet: 'claws' }],
  ['feet: hooves', { feet: 'hooves' }],
  ['feet: wheels', { feet: 'wheels' }],
  ['tail: dragon', { tail: 'dragon' }],
  ['tail: serpent', { tail: 'serpent' }],
  ['tail: plume', { tail: 'plume' }],
  ['mouth: snout', { mouth: 'snout' }],
  ['pattern: scales', { pattern: 'scales' }],
  ['pattern: checks', { pattern: 'checks' }],
  ['pattern: sprinkles', { pattern: 'sprinkles' }],
  ['heads: 2', { heads: 2 }],
  ['heads: 3', { heads: 3 }],
];

/** A throwaway monster to draw one part with. The id is unique per variant, because sprites are cached by id. */
function sample(key: string, look: Partial<Look>, size: Size): Monster {
  return {
    id: `parts-${key}-${size}`.replace(/[^a-z0-9-]+/g, '-'),
    name: key,
    world: 'island',
    habitat: 'grassland',
    type: 'Fluff',
    rarity: 'common',
    size,
    ability: { name: '', description: '' },
    fact: '',
    colors: COLORS,
    look: { ...PLAIN, ...look },
  };
}

/** One card: a row of color pictures and a row of line art (all 4 sizes), plus the in-world sprite. */
function partCard(label: string, key: string, look: Partial<Look>): { html: string; jobs: Job[] } {
  const jobs: Job[] = [];
  const cell = (m: Monster, mode: 'color' | 'outline' | 'world', caption: string) => {
    const slot = `slot-${m.id}-${mode}`;
    jobs.push({ slot, m, mode });
    return `<figure class="${mode === 'outline' ? 'outline' : ''}"><div class="pic" id="${slot}"></div><figcaption>${caption}</figcaption></figure>`;
  };
  const colorRow = SIZES.map((s) => cell(sample(key, look, s), 'color', s)).join('') + cell(sample(key, look, 'medium'), 'world', 'in world');
  const lineRow = SIZES.map((s) => cell(sample(key, look, s), 'outline', `${s} · line art`)).join('');
  return { html: `<article class="card part"><h3>${label}</h3><div class="sizes">${colorRow}</div><div class="sizes">${lineRow}</div></article>`, jobs };
}

interface Job {
  slot: string;
  m: Monster;
  mode: 'color' | 'outline' | 'world';
}

function testCard(m: Monster): string {
  return `
    <article class="card test" id="card-${m.id}">
      <h3>${m.name} <small><code>${m.look.body}</code> · ${m.size} · ${m.type}</small></h3>
      <div class="test__row">
        <figure><div class="pic" id="slot-${m.id}-color"></div><figcaption>color</figcaption></figure>
        <figure class="outline"><div class="pic" id="slot-${m.id}-outline"></div><figcaption>line art</figcaption></figure>
        <figure><div class="pic" id="slot-${m.id}-world"></div><figcaption>in world</figcaption></figure>
        <figure class="outline"><div class="cp-preview" id="page-${m.id}"></div><figcaption>coloring page</figcaption></figure>
      </div>
      <p class="check" id="check-${m.id}">Checking the line art…</p>
    </article>`;
}

/** The test monsters are held to the same bar as the island monsters, which already print well. */
function reportText(r: LineArtReport, bar: { specks: number; slivers: number }): string {
  const good = r.closed && r.specks <= bar.specks && r.slivers <= bar.slivers;
  return (
    `${good ? '✅ Prints cleanly' : '⚠️ Check this one'}: outline ${r.closed ? 'closed' : 'OPEN'}, ` +
    `${r.specks} tiny white speck(s) (island max ${bar.specks}), ${r.slivers} one-pixel sliver(s) (island max ${bar.slivers})`
  );
}

export function renderPartsPage(root: HTMLElement): void {
  const bodies = BODIES.map((b) => partCard(`body: ${b}`, `body-${b}`, { body: b }));
  const parts = NEW_PARTS.map(([label, look]) => partCard(label, label, look));
  root.innerHTML = `
    <h1>Parts <small>dev only · every body and every newer part, 4 sizes, color + line art</small></h1>
    <nav><a href="#parts-bodies">Bodies</a><a href="#parts-new">New parts</a><a href="#parts-tests">Test monsters</a></nav>
    <section id="parts-tests">
      <h2>Test monsters <small>(gallery only: never in the game or saves)</small></h2>
      <p><button id="print-tests">Print all 6 coloring pages</button></p>
      <div class="grid wide">${TEST_MONSTERS.map(testCard).join('')}</div>
    </section>
    <section id="parts-bodies"><h2>Bodies <small>(default parts: round eyes + smile)</small></h2><div class="grid wide">${bodies.map((c) => c.html).join('')}</div></section>
    <section id="parts-new"><h2>New parts <small>(on a plain round body)</small></h2><div class="grid wide">${parts.map((c) => c.html).join('')}</div></section>`;

  root.querySelector('#print-tests')!.addEventListener('click', async () => {
    await preparePrint(TEST_MONSTERS);
    printColoringPages(TEST_MONSTERS);
  });
  void fillTests().then(() => fill([...bodies, ...parts].flatMap((c) => c.jobs)));
}

/** Test monsters first (with coloring pages and the print check), then all the part pictures. */
async function fillTests(): Promise<void> {
  // How "sliver-y" are the island monsters' coloring pages? That's the bar the test monsters are held to.
  const bar = { specks: 0, slivers: 0 };
  for (const m of MONSTERS) {
    const s = await monsterSprite(m, 'large');
    const r = checkLineArt(s.outline, s.width, s.height);
    bar.specks = Math.max(bar.specks, r.specks);
    bar.slivers = Math.max(bar.slivers, r.slivers);
  }
  for (const m of TEST_MONSTERS) {
    await fill([
      { slot: `slot-${m.id}-color`, m, mode: 'color' },
      { slot: `slot-${m.id}-outline`, m, mode: 'outline' },
      { slot: `slot-${m.id}-world`, m, mode: 'world' },
    ]);
    const sprite = await monsterSprite(m, 'large');
    document.getElementById(`page-${m.id}`)!.append(buildColoringPage(m, sprite));
    document.getElementById(`check-${m.id}`)!.textContent = reportText(checkLineArt(sprite.outline, sprite.width, sprite.height), bar);
  }
}

async function fill(jobs: Job[]): Promise<void> {
  for (const { slot, m, mode } of jobs) {
    const el = document.getElementById(slot);
    if (!el) return; // the page changed tab
    if (mode === 'world') {
      const s = await monsterSprite(m, 'small');
      el.innerHTML = pixelsToSvg(s.color, s.width, s.height, m.name);
    } else {
      el.innerHTML = await monsterSvg(m, mode);
    }
  }
}
