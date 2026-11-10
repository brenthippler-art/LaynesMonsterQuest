import { makeBuildingWorld } from '../building';
import { BUMPER_FIREWORKS } from './decor/bumperFireworks';
import { COASTER_CAROUSEL } from './decor/coasterCarousel';
import { PARK_GATE } from './decor/parkGate';
import { SPLASH_FUNHOUSE } from './decor/splashFunhouse';
import { WHEEL_SNACKS } from './decor/wheelSnacks';
import { LEGEND, WONDERWHIRL_MAPS } from './layout';
import { WONDERWHIRL_REALMS } from './realms';
import { WONDERWHIRL_RIDES } from './rides';
import { WONDERWHIRL_SCENE } from './scene';
import { WONDERWHIRL_TILES } from './tiles';

/**
 * Wonderwhirl Park: an outdoor theme park (an original one, with its own
 * swirly-pinwheel sign; no real parks, castles, characters, rides or mascots).
 * Layne starts just inside the front gate. A little main street leads up to
 * paths that branch out to the ride areas around a central fountain, with the
 * fireworks plaza at the top. The rides really move (see rides/), and the
 * funhouse is a small map of its own through its doors.
 */
export const WONDERWHIRL = makeBuildingWorld({
  id: 'wonderwhirl',
  name: 'Wonderwhirl Park',
  seed: 3131,
  scene: WONDERWHIRL_SCENE,
  tiles: WONDERWHIRL_TILES,
  decor: { ...PARK_GATE, ...COASTER_CAROUSEL, ...SPLASH_FUNHOUSE, ...WHEEL_SNACKS, ...BUMPER_FIREWORKS },
  legend: LEGEND,
  maps: WONDERWHIRL_MAPS,
  realms: WONDERWHIRL_REALMS,
  rides: WONDERWHIRL_RIDES,
});
