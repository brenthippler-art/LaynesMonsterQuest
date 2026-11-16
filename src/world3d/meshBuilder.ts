import { BufferAttribute, BufferGeometry, Color, Matrix4, Quaternion, Vector3 } from 'three';

/**
 * Builds ONE low-poly mesh out of many simple shapes (balls, cones, boxes...).
 *
 * Every shape is copied in already moved/turned/stretched into place, and every
 * corner gets its own color (a "vertex color"). Then the whole thing is drawn in
 * a single go, which is fast, and looks just like a Nintendo 64 game: chunky
 * flat faces, plain colors, no pictures stretched over the shapes.
 *
 * A color can be one color, or a function that picks a color for each triangle
 * from where its middle is on the ORIGINAL shape (a ball is -1..1). That's how
 * stripes, spots and tummy patches are painted. Each triangle gets one color, so
 * patterns have crisp, chunky edges.
 *
 * `bend` (optional) reshapes the shape before it's placed: it gets each corner of
 * the original shape and moves it (a ball can become a pear or a drop).
 */
export type Paint = Color | ((p: Vector3) => Color);
export type Bend = (p: Vector3) => void;

const corner = [new Vector3(), new Vector3(), new Vector3()];
const middle = new Vector3();

export class MeshBuilder {
  private pos: number[] = [];
  private col: number[] = [];

  get isEmpty(): boolean {
    return this.pos.length === 0;
  }

  /** Copy a shape in, placed by `m`. The shape must be "non-indexed" (every triangle has its own 3 corners): see shapes.ts. */
  add(shape: BufferGeometry, m: Matrix4, paint: Paint, bend?: Bend): this {
    const src = shape.getAttribute('position');
    for (let i = 0; i + 2 < src.count; i += 3) {
      for (let k = 0; k < 3; k++) corner[k].fromBufferAttribute(src, i + k);
      let c: Color;
      if (paint instanceof Color) c = paint;
      else {
        middle.copy(corner[0]).add(corner[1]).add(corner[2]).divideScalar(3);
        c = paint(middle);
      }
      for (let k = 0; k < 3; k++) {
        if (bend) bend(corner[k]);
        corner[k].applyMatrix4(m);
        this.pos.push(corner[k].x, corner[k].y, corner[k].z);
        this.col.push(c.r, c.g, c.b);
      }
    }
    return this;
  }

  /** One triangle, corners given counter-clockwise when seen from the side that should face out. */
  tri(a: Vector3, b: Vector3, c: Vector3, color: Color): this {
    this.pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    for (let i = 0; i < 3; i++) this.col.push(color.r, color.g, color.b);
    return this;
  }

  /** Two triangles: corners a, b, c, d going around counter-clockwise. */
  quad(a: Vector3, b: Vector3, c: Vector3, d: Vector3, color: Color): this {
    return this.tri(a, b, c, color).tri(a, c, d, color);
  }

  /** The finished mesh data (null if nothing was added). Each face gets its own flat light, N64 style. */
  build(): BufferGeometry | null {
    if (this.isEmpty) return null;
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute('color', new BufferAttribute(new Float32Array(this.col), 3));
    g.computeVertexNormals(); // non-indexed, so every face keeps its own normal = flat shading
    g.computeBoundingSphere();
    return g;
  }
}

const q = new Quaternion();
const e = new Vector3();
const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Y = new Vector3(0, 1, 0);
const AXIS_Z = new Vector3(0, 0, 1);
const qx = new Quaternion();
const qy = new Quaternion();
const qz = new Quaternion();

/**
 * Place a shape: move to (x, y, z), stretch by (sx, sy, sz), turn by (rx, ry, rz) radians.
 * The turns happen in the order Y (turn around), then X (tip forward), then Z (lean sideways).
 */
export function place(x: number, y: number, z: number, sx = 1, sy = sx, sz = sx, rx = 0, ry = 0, rz = 0): Matrix4 {
  qy.setFromAxisAngle(AXIS_Y, ry);
  qx.setFromAxisAngle(AXIS_X, rx);
  qz.setFromAxisAngle(AXIS_Z, rz);
  q.copy(qy).multiply(qx).multiply(qz);
  return new Matrix4().compose(e.set(x, y, z), q, new Vector3(sx, sy, sz));
}

/** Colors are cached, because the same few colors get used thousands of times. */
const colors = new Map<string, Color>();
export function rgb(hex: string): Color {
  let c = colors.get(hex);
  if (!c) colors.set(hex, (c = new Color(hex)));
  return c;
}

/** A lighter (k > 0) or darker (k < 0) copy of a color. Makes a new Color, so use it outside hot loops. */
export function shade(c: Color, k: number): Color {
  const out = c.clone();
  return k >= 0 ? out.lerp(WHITE, k) : out.multiplyScalar(1 + k);
}
const WHITE = new Color('#ffffff');
