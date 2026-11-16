import { type Color, Group, type Material, Mesh, type Vector3 } from 'three';
import { type GlassesStyle } from '../player/glasses';
import { NES } from '../render/nesPalette';
import { MeshBuilder, place, rgb } from './meshBuilder';
import { SHAPES } from './shapes';

/**
 * Layne in 3D: the same boy as the pixel sprite (blond hair, blue eyes,
 * red-and-white striped shirt, blue backpack, red shorts, blue shoes) and this
 * visit's glasses. About 1 tile tall, facing +z (three.js "forward").
 *
 * The arms and legs are separate pieces that swing from the shoulders and hips,
 * so he walks and jumps like a real 3D character.
 */
const C = {
  skin: rgb(NES.skin),
  ear: rgb(NES.orangeLight),
  cheek: rgb(NES.salmon),
  hair: rgb(NES.gold),
  hairLight: rgb(NES.yellowLight),
  eye: rgb(NES.blue),
  sparkle: rgb(NES.white),
  mouth: rgb(NES.red),
  red: rgb(NES.redBright),
  white: rgb(NES.white),
  pack: rgb(NES.blueDark),
  packLight: rgb(NES.periwinkle),
  buckle: rgb(NES.gold),
  shorts: rgb(NES.brownRed),
  shoe: rgb(NES.blueMid),
};
const RAINBOW = [NES.redBright, NES.orange, NES.gold, NES.green, NES.blueMid, NES.purple].map(rgb);

/** The glasses' frame color at a spot on the ring (`side` = -1 left, 1 right). */
function frameColor(g: GlassesStyle, side: number): (p: Vector3) => Color {
  const main = rgb(g.color);
  const accent = rgb(g.accent);
  return (p) => {
    switch (g.pattern) {
      case 'solid': return main;
      case 'twoTone': return side < 0 ? main : accent;
      case 'stripes': return p.y > 0 ? main : accent;
      case 'dots': return Math.round(Math.atan2(p.y, p.x) * 3) % 2 ? main : accent;
      case 'rainbow': return RAINBOW[Math.floor(((Math.atan2(p.y, p.x) / Math.PI + 1) / 2) * RAINBOW.length) % RAINBOW.length];
    }
  };
}

function leg(side: number): MeshBuilder {
  const b = new MeshBuilder();
  // Measured from the hip (y = 0) down to the sole (y = -0.3).
  b.add(SHAPES.tube(5), place(side * 0.01, -0.26, 0, 0.055, 0.26, 0.055), C.skin);
  b.add(SHAPES.box(), place(side * 0.01, -0.25, 0.03, 0.12, 0.08, 0.19), C.shoe);
  b.add(SHAPES.box(), place(side * 0.01, -0.295, 0.03, 0.13, 0.02, 0.2), C.white);
  return b;
}

function arm(side: number): MeshBuilder {
  const b = new MeshBuilder();
  // Measured from the shoulder (y = 0) down to the hand.
  b.add(SHAPES.tube(5), place(0, -0.1, 0, 0.055, 0.1, 0.055), C.red);
  b.add(SHAPES.tube(5), place(0, -0.25, 0, 0.042, 0.16, 0.042), C.skin);
  b.add(SHAPES.gem(0), place(side * 0.005, -0.27, 0, 0.055), C.skin);
  return b;
}

function bodyAndHead(g: GlassesStyle): MeshBuilder {
  const b = new MeshBuilder();
  // Shorts and the striped shirt (stripes painted by height).
  b.add(SHAPES.box(), place(0, 0.32, 0, 0.3, 0.12, 0.2), C.shorts);
  b.add(SHAPES.taper(0.85, 8, 5), place(0, 0.36, 0, 0.17, 0.27, 0.12), (p) => (Math.floor(p.y * 5) % 2 ? C.white : C.red));
  // Backpack and its straps.
  b.add(SHAPES.box(), place(0, 0.5, -0.17, 0.26, 0.24, 0.1), C.pack);
  b.add(SHAPES.box(), place(0, 0.55, -0.225, 0.2, 0.1, 0.02), C.packLight);
  b.add(SHAPES.box(), place(0, 0.52, -0.236, 0.05, 0.04, 0.01), C.buckle);
  for (const side of [-1, 1]) b.add(SHAPES.box(), place(side * 0.08, 0.5, 0.115, 0.04, 0.24, 0.02), C.pack);

  // Head: a big round head (he's six!), ears, hair, face.
  const hy = 0.83;
  b.add(SHAPES.ball(10, 8), place(0, hy, 0, 0.2, 0.2, 0.19), C.skin);
  for (const side of [-1, 1]) b.add(SHAPES.gem(0), place(side * 0.2, hy - 0.01, -0.01, 0.04, 0.06, 0.04), C.ear);
  b.add(SHAPES.dome(10), place(0, hy + 0.02, -0.02, 0.215, 0.2, 0.215, -0.25), C.hair);
  b.add(SHAPES.ball(8, 6), place(0, hy - 0.02, -0.07, 0.2, 0.17, 0.15), C.hair);
  b.add(SHAPES.gem(0), place(0.06, hy + 0.2, 0.08, 0.09, 0.05, 0.08, 0.4, 0.3), C.hairLight);
  b.add(SHAPES.gem(0), place(-0.07, hy + 0.19, 0.1, 0.08, 0.05, 0.07, 0.5, -0.4), C.hair);
  b.add(SHAPES.gem(0), place(0.12, hy + 0.13, 0.13, 0.07, 0.05, 0.06, 0.6, 0.6), C.hair);

  // Eyes (blue with a sparkle), behind the glasses.
  for (const side of [-1, 1]) {
    b.add(SHAPES.gem(0), place(side * 0.07, hy, 0.17, 0.03, 0.04, 0.02), C.eye);
    b.add(SHAPES.gem(0), place(side * 0.07 + 0.012, hy + 0.015, 0.188, 0.01), C.sparkle);
    b.add(SHAPES.gem(0), place(side * 0.12, hy - 0.06, 0.15, 0.03, 0.02, 0.01), C.cheek);
  }
  b.add(SHAPES.ring(0.35, Math.PI), place(0, hy - 0.06, 0.18, 0.035, 0.03, 0.03, 0, 0, Math.PI), C.mouth);

  // Glasses: two round frames, the bridge, and the arms going back to the ears.
  for (const side of [-1, 1]) {
    b.add(SHAPES.ring(0.22), place(side * 0.075, hy, 0.195, 0.065), frameColor(g, side));
    b.add(SHAPES.box(), place(side * 0.165, hy + 0.02, 0.09, 0.015, 0.02, 0.2), rgb(side < 0 ? g.color : g.pattern === 'twoTone' ? g.accent : g.color));
  }
  b.add(SHAPES.box(), place(0, hy + 0.01, 0.2, 0.03, 0.015, 0.015), rgb(g.color));
  return b;
}

export class LayneModel {
  /** Stands on the ground at Layne's feet. Turn it with rotation.y. */
  readonly root = new Group();
  private body = new Group();
  private legs: Group[] = [];
  private arms: Group[] = [];
  private meshes: Mesh[] = [];

  constructor(glasses: GlassesStyle, material: Material) {
    const mesh = (b: MeshBuilder) => {
      const m = new Mesh(b.build()!, material);
      this.meshes.push(m);
      return m;
    };
    this.root.add(this.body);
    this.body.add(mesh(bodyAndHead(glasses)));
    for (const side of [-1, 1]) {
      const hip = new Group();
      hip.position.set(side * 0.08, 0.3, 0);
      hip.add(mesh(leg(side)));
      this.body.add(hip);
      this.legs.push(hip);
      const shoulder = new Group();
      shoulder.position.set(side * 0.2, 0.6, 0);
      shoulder.rotation.z = side * 0.12; // arms hang a little away from the body
      shoulder.add(mesh(arm(side)));
      this.body.add(shoulder);
      this.arms.push(shoulder);
    }
  }

  /**
   * Put him in a pose. `walk` = seconds he's been walking (0 = standing),
   * `air` = how high he is in a jump (0 = on the ground).
   */
  pose(walk: number, air: number): void {
    const swing = walk > 0 ? Math.sin(walk * 11) * 0.7 : 0;
    this.legs[0].rotation.x = swing;
    this.legs[1].rotation.x = -swing;
    this.arms[0].rotation.x = -swing * 0.8;
    this.arms[1].rotation.x = swing * 0.8;
    // A little bounce in each step.
    this.body.position.y = walk > 0 ? Math.abs(Math.cos(walk * 11)) * 0.04 : 0;
    if (air > 0) {
      // Jumping: arms up, legs tucked.
      this.arms[0].rotation.x = this.arms[1].rotation.x = -2.6;
      this.legs[0].rotation.x = 0.5;
      this.legs[1].rotation.x = -0.3;
    }
  }

  dispose(): void {
    for (const m of this.meshes) m.geometry.dispose();
  }
}
