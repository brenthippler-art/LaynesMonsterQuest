import { type WorldId } from './worldIds';

/**
 * Map ids are saved (which map Layne is on), so two worlds must never use the
 * same one. New worlds name their maps '<worldId>/<mapName>', e.g. 'jungle/cave-1'.
 *
 * The island is the one exception: it keeps its first ids ('overworld',
 * 'cave-1'...) because existing saves already use them.
 */
export function mapIdFor(world: WorldId, name: string): string {
  return `${world}/${name}`;
}

/** Map ids that break the naming rule above (empty = all good). */
export function badMapIds(world: WorldId, ids: string[]): string[] {
  if (world === 'island') return [];
  return ids.filter((id) => !id.startsWith(`${world}/`));
}
