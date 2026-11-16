import { BackSide, BufferAttribute, Color, Group, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
import { NES } from '../render/nesPalette';
import { MeshBuilder, place, rgb } from './meshBuilder';
import { SHAPES } from './shapes';

/**
 * The sky: a big ball around the camera, blue at the top and pale at the horizon,
 * with a few chunky clouds drifting by. It moves with the camera, so you can never
 * reach it. The fog is the same pale color, so far-away hills fade into the sky.
 */
export const SKY_TOP = new Color(NES.blueMid);
export const HORIZON = new Color(NES.skyLight);

export class Sky {
  readonly group = new Group();
  private clouds: Mesh;

  constructor() {
    const ball = new SphereGeometry(80, 12, 8);
    const colors: number[] = [];
    const pos = ball.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const up = Math.max(0, pos.getY(i) / 80); // 0 at the horizon, 1 straight up
      const c = HORIZON.clone().lerp(SKY_TOP, Math.min(1, up * 1.6));
      colors.push(c.r, c.g, c.b);
    }
    ball.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    const dome = new Mesh(ball, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false, depthWrite: false }));
    dome.renderOrder = -2;
    this.group.add(dome);

    // Clouds: lumpy white balls in a ring far away.
    const b = new MeshBuilder();
    const white = rgb(NES.white);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + (i % 3) * 0.3;
      const x = Math.cos(a) * 60;
      const z = Math.sin(a) * 60;
      const y = 14 + (i % 4) * 4;
      for (let n = 0; n < 4; n++) b.add(SHAPES.gem(0), place(x + (n - 1.5) * 3, y + (n % 2) * 1.2, z, 3 + (n % 2), 2, 3), white);
    }
    this.clouds = new Mesh(b.build()!, new MeshBasicMaterial({ vertexColors: true, fog: false, depthWrite: false }));
    this.clouds.renderOrder = -1;
    this.group.add(this.clouds);
  }

  /** Follow the camera, and drift the clouds around slowly. */
  update(camX: number, camY: number, camZ: number, time: number): void {
    this.group.position.set(camX, camY - 10, camZ);
    this.clouds.rotation.y = time * 0.01;
  }
}
