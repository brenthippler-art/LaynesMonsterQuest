import { type Palette } from '../monsterTypes';
import { type Body, CENTER_X } from './bodies';
import { circle, fluff, n, type Pen, shape } from './pen';

/**
 * Things that sit ON the head like a hat:
 *   crown    a gold crown with three round points and little gems (in front of the head)
 *   chefhat  a puffy white chef's hat (in front of the head)
 *   lid      a lid standing open behind the head, like a toilet seat lid or a pot lid
 */
export type HatTop = 'crown' | 'chefhat' | 'lid';

const GOLD = '#F8B800';
const WHITE = '#FFFFFF';
const FLAT = { outline: false, shade: false };

export function drawHat(pen: Pen, b: Body, style: HatTop, c: Palette): { back: string; front: string } {
  const x = CENTER_X;
  switch (style) {
    case 'crown': {
      const by = b.top + 8;
      const P = (dx: number, dy: number) => `${n(x + dx)} ${n(by + dy)}`;
      const crown =
        `M${P(-22, 0)} L${P(-24, -18)} Q${P(-23, -24)} ${P(-18, -19)} L${P(-10, -10)} L${P(-3, -22)} Q${P(0, -27)} ${P(3, -22)}` +
        ` L${P(10, -10)} L${P(18, -19)} Q${P(23, -24)} ${P(24, -18)} L${P(22, 0)} Z`;
      return {
        back: '',
        front: shape(pen, crown, GOLD) + circle(pen, x, by - 6, 3.5, '#F83800', FLAT) + circle(pen, x - 13, by - 5, 3, '#3CBCFC', FLAT) + circle(pen, x + 13, by - 5, 3, '#3CBCFC', FLAT),
      };
    }
    case 'chefhat': {
      const by = b.top + 10;
      const band = `M${n(x - 22)} ${n(by)} L${n(x + 22)} ${n(by)} L${n(x + 22)} ${n(by - 12)} L${n(x - 22)} ${n(by - 12)} Z`;
      const puff = fluff(pen, [[x - 16, by - 20, 13], [x + 16, by - 20, 13], [x, by - 28, 16]], WHITE);
      return { back: '', front: puff + shape(pen, band, WHITE) };
    }
    case 'lid': {
      // A tall rounded lid standing up behind the head, tipped back a little, with a panel on it.
      const w = Math.min(b.rx * 0.85, 52);
      const h = w * 1.25;
      const by = b.top + 14;
      const rr = (inset: number) => {
        const x0 = x - w + inset;
        const x1 = x + w - inset;
        const y0 = by - h + inset;
        const y1 = by;
        const r = w * 0.6 - inset;
        return `M${n(x0)} ${n(y1)} L${n(x0)} ${n(y0 + r)} Q${n(x0)} ${n(y0)} ${n(x0 + r)} ${n(y0)} L${n(x1 - r)} ${n(y0)} Q${n(x1)} ${n(y0)} ${n(x1)} ${n(y0 + r)} L${n(x1)} ${n(y1)} Z`;
      };
      const turn = `transform="rotate(-8 ${n(x)} ${n(by)})"`;
      return { back: `<g ${turn}>${shape(pen, rr(0), c.main)}${shape(pen, rr(10), c.accent)}</g>`, front: '' };
    }
  }
}
