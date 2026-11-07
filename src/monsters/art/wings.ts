import { type Body } from './bodies';
import { line, n, type Pen, shape } from './pen';

/**
 * Big wings for the newer creatures (drawn behind the body, one per side):
 *   dragonwings  bat-style: a long top edge and a scalloped bottom edge of round bumps, with finger lines
 *   feathers     spread feathered wings with five round feather tips (griffins, phoenixes)
 */
export type BigWing = 'dragonwings' | 'feathers';

export function drawBigWing(pen: Pen, b: Body, style: BigWing, side: number, color: string): string {
  // Big wings grow from the shoulders on top of the back (not the sides), so even on a long
  // body they stay inside the picture and look like they lift the creature up.
  const wx = b.cx + side * b.rx * 0.35;
  const wy = b.topYAt(wx) + 12;
  // Work in "wing space": dx goes outward from the body, so the same numbers draw both sides.
  const P = (dx: number, dy: number) => `${n(wx + side * dx)} ${n(wy + dy)}`;

  if (style === 'dragonwings') {
    const wing =
      `M${P(0, -10)} C${P(14, -50)} ${P(48, -66)} ${P(66, -58)} Q${P(72, -42)} ${P(62, -28)}` +
      // Three round scallops along the bottom edge.
      ` Q${P(60, -10)} ${P(46, -16)} Q${P(42, 0)} ${P(30, -6)} Q${P(24, 10)} ${P(12, 2)} L${P(0, 10)} Z`;
    const fingers = [P(62, -28), P(46, -16), P(30, -6)].map((tip) => `M${P(4, -6)} L${tip}`).join(' ');
    return shape(pen, wing, color) + line(pen, fingers, 2.5);
  }

  const wing =
    `M${P(0, -8)} C${P(16, -48)} ${P(44, -64)} ${P(62, -60)}` +
    // Five round feather tips, from the top of the wing down to the body.
    ` Q${P(74, -56)} ${P(64, -46)} Q${P(78, -38)} ${P(64, -30)} Q${P(74, -18)} ${P(58, -16)}` +
    ` Q${P(64, -2)} ${P(46, -4)} Q${P(46, 10)} ${P(30, 4)} Q${P(14, 12)} ${P(0, 10)} Z`;
  // Short lines between the top three feather tips (long ones look like stripes on the small in-world sprite).
  const quills = [[P(50, -42), P(64, -46)], [P(52, -29), P(64, -30)], [P(46, -15), P(58, -16)]]
    .map(([a, z]) => `M${a} L${z}`)
    .join(' ');
  return shape(pen, wing, color) + line(pen, quills, 2.5);
}
