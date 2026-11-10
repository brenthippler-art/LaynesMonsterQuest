import { type RidePlan } from '../../building/types';
import { ROLLING_RIDES } from './rolling';
import { SKY_RIDES } from './sky';
import { SPINNING_RIDES } from './spinning';

/** Everything in Wonderwhirl Park that moves (see building/rides.ts for how they're drawn). */
export const WONDERWHIRL_RIDES: RidePlan[] = [...SPINNING_RIDES, ...ROLLING_RIDES, ...SKY_RIDES];
