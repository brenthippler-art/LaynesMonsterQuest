import { SPRITE_COLORS } from '../render/decorArt';
import { NES } from '../render/nesPalette';
import { PixelBuffer, rgba, stamp } from '../render/pixels';
import { BIOME_INFO, type Biome } from '../world/biomes';
import { BIOME_ICONS } from './biomeIcons';
import { drawText, GLYPH_H, textWidth } from './pixelFont';

/** Each badge pixel becomes a SCALE x SCALE square of CSS pixels (24 px tall x 3 = 72px). */
const SCALE = 3;
const HEIGHT = 24;
const ICON = 16;
const PAD = 4;

/** Fixed colors for the "changes per flower/crystal" letters, so the icon always looks the same. */
const iconColors = (ch: string) => rgba(ch === 'f' ? NES.pink : ch === 'c' ? NES.skyLight : SPRITE_COLORS[ch]);

/**
 * The sign in the top-left showing where Layne is: a black box with a white
 * border, a pixel-art icon and a pixel-font word, like an NES menu.
 */
export class BiomeBadge {
  private canvas: HTMLCanvasElement;
  private current: Biome | null = null;

  constructor(parent: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'biome-badge';
    this.canvas.setAttribute('role', 'status');
    parent.append(this.canvas);
  }

  /** Cheap to call every frame: only redraws when the biome actually changes. */
  show(biome: Biome): void {
    if (biome === this.current) return;
    this.current = biome;
    const label = BIOME_INFO[biome].label;
    const icon = BIOME_ICONS[biome];

    const width = PAD + ICON + PAD + textWidth(label) + PAD + 1;
    const buf = new PixelBuffer(width, HEIGHT);
    buf.fill(0, 0, width, HEIGHT, rgba(NES.black));
    // White frame, one pixel in from the edge.
    const white = rgba(NES.white);
    buf.fill(1, 1, width - 2, 1, white);
    buf.fill(1, HEIGHT - 2, width - 2, 1, white);
    buf.fill(1, 1, 1, HEIGHT - 2, white);
    buf.fill(width - 2, 1, 1, HEIGHT - 2, white);

    // Icon, centered in a 16x16 box.
    const iconX = PAD + Math.floor((ICON - icon[0].length) / 2);
    const iconY = PAD + Math.floor((ICON - icon.length) / 2);
    stamp(buf, icon, iconColors, iconX, iconY);
    drawText(buf, label, PAD + ICON + PAD, Math.floor((HEIGHT - GLYPH_H) / 2), white);

    // Show it: tiny canvas, scaled up with crisp pixels by CSS.
    this.canvas.width = width;
    this.canvas.height = HEIGHT;
    this.canvas.getContext('2d')!.drawImage(buf.toCanvas(), 0, 0);
    this.canvas.style.width = `${width * SCALE}px`;
    this.canvas.style.height = `${HEIGHT * SCALE}px`;
    this.canvas.setAttribute('aria-label', label);

    // Restart the little "pop" animation.
    this.canvas.classList.remove('pop');
    void this.canvas.offsetWidth;
    this.canvas.classList.add('pop');
  }
}
