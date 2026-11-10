/**
 * Cherry Mart's holiday aisle changes with the real month. The month comes from
 * the device's own clock (new Date()), so no internet is needed. To see a
 * different season, change the computer's date and reload the page.
 *
 *   December, January          winter   snowflakes and snowmen
 *   February                   hearts   hearts and heart balloons
 *   March, April, May          spring   flowers and tulip pots
 *   June, July, August         summer   beach balls and sandcastles
 *   September, October, Nov.   fall     pumpkins
 */
export type Season = 'winter' | 'hearts' | 'spring' | 'summer' | 'fall';

/** Which season a date is in. getMonth() counts from 0: January = 0 ... December = 11. */
export function seasonFor(date: Date): Season {
  const month = date.getMonth();
  if (month === 1) return 'hearts';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

/** The season right now, read once when the game loads. */
export const SEASON_NOW: Season = seasonFor(new Date());
