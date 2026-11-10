import { PixelBuffer, rgba, stamp } from '../../render/pixels';
import { realmIconColor } from '../../ui/pixelIcon';
import { isWalkable, type MapRide, type TileMap } from '../../world/tilemap';
import { type BuildingPlan, type RidePlan } from './types';

/**
 * Turn a plan's rides into MapRides the renderer draws every frame.
 *
 * Each sprite is turned into a tiny picture only once (the first time it's drawn),
 * so a frame is just a few drawImage() calls per ride on screen: cheap, even on an
 * older tablet. Positions are rounded to whole art pixels, so rides move one
 * pixel-art pixel at a time, like everything else in the game.
 */
export function attachRides(plan: BuildingPlan, maps: TileMap[]): string[] {
  const problems: string[] = [];
  for (const ride of plan.rides ?? []) {
    const map = maps.find((m) => m.id === `${plan.id}/${ride.map}`);
    if (!map) throw new Error(`World "${plan.id}": a ride is on map "${ride.map}", which isn't in the maps list.`);
    for (const part of ride.pose(0)) {
      if (!ride.sprites[part.sprite]) throw new Error(`World "${plan.id}": a ride uses sprite "${part.sprite}", which it doesn't have.`);
    }
    problems.push(...walkableUnder(ride, map));
    (map.rides ??= []).push(toMapRide(ride));
  }
  return problems;
}

function toMapRide(ride: RidePlan): MapRide {
  const pictures = new Map<string, HTMLCanvasElement>();
  const picture = (name: string) => {
    let canvas = pictures.get(name);
    if (!canvas) {
      const rows = ride.sprites[name];
      const buf = new PixelBuffer(Math.max(...rows.map((r) => r.length)), rows.length);
      stamp(buf, rows, (ch) => rgba(realmIconColor(ch)), 0, 0);
      canvas = buf.toCanvas();
      pictures.set(name, canvas);
    }
    return canvas;
  };
  return {
    x: ride.x,
    y: ride.y,
    w: ride.w,
    h: ride.h,
    draw(ctx, sx, sy, p, time) {
      for (const part of ride.pose(time)) {
        const pic = picture(part.sprite);
        ctx.drawImage(pic, sx + Math.round(part.x) * p, sy + Math.round(part.y) * p, pic.width * p, pic.height * p);
      }
    },
  };
}

/** A ride drawn over a walkable square would hide Layne (and could look like it's in the way). */
function walkableUnder(ride: RidePlan, map: TileMap): string[] {
  for (let y = ride.y; y < ride.y + ride.h; y++) {
    for (let x = ride.x; x < ride.x + ride.w; x++) {
      if (isWalkable(map, x, y)) return [`Map "${map.id}": the ride at ${ride.x},${ride.y} covers ${x},${y}, a square Layne can walk on.`];
    }
  }
  return [];
}
